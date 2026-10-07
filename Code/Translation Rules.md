# Translation Rules

This is the editable rule authority used by Translation Pipeline and Typo Checker.
It incorporates Translation Rules.xlsx (Sheet1, A1:H59), including every nonempty
source cell in the workbook transcription below. The workbook remains unchanged.

## Editing

Edit the prose under a shared rule to change its instruction. To add a rule, copy
a neighbouring `### rule_id` entry, give it a unique ID, retain its JSON metadata,
and write the instruction beneath it. Stages are `glossary`, `text`, `diagram`,
`caption`, `icml`, and `layout`. Typo checking uses the `text` stage.
Language-specific settings and rules live in each language's JSON block.
Preserve field names and valid JSON; plain rule instructions may use Markdown.
Omitted shared-rule metadata inherits `sharedRuleDefaults`; omitted language fields
inherit `languageDefaults`. Explicit fields override defaults. Cross-reference fields
merge individually. Language-specific rule arrays retain their full metadata.
These defaults consolidate identical values; all instructions and exceptions remain intact.

The policy metadata, shared rules and language settings are active. The workbook
transcription preserves the original wording and GREP syntax as reference evidence;
edit the active rules to change behaviour. Existing native-language adaptations,
protected content and book-specific terminology take the precedence stated below.
The workbook's conflicting imperial example is resolved by its explicit metric-first
rule for English and Spanish. Its bare GREP plus is escaped in the tested engine;
fractions are not treated as binary operators. No source GREP is executed blindly.

New jobs use saved edits immediately. An in-progress job refuses changed rule hashes
and must be restarted or reopened for the pipeline's rules-review workflow. Text-only
typo reports cannot verify layers, image stacking, paragraph styles or TOC numbering.

The canonical Publishing copy lives in Translate's `Code/Translation Rules.md`.
Typos includes an identical distribution copy; when the projects are side by side,
it reads the canonical Translate file. Independent downloads read their own bundled
copy. Keep the distribution copy and shared policy reader identical before committing.


## Policy metadata

```json
{
  "schemaVersion": 1,
  "version": "1.2.0",
  "sourceWorkbook": "Translation Rules.xlsx",
  "scope": "English source plus nine target languages. House style is applied only where linguistically and technically applicable.",
  "precedence": [
    "Protected source sections, verified quotations, official names, codes and manufacturer specifications remain protected.",
    "Book-specific mandatory terminology overrides generic terminology advice.",
    "Language-specific conventions override English-specific wording and typography.",
    "The explicit English/Spanish metric-first rule governs the conflicting generic imperial-first example."
  ],
  "sources": [
    {"id":"house","title":"User-supplied Translation Rules.xlsx","reference":"Sheet1, A1:H59"},
    {"id":"bipm","title":"BIPM SI Brochure: quantity and unit typography","url":"https://www.bipm.org/fr/publications/si-brochure/"},
    {"id":"fr","title":"Académie française: questions de langue","url":"https://www.academie-francaise.fr/questions-de-langue"},
    {"id":"de","title":"Duden: quotation marks and punctuation","url":"https://www.duden.de/sprachwissen/rechtschreibregeln/anfuehrungszeichen"},
    {"id":"es","title":"FundéuRAE: percentage notation","url":"https://www.fundeu.es/recomendacion/porcentajes-claves-de-redaccion/"},
    {"id":"es_review","title":"User-supplied Spanish translation corrections","reference":"Generalized editorial rules for all books; no book-specific terminology or page edits."},
    {"id":"es_numbers","title":"FundéuRAE: miles y millones, claves de escritura","url":"https://www.fundeu.es/recomendacion/miles-y-millones-claves-de-escritura/"},
    {"id":"es_percent","title":"RAE: space before the percentage symbol","url":"https://www.rae.es/duda-linguistica/el-simbolo-del-porcentaje-se-escribe-pegado-la-cifra"},
    {"id":"es_ordinals","title":"FundéuRAE: números ordinales, claves de escritura","url":"https://www.fundeu.es/recomendacion/numero-ordinales-claves-de-escritura/"},
    {"id":"nl","title":"Taalunie: date notation","url":"https://taaladvies.net/datumnotatie/"},
    {"id":"tr","title":"Türk Dil Kurumu: writing numbers","url":"https://tdk.gov.tr/icerik/yazim-kurallari/sayilarin-yazilisi/"},
    {"id":"sv","title":"Språkrådet: percentage signs","url":"https://frageladan.isof.se/faqs/21726"}
  ],
  "markdownFormatVersion": 2,
  "sharedRuleDefaults": {"stages":["text","caption"],"verification":"linguistic","scope":"Unprotected editorial content","source":"house"},
  "languageDefaults": {"decimal":",","grouping":".","percentExample":"5 %","units":"metric_only","dateRule":"Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.","punctuation":"Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.","crossReferences":{"credit":"<fullPara delim=\":\" />:"}}
}
```

