#!/usr/bin/env python3
"""Validate this repository's documentation against the project conventions.

Vendored from the `iteration-docs-and-assets` skill, unchanged in behaviour.
Edit the skill copy first, then re-copy; local edits here will be overwritten.

Checks, in order of usefulness:
  1. Relative links in Markdown resolve.
  2. Markdown fences are balanced.
  3. Documentation file names are lowercase kebab-case ASCII.
  4. Every ADR is listed in the ADR index, with monotonic numbering.
  5. Requirement identifiers are unique and continuous per group.
  6. Every docs folder has a README index.
  7. Changelog version headings have matching comparison links.
  8. The newest tag points at the current HEAD commit.
  9. Licensed assets on disk appear in the LICENSE notices.
 10. Numeric specification documents agree with their code constants.

Exit code 0 when clean, 1 when anything fails. No third-party dependencies.

Usage:
    validate-docs.py [project-root] [--assets DIR] [--no-git] [--spec DOC:CODE]

Options:
    --assets DIR   asset folder to cross-check against LICENSE, repeatable
    --no-git       skip the tag/commit check
"""

import argparse
import os
import re
import subprocess
import sys

FENCE = "```"
DOC_NAME = re.compile(r"^[a-z0-9][a-z0-9-]*(?:\.[a-z0-9]+)?$")
ADR_NAME = re.compile(r"^(\d{4})-[a-z0-9-]+\.md$")
LINK = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")
REQ_ID = re.compile(r"\*\*(R(\d+)\.(\d+)[a-z]?)\b")
VERSION_HEADING = re.compile(r"^##\s*\[(\d+\.\d+\.\d+)\]", re.M)
LINK_DEF = re.compile(r"^\[(\d+\.\d+\.\d+)\]:", re.M)


class Report:
    def __init__(self):
        self.failures = []
        self.checks = 0

    def check(self, ok, name, detail=""):
        self.checks += 1
        if not ok:
            self.failures.append((name, detail))
        return ok

    def summary(self):
        passed = self.checks - len(self.failures)
        for name, detail in self.failures:
            print(f"  FAIL {name}" + (f" — {detail}" if detail else ""))
        print(f"\n{passed} passed, {len(self.failures)} failed, {self.checks} checks")
        return 0 if not self.failures else 1


def read(path):
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def markdown_files(root):
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules", ".kilo", ".venv"}]
        for name in files:
            if name.endswith(".md"):
                yield os.path.join(base, name)


def check_links(report, root):
    broken = []
    for path in markdown_files(root):
        text = read(path)
        for target in LINK.findall(text):
            if target.startswith(("http://", "https://", "mailto:", "tel:")):
                continue
            resolved = os.path.normpath(os.path.join(os.path.dirname(path), target))
            if not os.path.exists(resolved):
                broken.append(f"{os.path.relpath(path, root)} -> {target}")
    report.check(not broken, "relative markdown links resolve", "; ".join(broken[:6]))


def check_fences(report, root):
    bad = []
    for path in markdown_files(root):
        text = read(path)
        # Four-backtick fences wrap three-backtick blocks; ignore those wrappers.
        stripped = re.sub(r"^````.*?^````", "", text, flags=re.S | re.M)
        if stripped.count(FENCE) % 2 != 0:
            bad.append(os.path.relpath(path, root))
    report.check(not bad, "markdown fences balanced", ", ".join(bad))


def check_names(report, root):
    docs = os.path.join(root, "docs")
    if not os.path.isdir(docs):
        report.check(True, "docs folder present", "skipped, no docs folder")
        return

    bad = []
    for base, _dirs, files in os.walk(docs):
        for name in files + [os.path.basename(base)]:
            if name == "README.md":
                continue
            if not DOC_NAME.match(name):
                rel = os.path.relpath(os.path.join(base, name), root)
                if rel not in bad:
                    bad.append(rel)
    report.check(not bad, "docs names are lowercase kebab-case ASCII", ", ".join(bad[:8]))


def check_docs_indexes(report, root):
    docs = os.path.join(root, "docs")
    if not os.path.isdir(docs):
        return

    missing = []
    for base, _dirs, _files in os.walk(docs):
        if not os.path.exists(os.path.join(base, "README.md")):
            missing.append(os.path.relpath(base, root))
    report.check(not missing, "every docs folder has a README index", ", ".join(missing))


def check_adrs(report, root):
    adr_dir = os.path.join(root, "docs", "architecture", "adr")
    if not os.path.isdir(adr_dir):
        report.check(True, "ADRs indexed", "skipped, no adr folder")
        return

    files = sorted(f for f in os.listdir(adr_dir) if ADR_NAME.match(f))
    numbers = [int(ADR_NAME.match(f).group(1)) for f in files]

    report.check(numbers == sorted(numbers), "ADR numbering is monotonic", str(numbers))
    report.check(len(numbers) == len(set(numbers)), "ADR numbers are unique", str(numbers))

    index_path = os.path.join(adr_dir, "README.md")
    if report.check(os.path.exists(index_path), "ADR index exists"):
        index = read(index_path)
        unlisted = [f for f in files if f not in index]
        report.check(not unlisted, "every ADR is listed in the index", ", ".join(unlisted))


