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
	newContent:
		| JSXNode
		| Response
		| ReadableStream<string>
		| ReadableStream<Uint8Array>,
) => {
	let body: ReadableStream<string>;
	if (newContent instanceof Response) {
		if (!newContent.body) {
			throw new Error("Response body is not readable");
		}
		body = newContent.body.pipeThrough(new TextDecoderStream());
	} else if (newContent instanceof ReadableStream) {
		let decoder = new TextDecoder();
		body = newContent.pipeThrough(
			new TransformStream<Uint8Array | string, string>({
				transform(chunk, controller) {
					if (typeof chunk === "string") {
						controller.enqueue(chunk);
					} else {
						controller.enqueue(decoder.decode(chunk, { stream: true }));
					}
				},
			}),
		);
	} else {
		body = render(newContent);
	}

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
		let transition: ViewTransition | undefined;
		let donePromise = body.pipeThrough(new DOMStream()).pipeTo(
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

					if (typeof document.startViewTransition != "undefined") {
						let lastTransition = transition;
						transition = document.startViewTransition(() => {
							if (lastTransition) lastTransition.skipTransition();
							insertBefore.parentElement!.insertBefore(node, insertBefore);
						});
					} else {
						insertBefore.parentElement!.insertBefore(node, insertBefore);
					}
				},
			}),
		);
		await donePromise;
		await transition?.finished;
	} finally {
		if (insertBefore?.parentElement) {
			insertBefore.parentElement.removeChild(insertBefore);
		}
	}
};
