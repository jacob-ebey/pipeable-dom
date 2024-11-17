export type JSXPrimitive = string | number | boolean | null | undefined;

export interface JSXProps {
	children?: JSXNode;
	[key: string]: any;
}

export interface JSXElementStructure {
	type: string | Component;
	props: JSXProps;
}

export type Component = (props: any) => JSXNode;

export type JSXNode =
	| JSXPrimitive
	| JSXElementStructure
	| Array<JSXNode>
	| Promise<JSXNode>
	| Generator<JSXNode, void, unknown>
	| AsyncGenerator<JSXNode, void, unknown>;

export type ActionFunction = (request: Request) => unknown;

export declare namespace JSX {
	type HTMLAttributeAnchorTarget = "_self" | "_blank" | "_parent" | "_top";
	type HTMLInputTypeAttribute =
		| "button"
		| "checkbox"
		| "color"
		| "date"
		| "datetime-local"
		| "email"
		| "file"
		| "hidden"
		| "image"
		| "month"
		| "number"
		| "password"
		| "radio"
		| "range"
		| "reset"
		| "search"
		| "submit"
		| "tel"
		| "text"
		| "time"
		| "url"
		| "week";

	interface HTMLAttributes {
		// JSX properties
		dangerouslySetInnerHTML?: null | { __html: string };

		// Global HTML attributes
		accesskey?: null | string;
		class?: null | string;
		contenteditable?: null | boolean | "true" | "false";
		dir?: null | "ltr" | "rtl" | "auto";
		draggable?: null | boolean | "true" | "false";
		hidden?: null | boolean;
		id?: null | string;
		lang?: null | string;
		spellcheck?: null | boolean | "true" | "false";
		style?: null | string;
		tabindex?: null | number;
		title?: null | string;
		translate?: null | "yes" | "no";

		// ARIA attributes
		role?: null | string;
		"aria-activedescendant"?: null | string;
		"aria-atomic"?: null | boolean | "true" | "false";
		"aria-autocomplete"?: null | "none" | "inline" | "list" | "both";
		"aria-busy"?: null | boolean | "true" | "false";
		"aria-checked"?: null | boolean | "true" | "false" | "mixed";
		"aria-colcount"?: null | number;
		"aria-colindex"?: null | number;
		"aria-colspan"?: null | number;
		"aria-controls"?: null | string;
		"aria-current"?:
			| boolean
			| "true"
			| "false"
			| "page"
			| "step"
			| "location"
			| "date"
			| "time";
		"aria-describedby"?: null | string;
		"aria-details"?: null | string;
		"aria-disabled"?: null | boolean | "true" | "false";
		"aria-dropeffect"?:
			| null
			| "none"
			| "copy"
			| "execute"
			| "link"
			| "move"
			| "popup";
		"aria-errormessage"?: null | string;
		"aria-expanded"?: null | boolean | "true" | "false";
		"aria-flowto"?: null | string;
		"aria-grabbed"?: null | boolean | "true" | "false";
		"aria-haspopup"?:
			| boolean
			| "true"
			| "false"
			| "menu"
			| "listbox"
			| "tree"
			| "grid"
			| "dialog";
		"aria-hidden"?: null | boolean | "true" | "false";
		"aria-invalid"?: null | boolean | "true" | "false" | "grammar" | "spelling";
		"aria-keyshortcuts"?: null | string;
		"aria-label"?: null | string;
		"aria-labelledby"?: null | string;
		"aria-level"?: null | number;
		"aria-live"?: null | "off" | "assertive" | "polite";
		"aria-modal"?: null | boolean | "true" | "false";
		"aria-multiline"?: null | boolean | "true" | "false";
		"aria-multiselectable"?: null | boolean | "true" | "false";
		"aria-orientation"?: null | "horizontal" | "vertical";
		"aria-owns"?: null | string;
		"aria-placeholder"?: null | string;
		"aria-posinset"?: null | number;
		"aria-pressed"?: null | boolean | "true" | "false" | "mixed";
		"aria-readonly"?: null | boolean | "true" | "false";
		"aria-relevant"?:
			| "additions"
			| "additions removals"
			| "additions text"
			| "all"
			| "removals"
			| "removals additions"
			| "removals text"
			| "text"
			| "text additions"
			| "text removals";
		"aria-required"?: null | boolean | "true" | "false";
		"aria-roledescription"?: null | string;
		"aria-rowcount"?: null | number;
		"aria-rowindex"?: null | number;
		"aria-rowspan"?: null | number;
		"aria-selected"?: null | boolean | "true" | "false";
		"aria-setsize"?: null | number;
		"aria-sort"?: null | "none" | "ascending" | "descending" | "other";
		"aria-valuemax"?: null | number;
		"aria-valuemin"?: null | number;
		"aria-valuenow"?: null | number;
		"aria-valuetext"?: null | string;

