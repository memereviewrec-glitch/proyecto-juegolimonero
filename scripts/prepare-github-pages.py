from pathlib import Path
import os
import re

root = Path(os.environ.get("PAGES_OUTPUT", "dist/public"))
base = os.environ.get("BASE_PATH", "/proyecto-juegolimonero/")
if not base.startswith("/") or not base.endswith("/"):
    raise SystemExit("BASE_PATH must be an absolute path ending in '/'")

# Vite rewrites its generated asset URLs, but game artwork, audio and the public
# platform config are referenced from React/CSS as root-relative paths. Restrict
# this rewrite to known public prefixes so JavaScript strings and regular
# expressions are never modified accidentally.
public_paths = re.compile(
    r'(["\'(])(/(?:audio/|api/platform/|amp-sprite-light\.png|colibri-sprite\.png|dawn-background-clean\.png|el-rio-background-pixel\.png|fire-forest-background-after\.png|fire-forest-burning-frames\.png|guitar-sprite-recut-v2\.png|limonero-mark\.svg|river-mirror-background\.png|river-stone-ripples\.gif|room-background-empty\.png|ruins-background\.png|ruins-column-left-inscribed-pixelated\.png|ruins-column-right-inscribed-pixelated\.png|scene-04-background\.png|seedbook-art\.png|storyboard-pantallas-01-02\.png)[^"\'()\s]*)'
)
for path in root.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in {".html", ".js", ".css", ".map"}:
        continue
    text = path.read_text(encoding="utf-8")
    rewritten = public_paths.sub(lambda match: f'{match.group(1)}{base}{match.group(2).lstrip("/")}', text)
    if rewritten != text:
        path.write_text(rewritten, encoding="utf-8")
        print(path)