## Shared rules

### fractions_and_precision

```json
{"category":"Numbers","stages":["text","diagram","caption"]}
```

Use decimal quantities with measurement units. Fractions may remain for nonmeasurement concepts such as portions of a circle. Preserve exact ranges, ratios and specifications; do not confuse a fraction slash with an ordinary slash in dates or codes.

### plain_register

```json
{"category":"Sentence structure","stages":["glossary","text","diagram","caption"]}
```

Use clear, direct, idiomatic language for an educated nonacademic reader. Natural sentence-initial conjunctions are acceptable. End complete sentences and verbal caption fragments with appropriate punctuation.

### numbers_in_prose

```json
{"category":"Numbers"}
```

Spell out ordinary counting numbers one through one hundred as house style. Use numerals for time, measurements, decimals, percentages, numbers above one hundred, labels, tables, identifiers and official designations. Do not spell out digits inside a designation.

### conversion_precision

```json
{"category":"Numbers","stages":["text","diagram","caption"]}
```

New unit conversions use at most three significant digits, or two for approximate non-specific measures. Preserve exact source specifications and precision; do not round an exact value merely to meet a style preference.

### unit_system

```json
{"category":"Measurements","stages":["text","diagram","caption"]}
```

For English and Spanish, present metric first followed by the imperial equivalent. Other languages use metric only. Preserve regulations, manufacturer specifications and idiosyncratic designations or calibres; do not convert brand names or cartridge names. A redundant imperial equivalent may be removed only when the metric quantity expresses the same information.

### unit_symbols

```json
{"category":"Measurements","stages":["text","diagram","caption","icml"],"verification":"text"}
```

Use singular, case-sensitive unit symbols after numerals and U+00A0 NBSP before them. Prefer symbols to spelled-out units except in names or idiomatic contexts. Plane-angle °, ′ and ″ attach to the number; °C takes NBSP. Do not change calibre or product designations.

### date_spacing

```json
{"category":"Dates","stages":["text","caption","icml"],"verification":"text"}
```

Use the selected language's date form, with NBSP between its words and numeric components. Keep the four-digit year and the actual date. Do not normalize identifiers or reference codes as dates.

### math_spacing

```json
{"category":"Math symbols","stages":["text","diagram","caption","icml"],"verification":"text"}
```

Put NBSP on both sides of binary mathematical operators + − × ÷ = ≠ ≈ < > ≤ ≥ ±. Distinguish a unary sign from a binary operator. A fraction slash ⁄ and vulgar-fraction glyphs are parts of numbers, not binary operators. Do not alter URLs, tags, ranges, names or identifiers.

### acronym_introduction

```json
{"category":"Acronyms"}
```

Introduce a verified full term followed by its acronym in parentheses at first use in each section. Follow the chosen glossary and book-specific official-name rules. Do not invent an expansion or repeat an expansion unnecessarily in the same caption.

### parenthetical_examples

```json
{"category":"Sentence structure"}
```

Use the language's natural equivalent of e.g. and i.e. in parentheses, and the equivalent of for example and that is outside parentheses. Do not transplant English abbreviations where they are unnatural.

### modality

```json
{"category":"Specific words"}
```

Avoid vague prescriptive should, unnecessary will, and stilted thus in English editorial prose. In translations, preserve the source's obligation, recommendation, condition, uncertainty and tense with natural wording; do not mechanically ban equivalent target-language words or strengthen advice into an obligation.

### pronouns

```json
{"category":"Specific words"}
```

Avoid unnecessary personal pronouns and ambiguous referents. Use natural gender-neutral wording for an unknown person where the language allows it. Do not erase a known person's gender or import singular English they into another language.

### caption_order

```json
{"category":"Paragraphs"}
```

Finish location/date captions in the form Location, date. Use natural target-language order for the rest of the caption without dropping names, events or facts.

### draft_comments

```json
{"category":"Drafting","stages":["text","caption","icml","layout"],"verification":"review"}
```

Editorial drafting comments use curly brackets. Detect unresolved editorial comments before final publication and require a recorded resolution. Preserve literal braces used in code or mathematics.

### cross_references

```json
{"category":"Cross references","stages":["icml","layout"],"verification":"layout"}
```

