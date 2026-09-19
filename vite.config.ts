import { defineConfig } from "vite";

export default defineConfig({
  // Keep generated URLs relative so the same build works both at a user/org
  // Pages root and below a repository path such as /cards/.
  base: "./",
});
