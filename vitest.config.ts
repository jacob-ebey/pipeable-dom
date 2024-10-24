import tsconfigPaths from "vite-tsconfig-paths";
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
		tsconfigPaths(),
		{
			name: "server",
			configureServer(server) {
				return () => {
					server.middlewares.use(async (request, response, next) => {
						const url = new URL(request.originalUrl || "/", "http://test.com");
						switch (url.pathname) {
							case "/style": {
								await new Promise((resolve) =>
									setTimeout(
										resolve,
										Number.parseInt(url.searchParams.get("delay") || "0"),
									),
								);
								const style = url.searchParams.get("style");

								response.setHeader("Content-Type", "text/css");
								response.end(style);
								break;
							}
							case "/script": {
								await new Promise((resolve) =>
									setTimeout(
										resolve,
										Number.parseInt(url.searchParams.get("delay") || "0"),
									),
								);
								const script = url.searchParams.get("script");

								response.setHeader("Content-Type", "application/javascript");
								response.end(script);
								break;
							}
							default: {
								next();
							}
						}
					});
				};
			},
		},
	],
});
