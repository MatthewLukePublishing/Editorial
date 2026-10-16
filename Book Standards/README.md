# Book Standards

One SQLite database for Publishing.xlsx and the existing translation and
proofreading policy, stored at `../data/Book Standards.sqlite` under Editorial.
The owner's October 16, 2026 request selected this consolidated location.
The workbook's ten original sheet names, 7,398 populated cells,
746 formulas, cached results and merged ranges are preserved. The embedded
original XLSX preserves formatting, images and other workbook features exactly.

The editorial tables preserve the existing 26 rules and ten language profiles.
Typos and Translate read this database through the shared reader on every
policy load. They reject missing, malformed or changed rules. Their job evidence
uses the database file's SHA-256, so jobs pinned to the former Markdown file
require a new rules review. Existing accepted production files are not changed.

## Read and Maintain

Requires Node.js 24 or newer. From this directory:

```powershell
node .\BookStandards.cjs summary
node .\BookStandards.cjs sheet 'Indd Paragaph Styles'
node --test .\BookStandards.test.cjs
```

The original spelling of worksheet names is intentional.
The shared Node API provides `workbookCells(sheetName)`, `sourceDocument(name)`
and `summary()`. `EditorialPolicy.cjs` provides the existing stage/language
prompt interface. Consumers outside the standard sibling layout set
`BOOK_STANDARDS_HOME` to this directory. Missing shared installations fail;
the programs never substitute obsolete local rule files.

SQLite tables:

| Table | Contents |
| --- | --- |
| worksheet | Sheet order, visibility and merged ranges |
| workbook_cell | Coordinates, typed cached values, formulas and style indexes |
| editorial_metadata | Policy version, precedence and source references |
| editorial_rule | Rule ID, language, order, instruction and stage metadata |
| editorial_language | Ordered language profiles and cross-reference templates |
| editorial_source_cell | Original 186-cell Translation Rules.xlsx transcription |
| source_document | Exact source bytes, sizes and SHA-256 hashes |

Use a SQLite editor for approved changes to active editorial tables. Commit
related changes in one transaction, increment the policy version in
`editorial_metadata`, then run the relevant offline consumer tests. Keep
`journal_mode=DELETE`, close the editor before consumers run, and never edit
while a job is using the database. The whole-file hash intentionally invalidates
job evidence after any database change. The reader does not cache the policy.

Workbook formulas are preserved with their original cached values; SQLite does
not recalculate Excel formulas. Checklist text remains reference data. Importing
it does not execute tasks, modify books or make product-status claims.

## Import and Recovery

`ImportBookStandards.py` uses Python with openpyxl and Node.js to create
a new database from an XLSX and the former editorial Markdown source. Shared
Excel formulas are expanded with openpyxl's formula parser while their original
shared-formula attributes and original workbook bytes remain available. It refuses
to overwrite an existing database. It validates in memory, writes one uniquely
named staging file, checks it, then atomically renames it on Windows. An interrupted
staging file is never an active database; validate or recycle that exact file
before retrying. The source input is unchanged.

The original Publishing.xlsx bytes and original Translation Rules.md bytes are
retained inside `source_document` for provenance and recovery. The policy
source is historical evidence, not a second live authority. Restoring the initial
import uses these bytes and the importer. After editing live rules, recovery of
those edits requires the current database or its verified Google Drive version.

## Capacity and Retention

Keep one database of at most 20 MiB, at most one import staging file of 20 MiB
until the same operation completes, and at most one SQLite transaction journal.
Never keep per-cell files or duplicate standalone rule/workbook copies. Preserve
the current database and embedded provenance for as long as these programs use
the standards. Recycle obsolete staging and superseded sources after verification.

The initial import started with an empty directory. It produced a 1,536,000-byte
database with all source bytes and cells verified. Internal names follow the
Publishing naming guide; Google's Naming, Style and Consistency sections were
read directly on October 16, 2026. No external naming contract was changed.

## Management contract

- Primary entry point: `BookStandards.cjs`
- Archive boundary: `None`

## Authentication contract

This project must not store secrets or authentication state locally. All current
and future credentials and authentication state belong only in
`D:\Google Drive\Publishing\Code\Admin\Access`. Code may reference protected
loaders there but must never duplicate or print secret values.
