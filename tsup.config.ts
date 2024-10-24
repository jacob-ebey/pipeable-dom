import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/pipeable-dom.ts", "src/jsx.ts"],
	dts: true,
	format: ["cjs", "esm"],
	platform: "neutral",
	external: ["pipeable-dom"],
});
