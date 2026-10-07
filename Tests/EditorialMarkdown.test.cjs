"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const reader = require("../Code/EditorialPolicy.cjs");
const markdown = fs.readFileSync(path.join(__dirname, "../Code/Translation Rules.md"), "utf8");

test("Markdown carries all ten languages and stage-scoped original policy", () => {
  const policy = reader.parseEditorialMarkdown(markdown);
  assert.equal(policy.version, "1.2.0");
  assert.equal(policy.shared.length, 20);
  assert.equal(policy.languages.length, 10);
  assert.match(policy.shared.find(rule => rule.id === "numbers_in_prose").instruction, /one through one hundred/);
  assert.match(policy.languages[0].hyphens, /preassault/);
  for (const language of reader.LANGUAGES) {
    for (const stage of reader.STAGES) {
      const selected = reader.resolveEditorialRules(path.join(__dirname, "../Code/Translation Rules.md"), language, stage);
      assert.ok(selected.rules.every(rule => rule.stages.includes(stage)));
    }
  }
  assert.deepEqual(reader.parseEditorialMarkdown(markdown.replace(/\n/g, "\r\n")), policy);
});
test("prose edits and newly added Markdown rules become live policy", () => {
  const edited = markdown.replace("Spell out ordinary counting numbers one through one hundred", "Spell out ordinary counting numbers one through twenty");
  assert.match(reader.parseEditorialMarkdown(edited).shared.find(rule => rule.id === "numbers_in_prose").instruction, /one through twenty/);
  const newRule = '\n### example_new_rule\n\n' + '```json' + '\n{"stages":["text"],"source":"house"}\n' + '```' + '\n\nUse the newly approved spelling in editorial text.\n\n';
  const updated = markdown.replace("\n## Languages\n", newRule + "## Languages\n");
  assert.equal(reader.parseEditorialMarkdown(updated).shared.at(-1).id, "example_new_rule");
});

test("malformed, missing, duplicate and unsupported rule definitions fail closed", () => {
  for (const bad of [
    "", markdown.replace("## Languages", "## Lost languages"),
    markdown.replace("### unit_symbols", "### unit_system"),
    markdown.replace('"text",', '"unsupported_stage",'),
    markdown.replace('"language": "English"', '"language": "Unknown"'),
    markdown.replace('"schemaVersion": 1', '"schemaVersion": 99'),
    markdown.replace("### date_spacing", "### invalid-rule-id"),
  ]) assert.throws(() => reader.parseEditorialMarkdown(bad));
  assert.throws(() => reader.loadEditorialRules(path.join(__dirname, "missing-policy.md")));
  assert.throws(() => reader.editorialPrompt(path.join(__dirname, "../Code/Translation Rules.md"), "French", "text", "outdated"), /rules changed/);
});

test("the complete workbook transcription keeps 186 cells and literal special spaces", () => {
  const cells = [...markdown.matchAll(/### Sheet1!([A-H]\d+)\n\n```text\n([\s\S]*?)\n```/g)];
  assert.equal(cells.length, 186);
  assert.equal(new Set(cells.map(match => match[1])).size, 186);
  const cell = name => cells.find(match => match[1] === name)?.[2];
  assert.equal(cell("H4"), '<fullPara delim=":" />\u202F:');
  assert.match(cell("G35"), /\\x\{202F\}/);
  assert.match(cell("D37"), /\(\+\|/); // Retain the original bare plus as reference.
  assert.match(cell("B51"), /one through one hundred/);
  assert.match(cell("B59"), /Bold is for emphasis/);
  assert.doesNotMatch(reader.editorialPrompt(path.join(__dirname, "../Code/Translation Rules.md"), "French", "text"), /GREP Code|Sheet1!D37|\[layer_order\]|preassault/);
});
