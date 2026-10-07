"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const LANGUAGES = ["English", "French", "German", "Spanish", "Portuguese", "Dutch", "Italian", "Turkish", "Polish", "Swedish"];
const STAGES = ["glossary", "text", "diagram", "caption", "icml", "layout"];

function section(markdown, heading, next) {
  const marker = "\n## " + heading + "\n";
  if (markdown.split(marker).length !== 2) throw new Error("Missing or duplicate editorial Markdown section: " + heading);
  const body = markdown.split(marker)[1];
  const end = body.indexOf("\n## " + next + "\n");
  if (end < 0) throw new Error("Missing editorial Markdown section: " + next);
  return body.slice(0, end);
}
function jsonBlock(value, allowInstruction = false) {
  const match = value.match(/^\s*```json\r?\n([\s\S]*?)\r?\n```(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error("Invalid editorial Markdown JSON block.");
  if (!allowInstruction && match[2].trim()) throw new Error("Unexpected prose outside editorial metadata.");
  return { metadata: JSON.parse(match[1]), instruction: match[2].trim() };
}
function entries(value) {
  if (value.split("\n### ")[0].trim()) throw new Error("Unexpected prose before editorial rule entries.");
  return value.split("\n### ").slice(1).map(entry => {
    const newline = entry.indexOf("\n");
    if (newline < 1) throw new Error("Invalid editorial Markdown entry.");
    return { name: entry.slice(0, newline).trim(), body: entry.slice(newline + 1) };
  });
}
function parseEditorialMarkdown(value) {
  const markdown = String(value).replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const policy = jsonBlock(section(markdown, "Policy metadata", "Shared rules")).metadata;
  policy.shared = entries(section(markdown, "Shared rules", "Languages")).map(entry => {
    const parsed = jsonBlock(entry.body, true);
    if ("id" in parsed.metadata || "instruction" in parsed.metadata) throw new Error("Rule ID and instruction must be authored in Markdown.");
    return { ...parsed.metadata, id: entry.name, instruction: parsed.instruction };
  });
  policy.languages = entries(section(markdown, "Languages", "Workbook transcription")).map(entry => {
    const locale = jsonBlock(entry.body).metadata;
    if (locale.language !== entry.name) throw new Error("Language heading and policy disagree.");
    return locale;
  });
  if (policy.schemaVersion !== 1 || !policy.version || !Array.isArray(policy.precedence) || !Array.isArray(policy.sources)) {
    throw new Error("Invalid translation editorial policy schema.");
  }
  const names = policy.languages.map(entry => entry.language);
  if (names.length !== LANGUAGES.length || new Set(names).size !== LANGUAGES.length || LANGUAGES.some(name => !names.includes(name))) {
    throw new Error("Translation editorial policy must cover exactly the ten supported languages.");
  }
  for (const locale of policy.languages) {
    for (const field of ["code", "dateRule", "punctuation", "capitalization", "acronyms", "hyphens", "quotes", "decimal", "grouping", "percentExample", "units"]) {
      if (typeof locale[field] !== "string" || !locale[field]) throw new Error("Invalid language-specific editorial setting: " + field);
    }
    if (locale.rules !== undefined && !Array.isArray(locale.rules)) throw new Error("Invalid language-specific editorial rules.");
    for (const name of ["image", "text", "credit"]) {
      if (typeof locale.crossReferences?.[name] !== "string" || !locale.crossReferences[name]) throw new Error("Invalid cross-reference template.");
    }
  }
  const allRules = [...policy.shared, ...policy.languages.flatMap(locale => locale.rules || [])];
  for (const rule of allRules) {
    if (!/^[a-z][a-z0-9_]*$/.test(rule.id) || typeof rule.instruction !== "string" || !rule.instruction.trim() ||
        !Array.isArray(rule.stages) || !rule.stages.length || rule.stages.some(stage => !STAGES.includes(stage)) ||
        !policy.sources.some(source => source.id === rule.source)) {
      throw new Error("Invalid editorial rule or pipeline stage.");
    }
  }
  if (new Set(allRules.map(rule => rule.id)).size !== allRules.length) throw new Error("Duplicate editorial rule IDs.");
  return policy;
}
function loadEditorialRules(filePath, expectedSha256) {
  const bytes = fs.readFileSync(filePath);
  const sha256 = crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
  if (expectedSha256 && sha256 !== expectedSha256) throw new Error("Editorial rules changed during the job; start a new rules review.");
  return { policy: parseEditorialMarkdown(bytes.toString("utf8")), sha256, path: path.resolve(filePath) };
}
function resolveEditorialRules(filePath, language, stage, expectedSha256) {
  if (!STAGES.includes(stage)) throw new Error("Unknown editorial pipeline stage: " + stage);
  const { policy, sha256, path: sourcePath } = loadEditorialRules(filePath, expectedSha256);
  const requested = String(language || "").trim().toLowerCase();
  const name = requested === "brazilian portuguese" ? "portuguese" : requested;
  const selected = policy.languages.find(entry => entry.language.toLowerCase() === name);
  if (!selected) throw new Error("No editorial policy for language: " + language);
  const effective = { ...selected };
  if (requested === "brazilian portuguese") effective.quotes = "“texto”";
  return {
    version: policy.version, sha256, path: sourcePath, stage, language: effective,
    precedence: policy.precedence,
    rules: [...policy.shared, ...(effective.rules || [])].filter(rule => rule.stages.includes(stage)),
  };
}
function editorialPrompt(filePath, language, stage, expectedSha256) {
  const selected = resolveEditorialRules(filePath, language, stage, expectedSha256);
  const locale = selected.language;
  const localRules = stage === "layout" ? [] : [
    locale.capitalization, locale.acronyms, locale.hyphens,
    ...(stage === "glossary" ? [] : [
      locale.dateRule, locale.punctuation,
      "Use " + locale.quotes + " quotation typography and native-language placement of quotation punctuation.",
      "Use decimal separator " + JSON.stringify(locale.decimal) + " and grouping separator " + JSON.stringify(locale.grouping) +
        " in ordinary quantities, never in years, page numbers, identifiers or official designations. Percentage example: " + locale.percentExample + ".",
      "Measurement policy: " + (locale.units === "metric_only" ? "metric only outside the stated exceptions" : "metric first, then imperial") + ".",
    ]),
  ];
  return [
    "Publishing editorial rules " + selected.version + "; " + locale.language + "; stage " + stage + "; SHA-256 " + selected.sha256 + ".",
    ...selected.precedence,
    ...selected.rules.map(rule => "[" + rule.id + "] " + rule.instruction),
    ...localRules,
    ...(["text", "diagram", "caption"].includes(stage) ? [
      "Produce the final language-specific Unicode spacing during translation, before export/import. Proofreading corrections use the same final spacing. Do not defer text corrections to InDesign GREP. NNBSP is a label, not text or GREP syntax; use the actual U+202F character where required, and U+00A0 for NBSP."
    ] : []),
    "Apply only relevant rules. Do not modify protected source quotations, official designations, glossary locks, literal markup or identifiers to satisfy a generic style rule.",
    "Infer only what the supplied text proves. Do not invent missing acronym expansions, conversions, section boundaries, formatting or facts. Text-only review cannot verify layer order, object stacking, TOC numbering, paragraph indents, bold or italic character styles.",
  ].join("\n");
}
module.exports = { LANGUAGES, STAGES, parseEditorialMarkdown, loadEditorialRules, resolveEditorialRules, editorialPrompt };
