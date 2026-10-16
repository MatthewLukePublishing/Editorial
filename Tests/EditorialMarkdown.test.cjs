"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const reader = require("../Code/EditorialPolicy.cjs");
const RULE_PATH = reader.POLICY_PATH;
const standards = require(path.join(path.dirname(RULE_PATH), "../Book Standards/BookStandards.cjs"));
const markdown = standards.sourceDocument("Translation Rules.md").toString("utf8");
function compressionDigest(value) {
  const sorted = item => Array.isArray(item) ? item.map(sorted) :
    item && typeof item === "object" ? Object.fromEntries(Object.keys(item).sort().map(key => [key, sorted(item[key])])) : item;
  return require("node:crypto").createHash("sha256").update(JSON.stringify(sorted(value))).digest("hex");
}

test("compaction preserves expanded policy, every source cell and all language/stage prompts", () => {
  // Captured before compaction over decoded values, independently of Markdown formatting.
  // Update these only when making an intentional policy/source change.
  assert.equal(compressionDigest(reader.parseEditorialMarkdown(markdown)), "538748edc0b4d5afcb451091a816bffa8f31c41d4648f8391a2be2ea4a5313ec");
  assert.equal(compressionDigest(reader.parseWorkbookTranscription(markdown)), "0e27d3f06d5cbee4cd40ac763b8626c968c0fddd359fa60f8a6a7f768f433e76");
  const prompts = reader.LANGUAGES.flatMap(language => reader.STAGES.map(stage =>
    [language, stage, reader.editorialPrompt(RULE_PATH, language, stage).replace(/SHA-256 [A-F0-9]{64}/g, "SHA-256 <HASH>")]));
  assert.equal(compressionDigest(prompts), "a5cbb697a064e115ec1a1852e51d0fea60f3daffec9efd5371486bb9793b75dc");
});

test("defaults preserve explicit overrides and independent mutable rule arrays", () => {
  const policy = reader.parseEditorialMarkdown(markdown);
  const numbers = policy.shared.find(rule => rule.id === "numbers_in_prose");
  assert.deepEqual(numbers.stages, ["text", "caption"]);
  const layout = policy.shared.find(rule => rule.id === "layer_order");
  assert.deepEqual(layout.stages, ["layout"]);
  assert.equal(layout.verification, "layout");
  const english = policy.languages.find(locale => locale.language === "English");
  const french = policy.languages.find(locale => locale.language === "French");
  assert.equal(english.decimal, ".");
  assert.equal(french.decimal, ",");
  assert.equal(english.crossReferences.credit, '<fullPara delim=":" />:');
  assert.equal(french.crossReferences.credit, '<fullPara delim=":" />\u202F:');
  assert.equal(policy.languages.find(locale => locale.language === "Spanish").rules[0].source, "es_review");
  numbers.stages.push("layout");
  assert.deepEqual(policy.shared.find(rule => rule.id === "acronym_introduction").stages, ["text", "caption"]);
});

test("expanded legacy Markdown remains readable without compact defaults", () => {
  const policy = reader.parseEditorialMarkdown(markdown);
  const { shared, languages, ...metadata } = policy;
  const fence = String.fromCharCode(96).repeat(3);
  const json = value => fence + "json\n" + JSON.stringify(value) + "\n" + fence + "\n\n";
  const cells = reader.parseWorkbookTranscription(markdown);
  const legacy = "# Legacy fixture\n\n## Policy metadata\n\n" + json(metadata) +
    "## Shared rules\n\n" + shared.map(({ id, instruction, ...details }) =>
      "### " + id + "\n\n" + json(details) + instruction + "\n\n").join("") +
    "## Languages\n\n" + languages.map(locale => "### " + locale.language + "\n\n" + json(locale)).join("") +
    "## Workbook transcription\n\n" + cells.map(([address, value]) =>
      "### Sheet1!" + address + "\n\n" + fence + "text\n" + value + "\n" + fence + "\n\n").join("");
  assert.deepEqual(reader.parseEditorialMarkdown(legacy), policy);
  assert.deepEqual(reader.parseWorkbookTranscription(legacy), cells);
});

test("invalid compact defaults and duplicate source coordinates fail closed", () => {
  for (const bad of [
    markdown.replace('"markdownFormatVersion": 2', '"markdownFormatVersion": 99'),
    markdown.replace('"sharedRuleDefaults": {', '"sharedRuleDefaults": {"id":"forbidden",'),
    markdown.replace('"languageDefaults": {', '"languageDefaults": {"language":"forbidden",'),
  ]) assert.throws(() => reader.parseEditorialMarkdown(bad));
  const fence = String.fromCharCode(96).repeat(3);
  const source = value => "# Source fixture\n\n## Workbook transcription\n\n" + fence + "json\n" + value + "\n" + fence + "\n";
  for (const bad of [
    "[]", '{"A1":null}', '{"A1":1}', '{"A1 A1":"duplicate"}',
    '{"A1":"first","A1":"second"}', '{"A1":"first","A1 A2":"second"}',
    '{"A1  A2":"extra gap"}', '{"A1\\tA2":"tab"}', '{"A0":"bad address"}',
  ]) assert.throws(() => reader.parseWorkbookTranscription(source(bad)));
  const exact = " leading\u00A0space\u202Fand slash\\\ntrailing \n";
  assert.deepEqual(reader.parseWorkbookTranscription(source(JSON.stringify({ "A1 A2": exact }))), [["A1", exact], ["A2", exact]]);
});

test("Markdown carries all ten languages and stage-scoped original policy", () => {
  const policy = reader.parseEditorialMarkdown(markdown);
  assert.equal(policy.version, "1.2.0");
  assert.equal(policy.shared.length, 20);
  assert.equal(policy.languages.length, 10);
  assert.match(policy.shared.find(rule => rule.id === "numbers_in_prose").instruction, /one through one hundred/);
  assert.match(policy.languages[0].hyphens, /preassault/);
  for (const language of reader.LANGUAGES) {
    for (const stage of reader.STAGES) {
      const selected = reader.resolveEditorialRules(reader.POLICY_PATH, language, stage);
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
  assert.throws(() => reader.editorialPrompt(reader.POLICY_PATH, "French", "text", "outdated"), /rules changed/);
});

test("the complete workbook transcription keeps 186 cells and literal special spaces", () => {
  const cells = reader.parseWorkbookTranscription(markdown);
  assert.equal(cells.length, 186);
  assert.equal(new Set(cells.map(([address]) => address)).size, 186);
  const cell = name => cells.find(([address]) => address === name)?.[1];
  assert.equal(cell("H4"), '<fullPara delim=":" />\u202F:');
  assert.match(cell("G35"), /\\x\{202F\}/);
  assert.match(cell("D37"), /\(\+\|/); // Retain the original bare plus as reference.
  assert.match(cell("B51"), /one through one hundred/);
  assert.match(cell("B59"), /Bold is for emphasis/);
  assert.doesNotMatch(reader.editorialPrompt(reader.POLICY_PATH, "French", "text"), /GREP Code|Sheet1!D37|\[layer_order\]|preassault/);
});
