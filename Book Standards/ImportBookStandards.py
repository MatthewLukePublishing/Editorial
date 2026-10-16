"""Import workbook cells and existing editorial policy into one SQLite database."""

import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import uuid
import zipfile
import xml.etree.ElementTree as ET
import openpyxl

NAMESPACE = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
RELATIONSHIP = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
MAX_BYTES = 20 * 1024 * 1024


def workbook_records(source_bytes):
    expanded_workbook = openpyxl.load_workbook(io.BytesIO(source_bytes), read_only=False, data_only=False)
    with zipfile.ZipFile(io.BytesIO(source_bytes)) as workbook:
        if sum(item.file_size for item in workbook.infolist()) > MAX_BYTES:
            raise ValueError("Workbook exceeds the 20 MiB expanded import limit")
        strings = []
        if "xl/sharedStrings.xml" in workbook.namelist():
            strings = ["".join(text.text or "" for text in item.findall(".//s:t", NAMESPACE))
                       for item in ET.fromstring(workbook.read("xl/sharedStrings.xml"))]
        relationships = {item.attrib["Id"]: item.attrib["Target"]
                         for item in ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))}
        sheets, cells = [], []
        for position, sheet in enumerate(ET.fromstring(workbook.read("xl/workbook.xml")).find("s:sheets", NAMESPACE)):
            name = sheet.attrib["name"]
            target = relationships[sheet.attrib[RELATIONSHIP]]
            target = target.lstrip("/") if target.startswith("/") else "xl/" + target
            root = ET.fromstring(workbook.read(target))
            merges = [item.attrib["ref"] for item in root.findall("s:mergeCells/s:mergeCell", NAMESPACE)]
            sheets.append((name, position, sheet.attrib.get("state", "visible"), json.dumps(merges)))
            for cell in root.findall("s:sheetData/s:row/s:c", NAMESPACE):
                kind = cell.attrib.get("t", "n")
                raw = cell.find("s:v", NAMESPACE)
                formula = cell.find("s:f", NAMESPACE)
                value = raw.text if raw is not None else None
                if kind == "s" and value is not None:
                    value = strings[int(value)]
                elif kind == "inlineStr":
                    value = "".join(text.text or "" for text in cell.findall(".//s:t", NAMESPACE))
                elif kind == "b" and value is not None:
                    value = value == "1"
                elif kind == "n" and value is not None:
                    value = json.loads(value)
                if value is None and formula is None:
                    continue
                address = cell.attrib["r"]
                column_name = address.rstrip("0123456789")
                column_number = 0
                for letter in column_name:
                    column_number = column_number * 26 + ord(letter) - 64
                cells.append((name, address, int(address[len(column_name):]), column_number,
                              kind, json.dumps(value, ensure_ascii=False),
                              None if formula is None else expanded_workbook[name][address].value[1:],
                              None if formula is None else json.dumps(formula.attrib),
                              int(cell.attrib.get("s", 0))))
        return sheets, cells


