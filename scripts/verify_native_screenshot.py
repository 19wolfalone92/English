#!/usr/bin/env python3
import json, struct, sys
png_path, dom_path = sys.argv[1:3]
data = open(png_path, "rb").read()
assert data[:8] == b"\x89PNG\r\n\x1a\n", "native screenshot is not PNG"
width, height = struct.unpack(">II", data[16:24])
assert width >= 480 and height >= 800, f"unexpected screenshot dimensions: {width}x{height}"
assert len(data) >= 30000, f"screenshot is suspiciously small: {len(data)} bytes"
raw = open(dom_path, encoding="utf-8").read()
try:
    dom = json.loads(raw)
except json.JSONDecodeError:
    dom = raw
assert "Первый вечер в разговорном клубе" in dom, "expected lesson card is not rendered"
assert "День 1 из 300" in dom, "expected course progress is not rendered"
assert "Подбираем твою следующую тренировку" not in dom, "loading placeholder is still visible"
print(f"PASS: native screenshot {width}x{height}, {len(data)} bytes; expected home DOM is ready")
