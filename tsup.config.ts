import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  entry: ["src/pipeable-dom.ts"],
  format: "esm",
  platform: "browser",
});
