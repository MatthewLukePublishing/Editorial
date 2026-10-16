# Editorial

This directory groups [Translate](Translate/README.md), [Typos](Typos/README.md)
and the shared [Book Standards database](<Book Standards/README.md>), as selected
by the owner on October 16, 2026. The database is `data/Book Standards.sqlite`;
its importer, shared reader and tests remain under `Book Standards`.
Use each component's PROJECT.md before maintaining its files.

The protected `data` boundary owns the single SQLite file. The owner authorized
publishing this exact database, including its embedded source documents, on
October 16, 2026. All other files under `data` remain Git-ignored. Publication
preserves its exact bytes and does not change any editorial rule.
Consumers resolve the sibling reader; `BOOK_STANDARDS_HOME` overrides the
reader directory for standalone deployments, not the database file.
Existing jobs with absolute former paths must be reviewed before resuming;
this consolidation does not rewrite accepted translation evidence.

## Public Repository

The canonical repository is [Editorial](https://github.com/MatthewLukePublishing/Editorial).
It replaces the separate typo-checker and translation-pipeline repositories.
The public can read, download and fork it; only the owner has direct write
access. A public fork or pull request cannot change the canonical database.

```powershell
git clone https://github.com/MatthewLukePublishing/Editorial.git
Set-Location Editorial
node '.\Book Standards\BookStandards.cjs' summary
npm --prefix Typos ci --ignore-scripts
npm --prefix Translate ci --ignore-scripts
npm test
```

Node.js 24 and PowerShell 7 are required for the complete offline test suite.
Run each component's commands from its own directory. Keep `Book Standards`,
`data`, `Typos` and `Translate` together in downloaded or cloned installations.
The root package version identifies the consolidated release; component
versions retain their independent histories. The Typos launcher resolves the
latest stable Editorial release and runs its `Typos` component.

Existing Git histories are preserved as parents of the consolidation commit,
with old branches under `legacy/typos` and `legacy/translate` and old tags under
`typos/` and `translate/`. Historical tags describe the former standalone
layouts; only Editorial releases contain the consolidated database layout.
Old GitHub issues, pull-request discussions and release pages are not migrated.

The component code retains its existing [Typos license](Typos/LICENSE) and
[Translate license](Translate/LICENSE). Translate's published content retains
its separate [content terms](Translate/DATA-LICENCE.md). Public availability of
the standards database and embedded source documents does not grant an
additional content license. Private jobs, credentials, manuscripts, Adobe
files, local dependencies and generated output are excluded.

## Retention and Relocation

The 136-file retired Translate archive was reconciled on October 16, 2026:
76 unique source/translation files moved to eight corresponding product-owned
`Translation Evidence` folders, each with a verified manifest. Three exact
duplicates and 57 retired code, documentation and completed diagnostic files
went to the Windows Recycle Bin; every recycled payload was hash-verified.
No archive remains here. Product manifests record the October 25 review date.

The remaining operational inputs and job records are unchanged. Review their
absolute paths before resuming and reconcile their retention by October 25,
2026; do not discard accepted translations or recovery dependencies. Existing
dependency installations stay outside `data` and are pinned by the component
lockfiles. Review inactive installations and existing scratch by the same date.
This is bounded retention for existing work, not approval for new archives.
Keep the project within 4,500 files and 2 GiB; the standards database itself
remains capped at 20 MiB. New writes require the shared capacity preflight.

## Management contract

- Primary entry point: `Book Standards/BookStandards.cjs`
- Archive boundary: `None`

## Authentication contract

This project must not store secrets or authentication state locally. All current and future credentials, `.env` files, DPAPI blobs, tokens, private keys, cookies, browser profiles, session state, and provider account contexts belong only in `D:\Google Drive\Publishing\Code\Admin\Access`. Code in this project may reference protected loaders or authenticated sessions from that directory but must never duplicate or print secret values.
