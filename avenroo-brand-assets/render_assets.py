from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter


OUT_DIR = Path(__file__).resolve().parent
FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"

INK = "#102033"
BLUE = "#0B5FFF"
SKY = "#EAF4FF"
PALE = "#F7FBFF"
RED = "#E53935"
MUTED = "#5B6B7C"
LINE = "#D7E8FF"
WHITE = "#FFFFFF"


def font(path, size):
    return ImageFont.truetype(path, size)


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient(size, left, right):
    width, height = size
    a = hex_to_rgb(left)
    b = hex_to_rgb(right)
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(height):
        for x in range(width):
            t = (x / max(width - 1, 1) * 0.7) + (y / max(height - 1, 1) * 0.3)
            px[x, y] = tuple(lerp(a[i], b[i], t) for i in range(3))
    return img.convert("RGBA")


def text_size(draw, text, text_font):
    box = draw.textbbox((0, 0), text, font=text_font)
    return box[2] - box[0], box[3] - box[1]


def draw_soft_background(draw, w, h):
    for x in range(48, w, 120):
        draw.line((x, 0, x + 44, h), fill="#E8F2FF", width=1)
    draw.ellipse((w - 300, -104, w + 90, 285), fill="#E8F2FF")
    draw.ellipse((w - 190, -28, w + 22, 184), fill="#FDEAEA")


def draw_a_mark(draw, x, y, size):
    radius = max(12, size // 5)
    draw.rounded_rectangle((x, y, x + size, y + size), radius=radius, fill=WHITE, outline=LINE, width=max(2, size // 45))
    a_font = font(FONT_BOLD, int(size * 0.74))
    aw, ah = text_size(draw, "A", a_font)
    draw.text((x + (size - aw) / 2, y + (size - ah) / 2 - size * 0.06), "A", font=a_font, fill=BLUE)
    draw.rounded_rectangle(
        (x + size * 0.64, y + size * 0.24, x + size * 0.84, y + size * 0.31),
        radius=max(2, size // 32),
        fill=RED,
    )
    draw.ellipse((x + size * 0.72, y + size * 0.68, x + size * 0.82, y + size * 0.78), fill=RED)


def draw_logo_lockup(draw, x, y, mark_size, name_size, show_subtitle=True):
    draw_a_mark(draw, x, y, mark_size)
    brand_font = font(FONT_BOLD, name_size)
    sub_font = font(FONT_REGULAR, max(16, int(name_size * 0.38)))
    text_x = x + mark_size + int(mark_size * 0.16)
    text_y = y + int(mark_size * 0.17)
    draw.text((text_x, text_y), "Avenroo", font=brand_font, fill=INK)
    if show_subtitle:
        draw.text((text_x + 2, text_y + int(name_size * 1.02)), "Technologies", font=sub_font, fill=MUTED)


def render_logo():
    size = 1024
    img = gradient((size, size), WHITE, PALE)
    draw = ImageDraw.Draw(img)
    draw_soft_background(draw, size, size)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((172, 248, 852, 776), radius=52, fill=(32, 81, 142, 34))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    img.alpha_composite(shadow)

    card = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle((172, 248, 852, 776), radius=52, fill=WHITE, outline=LINE, width=3)
    img.alpha_composite(card)

    draw = ImageDraw.Draw(img)
    draw_logo_lockup(draw, 242, 388, 168, 82, show_subtitle=True)

    img.save(OUT_DIR / "logo.png")


def render_banner():
    w, h = 1128, 191
    img = gradient((w, h), WHITE, SKY)
    draw = ImageDraw.Draw(img)
    draw_soft_background(draw, w, h)

    draw.rounded_rectangle((48, 35, 178, 155), radius=22, fill=WHITE, outline=LINE, width=2)
    draw_a_mark(draw, 74, 58, 78)

    draw.text((218, 49), "Avenroo Technologies", font=font(FONT_BOLD, 32), fill=INK)
    draw.text((220, 94), "Premium SaaS, Software Development & IT Consulting", font=font(FONT_REGULAR, 17), fill=MUTED)
    draw.text((220, 130), "Build. Scale. Transform.", font=font(FONT_BOLD, 15), fill=BLUE)

    draw.line((842, 54, 1020, 54), fill=BLUE, width=3)
    draw.line((904, 79, 1068, 79), fill=RED, width=3)
    draw.line((842, 104, 990, 104), fill="#9CC7FF", width=2)
    for x, y, c in [(842, 54, BLUE), (1020, 54, BLUE), (904, 79, RED), (1068, 79, RED), (990, 104, "#9CC7FF")]:
        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=c)

    img.save(OUT_DIR / "linkedin-banner.png")

    canva = img.convert("RGB").resize((2256, 382), Image.Resampling.LANCZOS)
    canva.save(OUT_DIR / "linkedin-banner-canva.png", quality=95)


if __name__ == "__main__":
    render_logo()
    render_banner()
    print("Created smooth MNC-style logo.png and linkedin-banner.png")