def check_requirements(report, root):
    req_dir = os.path.join(root, "docs", "requirements")
    if not os.path.isdir(req_dir):
        report.check(True, "requirement ids unique", "skipped, no requirements folder")
        return

    for name in sorted(f for f in os.listdir(req_dir) if f.startswith("iteration-")):
        text = read(os.path.join(req_dir, name))
        ids = REQ_ID.findall(text)
        seen = {}
        for full, group, _num in ids:
            seen[full] = seen.get(full, 0) + 1
        dupes = [k for k, v in seen.items() if v > 1]
        report.check(not dupes, f"{name}: requirement ids unique", ", ".join(dupes[:6]))

        groups = {}
        for full, group, num in ids:
            groups.setdefault(group, set()).add(int(num))
        gaps = []
        for group, nums in groups.items():
            expected = set(range(1, max(nums) + 1))
            missing = sorted(expected - nums)
            if missing:
                gaps.append(f"R{group}: missing {missing}")
        report.check(not gaps, f"{name}: requirement numbering continuous", "; ".join(gaps[:4]))


def check_changelog(report, root):
    path = os.path.join(root, "CHANGELOG.md")
    if not report.check(os.path.exists(path), "CHANGELOG.md exists"):
        return

    text = read(path)
    headings = set(VERSION_HEADING.findall(text))
    links = set(LINK_DEF.findall(text))
    missing = sorted(headings - links)
    report.check(not missing, "changelog versions have comparison links", ", ".join(missing))


def check_tag(report, root):
    try:
        head = subprocess.run(
            ["git", "-C", root, "rev-parse", "HEAD"],
            capture_output=True, text=True, check=True
        ).stdout.strip()

        tags = subprocess.run(
            ["git", "-C", root, "tag", "--sort=-creatordate"],
            capture_output=True, text=True, check=True
        ).stdout.split()

        if not tags:
            report.check(True, "newest tag points at HEAD", "skipped, no tags")
            return

        target = subprocess.run(
            ["git", "-C", root, "rev-list", "-n", "1", tags[0]],
            capture_output=True, text=True, check=True
        ).stdout.strip()

        report.check(
            target == head,
            "newest tag points at HEAD",
            f"tag {tags[0]} is behind HEAD; tag the release or expect a newer commit"
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        report.check(True, "newest tag points at HEAD", "skipped, git unavailable")


def check_asset_notices(report, root, asset_dirs):
    licence_path = os.path.join(root, "LICENSE")
    if not os.path.exists(licence_path):
        for folder in asset_dirs:
            report.check(False, f"LICENSE covers {folder}", "no LICENSE file")
        return

    licence = read(licence_path)
    report.check(
        "third-party" in licence.lower(),
        "LICENSE has a third-party notices section",
        "add a section listing borrowed content"
    )

    for folder in asset_dirs:
        base = os.path.join(root, folder)
        if not os.path.isdir(base):
            continue
        files = []
        for _b, _d, names in os.walk(base):
            files.extend(n for n in names if n.lower().endswith(
                (".svg", ".png", ".jpg", ".woff", ".woff2", ".mp3", ".ogg", ".wav",
                 ".js", ".txt")))
        unlisted = [n for n in files if n not in licence]
        report.check(
            not unlisted,
            f"every file in {folder} is listed in LICENSE",
            ", ".join(sorted(unlisted)[:8])
        )


def table_numbers(text):
    """Numbers that appear inside markdown table rows, ignoring link targets.

    Prose counts and ADR references are noise for this check; the parameter
    table is the part that must stay in sync with code.
    """
    found = set()
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue

        cells = stripped.strip("|").split("|")
        for cell in cells:
            without_links = re.sub(r"\[[^\]]*\]\([^)]*\)", "", cell)
            without_links = re.sub(r"`[^`]*`", "", without_links)
            for number in re.findall(r"\b(\d{1,4})\b", without_links):
                # Skip four-digit values that look like years or ADR numbers.
                if len(number) == 4 and number.startswith(("19", "20")):
                    continue
                found.add(number)
    return found


def check_numeric_specs(report, root, specs):
    """specs: list of (doc_relative_path, code_relative_path).

    Asserts that each parameter-table number in the doc also appears in the
    code file. Deliberately loose: it catches drift, it does not parse either
    side.
    """
    for doc, code in specs:
        doc_path = os.path.join(root, doc)
        code_path = os.path.join(root, code)
        if not os.path.exists(doc_path) or not os.path.exists(code_path):
            report.check(True, f"{doc} matches {code}", "skipped, file missing")
            continue

        numbers = table_numbers(read(doc_path))
        code_text = read(code_path)
        absent = sorted(n for n in numbers if n not in code_text)
        report.check(
            not absent,
            f"{doc} table numbers appear in {code}",
            f"only in the document: {absent[:8]}"
        )


def main():
    parser = argparse.ArgumentParser(description="Validate a docs-as-code repository.")
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--assets", action="append", default=[])
    parser.add_argument("--spec", action="append", default=[],
                        help="DOC:CODE pair to cross-check, repeatable")
    parser.add_argument("--no-git", action="store_true")
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    report = Report()

    print(f"Validating {root}\n")

    check_links(report, root)
    check_fences(report, root)
    check_names(report, root)
    check_docs_indexes(report, root)
    check_adrs(report, root)
    check_requirements(report, root)
    check_changelog(report, root)
    check_asset_notices(report, root, args.assets or [
        "assets/mascots/fluent",
        "assets/vendor/tone",
        "assets/fonts",
    ])
    if not args.no_git:
        check_tag(report, root)

    specs = args.spec or ["docs/levels.md:app.js"]
    pairs = [tuple(spec.split(":", 1)) for spec in specs if ":" in spec]
    if pairs:
        check_numeric_specs(report, root, pairs)

    return report.summary()


if __name__ == "__main__":
    sys.exit(main())
