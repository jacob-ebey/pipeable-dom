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
		// Global HTML attributes
		accesskey?: string;
		class?: string;
		contenteditable?: boolean | "true" | "false";
		dir?: "ltr" | "rtl" | "auto";
		draggable?: boolean | "true" | "false";
		hidden?: boolean;
		id?: string;
		lang?: string;
		spellcheck?: boolean | "true" | "false";
		style?: string;
		tabindex?: number;
		title?: string;
		translate?: "yes" | "no";

		// ARIA attributes
		role?: string;
		"aria-activedescendant"?: string;
		"aria-atomic"?: boolean | "true" | "false";
		"aria-autocomplete"?: "none" | "inline" | "list" | "both";
		"aria-busy"?: boolean | "true" | "false";
		"aria-checked"?: boolean | "true" | "false" | "mixed";
		"aria-colcount"?: number;
		"aria-colindex"?: number;
		"aria-colspan"?: number;
		"aria-controls"?: string;
		"aria-current"?:
			| boolean
			| "true"
			| "false"
			| "page"
			| "step"
			| "location"
			| "date"
			| "time";
		"aria-describedby"?: string;
		"aria-details"?: string;
		"aria-disabled"?: boolean | "true" | "false";
		"aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup";
		"aria-errormessage"?: string;
		"aria-expanded"?: boolean | "true" | "false";
		"aria-flowto"?: string;
		"aria-grabbed"?: boolean | "true" | "false";
		"aria-haspopup"?:
			| boolean
			| "true"
			| "false"
			| "menu"
			| "listbox"
			| "tree"
			| "grid"
			| "dialog";
		"aria-hidden"?: boolean | "true" | "false";
		"aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
		"aria-keyshortcuts"?: string;
		"aria-label"?: string;
		"aria-labelledby"?: string;
		"aria-level"?: number;
		"aria-live"?: "off" | "assertive" | "polite";
		"aria-modal"?: boolean | "true" | "false";
		"aria-multiline"?: boolean | "true" | "false";
		"aria-multiselectable"?: boolean | "true" | "false";
		"aria-orientation"?: "horizontal" | "vertical";
		"aria-owns"?: string;
		"aria-placeholder"?: string;
		"aria-posinset"?: number;
		"aria-pressed"?: boolean | "true" | "false" | "mixed";
		"aria-readonly"?: boolean | "true" | "false";
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
		"aria-required"?: boolean | "true" | "false";
		"aria-roledescription"?: string;
		"aria-rowcount"?: number;
		"aria-rowindex"?: number;
		"aria-rowspan"?: number;
		"aria-selected"?: boolean | "true" | "false";
		"aria-setsize"?: number;
		"aria-sort"?: "none" | "ascending" | "descending" | "other";
		"aria-valuemax"?: number;
		"aria-valuemin"?: number;
		"aria-valuenow"?: number;
		"aria-valuetext"?: string;

		// Event handlers
		onabort?: string;
		onblur?: string;
		oncancel?: string;
		oncanplay?: string;
		oncanplaythrough?: string;
		onchange?: string;
		onclick?: string;
		onclose?: string;
		oncontextmenu?: string;
		oncuechange?: string;
		ondblclick?: string;
		ondrag?: string;
		ondragend?: string;
		ondragenter?: string;
		ondragleave?: string;
		ondragover?: string;
		ondragstart?: string;
		ondrop?: string;
		ondurationchange?: string;
		onemptied?: string;
		onended?: string;
		onerror?: string;
		onfocus?: string;
		oninput?: string;
		oninvalid?: string;
		onkeydown?: string;
		onkeypress?: string;
		onkeyup?: string;
		onload?: string;
		onloadeddata?: string;
		onloadedmetadata?: string;
		onloadstart?: string;
		onmousedown?: string;
		onmouseenter?: string;
		onmouseleave?: string;
		onmousemove?: string;
		onmouseout?: string;
		onmouseover?: string;
		onmouseup?: string;
		onpause?: string;
		onplay?: string;
		onplaying?: string;
		onprogress?: string;
		onratechange?: string;
		onreset?: string;
		onresize?: string;
		onscroll?: string;
		onseeked?: string;
		onseeking?: string;
		onselect?: string;
		onstalled?: string;
		onsubmit?: string;
		onsuspend?: string;
		ontimeupdate?: string;
		ontoggle?: string;
		onvolumechange?: string;
		onwaiting?: string;
		onwheel?: string;
	}

	interface IntrinsicElements {
		// Main root
		html: HTMLAttributes & {
			lang?: string;
			manifest?: string;
			xmlns?: string;
		};

		// Document metadata
		head: HTMLAttributes;
		title: HTMLAttributes;
		base: HTMLAttributes & {
			href?: string;
			target?: string;
		};
		link: HTMLAttributes & {
			href?: string;
			rel?: string;
			media?: string;
			type?: string;
			sizes?: string;
		};
		meta: HTMLAttributes & {
			charset?: string;
			content?: string;
			httpEquiv?: string;
			name?: string;
		};
		style: HTMLAttributes & {
			media?: string;
			nonce?: string;
			type?: string;
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
			cite?: string;
		};
		ol: HTMLAttributes & {
			reversed?: boolean;
			start?: number;
			type?: "1" | "a" | "A" | "i" | "I";
		};
		ul: HTMLAttributes;
		li: HTMLAttributes & {
			value?: number;
		};
		dl: HTMLAttributes;
		dt: HTMLAttributes;
		dd: HTMLAttributes;
		figure: HTMLAttributes;
		figcaption: HTMLAttributes;
		div: HTMLAttributes;

		// Text-level semantics
		a: HTMLAttributes & {
			href?: string;
			target?: HTMLAttributeAnchorTarget;
			download?: any;
			rel?: string;
		};
		em: HTMLAttributes;
		strong: HTMLAttributes;
		small: HTMLAttributes;
		s: HTMLAttributes;
		cite: HTMLAttributes;
		q: HTMLAttributes & {
			cite?: string;
		};
		dfn: HTMLAttributes;
		abbr: HTMLAttributes;
		data: HTMLAttributes & {
			value: string;
		};
		time: HTMLAttributes & {
			datetime?: string;
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
			acceptCharset?: string;
			action?: string;
			autocomplete?: string;
			enctype?: string;
			method?: "get" | "post";
			name?: string;
			novalidate?: boolean;
			target?: string;
		};
		label: HTMLAttributes & {
			for?: string;
		};
		input: HTMLAttributes & {
			accept?: string;
			alt?: string;
			autocomplete?: string;
			autofocus?: boolean;
			checked?: boolean;
			dirname?: string;
			disabled?: boolean;
			form?: string;
			formaction?: string;
			formenctype?: string;
			formmethod?: string;
			formnovalidate?: boolean;
			formtarget?: string;
			height?: number | string;
			list?: string;
			max?: number | string;
			maxlength?: number;
			min?: number | string;
			minlength?: number;
			multiple?: boolean;
			name?: string;
			pattern?: string;
			placeholder?: string;
			readonly?: boolean;
			required?: boolean;
			size?: number;
			src?: string;
			step?: number | string;
			type?: HTMLInputTypeAttribute;
			value?: string | string[] | number;
			width?: number | string;
		};
		button: HTMLAttributes & {
			autofocus?: boolean;
			disabled?: boolean;
			form?: string;
			formaction?: string;
			formenctype?: string;
			formmethod?: string;
			formnovalidate?: boolean;
			formtarget?: string;
			name?: string;
			type?: "submit" | "reset" | "button";
			value?: string;
		};
		select: HTMLAttributes & {
			autofocus?: boolean;
			disabled?: boolean;
			form?: string;
			multiple?: boolean;
			name?: string;
			required?: boolean;
			size?: number;
			value?: string | string[] | number;
		};
		optgroup: HTMLAttributes & {
			disabled?: boolean;
			label?: string;
		};
		option: HTMLAttributes & {
			disabled?: boolean;
			label?: string;
			selected?: boolean;
			value?: string | string[] | number;
		};
		textarea: HTMLAttributes & {
			autocomplete?: string;
			autofocus?: boolean;
			cols?: number;
			dirname?: string;
			disabled?: boolean;
			form?: string;
			maxlength?: number;
			minlength?: number;
			name?: string;
			placeholder?: string;
			readonly?: boolean;
			required?: boolean;
			rows?: number;
			value?: string | string[] | number;
			wrap?: string;
		};
		fieldset: HTMLAttributes & {
			disabled?: boolean;
			form?: string;
			name?: string;
		};
		legend: HTMLAttributes;
		meter: HTMLAttributes & {
			form?: string;
			high?: number;
			low?: number;
			max?: number | string;
			min?: number | string;
			optimum?: number;
			value?: string | string[] | number;
		};
		progress: HTMLAttributes & {
			max?: number | string;
			value?: string | string[] | number;
		};

		// Interactive elements
		details: HTMLAttributes & {
			open?: boolean;
		};
		summary: HTMLAttributes;
		dialog: HTMLAttributes & {
			open?: boolean;
		};

		// Scripting
		script: HTMLAttributes & {
			async?: boolean;
			crossorigin?: string;
			defer?: boolean;
			integrity?: string;
			nomodule?: boolean;
			nonce?: string;
			src?: string;
			type?: string;
		};
		noscript: HTMLAttributes;
		template: HTMLAttributes;
		canvas: HTMLAttributes & {
			height?: number | string;
			width?: number | string;
		};

		// Image and multimedia
		img: HTMLAttributes & {
			alt?: string;
			crossorigin?: "anonymous" | "use-credentials";
			decoding?: "sync" | "async" | "auto";
			height?: number | string;
			loading?: "eager" | "lazy";
			sizes?: string;
			src?: string;
			srcset?: string;
			usemap?: string;
			width?: number | string;
		};
		picture: HTMLAttributes;
		source: HTMLAttributes & {
			media?: string;
			sizes?: string;
			src?: string;
			srcset?: string;
			type?: string;
		};
		video: HTMLAttributes & {
			autoplay?: boolean;
			controls?: boolean;
			crossorigin?: "anonymous" | "use-credentials";
			height?: number | string;
			loop?: boolean;
			muted?: boolean;
			playsinline?: boolean;
			poster?: string;
			preload?: "none" | "metadata" | "auto";
			src?: string;
			width?: number | string;
		};
		audio: HTMLAttributes & {
			autoplay?: boolean;
			controls?: boolean;
			crossorigin?: "anonymous" | "use-credentials";
			loop?: boolean;
			muted?: boolean;
			preload?: "none" | "metadata" | "auto";
			src?: string;
		};
		track: HTMLAttributes & {
			default?: boolean;
			kind?:
				| "subtitles"
				| "captions"
				| "descriptions"
				| "chapters"
				| "metadata";
			label?: string;
			src?: string;
			srclang?: string;
		};

		// Table content
		tfoot: HTMLAttributes;
		tr: HTMLAttributes;
		th: HTMLAttributes & {
			abbr?: string;
			colspan?: number;
			headers?: string;
			rowspan?: number;
			scope?: "row" | "col" | "rowgroup" | "colgroup";
		};
		td: HTMLAttributes & {
			colspan?: number;
			headers?: string;
			rowspan?: number;
		};
	}
}
