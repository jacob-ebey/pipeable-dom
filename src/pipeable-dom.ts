let LINK = "LINK";
let PRELOAD = "preload";
let SCRIPT = "SCRIPT";
let STYLE = "STYLE";
let STYLESHEET = "stylesheet";
let MODULE = "MODULE";
let NODE_TYPE = "nodeType";
let NODE_VALUE = "nodeValue";
let NULL = null;
let DOCUMENT = document;

export const isBlocking = (
  node: Node
): node is HTMLLinkElement | HTMLScriptElement => {
  let { tagName, src, rel, media } = node as HTMLLinkElement &
    HTMLScriptElement;
  return !!(
    (tagName == SCRIPT &&
      src &&
      ![MODULE, "async", "defer"].some((attr) =>
        (node as HTMLScriptElement).hasAttribute(attr)
      )) ||
    (tagName == LINK &&
      rel == STYLESHEET &&
      (!media || matchMedia(media).matches))
  );
};

export const domStream = (): TransformStream<string, Node> => {
  let doc = DOCUMENT.implementation.createHTMLDocument();
  let targetNodes = new WeakMap<Node, Node>();
  let inlineHostNode: Node | null = NULL;
  let isBlocked = false;
  let pendingText: Text | null = NULL;
  let scanNode: Node | null = NULL;
  let pendingPromises: Set<Promise<void>> = new Set();
  let lastSent: Node | null = NULL;
  let lastText: ChildNode;
  let controller: TransformStreamDefaultController<Node>;
  let walker = doc.createTreeWalker(
    (doc.write("<!DOCTYPE html><html><template>"),
    doc.body.firstChild as HTMLTemplateElement).content
  );

  let walk = () => {
    let node: Node | null;
    let clone: Node;
    let previousPendingText: Text;
    let parentNode: Node | undefined;
    let parentTagName: string;
    if (isBlocked) {
      preloadAssets();
      return;
    }

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

  let preloadAssets = () => {
    let node: Node | null;
    let blockedNode = walker.currentNode;
    let link: HTMLLinkElement | undefined;
    if (scanNode) walker.currentNode = scanNode;

    while ((node = walker.nextNode())) {
      link = getPreloadLink((scanNode = node));
      if (link) {
        link.onload = link.onerror = () => link.remove();
        appendChild(DOCUMENT.body, link);
      }
    }

    walker.currentNode = blockedNode;
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
    },
  });
};

let getPreloadLink = (node: any): HTMLLinkElement | undefined => {
  if (node[NODE_TYPE] != 1) return;

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
  } = node;

  switch (tagName) {
    case SCRIPT:
      if (src && !noModule) {
        link.href = src;
        link.rel = type == MODULE ? "modulepreload" : PRELOAD;
        link.as = SCRIPT;
      }
      break;
    case LINK:
      if (rel == STYLESHEET && (!media || matchMedia(media).matches)) {
        link.href = href;
        link.rel = PRELOAD;
        link.as = STYLE;
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

  if (link.rel) {
    if (integrity) link.integrity = integrity;
    if (crossOrigin) link.crossOrigin = crossOrigin;
  }

  return link.rel ? link : undefined;
};

let appendChild = (parent: Node, child: Node) => {
  parent.appendChild(child);
};
