/**
 * Copies production files into deploy/ for Hostinger (or any static host).
 * Run: npm run deploy:prepare
 */
import { cpSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "deploy");

const FILES = ["index.html", "styles.css", "script.js"];
const DIRS = ["assets"];

function copy() {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  for (const file of FILES) {
    const src = join(root, file);
    if (!statSync(src).isFile()) {
      throw new Error(`Missing: ${file}`);
    }
    cpSync(src, join(out, file));
  }

  for (const dir of DIRS) {
    const src = join(root, dir);
    cpSync(src, join(out, dir), { recursive: true });
  }

  const guide = join(dirname(fileURLToPath(import.meta.url)), "DEPLOY.hostinger.md");
  cpSync(guide, join(out, "DEPLOY.md"));

  console.log("Deploy package ready:");
  console.log(`  ${out}`);
  console.log("");
  console.log("Upload everything inside deploy/ to Hostinger public_html");
}

copy();
