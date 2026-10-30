from pathlib import Path
from PIL import Image, ImageDraw

SOURCE = Path('/home/ubuntu/upload/colibri-frames/raw')
OUTPUT = Path('/home/ubuntu/proyecto-juegolimonero/client/public/colibri-sprite.png')
PREVIEW = Path('/home/ubuntu/upload/colibri-frames/transparent-contact-sheet.png')

# Fixed canvas and crop: the bird can flap inside it without the frame itself moving.
CROP = (130, 40, 550, 460)  # 420 x 420
TARGET_HEAD = (397.0, 201.0)  # stable yellow head/chest anchor in source coordinates
frames = []

for path in sorted(SOURCE.glob('frame-*.png')):
    source = Image.open(path).convert('RGB')
    src = source.load()
    head_points = []
    for y in range(150, 430):
        for x in range(200, 520):
            r, g, b = src[x, y]
            if r > 120 and g > 120 and b < 150 and max(r, g) - min(r, g) < 100:
                head_points.append((x, y))
    if not head_points:
        raise SystemExit(f'Could not find the stable head anchor in {path}')
    head = (sum(x for x, _ in head_points) / len(head_points), sum(y for _, y in head_points) / len(head_points))
    dx = round(TARGET_HEAD[0] - head[0])
    dy = round(TARGET_HEAD[1] - head[1])

    aligned = Image.new('RGBA', (1000, 800), (0, 0, 0, 0))
    aligned_pixels = aligned.load()
    for y in range(source.height):
        for x in range(source.width):
            r, g, b = src[x, y]
            if not (r <= 5 and g <= 5 and b <= 8):
                aligned_pixels[x + dx, y + dy] = (r, g, b, 255)
    frames.append(aligned.crop(CROP))

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
            draw.rectangle((x * tile_w, y * tile_h, (x + 1) * tile_w - 1, (y + 1) * tile_h - 1), fill=(52, 52, 64, 255))
for index, frame in enumerate(frames):
    x = (index % 4) * tile_w
    y = (index // 4) * tile_h
    preview.alpha_composite(frame.resize((tile_w, tile_h), Image.Resampling.NEAREST), (x, y))
preview.convert('RGB').save(PREVIEW, optimize=True)
print(f'frames={len(frames)} frame_size={frame_w}x{frame_h} sheet={OUTPUT} preview={PREVIEW}')
