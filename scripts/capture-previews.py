"""Capture catalogue cards into public/previews/<id>.webp.

Requires agent-browser, ffmpeg and cwebp. Run against the dev server:

    python3 -I scripts/capture-previews.py [base-url]
"""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time

URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:5192"
OUT = Path(__file__).resolve().parents[1] / "public/previews"
SESSION = f"vice-city-previews-{os.getpid()}"
SCALE = 2


def browser(*args):
    return subprocess.run(
        ["agent-browser", "--session", SESSION, *args],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()


def evaluate(expression):
    return json.loads(browser("eval", expression))


def capture_card(card_id, tmp):
    selector = json.dumps(f'[data-id="{card_id}"] .cat-card__stage')
    stage = f"document.querySelector({selector})"
    preview = f"{stage}.querySelector('.cat-card__preview')"
    browser("eval", f"{stage}.scrollIntoView({{block: 'center'}})")
    browser("wait", "--fn", f"{preview}.childElementCount > 0")
    if evaluate(f"Boolean({preview}.querySelector('.demo-failed'))"):
        raise RuntimeError(f"The {card_id} preview failed to render.")

    time.sleep(1.2)  # Allow the game screen's entry animation to settle.
    x, y, width, height = evaluate(
        f"(r => [r.x, r.y, r.width, r.height].map(Math.round))({stage}.getBoundingClientRect())"
    )
    screenshot = tmp / f"{card_id}.png"
    crop = tmp / f"{card_id}-crop.png"
    browser("screenshot", screenshot)
    box = f"{width * SCALE}:{height * SCALE}:{x * SCALE}:{y * SCALE}"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", screenshot, "-vf", f"crop={box}", crop],
        check=True,
    )
    subprocess.run(
        ["cwebp", "-quiet", "-q", "82", crop, "-o", OUT / f"{card_id}.webp"],
        check=True,
    )
    print(card_id, f"{width}x{height}", flush=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    try:
        browser("set", "viewport", "1280", "900", str(SCALE))
        browser("open", f"{URL}/?live#/")
        browser("wait", ".cat-card__preview")
        browser("eval", "document.documentElement.dataset.motion = 'still'")
        browser("eval", "document.fonts.ready.then(() => true)")
        ids = evaluate("[...document.querySelectorAll('.cat-card')].map(card => card.dataset.id)")
        with tempfile.TemporaryDirectory() as tmp:
            for card_id in ids:
                capture_card(card_id, Path(tmp))
    finally:
        subprocess.run(["agent-browser", "--session", SESSION, "close"], capture_output=True)


if __name__ == "__main__":
    main()
