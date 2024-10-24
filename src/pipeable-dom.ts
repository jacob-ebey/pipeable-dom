const doc = document;
const head = doc.head;
const MODULE_PRELOAD = "modulepreload";
const LINK = "LINK";
const PRELOAD = "preload";
const SCRIPT = "SCRIPT";
const STYLE = "STYLE";
const STYLESHEET = "stylesheet";
const SRC = "src";
const MODULE = "module";
const HREF = "href";
const REL = "rel";
const TYPE = "type";
const CURRENT_NODE = "currentNode";
const PARENT_NODE = "parentNode";
const HAS_ATTRIBUTE = "hasAttribute";
const MEDIA = "media";
const TAG_NAME = "tagName";
const NULL: null = null;
const NODE_TYPE = "nodeType";
const APPEND_CHILD = "appendChild";
const PROMISE = Promise;

const appendInlineTextIfNeeded = (
	pendingText: Text | null,
	inlineTextHostNode: Node | null,
) => pendingText && inlineTextHostNode?.[APPEND_CHILD](pendingText);

const instanceOf = <T>(
	value: unknown,
	Constructor: new (...args: any[]) => T,
): value is T => value instanceof Constructor;

const isInlineHost = (node: Node, tagName?: string): node is Element => {
	tagName = (node as Element)?.[TAG_NAME];
	return (
		(tagName == SCRIPT && !(node as HTMLScriptElement)[SRC]) || tagName == STYLE
	);
};

const isBlocking = (
	node: Node,
): node is HTMLScriptElement | HTMLLinkElement => {
	let isPotentialScriptOrLinkElement = (
		node: Node,
	): node is HTMLScriptElement & HTMLLinkElement => {
		return node[NODE_TYPE] == 1;
	};
	return (
		/*#__INLINE__*/ isPotentialScriptOrLinkElement(node) &&
		((node[TAG_NAME] == SCRIPT &&
			node[SRC] &&
			!(
				node.noModule ||
				node[TYPE] == MODULE ||
				node[HAS_ATTRIBUTE]("async") ||
				node[HAS_ATTRIBUTE]("defer")
			)) ||
			(node[TAG_NAME] == LINK &&
				node[REL] == STYLESHEET &&
				(!node[MEDIA] || matchMedia(node[MEDIA]).matches)))
	);
};

const getPreloadLink = (
	node: Node,
	link?: HTMLLinkElement | null,
): HTMLLinkElement | null => {
	link = doc.createElement(LINK) as HTMLLinkElement;
	let isElement = (node: Node): node is Element => {
		return node[NODE_TYPE] == 1;
	};
	if (!(/*#__INLINE__*/ isElement(node))) {
		return NULL;
	}

	if (node[TAG_NAME] == "IMG") {
		if (instanceOf(node, HTMLImageElement) && node[SRC]) {
			link[REL] = PRELOAD;
			link[HREF] = node[SRC];
			link.as = "image";
		} else {
			link = NULL;
		}
	} else if (node[TAG_NAME] == LINK) {
		if (instanceOf(node, HTMLLinkElement) && node[HREF]) {
			if (node[REL] == STYLESHEET) {
				link![REL] = PRELOAD;
				link![HREF] = node[HREF];
				link!.as = STYLE;
				if (node[MEDIA]) {
					link![MEDIA] = node[MEDIA];
				}
			} else if (node[REL] == MODULE_PRELOAD) {
				link![REL] = MODULE_PRELOAD;
				link![HREF] = node[HREF];
			} else {
				link = NULL;
			}
		} else {
			link = NULL;
		}
	} else if (node[TAG_NAME] == SCRIPT) {
		if (instanceOf(node, HTMLScriptElement) && node[SRC]) {
			link[HREF] = node[SRC];
			if (node[TYPE] == MODULE) {
				link[REL] = MODULE_PRELOAD;
			} else {
				link[REL] = PRELOAD;
				link.as = SCRIPT;
			}
			if (node[TYPE]) {
				link[TYPE] = node[TYPE];
			}
			if (!node.noModule) {
				link.setAttribute("crossorigin", "");
			}
		} else {
			link = NULL;
		}
	}

	return link;
};

export class DOMStream extends TransformStream<string, Node> {
	constructor() {
		let tmpDoc = doc.implementation.createHTMLDocument();
		let walker = tmpDoc.createTreeWalker(
			(tmpDoc.write("<!DOCTYPE html><body><template>"),
			(tmpDoc.body.firstChild as HTMLTemplateElement).content),
		);
		let targetNodes = new WeakMap<Node, Node>();
		let blocked = false;
		let inlineHostNode: Node | null;
		let pendingText: Text | null;
		let scanNode: Node | null;
		let resolve: (() => void) | null;
		let controller: TransformStreamDefaultController<Node>;
		let node: Node | null;
		let blockedNode: Node | null;

		let scan = () => {
			blockedNode = walker[CURRENT_NODE];
			if (scanNode) walker[CURRENT_NODE] = scanNode;

			while ((node = walker.nextNode())) {
				let link = /*#__INLINE__*/ getPreloadLink((scanNode = node));
				if (link) {
					link.onload = link.onerror = () => head.removeChild(link);
					head[APPEND_CHILD](link);
				}
			}

			walker[CURRENT_NODE] = blockedNode;
		};

		let parentNode: Node | null;
		let parse = () => {
			while ((node = walker.nextNode())) {
				let clone = doc.importNode(node, false);
				let previousPendingText = pendingText;

				if (node[NODE_TYPE] == 3) {
					pendingText = node as Text;
				} else {
					pendingText = NULL;

					if (/*#__INLINE__*/ isBlocking(clone)) {
						blocked = true;
						clone.onload = clone.onerror = () => {
							blocked = false;
							if (clone[PARENT_NODE]) process();
						};
					}
				}

				parentNode = targetNodes.get(node[PARENT_NODE]!)!;
				targetNodes.set(node, clone);

				if (/*#__INLINE__*/ isInlineHost(parentNode!)) {
					inlineHostNode = parentNode;
				} else {
					appendInlineTextIfNeeded(previousPendingText, inlineHostNode);
					inlineHostNode = NULL;

					if (!parentNode) {
						controller.enqueue(clone);
					} else {
						parentNode[APPEND_CHILD](clone);
					}
				}

				if (blocked) return process();
			}

			if (resolve) resolve();
		};

		let process = () => {
			if (pendingText && !inlineHostNode) {
				(targetNodes.get(pendingText) as Text).data = pendingText.data;
			}

			if (blocked) {
				/*#__INLINE__*/ scan();
			} else {
				/*#__INLINE__*/ parse();
			}
		};

		super({
			start(c) {
				controller = c;
			},
			transform(chunk) {
				tmpDoc.write(chunk);
				process();
			},
			async flush() {
				await (blocked ? new PROMISE<void>((_) => (resolve = _)) : NULL);
				appendInlineTextIfNeeded(pendingText, inlineHostNode);
			},
		});
	}
}
