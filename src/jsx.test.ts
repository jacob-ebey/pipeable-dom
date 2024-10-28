import { describe, expect, it } from "vitest";

import type { JSXProps } from "./jsx.js";
import { Fragment, JSXRenderError, jsx, renderAsync } from "./jsx.js";

// Helper function to collect all chunks from an AsyncGenerator
async function collectOutput(
	generator: AsyncGenerator<string>,
): Promise<string> {
	let output = "";
	for await (const chunk of generator) {
		output += chunk;
	}
	return output;
}

describe("JSX Runtime", () => {
	describe("Basic Rendering", () => {
		it("renders primitive values", async () => {
			expect(await collectOutput(renderAsync("hello"))).toBe("hello");
			expect(await collectOutput(renderAsync(42))).toBe("42");
			expect(await collectOutput(renderAsync(true))).toBe("true");
			expect(await collectOutput(renderAsync(false))).toBe("");
			expect(await collectOutput(renderAsync(null))).toBe("");
			expect(await collectOutput(renderAsync(undefined))).toBe("");
		});

		it("renders Promise primitive values", async () => {
			expect(await collectOutput(renderAsync(Promise.resolve("hello")))).toBe(
				"hello",
			);
			expect(await collectOutput(renderAsync(Promise.resolve(42)))).toBe("42");
			expect(await collectOutput(renderAsync(Promise.resolve(true)))).toBe(
				"true",
			);
			expect(await collectOutput(renderAsync(Promise.resolve(false)))).toBe("");
			expect(await collectOutput(renderAsync(Promise.resolve(null)))).toBe("");
			expect(await collectOutput(renderAsync(Promise.resolve(undefined)))).toBe(
				"",
			);
		});

		it("renders basic HTML elements", async () => {
			const element = jsx("div");
			expect(await collectOutput(renderAsync(element))).toBe("<div></div>");
		});

		it("renders basic HTML elements with attributes", async () => {
			const element = jsx("div", {
				class: "test",
				"data-bool": true,
				"data-false": false,
				"data-null": null,
				"data-undefined": undefined,
			});
			expect(await collectOutput(renderAsync(element))).toBe(
				'<div class="test" data-bool></div>',
			);
		});

		it("renders server references as attributes", async () => {
			const serverAction = () => {};
			serverAction.$$typeof = Symbol.for("server.action");
			serverAction.$$action = "?action-123";
			const element = jsx("form", {
				action: serverAction,
			});
			expect(await collectOutput(renderAsync(element))).toBe(
				'<form action="?action-123"></form>',
			);
		});

		it("handles void elements correctly", async () => {
			const elements = [
				jsx("img", { src: "test.jpg", alt: "test" }),
				jsx("br", {}),
				jsx("input", { type: "text" }),
			];

			expect(await collectOutput(renderAsync(elements[0]))).toBe(
				'<img src="test.jpg" alt="test">',
			);
			expect(await collectOutput(renderAsync(elements[1]))).toBe("<br>");
			expect(await collectOutput(renderAsync(elements[2]))).toBe(
				'<input type="text">',
			);
		});

		it("escapes HTML in text content", async () => {
			const text = '<script>alert("xss")</script>';
			expect(await collectOutput(renderAsync(text))).toBe(
				"&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
			);
		});

		it("escapes HTML in attributes", async () => {
			const element = jsx("div", {
				"data-test": '"><script>alert("xss")</script>',
			});
			expect(await collectOutput(renderAsync(element))).toBe(
				'<div data-test="&quot;&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;"></div>',
			);
		});
	});

	describe("Component Rendering", () => {
		it("renders function components", async () => {
			const Component = ({ name }: { name: string }) =>
				jsx("div", { children: `Hello ${name}` });
			const element = jsx(Component, { name: "World" });
			expect(await collectOutput(renderAsync(element))).toBe(
				"<div>Hello World</div>",
			);
		});

		it("renders nested components", async () => {
			const Child = ({ text }: { text: string }) =>
				jsx("span", { children: text });
			const Parent = ({ children }: JSXProps) => jsx("div", { children });

			const element = jsx(Parent, {
				children: jsx(Child, { text: "test" }),
			});

			expect(await collectOutput(renderAsync(element))).toBe(
				"<div><span>test</span></div>",
			);
		});

		it("handles fragments", async () => {
			const element = jsx(Fragment, {
				children: [
					jsx("div", { id: 1, children: "first" }),
					jsx("div", { id: 2, children: "second" }),
				],
			});

			expect(await collectOutput(renderAsync(element))).toBe(
				'<div id="1">first</div><div id="2">second</div>',
			);
		});
	});

	describe("Async Components", () => {
		it("renders async components", async () => {
			const AsyncComponent = async () =>
				jsx("div", { children: "async content" });
			const element = jsx(AsyncComponent, {});
			expect(await collectOutput(renderAsync(element))).toBe(
				"<div>async content</div>",
			);
		});

		it("handles nested async components", async () => {
			const AsyncChild = async () => jsx("span", { children: "async child" });
			const AsyncParent = async () =>
				jsx("div", {
					children: jsx(AsyncChild, {}),
				});

			const element = jsx(AsyncParent, {});
			expect(await collectOutput(renderAsync(element))).toBe(
				"<div><span>async child</span></div>",
			);
		});
	});

	describe("Generator Components", () => {
		it("renders generator components", async () => {
			function* GeneratorComponent() {
				yield jsx("div", { children: "chunk 1" });
				yield jsx("div", { children: "chunk 2" });
			}

			const element = jsx(GeneratorComponent, {});
			expect(await collectOutput(renderAsync(element))).toBe(
				"<div>chunk 1</div><div>chunk 2</div>",
			);
		});

		it("tests streaming output order", async () => {
			function* GeneratorComponent() {
				yield jsx("div", { children: "chunk 1" });
				yield jsx("div", { children: "chunk 2" });
			}

			const element = jsx(GeneratorComponent, {});
			const chunks: string[] = [];
			for await (const chunk of renderAsync(element)) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				"<div>",
				"chunk 1",
				"</div>",
				"<div>",
				"chunk 2",
				"</div>",
			]);
		});

		it("renders async generator components", async () => {
			async function* AsyncGeneratorComponent() {
				yield jsx("div", { children: "async chunk 1" });
				yield jsx("div", { children: "async chunk 2" });
			}

			const element = jsx(AsyncGeneratorComponent, {});
			expect(await collectOutput(renderAsync(element))).toBe(
				"<div>async chunk 1</div><div>async chunk 2</div>",
			);
		});

		it("tests async streaming output order", async () => {
			async function* AsyncGeneratorComponent() {
				yield jsx("div", { children: "async chunk 1" });
				await Promise.resolve(); // Simulate delay
				yield jsx("div", { children: "async chunk 2" });
			}

			const element = jsx(AsyncGeneratorComponent, {});
			const chunks: string[] = [];
			for await (const chunk of renderAsync(element)) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				"<div>",
				"async chunk 1",
				"</div>",
				"<div>",
				"async chunk 2",
				"</div>",
			]);
		});
	});

	describe("Attribute Handling", () => {
		it("handles boolean attributes", async () => {
			const element1 = jsx("input", { disabled: true });
			const element2 = jsx("input", { disabled: false });

			expect(await collectOutput(renderAsync(element1))).toBe(
				"<input disabled>",
			);
			expect(await collectOutput(renderAsync(element2))).toBe("<input>");
		});

		it("handles event handlers correctly", async () => {
			const handler = () => console.log("click");
			const element = jsx("button", { onclick: handler });

			expect(await collectOutput(renderAsync(element))).toBe(
				"<button></button>",
			);
		});

		it("handles style objects", async () => {
			const element = jsx("div", {
				style: "color: red; background-color: blue;",
			});

			expect(await collectOutput(renderAsync(element))).toBe(
				'<div style="color: red; background-color: blue;"></div>',
			);
		});
	});

	describe("Error Handling", () => {
		it("throws JSXRenderError for invalid elements", async () => {
			const invalidElement = { invalid: "structure" } as any;

			await expect(() =>
				collectOutput(renderAsync(invalidElement)),
			).rejects.toThrow(JSXRenderError);
		});

		it("propagates errors from components", async () => {
			const ErrorComponent = () => {
				throw new Error("Component error");
			};

			await expect(() =>
				collectOutput(renderAsync(jsx(ErrorComponent, {}))),
			).rejects.toThrow(JSXRenderError);
		});

		it("handles errors in async components", async () => {
			const AsyncErrorComponent = async () => {
				throw new Error("Async error");
			};

			await expect(() =>
				collectOutput(renderAsync(jsx(AsyncErrorComponent, {}))),
			).rejects.toThrow(JSXRenderError);
		});
	});

	describe("Complex Scenarios", () => {
		it("renders a complex nested structure", async () => {
			const Header = ({ title }: { title: string }) =>
				jsx("header", { children: jsx("h1", { children: title }) });

			const List = ({ items }: { items: string[] }) =>
				jsx("ul", {
					children: items.map((item) =>
						jsx("li", { id: item, children: item }),
					),
				});

			const App = () =>
				jsx("div", {
					children: [
						jsx(Header, { title: "My App" }),
						jsx(List, { items: ["one", "two", "three"] }),
					],
				});

			const expected =
				"<div>" +
				"<header><h1>My App</h1></header>" +
				'<ul><li id="one">one</li><li id="two">two</li><li id="three">three</li></ul>' +
				"</div>";

			expect(await collectOutput(renderAsync(jsx(App, {})))).toBe(expected);
		});

		it("verifies streaming output of complex structure", async () => {
			const ComplexApp = () =>
				jsx("div", {
					children: [
						jsx("header", { children: "Header" }),
						jsx("main", { children: "Content" }),
						jsx("footer", { children: "Footer" }),
					],
				});

			const chunks: string[] = [];
			for await (const chunk of renderAsync(jsx(ComplexApp, {}))) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				"<div>",
				"<header>",
				"Header",
				"</header>",
				"<main>",
				"Content",
				"</main>",
				"<footer>",
				"Footer",
				"</footer>",
				"</div>",
			]);
		});
	});
});
