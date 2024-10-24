import { DOMStream } from "pipeable-dom";
export type { JSX } from "./jsx-types.js";

type JSXPrimitive = string | number | boolean | null | undefined;

export interface JSXProps {
	children?: JSXNode;
	[key: string]: any;
}

export interface JSXElementStructure {
	type: string | Component;
	props: JSXProps;
}

export type Component = (props: any) => JSXNode;

export type JSXNode =
	| JSXPrimitive
	| JSXElementStructure
	| Array<JSXNode>
	| Promise<JSXNode>
	| Generator<JSXNode, void, unknown>
	| AsyncGenerator<JSXNode, void, unknown>;

export class JSXRenderError extends Error {
	constructor(message: string, cause: unknown) {
		super(message);
		this.name = "JSXRenderError";
		this.cause = cause;
	}
}

const FUNCTION = "function";
const OBJECT = "object";

const isAsyncGenerator = (obj: any): obj is AsyncGenerator => {
	return typeof obj == OBJECT && typeof obj?.[Symbol.asyncIterator] == FUNCTION;
};

const isGenerator = (obj: any): obj is Generator => {
	return (
		obj !== null &&
		typeof obj === OBJECT &&
		typeof obj[Symbol.iterator] === FUNCTION &&
		!Array.isArray(obj)
	);
};

const escapeHtml = (str: string): string => {
	const entityMap: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
		"/": "&#x2F;",
		"`": "&#x60;",
		"=": "&#x3D;",
	};

	return String(str).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

const renderAttributes = (props: JSXProps): string => {
	return Object.entries(props)
		.filter(([key]) => key !== "children")
		.map(([key, value]) => {
			if (value === true) return ` ${key}`;
			if (value === false || value == null) return "";
			if (typeof value == FUNCTION) return "";
			if (typeof value == OBJECT) {
				value = JSON.stringify(value);
			}
			return ` ${key}="${escapeHtml(String(value))}"`;
		})
		.join("");
};

const renderGenerator = async function* (
	generator: Generator<JSXNode>,
): AsyncGenerator<string> {
	for (const chunk of generator) {
		yield* renderAsync(chunk);
	}
};

const renderAsyncGenerator = async function* (
	generator: AsyncGenerator<JSXNode>,
): AsyncGenerator<string> {
	for await (const chunk of generator) {
		yield* renderAsync(chunk);
	}
};

const renderComponent = async function* (
	component: Component,
	props: JSXProps = {},
): AsyncGenerator<string> {
	const result = component(props);

	if (result instanceof Promise) {
		yield* renderAsync(await result);
	} else if (isAsyncGenerator(result)) {
		yield* renderAsyncGenerator(result);
	} else if (isGenerator(result)) {
		yield* renderGenerator(result);
	} else {
		yield* renderAsync(result);
	}
};

export const renderAsync = async function* (
	node: JSXNode,
): AsyncGenerator<string> {
	try {
		// Handle null/undefined
		if (node == null) {
			return;
		}

		// Handle primitive types
		if (
			typeof node === "string" ||
			typeof node === "number" ||
			typeof node === "boolean"
		) {
			yield escapeHtml(String(node));
			return;
		}

		// Handle arrays
		if (Array.isArray(node)) {
			for (const item of node) {
				yield* renderAsync(item);
			}
			return;
		}

		// Handle promises
		if (node instanceof Promise) {
			yield* renderAsync(await (node as any));
			return;
		}

		// Handle generators
		if (isGenerator(node)) {
			yield* renderGenerator(node);
			return;
		}

		// Handle async generators
		if (isAsyncGenerator(node)) {
			yield* renderAsyncGenerator(node);
			return;
		}

		// Handle JSX elements
		const element = node as JSXElementStructure;
		const { type, props } = element;

		// Handle function components
		if (typeof type === FUNCTION) {
			yield* renderComponent(type as Component, props);
			return;
		}

		// Handle HTML elements
		const attributes = renderAttributes(props);

		// Handle void elements
		const voidElements = new Set([
			"area",
			"base",
			"br",
			"col",
			"embed",
			"hr",
			"img",
			"input",
			"link",
			"meta",
			"param",
			"source",
			"track",
			"wbr",
		]);

		if (voidElements.has((type as string).toLowerCase())) {
			yield `<${type}${attributes}>`;
			return;
		}

		yield `<${type}${attributes}>`;
		yield* renderAsync(props.children);
		yield `</${type}>`;
	} catch (error) {
		if (error instanceof JSXRenderError) {
			throw error;
		}
		throw new JSXRenderError(
			`Render failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
			error instanceof Error ? error : undefined,
		);
	}
};

export const render = (node: JSXNode): ReadableStream<string> => {
	return new ReadableStream<string>({
		async start(controller) {
			try {
				for await (const chunk of renderAsync(node)) {
					controller.enqueue(chunk);
				}
				controller.close();
			} catch (error) {
				controller.error(error);
			}
		},
	});
};

export function jsx(
	type: string | Component,
	props?: JSXProps,
): JSXElementStructure {
	return {
		type,
		props: props ?? {},
	};
}

export { jsx as jsxs, jsx as jsxDEV };

export const Fragment: Component = ({ children }: JSXProps): JSXNode =>
	children;

type SwapType =
	| "beforebegin"
	| "afterbegin"
	| "beforeend"
	| "afterend"
	| "outerHTML"
	| "innerHTML";

export const swap = async (
	target: Element,
	swap: SwapType,
	newContent: JSXNode,
) => {
	swap = swap || "outerHTML";
	let insertBefore: Node = document.createComment("");

	switch (swap) {
		case "afterbegin":
			target.prepend(insertBefore);
			break;
		case "afterend":
			target.after(insertBefore);
			break;
		case "beforebegin":
			target.before(insertBefore);
			break;
		case "beforeend":
			target.append(insertBefore);
			break;
		case "outerHTML":
			break;
		case "innerHTML":
			break;
		default:
			throw new Error(`Unknown swap value: ${swap}`);
	}

	try {
		let processedFirstChunk = false;
		await render(newContent)
			.pipeThrough(new DOMStream())
			.pipeTo(
				new WritableStream({
					write(node) {
						if (!processedFirstChunk) {
							if (swap == "outerHTML") {
								target!.after(insertBefore);
								target!.remove();
							} else if (swap == "innerHTML") {
								target!.innerHTML = "";
								target!.append(insertBefore);
							}
							processedFirstChunk = true;
						}

						insertBefore.parentElement!.insertBefore(node, insertBefore);
					},
				}),
			);
	} finally {
		if (insertBefore?.parentElement) {
			insertBefore.parentElement.removeChild(insertBefore);
		}
	}
};
