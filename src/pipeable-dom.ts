let LINK = "LINK" as const;
let PRELOAD = "preload" as const;
let SCRIPT = "SCRIPT" as const;
let STYLE = "STYLE" as const;
let STYLESHEET = "stylesheet" as const;
let MODULE = "MODULE" as const;
let NODE_TYPE = "nodeType" as const;
let NODE_VALUE = "nodeValue" as const;
let NULL = null;
let DOCUMENT = document;

export let domStream = (): TransformStream<string, Node> => {
	let doc = DOCUMENT.implementation.createHTMLDocument();
	let walker = doc.createTreeWalker(
		(doc.write("<!DOCTYPE html><html><template>"),
		doc.body.firstChild as HTMLTemplateElement).content,
	);
	let targetNodes = new WeakMap<Node, Node>();
	let inlineHostNode: Node | null = NULL;
	let pendingText: Text | null = NULL;
	let pendingPromises: Set<Promise<void>> = new Set();
	let lastSent: Node | null = NULL;
	let lastText: ChildNode | null;
	let controller: TransformStreamDefaultController<Node>;

	let walk = () => {
		let node: Node | null;
		let clone: Node;
		let previousPendingText: Text | null;
		let parentNode: Node | undefined;
		let parentTagName: string;

		while ((node = walker.nextNode())) {
			clone = DOCUMENT.importNode(node, false);
			previousPendingText = pendingText;

			if (node[NODE_TYPE] == 3) {
				pendingText = node as Text;
			} else {
				pendingText = NULL;
			}

			parentNode = targetNodes.get(node.parentNode!);
			targetNodes.set(node, clone);

			parentTagName = (parentNode as Element)?.tagName;
			if (
				parentNode &&
				(parentTagName == STYLE ||
					(parentTagName == SCRIPT && !(parentNode as HTMLScriptElement).src))
			) {
				inlineHostNode = parentNode;
			} else {
				if (previousPendingText && inlineHostNode)
					appendChild(inlineHostNode, previousPendingText);
				inlineHostNode = NULL;

				if (!parentNode) {
					lastSent = clone;
					controller.enqueue(clone);
				} else {
					appendChild(parentNode, clone);
				}
			}
		}
	};

	return new TransformStream({
		start(c) {
			controller = c;
		},
		transform(chunk) {
			doc.write(chunk);
			walk();
		},
		async flush() {
			while (pendingPromises.size) {
				await Promise.all(pendingPromises);
			}

			if (pendingText && inlineHostNode) {
				appendChild(inlineHostNode, pendingText);
			} else if (pendingText) {
				if (lastSent?.[NODE_TYPE] == 3) {
					lastSent[NODE_VALUE] = pendingText[NODE_VALUE];
				} else if (lastSent) {
					lastText = lastSent.lastChild;
					if (lastText && lastText[NODE_TYPE] == 3) {
						lastText[NODE_VALUE] = pendingText[NODE_VALUE];
					} else {
						appendChild(lastSent, pendingText);
					}
				} else {
					controller.enqueue(pendingText);
				}
			}

			doc.close();
			controller.terminate();
		},
	});
};

export let blocking = (
	node: Node,
): node is HTMLLinkElement | HTMLScriptElement => {
	let { tagName, src, rel, media } = node as HTMLLinkElement &
		HTMLScriptElement;
	return !!(
		(tagName == SCRIPT &&
			src &&
			![MODULE, "async", "defer"].some((attr) =>
				(node as HTMLScriptElement).hasAttribute(attr),
			)) ||
		(tagName == LINK &&
			rel == STYLESHEET &&
			(!media || matchMedia(media).matches))
	);
};

export let preloadLink = (node: Node): HTMLLinkElement | null => {
	if (node[NODE_TYPE] !== 1) return NULL;

	let link = DOCUMENT.createElement(LINK) as HTMLLinkElement;
	let {
		tagName,
		src,
		noModule,
		type,
		rel,
		media,
		href,
		srcset,
		sizes,
		integrity,
		crossOrigin,
	} = node as HTMLScriptElement & HTMLImageElement & HTMLLinkElement;

	let setLinkAttributes = (href: string, rel: string, as: string) => {
		link.href = href;
		link.rel = rel;
		link.as = as;
		if (integrity) link.integrity = integrity;
		if (crossOrigin) link.crossOrigin = crossOrigin;
	};

	switch (tagName) {
		case SCRIPT:
			if (src && !noModule) {
				setLinkAttributes(
					src,
					type === "module" ? "modulepreload" : PRELOAD,
					SCRIPT,
				);
			}
			break;
		case LINK:
			if (rel === STYLESHEET && (!media || matchMedia(media).matches)) {
				setLinkAttributes(href, PRELOAD, STYLE);
			}
			break;
		case "IMG":
			link.rel = PRELOAD;
			link.as = "image";
			if (srcset) {
				link.imageSrcset = srcset;
				link.imageSizes = sizes;
			} else {
				link.href = src;
			}
			break;
	}

	return link.rel ? link : NULL;
};

let appendChild = (parent: Node, child: Node) => {
	parent.appendChild(child);
};