		// Event handlers
		onabort?: null | string;
		onblur?: null | string;
		oncancel?: null | string;
		oncanplay?: null | string;
		oncanplaythrough?: null | string;
		onchange?: null | string;
		onclick?: null | string;
		onclose?: null | string;
		oncontextmenu?: null | string;
		oncuechange?: null | string;
		ondblclick?: null | string;
		ondrag?: null | string;
		ondragend?: null | string;
		ondragenter?: null | string;
		ondragleave?: null | string;
		ondragover?: null | string;
		ondragstart?: null | string;
		ondrop?: null | string;
		ondurationchange?: null | string;
		onemptied?: null | string;
		onended?: null | string;
		onerror?: null | string;
		onfocus?: null | string;
		oninput?: null | string;
		oninvalid?: null | string;
		onkeydown?: null | string;
		onkeypress?: null | string;
		onkeyup?: null | string;
		onload?: null | string;
		onloadeddata?: null | string;
		onloadedmetadata?: null | string;
		onloadstart?: null | string;
		onmousedown?: null | string;
		onmouseenter?: null | string;
		onmouseleave?: null | string;
		onmousemove?: null | string;
		onmouseout?: null | string;
		onmouseover?: null | string;
		onmouseup?: null | string;
		onpause?: null | string;
		onplay?: null | string;
		onplaying?: null | string;
		onprogress?: null | string;
		onratechange?: null | string;
		onreset?: null | string;
		onresize?: null | string;
		onscroll?: null | string;
		onseeked?: null | string;
		onseeking?: null | string;
		onselect?: null | string;
		onstalled?: null | string;
		onsubmit?: null | string;
		onsuspend?: null | string;
		ontimeupdate?: null | string;
		ontoggle?: null | string;
		onvolumechange?: null | string;
		onwaiting?: null | string;
		onwheel?: null | string;
	}

	interface IntrinsicElements {
		[element: string]: HTMLAttributes;

		// Main root
		html: HTMLAttributes & {
			lang?: null | string;
			manifest?: null | string;
			xmlns?: null | string;
		};

		// Document metadata
		head: HTMLAttributes;
		title: HTMLAttributes;
		base: HTMLAttributes & {
			href?: null | string;
			target?: null | string;
		};
		link: HTMLAttributes & {
			href?: null | string;
			rel?: null | string;
			media?: null | string;
			type?: null | string;
			sizes?: null | string;
		};
		meta: HTMLAttributes & {
			charset?: null | string;
			content?: null | string;
			httpEquiv?: null | string;
			name?: null | string;
		};
		style: HTMLAttributes & {
			media?: null | string;
			nonce?: null | string;
			type?: null | string;
		};

		// Sections
		body: HTMLAttributes;
		article: HTMLAttributes;
		section: HTMLAttributes;
		nav: HTMLAttributes;
		aside: HTMLAttributes;
		h1: HTMLAttributes;
		h2: HTMLAttributes;
		h3: HTMLAttributes;
		h4: HTMLAttributes;
		h5: HTMLAttributes;
		h6: HTMLAttributes;
		header: HTMLAttributes;
		footer: HTMLAttributes;
		address: HTMLAttributes;
		main: HTMLAttributes;

