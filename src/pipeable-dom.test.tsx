import { type RunnerTestCase, test } from "vitest";

import type { JSXNode } from "./jsx.js";
import { render } from "./jsx.js";
import { DOMStream } from "./pipeable-dom.js";

test("can stream text", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write("hello");
	expect(stream.target.innerHTML).toBe("hello");
	await stream.write(", world");
	expect(stream.target.innerHTML).toBe("hello, world");
	await stream.close();
});

test("can stream html", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write("<div>hello</div>");
	expect(stream.target.innerHTML).toBe("<div>hello</div>");
	await stream.write("<div>world</div>");
	expect(stream.target.innerHTML).toBe("<div>hello</div><div>world</div>");
	await stream.close();
});

test("can stream text inside html", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write("<div>hello");
	expect(stream.target.innerHTML).toBe("<div>hello</div>");
	await stream.write(", <span>world");
	expect(stream.target.innerHTML).toBe("<div>hello, <span>world</span></div>");
	await stream.write("!");
	expect(stream.target.innerHTML).toBe("<div>hello, <span>world!</span></div>");
	await stream.write("</span></div>");
	expect(stream.target.innerHTML).toBe("<div>hello, <span>world!</span></div>");
	await stream.close();
});

test("can execute inline scripts", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write("<div></div>");
	await stream.write("<script>");
	const script = `document.__inlineScript = (document.__inlineScript || 0)+1;document.currentScript.previousElementSibling.innerHTML = "hello";`;
	await stream.write(script.slice(0, 10));
	await stream.write(script.slice(10));
	await stream.write("</script>");
	// Script doesn't flush until we know there's no more content
	expect(stream.target.innerHTML).toBe("<div></div><script></script>");
	await stream.write("<div>");
	expect(stream.target.innerHTML).toBe(
		`<div>hello</div><script>${script}</script><div></div>`,
	);
	await stream.write("more</div>");
	expect(stream.target.innerHTML).toBe(
		`<div>hello</div><script>${script}</script><div>more</div>`,
	);
	await stream.close();
	expect((document as { __inlineScript?: number }).__inlineScript).toBe(1);
});

test("can execute external scripts", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write(
		'<script src="/script?script=document.__externalScript%3D%28document.__externalScript%7C%7C0%29%2B1%3B"></script>',
	);
	await stream.write("<div></div>");
	await stream.write(
		"<script>document.currentScript.previousElementSibling.innerHTML = 'hello ' + document.__externalScript;</script>",
	);
	await stream.write("<div>world</div>");
	await stream.close();
});

test("can execute async external scripts", async ({ expect, task }) => {
	const stream = testStream(task);

	const script =
		"<script>document.__asyncExternalScriptPromise = new Promise((resolve) => { document.__asyncExternalScriptResolve = resolve; });</script>";
	await stream.write(script);
	const externalScript =
		'<script src="/script?delay=100&amp;script=document.__asyncExternalScript%3D%28document.__asyncExternalScript%7C%7C0%29%2B1%3Bdocument.__asyncExternalScriptResolve%28%29%3B" async=""></script>';
	await stream.write(externalScript);
	await stream.write("<div>hello</div>");
	expect(
		(document as { __asyncExternalScript?: number }).__asyncExternalScript,
	).toBe(undefined);
	expect(stream.target.innerHTML).toBe(
		`${script}${externalScript}<div>hello</div>`,
	);

	const promise = (document as { __asyncExternalScriptPromise?: Promise<void> })
		.__asyncExternalScriptPromise;
	expect(promise).toBeInstanceOf(Promise);
	await promise;
});

test("can parse inline styles", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write("<style>");
	await stream.write(".inline-style { color: red; }");
	await stream.write("</style>");
	await stream.write("<div class='inline-style'>hello</div>");
	const inlineStyled = stream.target.querySelector(".inline-style")!;
	expect(getComputedStyle(inlineStyled).color).toBe("rgb(255, 0, 0)");
	await stream.close();
});

test("can parse external styles", async ({ expect, task }) => {
	const stream = testStream(task);

	await stream.write(
		'<link rel="stylesheet" href="/style?style=.external-style { color: blue; }">',
	);
	await stream.write("<div class='external-style'>hello</div>");
	await stream.close();
	const externalStyled = stream.target.querySelector(".external-style")!;
	expect(getComputedStyle(externalStyled).color).toBe("rgb(0, 0, 255)");
});

test("can be used with JSX runtime", async ({ expect, task }) => {
	const stream = jsxStream(
		task,
		<div>
			hello, <span>world</span>!
		</div>,
	);
	await stream.close();
	expect(stream.target.innerHTML).toBe("<div>hello, <span>world</span>!</div>");
});

test("can be used with streaming JSX", async ({ expect, task }) => {
	let resolveFirstChunk: () => void;
	const sentFirstChunk = new Promise<void>((resolve) => {
		resolveFirstChunk = resolve;
	});
	const Comp = async function* () {
		yield <div>hello</div>;
		resolveFirstChunk();
		yield <div>world</div>;
	};
	const stream = jsxStream(task, <Comp />);

	await sentFirstChunk;
	expect(stream.target.innerHTML).toBe("<div>hello</div>");
	await stream.close();
	expect(stream.target.innerHTML).toBe("<div>hello</div><div>world</div>");
});

function testStream(task: RunnerTestCase) {
	let controller: ReadableStreamDefaultController<string>;
	const container = document.createElement("div");
	container.style.border = "1px solid black";
	container.style.marginBottom = "1em";
	container.innerHTML = `<div style="border-bottom:1px solid black;">${
		task.name || task.id
	}</div>`;
	const target = document.createElement("div");
	container.appendChild(target);
	document.body.appendChild(container);

	let done = new ReadableStream<string>({
		start(c) {
			controller = c;
		},
	})
		.pipeThrough(new DOMStream())
		.pipeTo(
			new WritableStream({
				write(node) {
					target.appendChild(node);
				},
			}),
		);

	return {
		target,
		async close() {
			controller.close();
			await new Promise((resolve) => setTimeout(resolve, 0));
			await done;
		},
		async write(text: string) {
			controller.enqueue(text);
			await new Promise((resolve) => setTimeout(resolve, 0));
		},
	};
}

function jsxStream(task: RunnerTestCase, node: JSXNode) {
	const stream = testStream(task);

	const done = render(node).pipeTo(
		new WritableStream({
			write(chunk) {
				stream.write(chunk);
			},
		}),
	);

	return {
		target: stream.target,
		async close() {
			await done;
			await stream.close();
		},
	};
}
