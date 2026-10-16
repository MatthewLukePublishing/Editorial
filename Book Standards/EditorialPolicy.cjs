"use strict";
const fs = require("node:fs");
const path = require("node:path");
const standards = require("./BookStandards.cjs");
const POLICY_PATH = standards.DATABASE_PATH;
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
function objectRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid editorial " + label + ".");
  return value;
}
function orderedRecord(value, keys) {
  return Object.fromEntries([
    ...keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]),
    ...Object.entries(value).filter(([key]) => !keys.includes(key)),
  ]);
}
function parseEditorialMarkdown(value) {
  const markdown = String(value).replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const metadata = objectRecord(jsonBlock(section(markdown, "Policy metadata", "Shared rules")).metadata, "metadata");
  const { markdownFormatVersion = 1, sharedRuleDefaults = {}, languageDefaults = {}, ...policy } = metadata;
  if (![1, 2].includes(markdownFormatVersion) ||
      (markdownFormatVersion === 1 && ("sharedRuleDefaults" in metadata || "languageDefaults" in metadata))) {
    throw new Error("Unsupported editorial Markdown format.");
  }
  objectRecord(sharedRuleDefaults, "shared rule defaults");
  objectRecord(languageDefaults, "language defaults");
  if ("id" in sharedRuleDefaults || "instruction" in sharedRuleDefaults ||
      ["language", "code", "rules"].some(key => key in languageDefaults)) {
    throw new Error("Editorial defaults cannot define rule instructions or language identity.");
  }
  if ("crossReferences" in languageDefaults) objectRecord(languageDefaults.crossReferences, "default cross references");
  policy.shared = entries(section(markdown, "Shared rules", "Languages")).map(entry => {
    const parsed = jsonBlock(entry.body, true);
    objectRecord(parsed.metadata, "rule metadata");
    if ("id" in parsed.metadata || "instruction" in parsed.metadata) throw new Error("Rule ID and instruction must be authored in Markdown.");
    return orderedRecord({ ...structuredClone(sharedRuleDefaults), ...parsed.metadata, id: entry.name, instruction: parsed.instruction },
      ["category", "stages", "verification", "scope", "source", "id", "instruction"]);
  });
  policy.languages = entries(section(markdown, "Languages", "Workbook transcription")).map(entry => {
    const authored = objectRecord(jsonBlock(entry.body).metadata, "language metadata");
    if (authored.language !== entry.name) throw new Error("Language heading and policy disagree.");
    if ("crossReferences" in authored) objectRecord(authored.crossReferences, "cross references");
    const locale = { ...languageDefaults, ...authored };
    locale.crossReferences = orderedRecord({ ...languageDefaults.crossReferences, ...authored.crossReferences }, ["image", "text", "credit"]);
    return orderedRecord(locale, ["language", "code", "dateExample", "decimal", "grouping", "percentExample", "quotes",
      "capitalization", "acronyms", "hyphens", "units", "dateRule", "punctuation", "rules", "crossReferences"]);
  });
  return validatePolicy(policy);
}
function validatePolicy(policy) {
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
function parseWorkbookTranscription(value) {
  const markdown = String(value).replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const marker = "\n## Workbook transcription\n";
  if (markdown.split(marker).length !== 2) throw new Error("Missing or duplicate workbook transcription.");
  const body = markdown.split(marker)[1];
  const compact = body.match(/\n```json\n([\s\S]*?)\n```\s*$/);
  const cells = new Map();
  const add = (address, text) => {
    if (!/^[A-H][1-9]\d*$/.test(address) || typeof text !== "string" || cells.has(address)) {
      throw new Error("Invalid or duplicate workbook transcription cell.");
    }
    cells.set(address, text);
  };
  if (compact) {
    // Count authored keys as well as parsed keys so duplicate groups cannot
    // silently overwrite source evidence during JSON parsing.
    const pairs = objectRecord(JSON.parse(compact[1]), "workbook transcription");
    const keyMatches = [...compact[1].matchAll(/(?:^|[{,\n])\s*"((?:[^"\\]|\\.)*)"\s*:/g)];
    if (keyMatches.length !== Object.keys(pairs).length) throw new Error("Duplicate workbook transcription groups.");
    for (const [addresses, text] of Object.entries(pairs)) {
      if (addresses.trim() !== addresses || /\s{2,}|[^\S ]/.test(addresses)) throw new Error("Invalid workbook cell group.");
      for (const address of addresses.split(" ")) add(address, text);
    }
  } else {
    for (const match of body.matchAll(/### Sheet1!([A-H]\d+)\n\n```text\n([\s\S]*?)\n```/g)) add(match[1], match[2]);
  }
  if (!cells.size) throw new Error("Empty workbook transcription.");
  return [...cells].sort(([left], [right]) => Number(left.slice(1)) - Number(right.slice(1)) || left.charCodeAt(0) - right.charCodeAt(0));
}
function loadEditorialRules(filePath = POLICY_PATH, expectedSha256) {
  const loaded = standards.loadPolicy(filePath, expectedSha256);
  validatePolicy(loaded.policy);
  return loaded;
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
module.exports = { POLICY_PATH, LANGUAGES, STAGES, validatePolicy, parseEditorialMarkdown, parseWorkbookTranscription, loadEditorialRules, resolveEditorialRules, editorialPrompt };
