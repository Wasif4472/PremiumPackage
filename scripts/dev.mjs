import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT = 8080;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serveMain = join(root, "node_modules", "serve", "build", "main.js");

console.log("Starting Black Sapphire Systems site…");
console.log(`Folder: ${root}`);
console.log(`Port:   ${PORT}`);
console.log("Press Ctrl+C in this terminal to stop.\n");

let browserOpened = false;

function findChromeOnWindows() {
  const candidates = [
    join(process.env.ProgramFiles || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
    join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
    join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
  ];
  return candidates.find((path) => existsSync(path));
}

function openBrowser(targetUrl) {
  if (browserOpened) return;
  browserOpened = true;
  console.log(`\nOpening Chrome → ${targetUrl}\n`);
  if (process.platform === "win32") {
    const chrome = findChromeOnWindows();
    if (chrome) {
      spawn(chrome, [targetUrl], { stdio: "ignore", detached: true });
    } else {
      spawn("cmd", ["/c", "start", "chrome", targetUrl], { stdio: "ignore", detached: true });
    }
  } else if (process.platform === "darwin") {
    spawn("open", [targetUrl], { stdio: "ignore", detached: true });
  } else {
    spawn("xdg-open", [targetUrl], { stdio: "ignore", detached: true });
  }
}

function handleServeOutput(chunk) {
  const text = chunk.toString();
  process.stdout.write(text);
  const match = text.match(/Accepting connections at (https?:\/\/\S+)/);
  if (match) openBrowser(match[1]);
}

const server = spawn(process.execPath, [serveMain, root, "-l", String(PORT)], {
  cwd: root,
  stdio: ["inherit", "pipe", "pipe"],
});

server.stdout.on("data", handleServeOutput);
server.stderr.on("data", handleServeOutput);

server.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => server.kill());
process.on("SIGTERM", () => server.kill());
