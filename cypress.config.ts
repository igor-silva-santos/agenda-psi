import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://jandira-frederick.vercel.app/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
