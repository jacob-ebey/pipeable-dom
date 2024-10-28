import { describe, expect, it } from "vitest";

import { swap } from "./browser.js";
import { jsx } from "./jsx.js";

describe("swap", () => {
	it("can swap outerHTML", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await swap(
			target,
			"outerHTML",
			jsx("div", { class: "test", children: "hello" }),
		);
		expect(container.innerHTML).toBe('<div class="test">hello</div>');
	});

	it("can swap innerHTML", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await swap(
			target,
			"innerHTML",
			jsx("div", { class: "test", children: "hello" }),
		);
		expect(container.innerHTML).toBe(
			'<div><div class="test">hello</div></div>',
		);
	});

	it("can swap beforebegin", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await swap(
			target,
			"beforebegin",
			jsx("div", { class: "test", children: "hello" }),
		);
		expect(container.innerHTML).toBe(
			'<div class="test">hello</div><div>initial</div>',
		);
	});

	it("can swap afterbegin", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await swap(
			target,
			"afterbegin",
			jsx("div", { class: "test", children: "hello" }),
		);
		expect(container.innerHTML).toBe(
			'<div><div class="test">hello</div>initial</div>',
		);
	});

	it("can swap beforeend", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await swap(
			target,
			"beforeend",
			jsx("div", { class: "test", children: "hello" }),
		);
		expect(container.innerHTML).toBe(
			'<div>initial<div class="test">hello</div></div>',
		);
	});

	it("can swap afterend", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await swap(
			target,
			"afterend",
			jsx("div", { class: "test", children: "hello" }),
		);
		expect(container.innerHTML).toBe(
			'<div>initial</div><div class="test">hello</div>',
		);
	});

	it("throws for unknown swap values", async () => {
		const container = document.createElement("div");
		const target = document.createElement("div");
		target.innerHTML = "initial";
		container.appendChild(target);
		document.body.appendChild(container);

		await expect(() =>
			swap(
				target,
				"invalid" as any,
				jsx("div", { class: "test", children: "hello" }),
			),
		).rejects.toThrowError("Unknown swap value: invalid");
	});
});
