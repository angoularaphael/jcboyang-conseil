"""Generate favicon assets from public/images/logo.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public"
LOGO_PATH = ROOT / "images" / "logo.png"
BG = (11, 31, 58, 255)


def main() -> None:
    img = Image.open(LOGO_PATH).convert("RGBA")
    w, h = img.size
    side = max(w, h)
    square = Image.new("RGBA", (side, side), BG)
    square.paste(img, ((side - w) // 2, (side - h) // 2), img)

    for name, size in {
        "favicon-48x48.png": 48,
        "favicon-192x192.png": 192,
        "apple-touch-icon.png": 180,
    }.items():
        square.resize((size, size), Image.Resampling.LANCZOS).save(
            ROOT / name, format="PNG", optimize=True
        )

    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [square.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_images[0].save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_images[1:],
    )
    print(f"Generated favicons from {w}x{h} logo")


if __name__ == "__main__":
    main()
