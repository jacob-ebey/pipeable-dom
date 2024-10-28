import type {
	Component,
	JSX,
	JSXElementStructure,
	JSXNode,
	JSXPrimitive,
	JSXProps,
} from "./jsx-types.js";

export type {
	Component,
	JSX,
	JSXElementStructure,
	JSXNode,
	JSXPrimitive,
	JSXProps,
};
export { jsx as jsxDEV, jsx as jsxs };

const CHILDREN = "children";
const FUNCTION = "function";
const OBJECT = "object";

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

const instanceOf = <T extends new (...args: any) => any>(
	obj: any,
	Constructor: T,
): obj is InstanceType<T> => {
	return obj instanceof Constructor;
};

const isAsyncGenerator = (obj: any): obj is AsyncGenerator => {
	return typeof obj == OBJECT && typeof obj?.[Symbol.asyncIterator] == FUNCTION;
};

const isGenerator = (obj: any): obj is Generator => {
	return (
		obj != null &&
		typeof obj == OBJECT &&
		typeof obj[Symbol.iterator] == FUNCTION &&
		!Array.isArray(obj)
	);
};

const escapeHtml = (str: string): string => {
	return String(str).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

const renderAttributes = (props: JSXProps): string => {
	return Object.entries(props)
		.filter(([key]) => key != CHILDREN)
		.map(([key, value]) => {
			if (value === true) return ` ${key}`;
			if (value === false || value == null) return "";
			if (typeof value == OBJECT) {
				value = JSON.stringify(value);
			}
			if (
				value &&
				"$$typeof" &&
				value.$$typeof == Symbol.for("server.action") &&
				"$$action" in value
			) {
				value = value.$$action;
			}
			if (typeof value == FUNCTION) return "";
			return ` ${key}="${escapeHtml(String(value))}"`;
		})
		.join("");
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
			typeof node == "string" ||
			typeof node == "number" ||
			(typeof node == "boolean" && node)
		) {
			yield escapeHtml(String(node));
			return;
		}

		if (!node) {
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
		if (instanceOf(node, Promise)) {
			yield* renderAsync(await (node as any));
			return;
		}

		// Handle generators
		if (/*#__INLINE__*/ isGenerator(node)) {
			for (const chunk of node) {
				yield* renderAsync(chunk);
			}
			return;
		}

		// Handle async generators
		if (/*#__INLINE__*/ isAsyncGenerator(node)) {
			for await (const chunk of node) {
				yield* renderAsync(chunk);
			}
			return;
		}

		// Handle JSX elements
		const element = node as JSXElementStructure;
		const { type, props } = element;

		// Handle function components
		if (typeof type == FUNCTION) {
			yield* renderAsync((type as Component)(props));
			return;
		}

		// Handle HTML elements
		const attributes = /*#__INLINE__*/ renderAttributes(props);

		// Handle void elements
		if (voidElements.has((type as string).toLowerCase())) {
			yield `<${type}${attributes}>`;
			return;
		}

		yield `<${type}${attributes}>`;
		yield* renderAsync(props[CHILDREN]);
		yield `</${type}>`;
	} catch (error) {
		if (instanceOf(error, JSXRenderError)) {
			throw error;
		}
		throw new JSXRenderError(
			`Render failed: ${
				instanceOf(error, Error) ? error.message : "Unknown error"
			}`,
			instanceOf(error, Error) ? error : undefined,
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

export const jsx = (
	type: string | Component,
	props?: JSXProps,
): JSXElementStructure => {
	return {
		type,
		props: props ?? {},
	};
};

export const Fragment: Component = (props: JSXProps): JSXNode =>
	props[CHILDREN];

export class JSXRenderError extends Error {
	constructor(message: string, cause: unknown) {
		super(message);
		this.name = "JSXRenderError";
		this.cause = cause;
	}
}
