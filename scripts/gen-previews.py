"""Needs agent-browser, ffmpeg and cwebp. Captures each catalogue card's live preview into public/previews/<id>.webp, so the home page can show
images instead of mounting every component while you scroll. Re-run after changing a component's look:

    python3 -I scripts/gen-previews.py [base-url]   # default http://localhost:5192, the dev server
"""
import json, os, subprocess, sys, tempfile, time

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5192"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "previews")
SCALE = 2


def ab(*args):
    return subprocess.run(["agent-browser", "--session", "previews", *args], capture_output=True, text=True, check=True).stdout.strip()


def js(expr):
    return json.loads(json.loads(ab("eval", f"JSON.stringify({expr})")))


os.makedirs(OUT, exist_ok=True)
ab("set", "viewport", "1280", "900", str(SCALE))
ab("open", f"{URL}/#/")
ab("wait", "2500")
ab("eval", "document.documentElement.dataset.motion = 'still'")
ids = js("[...document.querySelectorAll('.cat-card')].map(c => c.dataset.id)")
with tempfile.TemporaryDirectory() as tmp:
    for id in ids:
        stage = f"document.querySelector('[data-id=\"{id}\"] .cat-card__stage')"
        ab("eval", f"{stage}.scrollIntoView({{block: 'center'}})")
        for _ in range(40):
            if js(f"{stage}.querySelector('.cat-card__preview').children.length > 0"):
                break
            time.sleep(0.1)
        time.sleep(1.2)  # let entry animations settle
        x, y, w, h = js(f"(r => [r.x, r.y, r.width, r.height].map(Math.round))({stage}.getBoundingClientRect())")
        shot = os.path.join(tmp, f"{id}.png")
        ab("screenshot", shot)
        crop = os.path.join(tmp, f"{id}-crop.png")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", shot, "-vf", f"crop={w * SCALE}:{h * SCALE}:{x * SCALE}:{y * SCALE}", crop], check=True)
        subprocess.run(["cwebp", "-quiet", "-q", "82", crop, "-o", os.path.join(OUT, f"{id}.webp")], check=True)
        print(id, f"{w}x{h}")
