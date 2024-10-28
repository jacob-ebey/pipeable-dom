import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/browser.ts", "src/pipeable-dom.ts", "src/jsx.ts"],
	dts: true,
	format: ["cjs", "esm"],
	platform: "neutral",
	external: ["pipeable-dom"],
});
