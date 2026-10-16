"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");
const root = __dirname;
const git = (...args) => execFileSync("git", args, { cwd: root, windowsHide: true, encoding: "utf8" });

test("one repository contains both consumers and exactly one approved database", () => {
  const files = git("ls-files", "-z").split("\0").filter(Boolean);
  for (const required of ["Book Standards/BookStandards.cjs", "Book Standards/EditorialPolicy.cjs",
    "data/Book Standards.sqlite", "Typos/Typo_Checker.js", "Translate/Run-Translation-Job.ps1",
    ".github/workflows/ci.yml"]) assert.ok(files.includes(required), `Missing ${required}`);
  assert.deepEqual(files.filter((file) => file.startsWith("data/")), ["data/Book Standards.sqlite"]);
  assert.ok(!git("ls-files", "--stage").split("\n").some((line) => line.startsWith("160000 ")),
    "Components must be real files, not submodules");
  assert.equal(fs.existsSync(path.join(root, "Typos/.git")), false);
  assert.equal(fs.existsSync(path.join(root, "Translate/.git")), false);
  for (const file of files) {
    assert.doesNotMatch(file, /(?:^|\/)(?:node_modules|\.tmp|_Archive|Jobs|Origin Files|Language Files|typo_checks)(?:\/|$)/i);
    assert.doesNotMatch(file, /(?:^|\/)(?:PROJECT\.md|\.env(?:\..*)?|Active Job\.json)$|\.(?:xlsx|indd|idml|ai|pem|key)$/i);
    assert.ok(fs.statSync(path.join(root, file)).size <= (file === "data/Book Standards.sqlite" ? 20 : 10) * 1024 * 1024,
      `Oversized public file: ${file}`);
  }
});

test("active GitHub references use Editorial and the root version owns releases", () => {
  const packageInfo = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(packageInfo.name, "@matthew-luke-publishing/editorial");
  assert.match(packageInfo.version, /^\d+\.\d+\.\d+$/);
  for (const file of ["Typos/Run_Latest_Typo_Checker.ps1", "Typos/CHATGPT_PROMPT.md",
    "Typos/README.md", "Translate/README.md", "Translate/package.json"]) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(source, /github\.com\/MatthewLukePublishing\/(?:typo-checker|translation-pipeline)/i);
    assert.match(source, /MatthewLukePublishing\/Editorial/);
  }
});
