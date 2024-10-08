import { page } from "@vitest/browser/context";
import { test } from "vitest";

import { blocking, domStream, preloadLink } from "./pipeable-dom.js";

test("sends root text as single node", async ({ expect }) => {
	const generator = domGenerator("hello", " world");
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(1);
	expect(toDomString(chunks)).toMatchInlineSnapshot(`"hello world"`);
});

test("send child text as single node", async ({ expect }) => {
	const generator = domGenerator("<div>", "hello", " world", "</div>");
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(1);
	expect(toDomString(chunks)).toMatchInlineSnapshot(`"<div>hello world</div>"`);
});

test("send child text as separate nodes", async ({ expect }) => {
	const generator = domGenerator(
		"<div>",
		"hello",
		"<span>child</span>",
		" world",
		"</div>",
	);
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(1);
	expect(chunks[0].childNodes.length).toBe(3);
	expect(toDomString(chunks)).toMatchInlineSnapshot(
		`"<div>hello<span>child</span> world</div>"`,
	);
});

test("send multiple root elements as separate nodes", async ({ expect }) => {
	const generator = domGenerator("<div>hello</div>", "<span>world</span>");
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(2);
	expect(toDomString(chunks)).toMatchInlineSnapshot(
		`"<div>hello</div><span>world</span>"`,
	);
});

test("send entire html document", async ({ expect }) => {
	const generator = domGenerator(
		"<!DOCTYPE html>",
		"<html>",
		"<head>",
		"<title>Test</title>",
		"</head>",
		"<body>",
		"<div>hello</div>",
		"<span>world</span>",
		"</body>",
		"</html>",
	);
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(3);
	expect(toDomString(chunks)).toMatchInlineSnapshot(
		`"<title>Test</title><div>hello</div><span>world</span>"`,
	);
});

test("executes script", async ({ expect }) => {
	const generator = domGenerator(
		"<div></div>",
		`<script>
      document.currentScript.previousElementSibling.setAttribute("data-testid", "script-executed");
    </script>`,
	);
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(2);
	expect((chunks[1] as Element).tagName).toBe("SCRIPT");

	for (let chunk of chunks) {
		document.body.appendChild(chunk);
	}

	expect(page.getByTestId("script-executed").element()).toBeDefined();
});

test("executes script in order", async ({ expect }) => {
	const generator = domGenerator(
		"Embedded App.",
		"<script>window.__testScriptExecutionOrder = []</script>",
		"<script>__testScriptExecutionOrder.push(0);</script>",
		`<script src="/external.js"></script>`,
		"<script>__testScriptExecutionOrder.push(1);</script>",
		`<script src="/external2.js"></script>`,
		`<script src=${JSON.stringify(base64ExternalScript("b"))}></script>`,
		"<script>__testScriptExecutionOrder.push(2);</script>",
		`<script src=${JSON.stringify(base64ExternalScript("b2"))}></script>`,
		"After blocking.",
	);
	const chunks = await toArray(generator);
	expect(chunks).toHaveLength(10);

	for (let chunk of chunks) {
		document.body.appendChild(chunk);
		if (blocking(chunk))
			await new Promise<void>((resolve) => {
				chunk.onload = chunk.onerror = () => {
					resolve();
				};
			});
	}

	expect(window.__testScriptExecutionOrder).toEqual([
		0,
		"e",
		1,
		"e2",
		"b",
		2,
		"b2",
	]);
	expect(chunks[0].textContent).toBe("Embedded App.");
	expect(chunks[9].textContent).toBe("After blocking.");
});

test("README example usage works", async ({ expect }) => {
	const chunks = [
		'<span data-testid="example-before-blocking">Embedded App.</span>',
		"<script>window.__testScriptExecutionOrder = []</script>",
		"<script>__testScriptExecutionOrder.push(0);</script>",
		`<script src="/external.js"></script>`,
		"<script>__testScriptExecutionOrder.push(1);</script>",
		`<script src="/external2.js"></script>`,
		`<script src=${JSON.stringify(base64ExternalScript("b"))}></script>`,
		"<script>__testScriptExecutionOrder.push(2);</script>",
		`<script src=${JSON.stringify(base64ExternalScript("b2"))}></script>`,
		'<span data-testid="example-after-blocking">After blocking.</span>',
	];
	// Pipe the HTML content through a TextDecoderStream and then a DOM parser
	// Get a ReadableStream<Node> of the parsed HTML content
	const stream = new ReadableStream({
		async start(controller) {
			for (let chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
				await Promise.resolve();
			}
			controller.close();
		},
	})
		.pipeThrough(new TextDecoderStream())
		.pipeThrough(domStream());

	const buffer: Node[] = [];
	let blocked = false;
	let readAll = false;
	let resolve: () => void;
	let done = new Promise<void>((r) => {
		resolve = r;
	});
	const flushBuffer = () => {
		let node: Node | undefined;
		while (!blocked && (node = buffer.shift())) {
			document.body.appendChild(node);
			// Wait for blocking nodes to load before continuing to simulate the browser's
			// initial document loading behavior. This is important for scripts to be executed
			// in the correct order, and stylesheets to be applied before the content is rendered.
			if (blocking(node)) {
				blocked = true;
				node.onload = node.onerror = () => {
					blocked = false;
					// Continue to flush the buffer to the DOM
					flushBuffer();
				};
				break;
			}
		}

		if (readAll && !blocked && buffer.length === 0) {
			resolve();
		}
	};

	// Read the parsed nodes as they are available
	const reader = stream.getReader();
	let result: ReadableStreamReadResult<Node>;
	while (!(result = await reader.read()).done) {
		const node = result.value;
		// Add the node to the buffer
		buffer.push(node);

		// Preload any pre-loadable nodes we run across
		const preload = preloadLink(node);
		if (preload) {
			preload.onload = preload.onerror = () => {
				preload.remove();
			};
			document.head.appendChild(preload);
		}

		// Attempt to flush any buffered nodes to the DOM
		flushBuffer();
	}
	readAll = true;

	expect(window.__testScriptExecutionOrder).toEqual([0]);

	await done;

	expect(window.__testScriptExecutionOrder).toEqual([
		0,
		"e",
		1,
		"e2",
		"b",
		2,
		"b2",
	]);
});

declare global {
	interface Window {
		__testScriptExecutionOrder?: string[];
	}
}

const encoder = new TextEncoder();
async function* domGenerator(...chunks: string[]) {
	const readable = new ReadableStream({
		async start(controller) {
			for (let chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
				await Promise.resolve();
			}
			controller.close();
		},
	})
		.pipeThrough(new TextDecoderStream())
		.pipeThrough(domStream());

	const reader = readable.getReader();
	let result: ReadableStreamReadResult<Node>;
	while (!(result = await reader.read()).done) {
		yield result.value;
	}
}

async function toArray(generator: AsyncGenerator<Node, void, unknown>) {
	const result = [];
	for await (let value of generator) {
		result.push(value);
	}
	return result;
}

function toDomString(chunks: Node[]) {
	const div = document.createElement("div");
	for (let chunk of chunks) {
		div.appendChild(chunk);
	}
	return div.innerHTML;
}

function base64ExternalScript(value: string) {
	return `data:text/javascript;base64,${btoa(
		`__testScriptExecutionOrder.push(${JSON.stringify(value)});`,
	)}`;
}
