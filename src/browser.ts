import { DOMStream } from "pipeable-dom";
import type { JSXNode } from "pipeable-dom/jsx";
import { render } from "pipeable-dom/jsx";

const INNER_HTML = "innerHTML";
const OUTER_HTML = "outerHTML";

export type SwapType =
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
	swap = swap || OUTER_HTML;
	let insertBefore: Node = document.createComment("");

	if (swap == "afterbegin") {
		target.prepend(insertBefore);
	} else if (swap == "afterend") {
		target.after(insertBefore);
	} else if (swap == "beforebegin") {
		target.before(insertBefore);
	} else if (swap == "beforeend") {
		target.append(insertBefore);
	} else if (swap != OUTER_HTML && swap != INNER_HTML) {
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
							if (swap == OUTER_HTML) {
								target!.after(insertBefore);
								target!.remove();
							} else if (swap == INNER_HTML) {
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
