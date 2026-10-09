import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://localhost:3108", headless: true },
  workers: 1,
  timeout: 90000,
  webServer: {
    command: "npm run dev -- --port 3108",
    url: "http://localhost:3108/grades",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test",
      DIRECT_URL: "postgresql://test:test@127.0.0.1:1/test",
      AUTH_SECRET: "isolated-browser-test-secret",
      PEXELS_API_KEY: "",
    },
  },
});
