"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const DATABASE_PATH = path.join(__dirname, "../data/Book Standards.sqlite");
const MAX_BYTES = 20 * 1024 * 1024;

function withDatabase(filePath, read) {
  const resolved = path.resolve(filePath);
  const stat = fs.lstatSync(resolved);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BYTES) {
    throw new Error("Book Standards database must be a regular file within the 20 MiB limit.");
  }
  const database = new DatabaseSync(resolved, { readOnly: true });
  try {
    if (database.prepare("PRAGMA user_version").get().user_version !== 1) {
      throw new Error("Unsupported Book Standards database schema.");
    }
    return read(database);
  } finally {
    database.close();
  }
}

function fileHash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function loadPolicy(filePath = DATABASE_PATH, expectedSha256) {
  const resolved = path.resolve(filePath);
  const sha256 = fileHash(resolved);
  if (expectedSha256 && expectedSha256 !== sha256) {
    throw new Error("Editorial rules changed during the job; start a new rules review.");
  }
  const policy = withDatabase(resolved, database => {
    const metadata = Object.fromEntries(database.prepare("SELECT name,value_json FROM editorial_metadata ORDER BY rowid").all()
      .map(row => [row.name, JSON.parse(row.value_json)]));
    const rules = database.prepare("SELECT * FROM editorial_rule ORDER BY position").all();
    const expandRule = row => ({
      ...JSON.parse(row.metadata_json), id: row.id, instruction: row.instruction,
    });
    metadata.shared = rules.filter(row => row.language === null).map(expandRule);
    metadata.languages = database.prepare("SELECT * FROM editorial_language ORDER BY position").all().map(row => {
      const settings = JSON.parse(row.settings_json);
      const languageRules = rules.filter(rule => rule.language === row.name).map(expandRule);
      if (!languageRules.length) return settings;
      const { crossReferences, ...fields } = settings;
      return { ...fields, rules: languageRules, crossReferences };
    });
    return metadata;
  });
  if (fileHash(resolved) !== sha256) throw new Error("Editorial rules changed while reading the database.");
  return { policy, sha256, path: resolved };
}

function sourceDocument(name, filePath = DATABASE_PATH) {
  return withDatabase(filePath, database => {
    const record = database.prepare("SELECT * FROM source_document WHERE name=?").get(name);
    if (!record) throw new Error("Unknown standards source: " + name);
    const bytes = Buffer.from(record.content);
    if (bytes.length !== record.byte_count ||
        crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase() !== record.sha256) {
      throw new Error("Standards source integrity check failed: " + name);
    }
    return bytes;
  });
}

function workbookCells(sheetName, filePath = DATABASE_PATH) {
  return withDatabase(filePath, database => {
    if (!database.prepare("SELECT name FROM worksheet WHERE name=?").get(sheetName)) {
      throw new Error("Unknown standards worksheet: " + sheetName);
    }
    return database.prepare("SELECT * FROM workbook_cell WHERE sheet_name=? ORDER BY row_number,column_number").all(sheetName)
      .map(({ value_json, formula_attributes_json, ...cell }) => ({
        ...cell, value: JSON.parse(value_json),
        formulaAttributes: formula_attributes_json === null ? null : JSON.parse(formula_attributes_json),
      }));
  });
}

function summary(filePath = DATABASE_PATH) {
  return withDatabase(filePath, database => ({
    database: path.resolve(filePath),
    integrity: database.prepare("PRAGMA integrity_check").get().integrity_check,
    foreignKeyErrors: database.prepare("PRAGMA foreign_key_check").all(),
    worksheets: database.prepare("SELECT s.name,count(c.address) AS cells,sum(c.formula IS NOT NULL) AS formulas FROM worksheet s LEFT JOIN workbook_cell c ON c.sheet_name=s.name GROUP BY s.name ORDER BY s.position").all(),
    editorialRules: database.prepare("SELECT count(*) AS count FROM editorial_rule").get().count,
    languages: database.prepare("SELECT name FROM editorial_language ORDER BY position").all().map(row => row.name),
  }));
}

module.exports = { DATABASE_PATH, withDatabase, loadPolicy, sourceDocument, workbookCells, summary };
if (require.main === module) {
  const [command = "summary", ...arguments_] = process.argv.slice(2);
  if (command === "summary" && !arguments_.length) console.log(JSON.stringify(summary(), null, 2));
  else if (command === "sheet" && arguments_.length === 1) console.log(JSON.stringify(workbookCells(arguments_[0]), null, 2));
  else throw new Error('Usage: node BookStandards.cjs [summary | sheet "worksheet name"]');
}