		// Grouping content
		p: HTMLAttributes;
		hr: HTMLAttributes;
		pre: HTMLAttributes;
		blockquote: HTMLAttributes & {
			cite?: null | string;
		};
		ol: HTMLAttributes & {
			reversed?: null | boolean;
			start?: null | number;
			type?: null | "1" | "a" | "A" | "i" | "I";
		};
		ul: HTMLAttributes;
		li: HTMLAttributes & {
			value?: null | number;
		};
		dl: HTMLAttributes;
		dt: HTMLAttributes;
		dd: HTMLAttributes;
		figure: HTMLAttributes;
		figcaption: HTMLAttributes;
		div: HTMLAttributes;

		// Text-level semantics
		a: HTMLAttributes & {
			href?: null | string;
			target?: null | HTMLAttributeAnchorTarget;
			download?: null | any;
			rel?: null | string;
		};
		em: HTMLAttributes;
		strong: HTMLAttributes;
		small: HTMLAttributes;
		s: HTMLAttributes;
		cite: HTMLAttributes;
		q: HTMLAttributes & {
			cite?: null | string;
		};
		dfn: HTMLAttributes;
		abbr: HTMLAttributes;
		data: HTMLAttributes & {
			value: string;
		};
		time: HTMLAttributes & {
			datetime?: null | string;
		};
		code: HTMLAttributes;
		var: HTMLAttributes;
		samp: HTMLAttributes;
		kbd: HTMLAttributes;
		sub: HTMLAttributes;
		sup: HTMLAttributes;
		i: HTMLAttributes;
		b: HTMLAttributes;
		u: HTMLAttributes;
		mark: HTMLAttributes;
		ruby: HTMLAttributes;
		rt: HTMLAttributes;
		rp: HTMLAttributes;
		bdi: HTMLAttributes;
		bdo: HTMLAttributes & {
			dir: "rtl" | "ltr";
		};
		span: HTMLAttributes;
		br: HTMLAttributes;
		wbr: HTMLAttributes;

		// Forms
		form: HTMLAttributes & {
			acceptCharset?: null | string;
			action?: null | string | ActionFunction;
			autocomplete?: null | string;
			enctype?: null | string;
			method?: null | "get" | "post";
			name?: null | string;
			novalidate?: null | boolean;
			target?: null | string;
		};
		label: HTMLAttributes & {
			for?: null | string;
		};
		input: HTMLAttributes & {
			accept?: null | string;
			alt?: null | string;
			autocomplete?: null | string;
			autofocus?: null | boolean;
			checked?: null | boolean;
			dirname?: null | string;
			disabled?: null | boolean;
			form?: null | string;
			formaction?: null | string | ActionFunction;
			formenctype?: null | string;
			formmethod?: null | string;
			formnovalidate?: null | boolean;
			formtarget?: null | string;
			height?: null | number | string;
			list?: null | string;
			max?: null | number | string;
			maxlength?: null | number;
			min?: null | number | string;
			minlength?: null | number;
			multiple?: null | boolean;
			name?: null | string;
			pattern?: null | string;
			placeholder?: null | string;
			readonly?: null | boolean;
			required?: null | boolean;
			size?: null | number;
			src?: null | string;
			step?: null | number | string;
			type?: null | HTMLInputTypeAttribute;
			value?: null | string | string[] | number;
			width?: null | number | string;
		};
		button: HTMLAttributes & {
			autofocus?: null | boolean;
			disabled?: null | boolean;
			form?: null | string;
			formaction?: null | string | ActionFunction;
			formenctype?: null | string;
			formmethod?: null | string;
			formnovalidate?: null | boolean;
			formtarget?: null | string;
			name?: null | string;
			type?: null | "submit" | "reset" | "button";
			value?: null | string;
		};
		select: HTMLAttributes & {
			autofocus?: null | boolean;
			disabled?: null | boolean;
			form?: null | string;
			multiple?: null | boolean;
			name?: null | string;
			required?: null | boolean;
			size?: null | number;
			value?: null | string | string[] | number;
		};
		optgroup: HTMLAttributes & {
			disabled?: null | boolean;
			label?: null | string;
		};
		option: HTMLAttributes & {
			disabled?: null | boolean;
			label?: null | string;
			selected?: null | boolean;
			value?: null | string | string[] | number;
		};
		textarea: HTMLAttributes & {
			autocomplete?: null | string;
			autofocus?: null | boolean;
			cols?: null | number;
			dirname?: null | string;
			disabled?: null | boolean;
			form?: null | string;
			maxlength?: null | number;
			minlength?: null | number;
			name?: null | string;
			placeholder?: null | string;
			readonly?: null | boolean;
			required?: null | boolean;
			rows?: null | number;
			value?: null | string | string[] | number;
			wrap?: null | string;
		};
		fieldset: HTMLAttributes & {
			disabled?: null | boolean;
			form?: null | string;
			name?: null | string;
		};
		legend: HTMLAttributes;
		meter: HTMLAttributes & {
			form?: null | string;
			high?: null | number;
			low?: null | number;
			max?: null | number | string;
			min?: null | number | string;
			optimum?: null | number;
			value?: null | string | string[] | number;
		};
		progress: HTMLAttributes & {
			max?: null | number | string;
			value?: null | string | string[] | number;
		};

