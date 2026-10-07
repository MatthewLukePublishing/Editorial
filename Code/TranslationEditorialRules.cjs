"use strict";

const path = require("node:path");
const policyReader = require("./EditorialPolicy.cjs");
const POLICY_PATH = path.join(__dirname, "Translation Rules.md");
const { LANGUAGES, STAGES } = policyReader;
function loadEditorialRules() { return policyReader.loadEditorialRules(POLICY_PATH); }
function resolveEditorialRules(language, stage) { return policyReader.resolveEditorialRules(POLICY_PATH, language, stage); }
function editorialPrompt(language, stage, expectedSha256) { return policyReader.editorialPrompt(POLICY_PATH, language, stage, expectedSha256); }

// Protect literal syntax before any text-only typography operation. Caller-provided
// strings protect book-specific names and exact glossary entries as well.
const MASK_TOKEN = /\uE100(\d+)\uE101/gu;
function outsideProtectedText(value, protectedStrings, transform) {
  const originals = [];
  const reserve = text => { const token = `\uE100${originals.length}\uE101`; originals.push(text); return token; };
  const input = String(value ?? "");
  if (/[\uE100\uE101]/u.test(input)) throw new Error("Reserved editorial masking characters in input.");
  // Even entries are unmasked text and odd entries are mask tokens. Protected
  // strings search only unmasked text, so a digit-only string can never match a
  // token's index. A part boundary satisfies the same lookarounds as the former
  // private-use token neighbours: neither is a letter, number or underscore.
  let parts = [input];
  for (const text of [...new Set(protectedStrings || [])].filter(Boolean).sort((a,b) => b.length-a.length)) {
    // A literal match requires a literal occurrence; skip absent strings cheaply.
    if (typeof text === "string" && !parts.some((part, index) => index % 2 === 0 && part.includes(text))) continue;
    const escaped=text.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,"gu");
    const next = [];
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      if (index % 2) { next.push(part); continue; }
      let last = 0;
      for (const match of part.matchAll(pattern)) {
        next.push(part.slice(last, match.index), reserve(text));
        last = match.index + match[0].length;
      }
      next.push(part.slice(last));
    }
    parts = next;
  }
  const masked = parts.join("").replace(/<\?[\s\S]*?\?>|<\/?[A-Za-z][^>]*>|&(?:#\d+|#x[\da-fA-F]+|[A-Za-z]+);|(?:https?:\/\/|www\.)[^\s<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]+|⟦[^⟧]+⟧|__lock_[A-Za-z0-9_]+__/gu, reserve);
  // A literal-syntax original (such as a URL) can contain an earlier protected
  // string's token. Restore nested tokens until none remain.
  const restore = text => text.replace(MASK_TOKEN, (_match,index) => restore(originals[Number(index)]));
  return restore(transform(masked));
}

const FRENCH_MONTHS = [
  ["janvier", "Jan|Janv\\.?|janvier"], ["février", "Feb|Fév\\.?|Févr\\.?|février"],
  ["mars", "Mar\\.?|mars"], ["avril", "Apr|Avr\\.?|avril"], ["mai", "May|mai"],
  ["juin", "Jun|juin"], ["juillet", "Jul|Juil\\.?|juillet"], ["août", "Aug|août"],
  ["septembre", "Sep\\.?|Sept\\.?|septembre"], ["octobre", "Oct\\.?|octobre"],
  ["novembre", "Nov\\.?|novembre"], ["décembre", "Dec\\.?|Déc\\.?|décembre"],
];

const DATE_MONTHS = {
  English: ["Jan|January", "Feb|February", "Mar|March", "Apr|April", "May", "Jun|June", "Jul|July", "Aug|August", "Sep|Sept|September", "Oct|October", "Nov|November", "Dec|December"],
  German: ["Jan|Januar", "Feb|Februar", "Mär|März", "Apr|April", "Mai", "Jun|Juni", "Jul|Juli", "Aug|August", "Sep|Sept|September", "Okt|Oktober", "Nov|November", "Dez|Dezember"],
  Spanish: ["enero|ene", "febrero|feb", "marzo|mar", "abril|abr", "mayo|may", "junio|jun", "julio|jul", "agosto|ago", "septiembre|sep|sept", "octubre|oct", "noviembre|nov", "diciembre|dic"],
  Portuguese: ["janeiro|jan", "fevereiro|fev", "março|mar", "abril|abr", "maio|mai", "junho|jun", "julho|jul", "agosto|ago", "setembro|set", "outubro|out", "novembro|nov", "dezembro|dez"],
  Dutch: ["jan|januari", "feb|februari", "mrt|maart", "apr|april", "mei", "jun|juni", "jul|juli", "aug|augustus", "sep|september", "okt|oktober", "nov|november", "dec|december"],
  Italian: ["gen|gennaio", "feb|febbraio", "mar|marzo", "apr|aprile", "mag|maggio", "giu|giugno", "lug|luglio", "ago|agosto", "set|settembre", "ott|ottobre", "nov|novembre", "dic|dicembre"],
  Turkish: ["Oca|Ocak", "Şub|Şubat", "Mar|Mart", "Nis|Nisan", "May|Mayıs", "Haz|Haziran", "Tem|Temmuz", "Ağu|Ağustos", "Eyl|Eylül", "Eki|Ekim", "Kas|Kasım", "Ara|Aralık"],
  Polish: ["sty|stycznia", "lut|lutego", "mar|marca", "kwi|kwietnia", "maj|maja", "cze|czerwca", "lip|lipca", "sie|sierpnia", "wrz|września", "paź|października", "lis|listopada", "gru|grudnia"],
  Swedish: ["jan|januari", "feb|februari", "mar|mars", "apr|april", "maj", "jun|juni", "jul|juli", "aug|augusti", "sep|september", "okt|oktober", "nov|november", "dec|december"],
};

function normalizeEditorialText(value, language, options = {}) {
  if (options.protected === true) return String(value ?? "");
  const selected = options.languageRules || resolveEditorialRules(language, "text").language;
  return outsideProtectedText(value, options.protectedStrings, original => {
    let text = original;
    const months=DATE_MONTHS[selected.language];
    if(months){
      const withDe=["Spanish","Portuguese"].includes(selected.language);
      for(const variants of months){
        // Spanish abbreviated caption dates may omit one or both instances of
        // de. Expand only an explicit day/month/year, never across line breaks.
        const separator=selected.language === "Spanish" ? "[ \\u00A0\\u202F]+(?:de[ \\u00A0\\u202F]+)?" : withDe ? "[ \\u00A0\\u202F]+de[ \\u00A0\\u202F]+" : "[ \\u00A0\\u202F]+";
        const date=new RegExp(`\\b(\\d{1,2})${separator}(?:${variants})\\.?${separator}(\\d{4})\\b`,"giu");
        text=text.replace(date,(match,day,year)=> Number(day)<1||Number(day)>31 ? match : [day, ...(withDe?["de"]:[]), variants.split("|")[0], ...(withDe?["de"]:[]), year].join("\u00A0"));
      }
    }
    if (selected.language === "French") {
      for (const [month,aliases] of FRENCH_MONTHS) {
        const pattern = new RegExp(`\\b(\\d{1,2})(?:er)?[ \\u00A0\\u202F]+(?:${aliases})[ \\u00A0\\u202F]+(\\d{4})\\b`, "giu");
        text = text.replace(pattern, (match,day,year) => {
          if (Number(day)<1 || Number(day)>31) return match;
          return `${Number(day)===1 ? "1er" : day}\u00A0${month}\u00A0${year}`;
        });
      }
      // No newline-consuming \s: paragraph and style structure remain intact.
      text = text.replace(/([^\s])[ \u00A0\u202F\u2009]*([;!?])/gu, "$1\u202F$2");
      text = text.replace(/([^\s\d])[ \u00A0\u202F\u2009]*:(?!\d)/gu, "$1\u202F:");
      text = text.replace(/«[ \u00A0\u202F\u2009]*(?=\S)/gu, "«\u202F");
      text = text.replace(/(\S)[ \u00A0\u202F\u2009]*»/gu, "$1\u202F»");
      text = text.replace(/(\S)[ \u00A0\u202F\u2009]+—[ \u00A0\u202F\u2009]+(?=\S)/gu, "$1 —\u202F");
    }
    const percentGap=selected.percentExample.match(/5(.*)%/u)?.[1];
    if(percentGap!==undefined) text=text.replace(/(\d)[ \u00A0\u202F\u2009]*%/gu,`$1${percentGap}%`);
    // Existing measurement boundaries only; attached calibres such as 9mm are
    // not guessed to be ordinary quantities. Semantic review handles those cases.
    text=text.replace(/(\d)[ \u00A0\u202F\u2009]+(mm|cm|km|mg|kg|in|ft|yd|mi|min|MOA|mil|m|g|s|°C)(?![\p{L}\p{N}_])/gu,"$1\u00A0$2");
    text=text.replace(/(\d)[ \u00A0\u202F]+([+−×÷=≠≈<>≤≥±])[ \u00A0\u202F]+(?=[+−-]?\d)/gu,"$1\u00A0$2\u00A0");
    // Lazy loading avoids the policy module's language-list dependency cycle.
    // All applicable matrix expressions run before the translation is exported.
    return require("./IcmlGrep.cjs").transformText(text, selected.language).text;
  });
}

function auditEditorialText(value, language, options = {}) {
  if(options.protected === true) return [];
  const normalized=normalizeEditorialText(value,language,options);
  return normalized===String(value ?? "") ? [] : [{
    code:"EDITORIAL_TYPOGRAPHY", severity:"error",
    message:"Text does not match the language-specific date, punctuation, percentage, unit or mathematical spacing rules.",
  }];
}

module.exports={LANGUAGES,STAGES,loadEditorialRules,resolveEditorialRules,editorialPrompt,normalizeEditorialText,auditEditorialText};
