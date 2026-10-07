import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policyReader from "./EditorialPolicy.cjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const canonicalRoot = path.resolve(directory, "../Translate");
const canonicalPath = path.join(canonicalRoot, "Code", "Translation Rules.md");
const bundledPath = path.join(directory, "Translation Rules.md");

export function loadTypoRules(expected) {
  // A present canonical project must supply its rules. Missing/invalid current
  // rules never silently fall back to an older distribution copy.
  const sourcePath = expected?.path || (fs.existsSync(canonicalRoot) ? canonicalPath : bundledPath);
  const loaded = policyReader.loadEditorialRules(sourcePath, expected?.sha256);
  return { ...loaded, version: loaded.policy.version };
}
export function typoRuleEvidence() {
  const { path: sourcePath, sha256, version } = loadTypoRules();
  return { path: sourcePath, sha256, version, stage: "text" };
}
export function proofreadingRules(language = "", expected) {
  const loaded = loadTypoRules(expected);
  const requested = String(language).trim();
  if (requested) return policyReader.editorialPrompt(loaded.path, requested, "text", loaded.sha256);
  const { policy } = loaded;
  return [
    "Publishing editorial rules " + policy.version + "; stage text; SHA-256 " + loaded.sha256 + ".",
    ...policy.precedence,
    ...policy.shared.filter(rule => rule.stages.includes("text")).map(rule => "[" + rule.id + "] " + rule.instruction),
    "Each language section below applies only to text in that language. Never apply English-specific style mechanically to another language.",
    ...policy.languages.map(locale => {
      const local = { ...locale, rules: (locale.rules || []).filter(rule => rule.stages.includes("text")) };
      delete local.crossReferences;
      return "Language-specific rules: " + JSON.stringify(local);
    }),
    "Use actual U+00A0 NBSP and U+202F NNBSP where required, never their labels or GREP escapes.",
    "Apply only relevant, proven corrections. Preserve protected quotations, official specifications, designations, exact glossary terms, literal markup, codes, line breaks and facts. Do not invent conversions or missing acronym expansions.",
    "Text-only review cannot verify layer order, image stacking, TOC numbering, paragraph indents, bold or italic character styles.",
  ].join("\n");
}