Apply the selected language's Image, In The Text and Credit templates to live InDesign cross-reference formats. Keep fullPara, paraText, pageNum and ^S tokens dynamic. Do not replace them with literal text or regenerate image labels by guessing.

### paragraph_indents

```json
{"category":"Paragraphs","stages":["layout"],"verification":"layout"}
```

The first body paragraph after a heading or section break has no first-line indent; subsequent body paragraphs use the approved body indent. Use paragraph styles, not inserted spaces. Do not apply body indentation to captions, tables or lists.

### layer_order

```json
{"category":"Layers","stages":["layout"],"verification":"layout"}
```

Verify the existing layers top-to-bottom as KDP, Images, Body, Peripheral, Background where those production layers apply. Report absent, extra or differently named layers for scoped resolution; never create, delete or rename layers blindly.

### image_number_order

```json
{"category":"Image numbering","stages":["layout"],"verification":"layout"}
```

When images are pasted or changed on one page, check image stacking bottom-to-top against intended caption numbering. Preserve existing image order unless a verified discrepancy requires a change.

### toc_numbering

```json
{"category":"Table of contents","stages":["layout"],"verification":"layout"}
```

Verify TOC 2 and the section-specific Title 2 numbering sequence. Correct a known sequence with the numbering style start/continue settings, not typed numbering. Preserve existing section boundaries and dynamic numbering.

### emphasis

```json
{"category":"Specific words","stages":["layout"],"verification":"layout"}
```

Preserve bold for emphasis and italics for variables using character styles. Do not italicize unit symbols merely because variables are italic.

## Languages

### English

```json
{
  "language": "English",
  "code": "en",
  "dateExample": "14 Mar 2013",
  "decimal": ".",
  "grouping": ",",
  "percentExample": "5%",
  "quotes": "“text”",
  "capitalization": "Use English title case for headings. Lowercase after a colon unless a proper name or quoted sentence requires capitals.",
  "acronyms": "The house-style acronym plural is MWD’s. Do not export this apostrophe rule to other languages.",
  "hyphens": "Use English compound-modifier hyphens. With SI symbols keep a space (5 m); use 5-foot when the unit is written out. Hyphenate compound noun adjuncts and single-concept phrases such as sector-of-fire and ease-of-use. Do not insert a hyphen after pre or re by default (preassault). With compound dimensions hyphenate only the second written-out unit phrase, as in 4 by 8-foot.",
  "units": "metric_then_imperial",
  "crossReferences": {"image":"(See <fullPara delim=\":\" />, Pg.^S<pageNum />.)","text":"(See <paraText />, Pg.^S<pageNum />.)"}
}
```

### French

```json
{
  "language": "French",
  "code": "fr",
  "dateExample": "25 octobre 2004",
  "grouping": " ",
  "percentExample": "5 %",
  "quotes": "« texte »",
  "capitalization": "Use sentence case in headings, with capitals for proper names. Lowercase after a colon except names and complete quotations.",
  "acronyms": "Keep unlexicalized capital-letter acronyms invariable. No English plural ’s.",
  "hyphens": "Use French compounds, agreement and elision. Do not transfer English prenominal hyphens.",
  "dateRule": "Day + full lowercase French month + year; 1er for the first day. Example: 25 octobre 2004.",
  "punctuation": "Use U+202F NNBSP before ; : ! ? and %, after « and before ». Use a regular space before an em dash and NNBSP after it. No spaces inside an apostrophe contraction.",
  "crossReferences": {"image":"(consulter l'<fullPara delim=\":\" />, p.^S<pageNum />)","text":"(consulter « <paraText /> », p.^S<pageNum />)","credit":"<fullPara delim=\":\" /> :"}
}
```

### German

```json
{
  "language": "German",
  "code": "de",
  "dateExample": "14 Mär 2013",
  "quotes": "„Text“",
  "capitalization": "Capitalize nouns and proper names, including in headings. After a colon capitalize a complete sentence; otherwise use ordinary German casing.",
  "acronyms": "Use established German abbreviation plurals where needed, without an English plural apostrophe.",
  "hyphens": "Use German compounds and necessary hyphens. Do not copy English open-compound syntax.",
  "crossReferences": {"image":"(Siehe <fullPara delim=\":\" />, S.^S<pageNum />.)","text":"(Siehe <paraText />, S.^S<pageNum />.)"}
}
```

### Spanish

