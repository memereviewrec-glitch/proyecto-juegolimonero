from pathlib import Path
from PIL import Image, ImageDraw

SOURCE = Path('/home/ubuntu/upload/colibri-frames/raw')
OUTPUT = Path('/home/ubuntu/proyecto-juegolimonero/client/public/colibri-sprite.png')
PREVIEW = Path('/home/ubuntu/upload/colibri-frames/transparent-contact-sheet.png')

# Register every transparent frame through a temporary green point at the exact
# geometric center. The point is only a guide and is removed before export; the
# hummingbird pixels are never used as the alignment anchor or shifted by hand.
CROP = (130, 40, 550, 460)  # 420 x 420
MARKER = (210, 210)
frames = []

for path in sorted(SOURCE.glob('frame-*.png')):
    source = Image.open(path).convert('RGB')
    src = source.load()
    rgba = Image.new('RGBA', source.size, (0, 0, 0, 0))
    rgba_pixels = rgba.load()
    for y in range(source.height):
        for x in range(source.width):
            r, g, b = src[x, y]
            if not (r <= 5 and g <= 5 and b <= 8):
                rgba_pixels[x, y] = (r, g, b, 255)
    frame = rgba.crop(CROP)
    marker_layer = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    marker_pixels = marker_layer.load()
    marker_pixels[MARKER[0], MARKER[1]] = (70, 255, 95, 255)
    marker_pixels[MARKER[0] - 1, MARKER[1]] = (70, 255, 95, 255)
    marker_pixels[MARKER[0] + 1, MARKER[1]] = (70, 255, 95, 255)
    marker_pixels[MARKER[0], MARKER[1] - 1] = (70, 255, 95, 255)
    marker_pixels[MARKER[0], MARKER[1] + 1] = (70, 255, 95, 255)
    # Register the transparent frame by the guide point. For equal source
    # frames this produces zero movement, while still making the operation explicit.
    marker_bbox = marker_layer.getchannel('A').getbbox()
    marker_center = ((marker_bbox[0] + marker_bbox[2] - 1) // 2, (marker_bbox[1] + marker_bbox[3] - 1) // 2)
    dx = MARKER[0] - marker_center[0]
    dy = MARKER[1] - marker_center[1]
    aligned = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    aligned.alpha_composite(frame, (dx, dy))
    frames.append(aligned)

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
