# pipeable-dom

![bundle size](https://deno.bundlejs.com/badge?q=pipeable-dom&treeshake=%5B*%5D)

Piecewise utilities to stream HTML content into a live document, or wherever else you want to pipe it.

This is a derivative of [@MarkdoDevTeam](https://x.com/MarkoDevTeam)'s [writable-dom](https://github.com/marko-js/writable-dom) that exposes lower-level utilities for working with the streamed HTML content.

## Installation

```bash
npm install pipeable-dom
```

## Usage

```typescript
import { domStream, blocking, preloadLink } from "pipeable-dom";

// Get a ReadableStream<Uint8Array> of HTML content from somewhere
fetch("https://example.com").then(async (response) => {
  // Pipe the HTML content through a TextDecoderStream and then a DOM parser
  // Get a ReadableStream<Node> of the parsed HTML content
  const stream = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(domStream());

  const buffer: Node[] = [];
  let blocked = false;
  let readAll = false;
  let resolve: () => void;
  let done = new Promise<void>((r) => {
    resolve = r;
  });
  const flushBuffer = () => {
    let node: Node | undefined;
    while (!blocked && (node = buffer.shift())) {
      document.body.appendChild(node);
      // Wait for blocking nodes to load before continuing to simulate the browser's
      // initial document loading behavior. This is important for scripts to be executed
      // in the correct order, and stylesheets to be applied before the content is rendered.
      if (blocking(node)) {
        blocked = true;
        node.onload = node.onerror = () => {
          blocked = false;
          // Continue to flush the buffer to the DOM
          flushBuffer();
        };
        break;
      }
    }

    if (readAll && !blocked && buffer.length === 0) {
      resolve();
    }
  };

  // Read the parsed nodes as they are available
  const reader = stream.getReader();
  let result: ReadableStreamReadResult<Node>;
  while (!(result = await reader.read()).done) {
    const node = result.value;
    // Add the node to the buffer
    buffer.push(node);

    // Preload any pre-loadable nodes we run across
    const preload = preloadLink(node);
    if (preload) {
      preload.onload = preload.onerror = () => {
        preload.remove();
      };
      document.head.appendChild(preload);
    }

    // Attempt to flush any buffered nodes to the DOM
    flushBuffer();
  }
  readAll = true;

  // Wait for everything to be done.
  await done;
});
```

## API

This module exposes two functions, the TransformStream API, and a utility function for determining if a node is blocking.

### `domStream(): TransformStream<string, Node>`

Creates a TransformStream that parses HTML string chunks into a stream of DOM nodes. These are "live" nodes that can be appended to a document and will update as child content is streamed in.

### `isBlocking(node: Node): node is HTMLLinkElement | HTMLScriptElement`

Determines if a node is a blocking node, such as a `<script>` or `<link>` element. This is useful for waiting for these nodes to load before continuing to stream content. It takes into account the `module`, `async` and `defer` attributes on `<script>` elements, and the `rel` and `media` attribute on `<link>` elements.

### `preloadLink(node: Node): HTMLLinkElement | null`

Get a <link> tag to preload <script>, <link>, and <img> tags in a manner similar to how the browser natively preloads during a document request.