```json
{
  "language": "Spanish",
  "code": "es",
  "dateExample": "25 de octubre de 2004",
  "grouping": " ",
  "quotes": "«texto»",
  "capitalization": "Use sentence case for headings, preserving official names. Lowercase ordinary common nouns and technical terms within sentences even when English capitalizes them; do not lowercase proper names, acronyms or sentence beginnings. Lowercase after a colon except proper names and quoted sentences.",
  "acronyms": "Keep capital-letter acronyms invariable in writing; express plurality through determiners.",
  "hyphens": "Use Spanish syntax for compound modifiers; do not import English hyphens.",
  "units": "metric_then_imperial",
  "dateRule": "Day + de + full lowercase month + de + year, joined with NBSP.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Preserve Spanish opening ¿ and ¡. Put U+00A0 NBSP before %, as in 5 %. Separate consecutive sentences with one ordinary space after the closing punctuation, without joining paragraph or segment boundaries. Do not insert spaces inside abbreviations, ordinal suffixes, decimals, URLs or codes.",
  "rules": [
    {"id":"es_labels_and_headings","category":"Translation coverage","stages":["glossary","text","diagram","caption","icml","layout"],"instruction":"Translate ordinary editorial labels, captions, chapter titles and running headings consistently into Spanish; use Imagen for the caption label Image. Check repeated headings against the translated chapter title rather than leaving an English duplicate. Translate only editable source text: preserve dynamic numbering, variables, cached cross-reference text, internal format/style names and identifiers. Generated references must use the Cross-References panel Definition encoder with the existing Spanish Ver templates; never patch their cached ICML text. Report headings or labels absent from the translation input for source-package/layout review rather than claiming complete coverage.","verification":"review","scope":"Unprotected editorial content; native generated references remain panel-owned","source":"es_review"},
    {"id":"es_caption_locations","category":"Captions","stages":["text","caption"],"instruction":"In narrative captions and image descriptions, spell out U.S. state names instead of retaining postal abbreviations. Resolve the full name from the geographical context; do not guess an ambiguous abbreviation or expand matching letters inside a name, code or postal address. This editorial location rule does not authorize rewriting protected source credits or official names.","verification":"linguistic","scope":"Unprotected editorial captions and image descriptions","source":"es_review"},
    {"id":"es_quotation_consistency","category":"Quotation marks","stages":["text","diagram","caption"],"instruction":"Use «texto» consistently for first-level Spanish quotations, with no internal padding. Do not mix English and Spanish first-level quotation marks arbitrarily. Reserve other quote shapes for genuinely nested quotations or protected literal syntax; preserve the nesting and meaning rather than replacing every quote character blindly.","verification":"linguistic","scope":"Unprotected editorial content","source":"es_review"},
    {"id":"es_ordinal_typography","category":"Ordinals","stages":["glossary","text","diagram","caption"],"instruction":"Write abbreviated ordinals with a period followed by superscript letters, agreeing with the noun in gender and number. For apocopated primer and tercer, use 1.ᵉʳ and 3.ᵉʳ, not baseline 1.er or 3.er; apply the same principle to other ordinal abbreviations. Use º or ª where grammatically appropriate, not the degree sign °. Preserve an already styled superscript run and protected official designations; never add markup or change segment structure to simulate superscript.","verification":"linguistic","scope":"Unprotected editorial content","source":"es_ordinals"},
    {"id":"es_number_grouping","category":"Numbers","stages":["text","diagram","caption"],"instruction":"Use a decimal comma. For ordinary quantities, leave four-digit integers ungrouped (3000, 1650); group integers of five or more digits in threes with U+00A0 NBSP (12 345, 1 234 567), never commas or periods. Determine whether a source comma is a thousands separator or a decimal separator before localizing it: do not turn the Spanish decimal 3,000 into the integer 3000. Do not group years, page numbers, identifiers, postal codes or official designations. This is source-aware translation/review, not a blind number-replacement formula.","verification":"linguistic","scope":"Unprotected editorial quantities","source":"es_numbers"},
    {"id":"es_parenthetical_periods","category":"Sentence punctuation","stages":["text","caption"],"instruction":"Place the sentence-final period after the closing parenthesis, including when the whole sentence is parenthetical. Distinguish sentence-final punctuation from internal sentence periods, abbreviation dots, decimals and ellipses; do not blindly move every period adjacent to a parenthesis. Keep generated cross-reference punctuation under the panel encoder's control.","verification":"linguistic","scope":"Unprotected editorial content","source":"es_review"}
  ],
  "crossReferences": {"image":"(Ver <fullPara delim=\":\" />, pág.^S<pageNum />)","text":"(Ver <paraText />, pág.^S<pageNum />)"}
}
```

### Portuguese