		// Interactive elements
		details: HTMLAttributes & {
			open?: null | boolean;
		};
		summary: HTMLAttributes;
		dialog: HTMLAttributes & {
			open?: null | boolean;
		};

		// Scripting
		script: HTMLAttributes & {
			async?: null | boolean;
			crossorigin?: null | string;
			defer?: null | boolean;
			integrity?: null | string;
			nomodule?: null | boolean;
			nonce?: null | string;
			src?: null | string;
			type?: null | string;
		};
		noscript: HTMLAttributes;
		template: HTMLAttributes;
		canvas: HTMLAttributes & {
			height?: null | number | string;
			width?: null | number | string;
		};

		// Image and multimedia
		img: HTMLAttributes & {
			alt?: null | string;
			crossorigin?: null | "anonymous" | "use-credentials";
			decoding?: null | "sync" | "async" | "auto";
			height?: null | number | string;
			loading?: null | "eager" | "lazy";
			sizes?: null | string;
			src?: null | string;
			srcset?: null | string;
			usemap?: null | string;
			width?: null | number | string;
		};
		picture: HTMLAttributes;
		source: HTMLAttributes & {
			media?: null | string;
			sizes?: null | string;
			src?: null | string;
			srcset?: null | string;
			type?: null | string;
		};
		video: HTMLAttributes & {
			autoplay?: null | boolean;
			controls?: null | boolean;
			crossorigin?: null | "anonymous" | "use-credentials";
			height?: null | number | string;
			loop?: null | boolean;
			muted?: null | boolean;
			playsinline?: null | boolean;
			poster?: null | string;
			preload?: null | "none" | "metadata" | "auto";
			src?: null | string;
			width?: null | number | string;
		};
		audio: HTMLAttributes & {
			autoplay?: null | boolean;
			controls?: null | boolean;
			crossorigin?: null | "anonymous" | "use-credentials";
			loop?: null | boolean;
			muted?: null | boolean;
			preload?: null | "none" | "metadata" | "auto";
			src?: null | string;
		};
		track: HTMLAttributes & {
			default?: null | boolean;
			kind?:
				| "subtitles"
				| "captions"
				| "descriptions"
				| "chapters"
				| "metadata";
			label?: null | string;
			src?: null | string;
			srclang?: null | string;
		};

		// Table content
		tfoot: HTMLAttributes;
		tr: HTMLAttributes;
		th: HTMLAttributes & {
			abbr?: null | string;
			colspan?: null | number;
			headers?: null | string;
			rowspan?: null | number;
			scope?: null | "row" | "col" | "rowgroup" | "colgroup";
		};
		td: HTMLAttributes & {
			colspan?: null | number;
			headers?: null | string;
			rowspan?: null | number;
		};
	}
}
