import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const [major, minor] = process.versions.node.split(".").map(Number);
if (!((major === 22 && minor >= 13) || major === 24 || major >= 26)) {
  console.error(
    "Use Node.js 22.13+ (22.x), 24.x, or 26+. Install it from https://nodejs.org/",
  );
  process.exit(1);
}
// Avoid broken user npm shims by preferring the npm bundled with node.exe.
const bundledNpm = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js",
);
console.log("\nPOCKET GACHA - Preparing local development server...\n");
const install = existsSync(bundledNpm)
  ? spawnSync(process.execPath, [bundledNpm, "ci"], { stdio: "inherit" })
  : spawnSync("npm.cmd", ["ci"], { stdio: "inherit", shell: true });
if (install.status !== 0) {
  console.error(
    "Dependency installation failed. Check your network and Node.js/npm installation.",
  );
  process.exit(install.status || 1);
}
console.log(
  "\nOpen http://127.0.0.1:5173 in your browser. Press Ctrl+C to stop.\n",
);
const serverArgs = [
  path.join(root, "node_modules", "vite", "bin", "vite.js"),
  "--host",
  "127.0.0.1",
  "--port",
  "5173",
  "--strictPort",
];
if (!process.argv.includes("--no-open")) serverArgs.push("--open");
const server = spawn(process.execPath, serverArgs, { stdio: "inherit" });
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