```json
{
  "language": "Portuguese",
  "code": "pt",
  "dateExample": "25 de outubro de 2004",
  "quotes": "«texto»",
  "capitalization": "Use sentence case for headings, except proper names. Use ordinary Portuguese rules after a colon.",
  "acronyms": "Use established Portuguese acronym plural forms only where appropriate; no English plural apostrophe.",
  "hyphens": "Use Portuguese compound and prefix spelling, including its context-dependent hyphen rules.",
  "dateRule": "Day + de + full lowercase month + de + year, joined with NBSP.",
  "crossReferences": {"image":"(Consulte a <fullPara delim=\":\" />, P.^S<pageNum />.)","text":"(Consulte <paraText />, P.^S<pageNum />.)"}
}
```

### Dutch

```json
{
  "language": "Dutch",
  "code": "nl",
  "dateExample": "25 okt 2004",
  "percentExample": "5%",
  "quotes": "‘tekst’",
  "capitalization": "Use sentence case for headings, preserving proper names. Lowercase after a colon except a quotation or proper name.",
  "acronyms": "Use native Dutch acronym inflection. An apostrophe may be required for letter abbreviations; do not apply English forms indiscriminately.",
  "hyphens": "Use native Dutch compounds, linking forms and necessary hyphens.",
  "crossReferences": {"image":"(Zie <fullPara delim=\":\" />, p.^S<pageNum />.)","text":"(Zie <paraText />, p.^S<pageNum />.)"}
}
```

### Italian

```json
{
  "language": "Italian",
  "code": "it",
  "dateExample": "25 ott 2004",
  "quotes": "«testo»",
  "capitalization": "Use sentence case for headings, preserving proper names. Lowercase after a colon except names and quotations.",
  "acronyms": "Normally keep capital-letter acronyms invariable. No English plural ’s.",
  "hyphens": "Use Italian compound and prefix spelling; do not copy English hyphenated noun strings.",
  "crossReferences": {"image":"(Vedere <fullPara delim=\":\" />, pag.^S<pageNum />.)","text":"(Vedere <paraText />, pag.^S<pageNum />.)"}
}
```

### Turkish

```json
{
  "language": "Turkish",
  "code": "tr",
  "dateExample": "25 Eki 2004",
  "percentExample": "%5",
  "quotes": "“metin”",
  "capitalization": "Use Turkish title capitalization and dotted/dotless I correctly. Use ordinary Turkish sentence casing after colons.",
  "acronyms": "Attach suffixes according to Turkish pronunciation and apostrophe rules for abbreviations; never append English plural ’s.",
  "hyphens": "Use Turkish compound spelling and vowel harmony; do not import English modifier hyphens.",
  "crossReferences": {"image":"(Bkz. <fullPara delim=\":\" />, s.^S<pageNum />.)","text":"(Bkz. <paraText />, s.^S<pageNum />.)"}
}
```

### Polish

```json
{
  "language": "Polish",
  "code": "pl",
  "dateExample": "25 paź 2004",
  "grouping": " ",
  "percentExample": "5%",
  "quotes": "„tekst”",
  "capitalization": "Use sentence case for headings except proper names and prescribed official titles. Lowercase after a colon except names and quotations.",
  "acronyms": "Use established Polish acronym inflection and hyphens when required; no blanket English plural ’s.",
  "hyphens": "Use Polish compound and prefix spelling and inflection.",
  "crossReferences": {"image":"(Zobacz <fullPara delim=\":\" />, s.^S<pageNum />.)","text":"(Zobacz <paraText />, s.^S<pageNum />.)"}
}
```

### Swedish

```json
{
  "language": "Swedish",
  "code": "sv",
  "dateExample": "25 okt 2004",
  "grouping": " ",
  "quotes": "”text”",
  "capitalization": "Use sentence case for headings, preserving proper names. A full independent sentence after a colon can begin with a capital.",
  "acronyms": "Use Swedish colon before letter-acronym endings where required, such as EU:s. Do not use English apostrophe plurals.",
  "hyphens": "Use Swedish compounds and required hyphens, not English noun-string spacing.",
  "crossReferences": {"image":"(Se <fullPara delim=\":\" />, s.^S<pageNum />.)","text":"(Se <paraText />, s.^S<pageNum />.)"}
}
```

## Workbook transcription

Source: Translation Rules.xlsx, Sheet1, A1:H59. SHA-256:
`D1ADE74153769E42C35F84D16569C7BBA1150BBF6D9D916DAD4562EA330DD809`. Original file size: 16246 bytes.
All 186 nonempty cells are losslessly encoded below as JSON strings. A key lists
one or more Sheet1 cell addresses separated by spaces; all listed cells contain
exactly that value. Identical values are stored once. JSON escapes preserve quotes,
backslashes, line breaks and trailing spaces; Unicode NBSP/NNBSP remain literal.
Spaces are preserved: NBSP is U+00A0; NNBSP is U+202F. InDesign `^S`, `~S`,
XML-like building blocks, and GREP escapes retain their original spelling.

