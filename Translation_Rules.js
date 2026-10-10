import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import policyReader from "./EditorialPolicy.cjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const canonicalTranslationProjectRoot = path.resolve(scriptDirectory, "../Translate");
const canonicalRulesPath = path.join(canonicalTranslationProjectRoot, "Code", "Translation Rules.md");
const bundledRulesPath = path.join(scriptDirectory, "Translation Rules.md");

export function loadTypoRules(expected) {
  // A present canonical project must supply its rules. Missing/invalid current
  // rules never silently fall back to an older distribution copy.
  const sourcePath = expected?.path || (fs.existsSync(canonicalTranslationProjectRoot) ? canonicalRulesPath : bundledRulesPath);
  const loadedRules = policyReader.loadEditorialRules(sourcePath, expected?.sha256);
  return { ...loadedRules, version: loadedRules.policy.version };
}
export function typoRuleEvidence() {
  const { path: sourcePath, sha256, version } = loadTypoRules();
  return { path: sourcePath, sha256, version, stage: "text" };
}
export function proofreadingRules(language = "", expected) {
  const loadedRules = loadTypoRules(expected);
  const requestedLanguage = String(language).trim();
  if (requestedLanguage) return policyReader.editorialPrompt(loadedRules.path, requestedLanguage, "text", loadedRules.sha256);
  const { policy } = loadedRules;
  return [
    "Publishing editorial rules " + policy.version + "; stage text; SHA-256 " + loadedRules.sha256 + ".",
    ...policy.precedence,
    ...policy.shared.filter(rule => rule.stages.includes("text")).map(rule => "[" + rule.id + "] " + rule.instruction),
    "Each language section below applies only to text in that language. Never apply English-specific style mechanically to another language.",
    ...policy.languages.map(languagePolicy => {
      const textStageLanguagePolicy = { ...languagePolicy, rules: (languagePolicy.rules || []).filter(rule => rule.stages.includes("text")) };
      delete textStageLanguagePolicy.crossReferences;
      return "Language-specific rules: " + JSON.stringify(textStageLanguagePolicy);
    }),
    "Use actual U+00A0 NBSP and U+202F NNBSP where required, never their labels or GREP escapes.",
    "Apply only relevant, proven corrections. Preserve protected quotations, official specifications, designations, exact glossary terms, literal markup, codes, line breaks and facts. Do not invent conversions or missing acronym expansions.",
    "Text-only review cannot verify layer order, image stacking, TOC numbering, paragraph indents, bold or italic character styles.",
  ].join("\n");
}
