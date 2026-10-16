#!/usr/bin/env node
/* global console */
import { cpSync, statSync } from "fs";
import { basename, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// Copy all CSS files from src/ to dist/, preserving directory structure
cpSync(`${root}/src`, `${root}/dist`, {
  recursive: true,
  // Directories and CSS files only. Checked with stat, not by looking for a
  // "." — any dotted ancestor (e.g. a worktree under .claude/) would match.
  filter: (src) =>
    src.endsWith(".css") ||
    (statSync(src).isDirectory() && basename(src) !== "__tests__"),
});
console.log("CSS files copied to dist/");
