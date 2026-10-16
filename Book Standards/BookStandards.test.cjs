"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const crypto = require("node:crypto");
const standards = require("./BookStandards.cjs");
const reader = require("./EditorialPolicy.cjs");

test("database preserves all workbook sheets, populated cells, formulas and exact source bytes", () => {
  const summary = standards.summary();
  assert.equal(summary.integrity, "ok");
  assert.deepEqual(summary.foreignKeyErrors, []);
  assert.equal(summary.worksheets.length, 10);
  assert.equal(summary.worksheets.reduce((count, sheet) => count + sheet.cells, 0), 7398);
  assert.equal(summary.worksheets.reduce((count, sheet) => count + sheet.formulas, 0), 746);
  assert.equal(crypto.createHash("sha256").update(standards.sourceDocument("Publishing.xlsx")).digest("hex"),
    "d968709654f7d6c534dc7a08fd21fa9438ca55a8a0ebab19fe5404254983dfc0");
  const formula = standards.workbookCells("Indd Other").find(cell => cell.address === "F3");
  assert.equal(formula.formula, 'concat("Base: ",\'Indd Other\'!$F$17)');
  assert.equal(typeof formula.value, "string");
});

test("live policy retains every original rule and source transcription", () => {
  const source = standards.sourceDocument("Translation Rules.md").toString("utf8");
  assert.deepEqual(reader.loadEditorialRules().policy, reader.parseEditorialMarkdown(source));
  assert.equal(standards.summary().editorialRules, 26);
  const sourceCells = standards.withDatabase(standards.DATABASE_PATH, database =>
    database.prepare("SELECT address,value FROM editorial_source_cell ORDER BY CAST(substr(address,2) AS INTEGER),address").all()
      .map(cell => [cell.address, cell.value]));
  assert.deepEqual(sourceCells, reader.parseWorkbookTranscription(source));
  assert.throws(() => reader.loadEditorialRules(reader.POLICY_PATH, "outdated"), /rules changed/);
  assert.throws(() => standards.workbookCells("missing"), /Unknown standards worksheet/);
  assert.throws(() => standards.sourceDocument("missing"), /Unknown standards source/);
});