```json
{
  "A1": "Cross Reference Code",
  "A2": "Language",
  "B2": "Image",
  "E2": "In The Text",
  "H2": "Credit",
  "A3": "English",
  "B3": "(See <fullPara delim=\":\" />, Pg.^S<pageNum />.)",
  "E3": "(See <paraText />, Pg.^S<pageNum />.)",
  "H3 H5 H6 H7 H8 H9 H10 H11 H12": "<fullPara delim=\":\" />:",
  "A4": "French",
  "B4": "(consulter l'<fullPara delim=\":\" />, p.^S<pageNum />)",
  "E4": "(consulter « <paraText /> », p.^S<pageNum />)",
  "H4": "<fullPara delim=\":\" /> :",
  "A5": "German",
  "B5": "(Siehe <fullPara delim=\":\" />, S.^S<pageNum />.)",
  "E5": "(Siehe <paraText />, S.^S<pageNum />.)",
  "A6": "Spanish",
  "B6": "(Ver <fullPara delim=\":\" />, pág.^S<pageNum />)",
  "E6": "(Ver <paraText />, pág.^S<pageNum />)",
  "A7": "Portuguese",
  "B7": "(Consulte a <fullPara delim=\":\" />, P.^S<pageNum />.)",
  "E7": "(Consulte <paraText />, P.^S<pageNum />.)",
  "A8": "Dutch",
  "B8": "(Zie <fullPara delim=\":\" />, p. ^S<pageNum />.)",
  "E8": "(Zie <paraText />, p. ^S<pageNum />.)",
  "A9": "Italian",
  "B9": "(Vedere <fullPara delim=\":\" />, pag. ^S<pageNum />.)",
  "E9": "(Vedere <paraText />, pag. ^S<pageNum />.)",
  "A10": "Turkish",
  "B10": "(Bkz. <fullPara delim=\":\" />, s. ^S<pageNum />.)",
  "E10": "(Bkz. <paraText />, s. ^S<pageNum />.)",
  "A11": "Polish",
  "B11": "(Zobacz <fullPara delim=\":\" />, s. ^S<pageNum />.)",
  "E11": "(Zobacz <paraText />, s. ^S<pageNum />.)",
  "A12": "Swedish",
  "B12": "(Se <fullPara delim=\":\" />, s. ^S<pageNum />.)",
  "E12": "(Se <paraText />, s. ^S<pageNum />.)",
  "A15": "Units (NBSP Before)",
  "C15": "French Punctuation (NNBSP Before)",
  "E15": "Math Symbols (NBSP Before and After)",
  "G15": "Other Uncommon Symbols",
  "A16 C16 E16 G16": "Name",
  "B16": "Abbreviation",
  "D16 F16 H16": "Symbol",
  "A17": "Millimeter",
  "B17": "mm",
  "C17": "Semicolon",
  "D17": ";",
  "E17": "Plus Sign",
  "F17": "+",
  "G17": "Degree Symbol",
  "H17": "°",
  "A18": "Centimeter",
  "B18": "cm",
  "C18": "Colon",
  "D18": ":",
  "E18": "Minus Sign",
  "F18": "-",
  "G18": "German Opening Quote",
  "H18": "„",
  "A19": "Meter",
  "B19": "m",
  "C19": "Question Mark",
  "D19": "?",
  "E19": "Multiplication Sign",
  "F19": "×",
  "G19": "German Closing Quote",
  "H19": "“",
  "A20": "Kilometer",
  "B20": "km",
  "C20": "Exclamation Point",
  "D20": "!",
  "E20": "Division sign",
  "F20": "÷",
  "G20": "Approximately",
  "H20": "~",
  "A21": "Milligram",
  "B21": "mg",
  "C21": "Left Guillemet, Opening Quote",
  "D21": "«",
  "E21": "Equal Sign",
  "F21": "=",
  "G21 C23": "Percent Sign",
  "H21 D23": "%",
  "A22": "Gram",
  "B22": "g",
  "C22": "Right Guillemet, Closing Quote",
  "D22": "»",
  "E22": "Not Equal Sign",
  "F22": "≠",
  "A23": "Kilogram",
  "B23": "kg",
  "E23": "Approximate Sign",
  "F23": "≈",
  "A24": "Inch",
  "B24": "in",
  "C24": "Em Dash",
  "D24": "—",
  "E24": "Less Than",
  "F24": "<",
  "A25": "Foot",
  "B25": "ft",
  "E25": "Greater Than",
  "F25": ">",
  "A26": "Yard",
  "B26": "yd",
  "E26": "Less Than or Equal To",
  "F26": "≤",
  "A27": "Mile",
  "B27": "mi",
  "E27": "Greater Than or Equal To",
  "F27": "≥",
  "A28": "Seconds",
  "B28": "s",
  "E28": "Plus-Minus",
  "F28": "±",
  "A29": "Minutes",
  "B29": "min",
  "E29": "Fractions",
  "F29": "½ ⅓ ⅔ ¼ ¾ ⅕ ⅖ ⅗ ⅘ ⅙ ⅚",
  "A30": "Minutes-of-Angle",
  "B30": "MOA",
  "E30": "Fractions Divider",
  "F30": "⁄ (not / )",
  "A31": "Mil",
  "B31": "mil",
  "A34": "GREP Code",
  "A35": "French NNBSP GREP Code",
  "B35": "Before ; : ! ?\nStandardize around —\nAfter « (normalize to NNBSP)\nBefore » (normalize to NNBSP)",
  "D35": "[ \\t\\x{00A0}\\x{2009}]+(?=[;:!?%])\n(\\S)[ \\t\\x{00A0}\\x{2009}\\x{202F}]*—[ \\t\\x{00A0}\\x{2009}\\x{202F}]*\n(?<=«)[ \\t\\x{00A0}\\x{2009}]+\n[ \\t\\x{00A0}\\x{2009}]+(?=»)",
  "G35": "\\x{202F}\n$1 —\\x{202F}\n\\x{202F}\n\\x{202F}\n",
  "A36": "NBSP Preceding Unit",
  "B36": "Adds NBSP before Unit",
  "D36": "(?<=\\d) (mm|cm|m|km|mg|g|kg|in|ft|yd|mi|s|min|MOA|mil)(?=[\\s[:punct:]]|$)",
  "G36 G37": "~S$1",
  "A37": "NBSP Preceding Math",
  "B37": "Adds NBSP before Math Symbol",
  "D37": "(?<=\\d) (+|−|×|÷|=|≠|≈|<|>|≤|≥|±|½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⁄)(?=[ [:punct:]]|$)",
  "A38": "NBSP in Dates",
  "B38": "English\nGerman\nFrench\nSpanish\nPortuguese\nDutch\nItalian\nTurkish\nPolish\nSwedish",
  "D38": "\\b(\\d{1,2})\\s+([A-Z][a-z]{2})\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+([A-ZÄ][a-zä]{2})\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+(\\u?\\l{3,})\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+de\\s+(\\u?\\l{3,})\\s+de\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+de\\s+(\\u?\\l{3,})\\s+de\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+(Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|lis|gru)\\s+(\\d{4})\\b\n\\b(\\d{1,2})\\s+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\\s+(\\d{4})\\b",
  "G38": "$1~S$2~S$3\n$1~S$2~S$3\n$1~S$2~S$3\n$1~Sde~S$2~Sde~S$3\n$1~Sde~S$2~Sde~S$3\n$1~S$2~S$3\n$1~S$2~S$3\n$1~S$2~S$3\n$1~S$2~S$3\n$1~S$2~S$3",
  "A43": "Other Notes",
  "A44": "Layer order and names",
  "B44": "1 - KDP\n2 - Images\n3 - Body\n4 - Peripheral\n5 - Background",
  "A45": "Maintaining the order of image numbers when pasting.",
  "B45": "For images to maintain the same order of numbers when multiple images are pasted or altered on the same page, the image objects must be ordered from bottom to top in the layers panel. That is, the bottom image in the layer panel is the first to get a caption number, and the top image is the last to get a caption number.",
  "A46": "Table of Contents Numbering",
  "B46": "○ The numbering of the table of contents is controled with TOC 2 paragraph styles.\n○ Each section has it's own Title 2 paragraph style. In that style, the \"Bullets and Numbering\" option has a \"Numbering Style: Mode\" option.\n○ To set the number, change the mode to \"Start At,\" enter the number, and change back to \"Continue...\".",
  "A47": "Drafting",
  "B47": "○ Enclose editorial comments that need to be reviewed later in curly brackets (e.g., {link to chapter 21}).",
  "A50": "Check with AI",
  "A51": "Numbers",
  "B51": "○ Spell out numbers from one through one hundred in text by default (e.g., \"twenty-five soldiers\").\n○ Use numerals for time (e.g., \"5 minutes\"), units of measure, (e.g. 20 in), decimals (e.g., 0.25 percent), and numbers greater than 100 (e.g., 1,000 soldiers).\n○ Use numerals and % for “percent” (e.g., 5%).\n○ Only use 2 to 3 significant digits (e.g., 5 m (5.5 yd)).\n○ Use a comma to separate every three digits (e.g., 1,000 not 1000).\n○ Decimals are used for units (e.g., meters and yards) while fractions can be used for other things (e.g., circles and ranges).\n○ When using a compound number, hyphenate only the second part (e.g., \"4 by 8-foot\").",
  "A52": "Imperial and Metric Abbreviations",
  "B52": "○ English and Spanish get metric first followed by imperial (e.g., 5 m (5.47 yd)). All other languages are metric only (unless in a regulation or manufacture specification).\n○ Only one unit of measurement needed if it is something like a brand name or caliber such as .300 Win Mag or 9mm caliber.\n○ All units use the singular abbreviation and have a non-breaking space (e.g., 12_km, not 12kms).\n○ Unless a specific name, the unit abbreviation is preferred to the full name (e.g, 12 m, not 12 meters).\n○ All imperial units are followed by a metric conversion, unless the imperial unit is idiosyncratic and would be used in metric countries (e.g., 22 lb (10 kg)).\n○ Unit conversions use no more than three significant digits (e.g., 10 lb (4.54 kg), not 10 lb (4.53592 kg)), and may use two (e.g., 10 lb (4.5 kg)) for non-specific measures.\n○ Include a hyphen between the number and the unit whenever the number and unit act as a pre-noun phrase (e.g., 5-ft boat versus it was 5 ft long).",
  "A53": "Dates",
  "B53": "○ All dates use non-breaking spaces, represented here by underscores.\n○ English and German: DD_Mmm_YYYY (e.g., 14 Mar 2013)\n○ French: DD_month_YYYY (e.g., 25 octobre 2004)\n○ Spanish and Portuguese: DD_de_month_de_YYYY (Spanish e.g., 25 de octubre de 2004 | Portuguese e.g., 25 de outubro de 2004)",
  "A54": "Acronyms",
  "B54": "○ Introduce an acronym in parentheses after introducing the correct full term (e.g., Bureau of Alcohol, Tobacco, Firearms and Explosives (ATF)).\n○ Reintroduce the full term and its acronym in each new section.\n○ Add an apostrophe when pluralizing acronyms (e.g., \"MWD’s\").",
  "A55": "Capitalization",
  "B55": "○ Use title case for titles (i.e., all nouns, verbs, and adjectives of titles are capitalized).\n○ Lowercase after colon (e.g., “Colons are used like this: lowercase.”)",
  "A56": "Hyphens",
  "B56": "○ Use hyphens for compound noun adjuncts (e.g., \"platoon-level raid\"). \n○ Hyphenate phrases acting as a single concept, especially if \"of\" is in the center (e.g., \"sector-of-fire\", “ease-of-use”). \n○ Do not hyphenate when using prefixes such as \"pre\" and \"re\" (e.g., \"preassault\").",
  "A57": "Paragraphs",
  "B57": "○ First paragraph is not indented.\n○ Second paragraph is indented.\n○ Captions with locations and dates are: “Location, date.”",
  "A58": "Sentence structure",
  "B58": "○ It's acceptable to start sentences with conjunctions such as \"and,\" \"or,\" \"but.\"\n○ Ensure that any sentence fragment containing a verb ends with a period.\n○ Prefer formal spoken English over formal written English. The target audience is educated but not academic.\n○ Periods and commas always fall within quotation marks (e.g. “go.”)\n○ Use e.g./i.e. within parenthesis (i.e., the muzzle face meets the bore at a 90-degree angle) and “for example” and “that is” outside of parentheses.",
  "A59": "Specific words",
  "B59": "○ “Should” – Do not use “should” in this text because it implies that there is a consequence without specifying it. Present tense, “requires,” “must,” “would,” “improves,” etc. are all better choices.\n○ “Will” – Do not use \"will\" and use present tense or “would.”\n○ “They” – Use gender-neutral pronouns (\"they,\" \"them,\" \"their,\" \"themself\" for singular unknown, and \"themselves\" for plural unknown) and minimize personal pronoun use to reduce confusion.\n○ “Thus” – Don’t use “thus.” The book is written using spoken English, and I don’t think people use “thus” when speaking.\n○ Bold is for emphasis.\n○ Italics for variables."
}
```
