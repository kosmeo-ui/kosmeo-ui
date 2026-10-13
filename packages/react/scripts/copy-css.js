#!/usr/bin/env node
/* global console */
import { cpSync, statSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// Copy all CSS files from src/ to dist/, preserving directory structure
cpSync(`${root}/src`, `${root}/dist`, {
  recursive: true,
  // Directories and CSS files only. Checked with stat, not by looking for a
  // "." — any dotted ancestor (e.g. a worktree under .claude/) would match.
  filter: (src) => src.endsWith(".css") || statSync(src).isDirectory(),
});
console.log("CSS files copied to dist/");
