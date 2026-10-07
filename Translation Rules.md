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
    {
      "id": "house",
      "title": "User-supplied Translation Rules.xlsx",
      "reference": "Sheet1, A1:H59"
    },
    {
      "id": "bipm",
      "title": "BIPM SI Brochure: quantity and unit typography",
      "url": "https://www.bipm.org/fr/publications/si-brochure/"
    },
    {
      "id": "fr",
      "title": "Académie française: questions de langue",
      "url": "https://www.academie-francaise.fr/questions-de-langue"
    },
    {
      "id": "de",
      "title": "Duden: quotation marks and punctuation",
      "url": "https://www.duden.de/sprachwissen/rechtschreibregeln/anfuehrungszeichen"
    },
    {
      "id": "es",
      "title": "FundéuRAE: percentage notation",
      "url": "https://www.fundeu.es/recomendacion/porcentajes-claves-de-redaccion/"
    },
    {
      "id": "es_review",
      "title": "User-supplied Spanish translation corrections",
      "reference": "Generalized editorial rules for all books; no book-specific terminology or page edits."
    },
    {
      "id": "es_numbers",
      "title": "FundéuRAE: miles y millones, claves de escritura",
      "url": "https://www.fundeu.es/recomendacion/miles-y-millones-claves-de-escritura/"
    },
    {
      "id": "es_percent",
      "title": "RAE: space before the percentage symbol",
      "url": "https://www.rae.es/duda-linguistica/el-simbolo-del-porcentaje-se-escribe-pegado-la-cifra"
    },
    {
      "id": "es_ordinals",
      "title": "FundéuRAE: números ordinales, claves de escritura",
      "url": "https://www.fundeu.es/recomendacion/numero-ordinales-claves-de-escritura/"
    },
    {
      "id": "nl",
      "title": "Taalunie: date notation",
      "url": "https://taaladvies.net/datumnotatie/"
    },
    {
      "id": "tr",
      "title": "Türk Dil Kurumu: writing numbers",
      "url": "https://tdk.gov.tr/icerik/yazim-kurallari/sayilarin-yazilisi/"
    },
    {
      "id": "sv",
      "title": "Språkrådet: percentage signs",
      "url": "https://frageladan.isof.se/faqs/21726"
    }
  ]
}
```
## Shared rules

### fractions_and_precision

```json
{
  "category": "Numbers",
  "stages": [
    "text",
    "diagram",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Use decimal quantities with measurement units. Fractions may remain for nonmeasurement concepts such as portions of a circle. Preserve exact ranges, ratios and specifications; do not confuse a fraction slash with an ordinary slash in dates or codes.

### plain_register

```json
{
  "category": "Sentence structure",
  "stages": [
    "glossary",
    "text",
    "diagram",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Use clear, direct, idiomatic language for an educated nonacademic reader. Natural sentence-initial conjunctions are acceptable. End complete sentences and verbal caption fragments with appropriate punctuation.

### numbers_in_prose

```json
{
  "category": "Numbers",
  "stages": [
    "text",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Spell out ordinary counting numbers one through one hundred as house style. Use numerals for time, measurements, decimals, percentages, numbers above one hundred, labels, tables, identifiers and official designations. Do not spell out digits inside a designation.

### conversion_precision

```json
{
  "category": "Numbers",
  "stages": [
    "text",
    "diagram",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

New unit conversions use at most three significant digits, or two for approximate non-specific measures. Preserve exact source specifications and precision; do not round an exact value merely to meet a style preference.

### unit_system

```json
{
  "category": "Measurements",
  "stages": [
    "text",
    "diagram",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

For English and Spanish, present metric first followed by the imperial equivalent. Other languages use metric only. Preserve regulations, manufacturer specifications and idiosyncratic designations or calibres; do not convert brand names or cartridge names. A redundant imperial equivalent may be removed only when the metric quantity expresses the same information.

### unit_symbols

```json
{
  "category": "Measurements",
  "stages": [
    "text",
    "diagram",
    "caption",
    "icml"
  ],
  "verification": "text",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Use singular, case-sensitive unit symbols after numerals and U+00A0 NBSP before them. Prefer symbols to spelled-out units except in names or idiomatic contexts. Plane-angle °, ′ and ″ attach to the number; °C takes NBSP. Do not change calibre or product designations.

### date_spacing

```json
{
  "category": "Dates",
  "stages": [
    "text",
    "caption",
    "icml"
  ],
  "verification": "text",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Use the selected language's date form, with NBSP between its words and numeric components. Keep the four-digit year and the actual date. Do not normalize identifiers or reference codes as dates.

### math_spacing

```json
{
  "category": "Math symbols",
  "stages": [
    "text",
    "diagram",
    "caption",
    "icml"
  ],
  "verification": "text",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Put NBSP on both sides of binary mathematical operators + − × ÷ = ≠ ≈ < > ≤ ≥ ±. Distinguish a unary sign from a binary operator. A fraction slash ⁄ and vulgar-fraction glyphs are parts of numbers, not binary operators. Do not alter URLs, tags, ranges, names or identifiers.

### acronym_introduction

```json
{
  "category": "Acronyms",
  "stages": [
    "text",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Introduce a verified full term followed by its acronym in parentheses at first use in each section. Follow the chosen glossary and book-specific official-name rules. Do not invent an expansion or repeat an expansion unnecessarily in the same caption.

### parenthetical_examples

```json
{
  "category": "Sentence structure",
  "stages": [
    "text",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Use the language's natural equivalent of e.g. and i.e. in parentheses, and the equivalent of for example and that is outside parentheses. Do not transplant English abbreviations where they are unnatural.

### modality

```json
{
  "category": "Specific words",
  "stages": [
    "text",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Avoid vague prescriptive should, unnecessary will, and stilted thus in English editorial prose. In translations, preserve the source's obligation, recommendation, condition, uncertainty and tense with natural wording; do not mechanically ban equivalent target-language words or strengthen advice into an obligation.

### pronouns

```json
{
  "category": "Specific words",
  "stages": [
    "text",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Avoid unnecessary personal pronouns and ambiguous referents. Use natural gender-neutral wording for an unknown person where the language allows it. Do not erase a known person's gender or import singular English they into another language.

### caption_order

```json
{
  "category": "Paragraphs",
  "stages": [
    "text",
    "caption"
  ],
  "verification": "linguistic",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Finish location/date captions in the form Location, date. Use natural target-language order for the rest of the caption without dropping names, events or facts.

### draft_comments

```json
{
  "category": "Drafting",
  "stages": [
    "text",
    "caption",
    "icml",
    "layout"
  ],
  "verification": "review",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Editorial drafting comments use curly brackets. Detect unresolved editorial comments before final publication and require a recorded resolution. Preserve literal braces used in code or mathematics.

### cross_references

```json
{
  "category": "Cross references",
  "stages": [
    "icml",
    "layout"
  ],
  "verification": "layout",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Apply the selected language's Image, In The Text and Credit templates to live InDesign cross-reference formats. Keep fullPara, paraText, pageNum and ^S tokens dynamic. Do not replace them with literal text or regenerate image labels by guessing.

### paragraph_indents

```json
{
  "category": "Paragraphs",
  "stages": [
    "layout"
  ],
  "verification": "layout",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

The first body paragraph after a heading or section break has no first-line indent; subsequent body paragraphs use the approved body indent. Use paragraph styles, not inserted spaces. Do not apply body indentation to captions, tables or lists.

### layer_order

```json
{
  "category": "Layers",
  "stages": [
    "layout"
  ],
  "verification": "layout",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Verify the existing layers top-to-bottom as KDP, Images, Body, Peripheral, Background where those production layers apply. Report absent, extra or differently named layers for scoped resolution; never create, delete or rename layers blindly.

### image_number_order

```json
{
  "category": "Image numbering",
  "stages": [
    "layout"
  ],
  "verification": "layout",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

When images are pasted or changed on one page, check image stacking bottom-to-top against intended caption numbering. Preserve existing image order unless a verified discrepancy requires a change.

### toc_numbering

```json
{
  "category": "Table of contents",
  "stages": [
    "layout"
  ],
  "verification": "layout",
  "scope": "Unprotected editorial content",
  "source": "house"
}
```

Verify TOC 2 and the section-specific Title 2 numbering sequence. Correct a known sequence with the numbering style start/continue settings, not typed numbering. Preserve existing section boundaries and dynamic numbering.

### emphasis

```json
{
  "category": "Specific words",
  "stages": [
    "layout"
  ],
  "verification": "layout",
  "scope": "Unprotected editorial content",
  "source": "house"
}
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
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(See <fullPara delim=\":\" />, Pg.^S<pageNum />.)",
    "text": "(See <paraText />, Pg.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### French

```json
{
  "language": "French",
  "code": "fr",
  "dateExample": "25 octobre 2004",
  "decimal": ",",
  "grouping": " ",
  "percentExample": "5 %",
  "quotes": "« texte »",
  "capitalization": "Use sentence case in headings, with capitals for proper names. Lowercase after a colon except names and complete quotations.",
  "acronyms": "Keep unlexicalized capital-letter acronyms invariable. No English plural ’s.",
  "hyphens": "Use French compounds, agreement and elision. Do not transfer English prenominal hyphens.",
  "units": "metric_only",
  "dateRule": "Day + full lowercase French month + year; 1er for the first day. Example: 25 octobre 2004.",
  "punctuation": "Use U+202F NNBSP before ; : ! ? and %, after « and before ». Use a regular space before an em dash and NNBSP after it. No spaces inside an apostrophe contraction.",
  "crossReferences": {
    "image": "(consulter l'<fullPara delim=\":\" />, p.^S<pageNum />)",
    "text": "(consulter « <paraText /> », p.^S<pageNum />)",
    "credit": "<fullPara delim=\":\" /> :"
  }
}
```

### German

```json
{
  "language": "German",
  "code": "de",
  "dateExample": "14 Mär 2013",
  "decimal": ",",
  "grouping": ".",
  "percentExample": "5 %",
  "quotes": "„Text“",
  "capitalization": "Capitalize nouns and proper names, including in headings. After a colon capitalize a complete sentence; otherwise use ordinary German casing.",
  "acronyms": "Use established German abbreviation plurals where needed, without an English plural apostrophe.",
  "hyphens": "Use German compounds and necessary hyphens. Do not copy English open-compound syntax.",
  "units": "metric_only",
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Siehe <fullPara delim=\":\" />, S.^S<pageNum />.)",
    "text": "(Siehe <paraText />, S.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Spanish

```json
{
  "language": "Spanish",
  "code": "es",
  "dateExample": "25 de octubre de 2004",
  "decimal": ",",
  "grouping": " ",
  "percentExample": "5 %",
  "quotes": "«texto»",
  "capitalization": "Use sentence case for headings, preserving official names. Lowercase ordinary common nouns and technical terms within sentences even when English capitalizes them; do not lowercase proper names, acronyms or sentence beginnings. Lowercase after a colon except proper names and quoted sentences.",
  "acronyms": "Keep capital-letter acronyms invariable in writing; express plurality through determiners.",
  "hyphens": "Use Spanish syntax for compound modifiers; do not import English hyphens.",
  "units": "metric_then_imperial",
  "dateRule": "Day + de + full lowercase month + de + year, joined with NBSP.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Preserve Spanish opening ¿ and ¡. Put U+00A0 NBSP before %, as in 5 %. Separate consecutive sentences with one ordinary space after the closing punctuation, without joining paragraph or segment boundaries. Do not insert spaces inside abbreviations, ordinal suffixes, decimals, URLs or codes.",
  "rules": [
    {
      "id": "es_labels_and_headings",
      "category": "Translation coverage",
      "stages": [
        "glossary",
        "text",
        "diagram",
        "caption",
        "icml",
        "layout"
      ],
      "instruction": "Translate ordinary editorial labels, captions, chapter titles and running headings consistently into Spanish; use Imagen for the caption label Image. Check repeated headings against the translated chapter title rather than leaving an English duplicate. Translate only editable source text: preserve dynamic numbering, variables, cached cross-reference text, internal format/style names and identifiers. Generated references must use the Cross-References panel Definition encoder with the existing Spanish Ver templates; never patch their cached ICML text. Report headings or labels absent from the translation input for source-package/layout review rather than claiming complete coverage.",
      "verification": "review",
      "scope": "Unprotected editorial content; native generated references remain panel-owned",
      "source": "es_review"
    },
    {
      "id": "es_caption_locations",
      "category": "Captions",
      "stages": [
        "text",
        "caption"
      ],
      "instruction": "In narrative captions and image descriptions, spell out U.S. state names instead of retaining postal abbreviations. Resolve the full name from the geographical context; do not guess an ambiguous abbreviation or expand matching letters inside a name, code or postal address. This editorial location rule does not authorize rewriting protected source credits or official names.",
      "verification": "linguistic",
      "scope": "Unprotected editorial captions and image descriptions",
      "source": "es_review"
    },
    {
      "id": "es_quotation_consistency",
      "category": "Quotation marks",
      "stages": [
        "text",
        "diagram",
        "caption"
      ],
      "instruction": "Use «texto» consistently for first-level Spanish quotations, with no internal padding. Do not mix English and Spanish first-level quotation marks arbitrarily. Reserve other quote shapes for genuinely nested quotations or protected literal syntax; preserve the nesting and meaning rather than replacing every quote character blindly.",
      "verification": "linguistic",
      "scope": "Unprotected editorial content",
      "source": "es_review"
    },
    {
      "id": "es_ordinal_typography",
      "category": "Ordinals",
      "stages": [
        "glossary",
        "text",
        "diagram",
        "caption"
      ],
      "instruction": "Write abbreviated ordinals with a period followed by superscript letters, agreeing with the noun in gender and number. For apocopated primer and tercer, use 1.ᵉʳ and 3.ᵉʳ, not baseline 1.er or 3.er; apply the same principle to other ordinal abbreviations. Use º or ª where grammatically appropriate, not the degree sign °. Preserve an already styled superscript run and protected official designations; never add markup or change segment structure to simulate superscript.",
      "verification": "linguistic",
      "scope": "Unprotected editorial content",
      "source": "es_ordinals"
    },
    {
      "id": "es_number_grouping",
      "category": "Numbers",
      "stages": [
        "text",
        "diagram",
        "caption"
      ],
      "instruction": "Use a decimal comma. For ordinary quantities, leave four-digit integers ungrouped (3000, 1650); group integers of five or more digits in threes with U+00A0 NBSP (12 345, 1 234 567), never commas or periods. Determine whether a source comma is a thousands separator or a decimal separator before localizing it: do not turn the Spanish decimal 3,000 into the integer 3000. Do not group years, page numbers, identifiers, postal codes or official designations. This is source-aware translation/review, not a blind number-replacement formula.",
      "verification": "linguistic",
      "scope": "Unprotected editorial quantities",
      "source": "es_numbers"
    },
    {
      "id": "es_parenthetical_periods",
      "category": "Sentence punctuation",
      "stages": [
        "text",
        "caption"
      ],
      "instruction": "Place the sentence-final period after the closing parenthesis, including when the whole sentence is parenthetical. Distinguish sentence-final punctuation from internal sentence periods, abbreviation dots, decimals and ellipses; do not blindly move every period adjacent to a parenthesis. Keep generated cross-reference punctuation under the panel encoder's control.",
      "verification": "linguistic",
      "scope": "Unprotected editorial content",
      "source": "es_review"
    }
  ],
  "crossReferences": {
    "image": "(Ver <fullPara delim=\":\" />, pág.^S<pageNum />)",
    "text": "(Ver <paraText />, pág.^S<pageNum />)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Portuguese

```json
{
  "language": "Portuguese",
  "code": "pt",
  "dateExample": "25 de outubro de 2004",
  "decimal": ",",
  "grouping": ".",
  "percentExample": "5 %",
  "quotes": "«texto»",
  "capitalization": "Use sentence case for headings, except proper names. Use ordinary Portuguese rules after a colon.",
  "acronyms": "Use established Portuguese acronym plural forms only where appropriate; no English plural apostrophe.",
  "hyphens": "Use Portuguese compound and prefix spelling, including its context-dependent hyphen rules.",
  "units": "metric_only",
  "dateRule": "Day + de + full lowercase month + de + year, joined with NBSP.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Consulte a <fullPara delim=\":\" />, P.^S<pageNum />.)",
    "text": "(Consulte <paraText />, P.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Dutch

```json
{
  "language": "Dutch",
  "code": "nl",
  "dateExample": "25 okt 2004",
  "decimal": ",",
  "grouping": ".",
  "percentExample": "5%",
  "quotes": "‘tekst’",
  "capitalization": "Use sentence case for headings, preserving proper names. Lowercase after a colon except a quotation or proper name.",
  "acronyms": "Use native Dutch acronym inflection. An apostrophe may be required for letter abbreviations; do not apply English forms indiscriminately.",
  "hyphens": "Use native Dutch compounds, linking forms and necessary hyphens.",
  "units": "metric_only",
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Zie <fullPara delim=\":\" />, p.^S<pageNum />.)",
    "text": "(Zie <paraText />, p.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Italian

```json
{
  "language": "Italian",
  "code": "it",
  "dateExample": "25 ott 2004",
  "decimal": ",",
  "grouping": ".",
  "percentExample": "5 %",
  "quotes": "«testo»",
  "capitalization": "Use sentence case for headings, preserving proper names. Lowercase after a colon except names and quotations.",
  "acronyms": "Normally keep capital-letter acronyms invariable. No English plural ’s.",
  "hyphens": "Use Italian compound and prefix spelling; do not copy English hyphenated noun strings.",
  "units": "metric_only",
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Vedere <fullPara delim=\":\" />, pag.^S<pageNum />.)",
    "text": "(Vedere <paraText />, pag.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Turkish

```json
{
  "language": "Turkish",
  "code": "tr",
  "dateExample": "25 Eki 2004",
  "decimal": ",",
  "grouping": ".",
  "percentExample": "%5",
  "quotes": "“metin”",
  "capitalization": "Use Turkish title capitalization and dotted/dotless I correctly. Use ordinary Turkish sentence casing after colons.",
  "acronyms": "Attach suffixes according to Turkish pronunciation and apostrophe rules for abbreviations; never append English plural ’s.",
  "hyphens": "Use Turkish compound spelling and vowel harmony; do not import English modifier hyphens.",
  "units": "metric_only",
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Bkz. <fullPara delim=\":\" />, s.^S<pageNum />.)",
    "text": "(Bkz. <paraText />, s.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Polish

```json
{
  "language": "Polish",
  "code": "pl",
  "dateExample": "25 paź 2004",
  "decimal": ",",
  "grouping": " ",
  "percentExample": "5%",
  "quotes": "„tekst”",
  "capitalization": "Use sentence case for headings except proper names and prescribed official titles. Lowercase after a colon except names and quotations.",
  "acronyms": "Use established Polish acronym inflection and hyphens when required; no blanket English plural ’s.",
  "hyphens": "Use Polish compound and prefix spelling and inflection.",
  "units": "metric_only",
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Zobacz <fullPara delim=\":\" />, s.^S<pageNum />.)",
    "text": "(Zobacz <paraText />, s.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

### Swedish

```json
{
  "language": "Swedish",
  "code": "sv",
  "dateExample": "25 okt 2004",
  "decimal": ",",
  "grouping": " ",
  "percentExample": "5 %",
  "quotes": "”text”",
  "capitalization": "Use sentence case for headings, preserving proper names. A full independent sentence after a colon can begin with a capital.",
  "acronyms": "Use Swedish colon before letter-acronym endings where required, such as EU:s. Do not use English apostrophe plurals.",
  "hyphens": "Use Swedish compounds and required hyphens, not English noun-string spacing.",
  "units": "metric_only",
  "dateRule": "Use day + the local month abbreviation + four-digit year, joined with NBSP, as in the supplied house-style date/GREP matrix. Preserve punctuation belonging to the chosen abbreviation.",
  "punctuation": "Do not add French-style spaces before ; : ! ?. Apply native quotation punctuation and the selected percentage form. Preserve Spanish opening ¿ and ¡. Respect Turkish percent-sign placement.",
  "crossReferences": {
    "image": "(Se <fullPara delim=\":\" />, s.^S<pageNum />.)",
    "text": "(Se <paraText />, s.^S<pageNum />.)",
    "credit": "<fullPara delim=\":\" />:"
  }
}
```

## Workbook transcription

Source: Translation Rules.xlsx, Sheet1, A1:H59. SHA-256:
`D1ADE74153769E42C35F84D16569C7BBA1150BBF6D9D916DAD4562EA330DD809`. Original file size: 16246 bytes.
All 186 nonempty cells are reproduced verbatim in text blocks.
Spaces are preserved: NBSP is U+00A0; NNBSP is U+202F. InDesign `^S`, `~S`,
XML-like building blocks, and GREP escapes retain their original spelling.

### Sheet1!A1

```text
Cross Reference Code
```

### Sheet1!A2

```text
Language
```

### Sheet1!B2

```text
Image
```

### Sheet1!E2

```text
In The Text
```

### Sheet1!H2

```text
Credit
```

### Sheet1!A3

```text
English
```

### Sheet1!B3

```text
(See <fullPara delim=":" />, Pg.^S<pageNum />.)
```

### Sheet1!E3

```text
(See <paraText />, Pg.^S<pageNum />.)
```

### Sheet1!H3

```text
<fullPara delim=":" />:
```

### Sheet1!A4

```text
French
```

### Sheet1!B4

```text
(consulter l'<fullPara delim=":" />, p.^S<pageNum />)
```

### Sheet1!E4

```text
(consulter « <paraText /> », p.^S<pageNum />)
```

### Sheet1!H4

```text
<fullPara delim=":" /> :
```

### Sheet1!A5

```text
German
```

### Sheet1!B5

```text
(Siehe <fullPara delim=":" />, S.^S<pageNum />.)
```

### Sheet1!E5

```text
(Siehe <paraText />, S.^S<pageNum />.)
```

### Sheet1!H5

```text
<fullPara delim=":" />:
```

### Sheet1!A6

```text
Spanish
```

### Sheet1!B6

```text
(Ver <fullPara delim=":" />, pág.^S<pageNum />)
```

### Sheet1!E6

```text
(Ver <paraText />, pág.^S<pageNum />)
```

### Sheet1!H6

```text
<fullPara delim=":" />:
```

### Sheet1!A7

```text
Portuguese
```

### Sheet1!B7

```text
(Consulte a <fullPara delim=":" />, P.^S<pageNum />.)
```

### Sheet1!E7

```text
(Consulte <paraText />, P.^S<pageNum />.)
```

### Sheet1!H7

```text
<fullPara delim=":" />:
```

### Sheet1!A8

```text
Dutch
```

### Sheet1!B8

```text
(Zie <fullPara delim=":" />, p. ^S<pageNum />.)
```

### Sheet1!E8

```text
(Zie <paraText />, p. ^S<pageNum />.)
```

### Sheet1!H8

```text
<fullPara delim=":" />:
```

### Sheet1!A9

```text
Italian
```

### Sheet1!B9

```text
(Vedere <fullPara delim=":" />, pag. ^S<pageNum />.)
```

### Sheet1!E9

```text
(Vedere <paraText />, pag. ^S<pageNum />.)
```

### Sheet1!H9

```text
<fullPara delim=":" />:
```

### Sheet1!A10

```text
Turkish
```

### Sheet1!B10

```text
(Bkz. <fullPara delim=":" />, s. ^S<pageNum />.)
```

### Sheet1!E10

```text
(Bkz. <paraText />, s. ^S<pageNum />.)
```

### Sheet1!H10

```text
<fullPara delim=":" />:
```

### Sheet1!A11

```text
Polish
```

### Sheet1!B11

```text
(Zobacz <fullPara delim=":" />, s. ^S<pageNum />.)
```

### Sheet1!E11

```text
(Zobacz <paraText />, s. ^S<pageNum />.)
```

### Sheet1!H11

```text
<fullPara delim=":" />:
```

### Sheet1!A12

```text
Swedish
```

### Sheet1!B12

```text
(Se <fullPara delim=":" />, s. ^S<pageNum />.)
```

### Sheet1!E12

```text
(Se <paraText />, s. ^S<pageNum />.)
```

### Sheet1!H12

```text
<fullPara delim=":" />:
```

### Sheet1!A15

```text
Units (NBSP Before)
```

### Sheet1!C15

```text
French Punctuation (NNBSP Before)
```

### Sheet1!E15

```text
Math Symbols (NBSP Before and After)
```

### Sheet1!G15

```text
Other Uncommon Symbols
```

### Sheet1!A16

```text
Name
```

### Sheet1!B16

```text
Abbreviation
```

### Sheet1!C16

```text
Name
```

### Sheet1!D16

```text
Symbol
```

### Sheet1!E16

```text
Name
```

### Sheet1!F16

```text
Symbol
```

### Sheet1!G16

```text
Name
```

### Sheet1!H16

```text
Symbol
```

### Sheet1!A17

```text
Millimeter
```

### Sheet1!B17

```text
mm
```

### Sheet1!C17

```text
Semicolon
```

### Sheet1!D17

```text
;
```

### Sheet1!E17

```text
Plus Sign
```

### Sheet1!F17

```text
+
```

### Sheet1!G17

```text
Degree Symbol
```

### Sheet1!H17

```text
°
```

### Sheet1!A18

```text
Centimeter
```

### Sheet1!B18

```text
cm
```

### Sheet1!C18

```text
Colon
```

### Sheet1!D18

```text
:
```

### Sheet1!E18

```text
Minus Sign
```

### Sheet1!F18

```text
-
```

### Sheet1!G18

```text
German Opening Quote
```

### Sheet1!H18

```text
„
```

### Sheet1!A19

```text
Meter
```

### Sheet1!B19

```text
m
```

### Sheet1!C19

```text
Question Mark
```

### Sheet1!D19

```text
?
```

### Sheet1!E19

```text
Multiplication Sign
```

### Sheet1!F19

```text
×
```

### Sheet1!G19

```text
German Closing Quote
```

### Sheet1!H19

```text
“
```

### Sheet1!A20

```text
Kilometer
```

### Sheet1!B20

```text
km
```

### Sheet1!C20

```text
Exclamation Point
```

### Sheet1!D20

```text
!
```

### Sheet1!E20

```text
Division sign
```

### Sheet1!F20

```text
÷
```

### Sheet1!G20

```text
Approximately
```

### Sheet1!H20

```text
~
```

### Sheet1!A21

```text
Milligram
```

### Sheet1!B21

```text
mg
```

### Sheet1!C21

```text
Left Guillemet, Opening Quote
```

### Sheet1!D21

```text
«
```

### Sheet1!E21

```text
Equal Sign
```

### Sheet1!F21

```text
=
```

### Sheet1!G21

```text
Percent Sign
```

### Sheet1!H21

```text
%
```

### Sheet1!A22

```text
Gram
```

### Sheet1!B22

```text
g
```

### Sheet1!C22

```text
Right Guillemet, Closing Quote
```

### Sheet1!D22

```text
»
```

### Sheet1!E22

```text
Not Equal Sign
```

### Sheet1!F22

```text
≠
```

### Sheet1!A23

```text
Kilogram
```

### Sheet1!B23

```text
kg
```

### Sheet1!C23

```text
Percent Sign
```

### Sheet1!D23

```text
%
```

### Sheet1!E23

```text
Approximate Sign
```

### Sheet1!F23

```text
≈
```

### Sheet1!A24

```text
Inch
```

### Sheet1!B24

```text
in
```

### Sheet1!C24

```text
Em Dash
```

### Sheet1!D24

```text
—
```

### Sheet1!E24

```text
Less Than
```

### Sheet1!F24

```text
<
```

### Sheet1!A25

```text
Foot
```

### Sheet1!B25

```text
ft
```

### Sheet1!E25

```text
Greater Than
```

### Sheet1!F25

```text
>
```

### Sheet1!A26

```text
Yard
```

### Sheet1!B26

```text
yd
```

### Sheet1!E26

```text
Less Than or Equal To
```

### Sheet1!F26

```text
≤
```

### Sheet1!A27

```text
Mile
```

### Sheet1!B27

```text
mi
```

### Sheet1!E27

```text
Greater Than or Equal To
```

### Sheet1!F27

```text
≥
```

### Sheet1!A28

```text
Seconds
```

### Sheet1!B28

```text
s
```

### Sheet1!E28

```text
Plus-Minus
```

### Sheet1!F28

```text
±
```

### Sheet1!A29

```text
Minutes
```

### Sheet1!B29

```text
min
```

### Sheet1!E29

```text
Fractions
```

### Sheet1!F29

```text
½ ⅓ ⅔ ¼ ¾ ⅕ ⅖ ⅗ ⅘ ⅙ ⅚
```

### Sheet1!A30

```text
Minutes-of-Angle
```

### Sheet1!B30

```text
MOA
```

### Sheet1!E30

```text
Fractions Divider
```

### Sheet1!F30

```text
⁄ (not / )
```

### Sheet1!A31

```text
Mil
```

### Sheet1!B31

```text
mil
```

### Sheet1!A34

```text
GREP Code
```

### Sheet1!A35

```text
French NNBSP GREP Code
```

### Sheet1!B35

```text
Before ; : ! ?
Standardize around —
After « (normalize to NNBSP)
Before » (normalize to NNBSP)
```

### Sheet1!D35

```text
[ \t\x{00A0}\x{2009}]+(?=[;:!?%])
(\S)[ \t\x{00A0}\x{2009}\x{202F}]*—[ \t\x{00A0}\x{2009}\x{202F}]*
(?<=«)[ \t\x{00A0}\x{2009}]+
[ \t\x{00A0}\x{2009}]+(?=»)
```

### Sheet1!G35

```text
\x{202F}
$1 —\x{202F}
\x{202F}
\x{202F}

```

### Sheet1!A36

```text
NBSP Preceding Unit
```

### Sheet1!B36

```text
Adds NBSP before Unit
```

### Sheet1!D36

```text
(?<=\d) (mm|cm|m|km|mg|g|kg|in|ft|yd|mi|s|min|MOA|mil)(?=[\s[:punct:]]|$)
```

### Sheet1!G36

```text
~S$1
```

### Sheet1!A37

```text
NBSP Preceding Math
```

### Sheet1!B37

```text
Adds NBSP before Math Symbol
```

### Sheet1!D37

```text
(?<=\d) (+|−|×|÷|=|≠|≈|<|>|≤|≥|±|½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⁄)(?=[ [:punct:]]|$)
```

### Sheet1!G37

```text
~S$1
```

### Sheet1!A38

```text
NBSP in Dates
```

### Sheet1!B38

```text
English
German
French
Spanish
Portuguese
Dutch
Italian
Turkish
Polish
Swedish
```

### Sheet1!D38

```text
\b(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})\b
\b(\d{1,2})\s+([A-ZÄ][a-zä]{2})\s+(\d{4})\b
\b(\d{1,2})\s+(\u?\l{3,})\s+(\d{4})\b
\b(\d{1,2})\s+de\s+(\u?\l{3,})\s+de\s+(\d{4})\b
\b(\d{1,2})\s+de\s+(\u?\l{3,})\s+de\s+(\d{4})\b
\b(\d{1,2})\s+(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\s+(\d{4})\b
\b(\d{1,2})\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\s+(\d{4})\b
\b(\d{1,2})\s+(Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)\s+(\d{4})\b
\b(\d{1,2})\s+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|lis|gru)\s+(\d{4})\b
\b(\d{1,2})\s+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\s+(\d{4})\b
```

### Sheet1!G38

```text
$1~S$2~S$3
$1~S$2~S$3
$1~S$2~S$3
$1~Sde~S$2~Sde~S$3
$1~Sde~S$2~Sde~S$3
$1~S$2~S$3
$1~S$2~S$3
$1~S$2~S$3
$1~S$2~S$3
$1~S$2~S$3
```

### Sheet1!A43

```text
Other Notes
```

### Sheet1!A44

```text
Layer order and names
```

### Sheet1!B44

```text
1 - KDP
2 - Images
3 - Body
4 - Peripheral
5 - Background
```

### Sheet1!A45

```text
Maintaining the order of image numbers when pasting.
```

### Sheet1!B45

```text
For images to maintain the same order of numbers when multiple images are pasted or altered on the same page, the image objects must be ordered from bottom to top in the layers panel. That is, the bottom image in the layer panel is the first to get a caption number, and the top image is the last to get a caption number.
```

### Sheet1!A46

```text
Table of Contents Numbering
```

### Sheet1!B46

```text
○ The numbering of the table of contents is controled with TOC 2 paragraph styles.
○ Each section has it's own Title 2 paragraph style. In that style, the "Bullets and Numbering" option has a "Numbering Style: Mode" option.
○ To set the number, change the mode to "Start At," enter the number, and change back to "Continue...".
```

### Sheet1!A47

```text
Drafting
```

### Sheet1!B47

```text
○ Enclose editorial comments that need to be reviewed later in curly brackets (e.g., {link to chapter 21}).
```

### Sheet1!A50

```text
Check with AI
```

### Sheet1!A51

```text
Numbers
```

### Sheet1!B51

```text
○ Spell out numbers from one through one hundred in text by default (e.g., "twenty-five soldiers").
○ Use numerals for time (e.g., "5 minutes"), units of measure, (e.g. 20 in), decimals (e.g., 0.25 percent), and numbers greater than 100 (e.g., 1,000 soldiers).
○ Use numerals and % for “percent” (e.g., 5%).
○ Only use 2 to 3 significant digits (e.g., 5 m (5.5 yd)).
○ Use a comma to separate every three digits (e.g., 1,000 not 1000).
○ Decimals are used for units (e.g., meters and yards) while fractions can be used for other things (e.g., circles and ranges).
○ When using a compound number, hyphenate only the second part (e.g., "4 by 8-foot").
```

### Sheet1!A52

```text
Imperial and Metric Abbreviations
```

### Sheet1!B52

```text
○ English and Spanish get metric first followed by imperial (e.g., 5 m (5.47 yd)). All other languages are metric only (unless in a regulation or manufacture specification).
○ Only one unit of measurement needed if it is something like a brand name or caliber such as .300 Win Mag or 9mm caliber.
○ All units use the singular abbreviation and have a non-breaking space (e.g., 12_km, not 12kms).
○ Unless a specific name, the unit abbreviation is preferred to the full name (e.g, 12 m, not 12 meters).
○ All imperial units are followed by a metric conversion, unless the imperial unit is idiosyncratic and would be used in metric countries (e.g., 22 lb (10 kg)).
○ Unit conversions use no more than three significant digits (e.g., 10 lb (4.54 kg), not 10 lb (4.53592 kg)), and may use two (e.g., 10 lb (4.5 kg)) for non-specific measures.
○ Include a hyphen between the number and the unit whenever the number and unit act as a pre-noun phrase (e.g., 5-ft boat versus it was 5 ft long).
```

### Sheet1!A53

```text
Dates
```

### Sheet1!B53

```text
○ All dates use non-breaking spaces, represented here by underscores.
○ English and German: DD_Mmm_YYYY (e.g., 14 Mar 2013)
○ French: DD_month_YYYY (e.g., 25 octobre 2004)
○ Spanish and Portuguese: DD_de_month_de_YYYY (Spanish e.g., 25 de octubre de 2004 | Portuguese e.g., 25 de outubro de 2004)
```

### Sheet1!A54

```text
Acronyms
```

### Sheet1!B54

```text
○ Introduce an acronym in parentheses after introducing the correct full term (e.g., Bureau of Alcohol, Tobacco, Firearms and Explosives (ATF)).
○ Reintroduce the full term and its acronym in each new section.
○ Add an apostrophe when pluralizing acronyms (e.g., "MWD’s").
```

### Sheet1!A55

```text
Capitalization
```

### Sheet1!B55

```text
○ Use title case for titles (i.e., all nouns, verbs, and adjectives of titles are capitalized).
○ Lowercase after colon (e.g., “Colons are used like this: lowercase.”)
```

### Sheet1!A56

```text
Hyphens
```

### Sheet1!B56

```text
○ Use hyphens for compound noun adjuncts (e.g., "platoon-level raid"). 
○ Hyphenate phrases acting as a single concept, especially if "of" is in the center (e.g., "sector-of-fire", “ease-of-use”). 
○ Do not hyphenate when using prefixes such as "pre" and "re" (e.g., "preassault").
```

### Sheet1!A57

```text
Paragraphs
```

### Sheet1!B57

```text
○ First paragraph is not indented.
○ Second paragraph is indented.
○ Captions with locations and dates are: “Location, date.”
```

### Sheet1!A58

```text
Sentence structure
```

### Sheet1!B58

```text
○ It's acceptable to start sentences with conjunctions such as "and," "or," "but."
○ Ensure that any sentence fragment containing a verb ends with a period.
○ Prefer formal spoken English over formal written English. The target audience is educated but not academic.
○ Periods and commas always fall within quotation marks (e.g. “go.”)
○ Use e.g./i.e. within parenthesis (i.e., the muzzle face meets the bore at a 90-degree angle) and “for example” and “that is” outside of parentheses.
```

### Sheet1!A59

```text
Specific words
```

### Sheet1!B59

```text
○ “Should” – Do not use “should” in this text because it implies that there is a consequence without specifying it. Present tense, “requires,” “must,” “would,” “improves,” etc. are all better choices.
○ “Will” – Do not use "will" and use present tense or “would.”
○ “They” – Use gender-neutral pronouns ("they," "them," "their," "themself" for singular unknown, and "themselves" for plural unknown) and minimize personal pronoun use to reduce confusion.
○ “Thus” – Don’t use “thus.” The book is written using spoken English, and I don’t think people use “thus” when speaking.
○ Bold is for emphasis.
○ Italics for variables.
```
