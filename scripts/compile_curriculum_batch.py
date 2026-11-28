#!/usr/bin/env python3
"""Compile independently authored curriculum batches. No generated lesson prose.

--check verifies the committed JS outputs exactly; --write compiles the JSON
sources. The release inventory is explicit and is never silently updated.
Linguistic correctness and CEFR calibration remain separate human/independent
review gates. No content generation is done by this script.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "app/src/main/assets"
DATA = ROOT / "data/curriculum"
PACK_PREFIX = "window.WOLFIE_CONTEXT_PACKS=(window.WOLFIE_CONTEXT_PACKS||[]).concat("
CHECK_PREFIX = "window.WOLFIE_CONTEXT_CHECKS=Object.assign(window.WOLFIE_CONTEXT_CHECKS||{},"

def require(condition, message):
    if not condition:
        raise ValueError(message)

def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))

def nonempty(s):
    return isinstance(s, str) and bool(s.strip())

def rows(value, count, width, label):
    require(isinstance(value, list) and len(value) == count, label)
    require(all(isinstance(x, list) and len(x) == width and all(nonempty(z) for z in x) for x in value), label)

def question(q, label):
    require(isinstance(q, list) and len(q) == 3, label)
    prompt, options, correct = q
    require(nonempty(prompt) and isinstance(options, list) and len(options) >= 2, label)
    require(all(nonempty(x) for x in options) and len(set(x.casefold().strip() for x in options)) == len(options), label)
    require(type(correct) is int and 0 <= correct < len(options), label)

def exercise(e, label):
    require(isinstance(e, list) and len(e) >= 4 and nonempty(e[1]) and nonempty(e[-1]), label)
    kind = e[0]
    if kind == "choice":
        require(len(e) == 5, label)
        question(e[1:4], label)
    elif kind == "type":
        require(len(e) == 4 and isinstance(e[2], list) and e[2] and all(nonempty(x) for x in e[2]), label)
    elif kind == "order":
        require(len(e) == 5 and isinstance(e[2], list) and all(nonempty(x) for x in e[2]) and nonempty(e[3]), label)
        require(sorted(e[2]) == sorted(e[3].split()), label)
    else:
        raise ValueError(f"{label}: unknown exercise type {kind}")

def validate(pack, checks):
    day = pack["day"]
    label = f"day {day}"
    require(type(day) is int and 1 <= day <= 300, label)
    require(pack["id"] == f"mission-v2-{day:03d}", label + " identity")
    require(pack["level"] == ("A2" if day <= 120 else "B1" if day <= 210 else "B2"), label + " roadmap level")
    require(pack["profile"] == "extended-v1", label + " profile")
    require(pack["quality"] == "authored-not-independently-reviewed", label + " review claim")
    for key in ("title", "ru", "goal", "model"):
        require(nonempty(pack[key]), label + " " + key)
    rows(pack["words"], 10, 2, label + " words")
    rows(pack["phrases"], 10, 2, label + " phrases")
    rows(pack["dialogue"], 8, 3, label + " dialogue")
    for key, n in (("speaking", 5), ("writing", 3)):
        require(len(pack[key]) == n and all(nonempty(x) for x in pack[key]), label + " " + key)
    reading = pack["reading"]
    require(nonempty(reading["title"]) and len(reading["paragraphs"]) >= 2 and all(nonempty(x) for x in reading["paragraphs"]), label + " reading")
    require(len(" ".join(reading["paragraphs"]).split()) >= 120, label + " reading length")
    require(len(reading["questions"]) == 4, label + " reading questions")
    for q in reading["questions"] + [pack["listening"]]:
        question(q, label)
    grammar = pack["grammar"]
    for key in ("title", "rule", "pattern", "example", "pitfall"):
        require(nonempty(grammar[key]), label + " grammar " + key)
    require(len(grammar["exercises"]) == 6 and len(checks) == 3, label + " exercise counts")
    for e in grammar["exercises"] + checks:
        exercise(e, label)
    require(not {e[1].casefold().strip() for e in checks} & {e[1].casefold().strip() for e in grammar["exercises"]}, label + " assessment overlap")
    competency = pack["competency"]
    for key in ("prerequisites", "canDo", "successCriteria", "cefr"):
        require(nonempty(competency[key]), label + " competency " + key)
    require(competency["reviewDays"] == [1,3,7], label + " review spacing")
    require(competency["cefr"].endswith("-not-independently-calibrated"), label + " CEFR claim")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    args = parser.parse_args()
    inventory = json.loads((DATA / "inventory.json").read_text(encoding="utf-8"))
    require(inventory["schema"] == 1, "inventory schema")
    seen_days, seen_shards, seen_files = set(), set(), set()
    reports = []
    for batch in inventory["batches"]:
        shard, filename = batch["shard"], batch["file"]
        require(re.fullmatch(r"[a-z]+", shard) and re.fullmatch(r"[a-z0-9-]+\.json", filename), "unsafe batch path")
        require(shard not in seen_shards and filename not in seen_files, "duplicate batch")
        seen_shards.add(shard); seen_files.add(filename)
        raw = (DATA / filename).read_bytes()
        authored = json.loads(raw)
        require(isinstance(authored, list) and authored, "empty authored batch")
        packs, checks = [], {}
        for row in authored:
            pack = row["pack"]; check = row["checks"]
            validate(pack, check)
            require(pack["day"] not in seen_days, "duplicate batch day")
            seen_days.add(pack["day"])
            packs.append(pack); checks[pack["id"]] = check
        require([p["day"] for p in packs] == batch["days"], filename + " declared day list mismatch")
        outputs = {
            ASSETS / f"context_packs_{shard}.js": PACK_PREFIX + compact(packs) + ");\n",
            ASSETS / f"context_checks_{shard}.js": CHECK_PREFIX + compact(checks) + ");\n",
        }
        for path, content in outputs.items():
            encoded = content.encode("utf-8")
            if args.write:
                path.write_bytes(encoded)
            require(path.read_bytes() == encoded, f"{path.name}: generated source differs")
        reports.append({"file": filename, "days": batch["days"], "sha256": hashlib.sha256(raw).hexdigest(),
                        "reading_words": sum(len(" ".join(p["reading"]["paragraphs"]).split()) for p in packs)})
    all_packs = []
    for f in sorted(ASSETS.glob("context_packs_*.js")):
        raw = f.read_text(encoding="utf-8")
        require(raw.startswith(PACK_PREFIX) and raw.endswith(");\n"), f.name + " wrapper")
        all_packs.extend(json.loads(raw[len(PACK_PREFIX):-3]))
    ids = {p["id"] for p in all_packs}; days = {p["day"] for p in all_packs}
    require(len(ids) == len(days) == len(all_packs) == inventory["contexts"], "global count or collision")
    require(sum(p.get("profile") == "extended-v1" for p in all_packs) == inventory["extended"], "extended count")
    complete = {p["day"] for p in all_packs if p.get("profile") == "extended-v1"}
    require(set(range(1, inventory["completeExtendedThroughDay"] + 1)) <= complete, "contiguous extended coverage")
    print(json.dumps({"status": "PASS", "compiled_authored_lessons": len(seen_days), "batches": reports,
                      "contexts": len(all_packs), "independent_linguistic_review": "NOT TESTED"}, ensure_ascii=False))

if __name__ == "__main__":
    main()