def import_database(workbook_path, policy_path, reader_path, database_path):
    if database_path.exists():
        raise ValueError("Database already exists; refusing to overwrite active standards")
    source_bytes = workbook_path.read_bytes()
    policy_bytes = policy_path.read_bytes()
    if len(source_bytes) + len(policy_bytes) > MAX_BYTES // 2:
        raise ValueError("Source payloads exceed the bounded import allowance")
    sheets, cells = workbook_records(source_bytes)
    script = "const r=require(process.argv[1]);const fs=require('node:fs');const m=fs.readFileSync(process.argv[2],'utf8');console.log(JSON.stringify({policy:r.parseEditorialMarkdown(m),cells:r.parseWorkbookTranscription(m)}));"
    parsed = json.loads(subprocess.check_output(
        ["node", "-e", script, str(reader_path), str(policy_path)], encoding="utf-8"))
    policy = parsed["policy"]
    database = sqlite3.connect(":memory:")
    database.executescript("""
        PRAGMA foreign_keys=ON;
        PRAGMA user_version=1;
        CREATE TABLE source_document (
            name TEXT PRIMARY KEY, sha256 TEXT NOT NULL, byte_count INTEGER NOT NULL,
            content BLOB NOT NULL CHECK(length(content)=byte_count));
        CREATE TABLE worksheet (
            name TEXT PRIMARY KEY, position INTEGER UNIQUE NOT NULL,
            visibility TEXT NOT NULL, merged_ranges_json TEXT NOT NULL);
        CREATE TABLE workbook_cell (
            sheet_name TEXT REFERENCES worksheet(name), address TEXT,
            row_number INTEGER NOT NULL, column_number INTEGER NOT NULL,
            data_type TEXT NOT NULL, value_json TEXT NOT NULL,
            formula TEXT, formula_attributes_json TEXT, style_index INTEGER NOT NULL,
            PRIMARY KEY(sheet_name,address));
        CREATE TABLE editorial_metadata (name TEXT PRIMARY KEY, value_json TEXT NOT NULL);
        CREATE TABLE editorial_language (
            name TEXT PRIMARY KEY, position INTEGER UNIQUE NOT NULL, settings_json TEXT NOT NULL);
        CREATE TABLE editorial_rule (
            id TEXT PRIMARY KEY, language TEXT REFERENCES editorial_language(name),
            position INTEGER NOT NULL, instruction TEXT NOT NULL, metadata_json TEXT NOT NULL);
        CREATE TABLE editorial_source_cell (address TEXT PRIMARY KEY, value TEXT NOT NULL);
    """)
    with database:
        for name, content in [("Publishing.xlsx", source_bytes), ("Translation Rules.md", policy_bytes)]:
            database.execute("INSERT INTO source_document VALUES(?,?,?,?)",
                             (name, hashlib.sha256(content).hexdigest().upper(), len(content), content))
        database.executemany("INSERT INTO worksheet VALUES(?,?,?,?)", sheets)
        database.executemany("INSERT INTO workbook_cell VALUES(?,?,?,?,?,?,?,?,?)", cells)
        database.executemany("INSERT INTO editorial_source_cell VALUES(?,?)", parsed["cells"])
        for name, value in policy.items():
            if name not in ("shared", "languages"):
                database.execute("INSERT INTO editorial_metadata VALUES(?,?)", (name, json.dumps(value, ensure_ascii=False)))
        for position, language in enumerate(policy["languages"]):
            settings = {key: value for key, value in language.items() if key != "rules"}
            database.execute("INSERT INTO editorial_language VALUES(?,?,?)",
                             (language["language"], position, json.dumps(settings, ensure_ascii=False)))
        for language, rules in [(None, policy["shared"])] + [(item["language"], item.get("rules", [])) for item in policy["languages"]]:
            for position, rule in enumerate(rules):
                metadata = {key: value for key, value in rule.items() if key not in ("id", "instruction")}
                database.execute("INSERT INTO editorial_rule VALUES(?,?,?,?,?)",
                                 (rule["id"], language, position, rule["instruction"], json.dumps(metadata, ensure_ascii=False)))
        if database.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("SQLite integrity check failed")
        if database.execute("PRAGMA foreign_key_check").fetchall():
            raise ValueError("SQLite foreign-key check failed")
    # Validate the closed staging database before an atomic, no-overwrite Windows rename.
    content = database.serialize()
    if len(content) > MAX_BYTES:
        raise ValueError("Database exceeds the 20 MiB capacity limit")
    staging_path = database_path.with_name(database_path.name + "." + uuid.uuid4().hex + ".importing")
    with staging_path.open("xb") as output:
        output.write(content)
        output.flush()
        os.fsync(output.fileno())
    with sqlite3.connect(staging_path.as_uri() + "?mode=ro", uri=True) as saved:
        assert saved.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        assert saved.execute("SELECT count(*) FROM workbook_cell").fetchone()[0] == len(cells)
        assert saved.execute("SELECT content FROM source_document WHERE name='Publishing.xlsx'").fetchone()[0] == source_bytes
    saved.close()
    if os.name != "nt":
        raise RuntimeError("Atomic no-overwrite publication requires Windows; preserve the validated staging file")
    staging_path.rename(database_path)
    print(json.dumps({"database": str(database_path), "bytes": len(content), "worksheets": len(sheets),
                      "cells": len(cells), "formulas": sum(cell[6] is not None for cell in cells),
                      "editorial_rules": len(policy["shared"]) + sum(len(item.get("rules", [])) for item in policy["languages"])}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("policy", type=Path)
    parser.add_argument("--reader", type=Path, required=True)
    parser.add_argument("--database", type=Path, default=Path(__file__).parent.parent / "data" / "Book Standards.sqlite")
    options = parser.parse_args()
    import_database(options.workbook.resolve(), options.policy.resolve(), options.reader.resolve(), options.database.resolve())
