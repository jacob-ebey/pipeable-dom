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
const DANGEROUSLY_SET_INNER_HTML = "dangerouslySetInnerHTML";
const FUNCTION = "function";
const OBJECT = "object";
const ITERATOR = "iterator";
const SYMBOL = Symbol;
const SYMBOL_ITERATOR = SYMBOL[ITERATOR];
const SYMBOL_ASYNC_ITERATOR = SYMBOL.asyncIterator;

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
	return (
		typeof obj == OBJECT && typeof obj?.[SYMBOL_ASYNC_ITERATOR] == FUNCTION
	);
};

const isGenerator = (obj: any): obj is Generator => {
	return (
		obj != null &&
		typeof obj == OBJECT &&
		typeof obj[SYMBOL_ITERATOR] == FUNCTION &&
		!Array.isArray(obj)
	);
};

const escapeHtml = (str: string): string => {
	return String(str).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

const renderAttributes = (props: JSXProps): string => {
	return Object.entries(props)
		.filter(([key]) => key != CHILDREN && key !== DANGEROUSLY_SET_INNER_HTML)
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

type RenderStackItem = {
	node: JSXNode;
	phase: "start" | "children" | "end";
	isArray?: boolean;
	arrayIndex?: number;
	type?: string | Component;
	props?: JSXProps;
	iterator?: Generator | AsyncGenerator;
};

export const renderAsync = async function* (
	initialNode: JSXNode,
): AsyncGenerator<string> {
	const stack: RenderStackItem[] = [{ node: initialNode, phase: "start" }];

	const pop = () => stack.pop();
	const push = (item: RenderStackItem) => stack.push(item);

	while (stack.length > 0) {
		try {
			const current = stack[stack.length - 1];
			const { node, phase } = current;

			if (node == null || node === false) {
				stack.pop();
				continue;
			}

			// Handle primitive types
			if (
				typeof node === "string" ||
				typeof node === "number" ||
				(typeof node === "boolean" && node)
			) {
				yield escapeHtml(String(node));
				pop();
				continue;
			}

			// Handle arrays
			if (Array.isArray(node)) {
				if (phase === "start") {
					current.isArray = true;
					current.arrayIndex = 0;
					current.phase = "children";
					if (node.length > 0) {
						push({ node: node[0], phase: "start" });
					}
				} else {
					if (current.arrayIndex! < node.length - 1) {
						current.arrayIndex!++;
						push({
							node: node[current.arrayIndex!],
							phase: "start",
						});
					} else {
						pop();
					}
				}
				continue;
			}

			// Handle promises
			if (instanceOf(node, Promise)) {
				const resolvedValue = await (node as any);
				pop();
				push({ node: resolvedValue, phase: "start" });
				continue;
			}

			// Handle async generators
			if (
				/*#__INLINE__*/ isGenerator(node) ||
				/*#__INLINE__*/ isAsyncGenerator(node)
			) {
				if (phase === "start") {
					const iterator: AsyncGenerator<JSXNode, any, any> =
						(node as any)[SYMBOL_ASYNC_ITERATOR]?.() ??
						(node as any)[SYMBOL_ITERATOR]();
					current[ITERATOR] = iterator;
					current.phase = "children";
					const result = await iterator.next();
					if (!result.done) {
						push({ node: result.value, phase: "start" });
					} else {
						pop();
					}
				} else {
					const result = await (
						current[ITERATOR] as AsyncGenerator<JSXNode, any, any>
					).next();
					if (!result.done) {
						push({ node: result.value, phase: "start" });
					} else {
						pop();
					}
				}
				continue;
			}

			// Handle JSX elements
			const element = node as JSXElementStructure;
			const { type, props } = element;

			// Handle function components
			if (typeof type === FUNCTION) {
				const result = (type as Component)(props);
				stack.pop();
				stack.push({ node: result, phase: "start" });
				continue;
			}

			// Handle HTML elements
			switch (phase) {
				case "start": {
					const attributes = /*#__INLINE__*/ renderAttributes(props);
					yield `<${type}${attributes}>`;

					if (voidElements.has((type as string).toLowerCase())) {
						stack.pop();
					} else {
						current.phase = "children";
						current.type = type;
						current.props = props;
						if (props[DANGEROUSLY_SET_INNER_HTML]) {
							yield props[DANGEROUSLY_SET_INNER_HTML].__html;
						} else if (props[CHILDREN]) {
							stack.push({ node: props[CHILDREN], phase: "start" });
						}
					}
					break;
				}
				case "children": {
					current.phase = "end";
					yield `</${current.type}>`;
					stack.pop();
					break;
				}
			}
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
