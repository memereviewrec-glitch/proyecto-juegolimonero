from pathlib import Path
from PIL import Image, ImageDraw

SOURCE = Path('/home/ubuntu/upload/colibri-frames/raw')
OUTPUT = Path('/home/ubuntu/proyecto-juegolimonero/client/public/colibri-sprite.png')
PREVIEW = Path('/home/ubuntu/upload/colibri-frames/transparent-contact-sheet.png')

# Register every frame against the same stable pixel: the small white
# highlight in the hummingbird's eye. Wings and tail change pose, but this
# point keeps the bird's head from drifting inside the animation cell.
CROP = (130, 40, 550, 460)  # 420 x 420
TARGET_EYE = (291, 167)


def find_eye_anchor(frame: Image.Image) -> tuple[int, int]:
    rgb = frame.convert('RGB')
    pixels = rgb.load()
    visited: set[tuple[int, int]] = set()
    candidates: list[list[tuple[int, int]]] = []

    for y in range(110, 205):
        for x in range(250, 330):
            if (x, y) in visited:
                continue
            r, g, b = pixels[x, y]
            if min(r, g, b) <= 200:
                continue
            stack = [(x, y)]
            visited.add((x, y))
            component: list[tuple[int, int]] = []
            while stack:
                px, py = stack.pop()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if not (250 <= nx < 330 and 110 <= ny < 205) or (nx, ny) in visited:
                        continue
                    nr, ng, nb = pixels[nx, ny]
                    if min(nr, ng, nb) > 200:
                        visited.add((nx, ny))
                        stack.append((nx, ny))
            if len(component) >= 10:
                candidates.append(component)

    if not candidates:
        raise RuntimeError('No eye highlight found in a hummingbird frame')
    eye = max(candidates, key=len)
    return (
        round(sum(x for x, _ in eye) / len(eye)),
        round(sum(y for _, y in eye) / len(eye)),
    )


def remove_black_background(source: Image.Image) -> Image.Image:
    source = source.convert('RGB')
    rgba = Image.new('RGBA', source.size, (0, 0, 0, 0))
    src = source.load()
    dst = rgba.load()
    for y in range(source.height):
        for x in range(source.width):
            r, g, b = src[x, y]
            if not (r <= 5 and g <= 5 and b <= 8):
                dst[x, y] = (r, g, b, 255)
    return rgba


frames: list[Image.Image] = []
for path in sorted(SOURCE.glob('frame-*.png')):
    frame = remove_black_background(Image.open(path)).crop(CROP)
    eye_x, eye_y = find_eye_anchor(frame)
    dx = TARGET_EYE[0] - eye_x
    dy = TARGET_EYE[1] - eye_y
    aligned = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    aligned.alpha_composite(frame, (dx, dy))
    frames.append(aligned)

if len(frames) != 14:
    raise RuntimeError(f'Expected 14 frames, found {len(frames)}')

frame_w, frame_h = frames[0].size
sheet = Image.new('RGBA', (frame_w * len(frames), frame_h), (0, 0, 0, 0))
for index, frame in enumerate(frames):
    sheet.alpha_composite(frame, (index * frame_w, 0))
sheet.save(OUTPUT, optimize=True)

# Checkerboard contact sheet for visual verification.
tile_w, tile_h = frame_w * 2, frame_h * 2
preview = Image.new('RGBA', (tile_w * 4, tile_h * 4), (30, 30, 38, 255))
draw = ImageDraw.Draw(preview)
for y in range(4):
    for x in range(4):
        if (x + y) % 2 == 0:
            draw.rectangle(
                (x * tile_w, y * tile_h, (x + 1) * tile_w - 1, (y + 1) * tile_h - 1),
                fill=(52, 52, 64, 255),
            )
for index, frame in enumerate(frames):
    x = (index % 4) * tile_w
    y = (index // 4) * tile_h
    preview.alpha_composite(frame.resize((tile_w, tile_h), Image.Resampling.NEAREST), (x, y))
preview.convert('RGB').save(PREVIEW, optimize=True)
print(f'frames={len(frames)} frame_size={frame_w}x{frame_h} sheet={OUTPUT} preview={PREVIEW}')
