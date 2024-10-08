import serve from "serve-handler";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      name: "chromium",
      provider: "playwright",
      // https://playwright.dev
      providerOptions: {},
    },
  },
  plugins: [
    {
      name: "serve",
      configureServer(server) {
        return () => {
          server.middlewares.use((request, response) => {
            serve(request, response, { public: "public" });
          });
        };
      },
    },
  ],
});
