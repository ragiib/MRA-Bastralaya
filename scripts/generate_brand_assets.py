import os
import shutil
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def generate():
    src_path = r'public/brand/logo.jpg'
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return

    os.makedirs('public/brand', exist_ok=True)
    os.makedirs('src/app', exist_ok=True)

    orig = Image.open(src_path)

    # Isolated circular medallion with smooth anti-aliased edge
    cx, cy, r = 511, 518, 486
    mask = Image.new('L', (1024, 1024), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))

    medallion = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    medallion.paste(orig.convert('RGBA'), (0, 0), mask=mask)
    bbox = (cx - r, cy - r, cx + r, cy + r)
    medallion_cropped = medallion.crop(bbox)

    ivory_rgb = (250, 247, 242)  # #FAF7F2

    def create_square_icon(size, padding_pct=0.03):
        canvas = Image.new('RGBA', (size, size), ivory_rgb + (255,))
        pad = int(size * padding_pct)
        target_dim = size - (pad * 2)
        resized_med = medallion_cropped.resize((target_dim, target_dim), Image.Resampling.LANCZOS)
        canvas.paste(resized_med, (pad, pad), mask=resized_med)
        return canvas

    # 512x512
    icon_512 = create_square_icon(512, 0.03)
    icon_512.save('src/app/icon.png', format='PNG', optimize=True)
    icon_512.save('public/brand/icon-512.png', format='PNG', optimize=True)

    # 180x180 (Apple touch icon)
    apple_icon_180 = create_square_icon(180, 0.03)
    apple_icon_180.save('src/app/apple-icon.png', format='PNG', optimize=True)
    apple_icon_180.save('public/brand/apple-icon.png', format='PNG', optimize=True)

    # Favicon (16, 32, 48)
    fav_32 = create_square_icon(32, 0.02).convert('RGBA')
    fav_32.save('src/app/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    fav_32.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

    # 1200x630 OpenGraph / Twitter card
    og_w, og_h = 1200, 630
    og = Image.new('RGBA', (og_w, og_h), ivory_rgb + (255,))
    og_draw = ImageDraw.Draw(og)

    gold_color = (212, 175, 55)  # #D4AF37
    maroon_color = (107, 13, 47)  # #6B0D2F
    charcoal_color = (74, 62, 61)  # #4A3E3D
    accent_gold = (166, 124, 30)  # #A67C1E

    # Double gold border
    og_draw.rectangle([20, 20, og_w - 20, og_h - 20], outline=gold_color, width=2)
    og_draw.rectangle([26, 26, og_w - 26, og_h - 26], outline=(212, 175, 55, 120), width=1)

    def draw_diamond(dcx, dcy, dr=6, col=gold_color):
        og_draw.polygon([(dcx, dcy - dr), (dcx + dr, dcy), (dcx, dcy + dr), (dcx - dr, dcy)], fill=col)

    draw_diamond(36, 36)
    draw_diamond(og_w - 36, 36)
    draw_diamond(36, og_h - 36)
    draw_diamond(og_w - 36, og_h - 36)

    # Medallion in upper-center
    med_size = 270
    med_resized = medallion_cropped.resize((med_size, med_size), Image.Resampling.LANCZOS)
    med_x = (og_w - med_size) // 2
    med_y = 65

    # Drop shadow
    shadow_size = med_size + 20
    shadow = Image.new('RGBA', (shadow_size, shadow_size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse([10, 10, shadow_size - 10, shadow_size - 10], fill=(60, 40, 20, 50))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    og.paste(shadow, (med_x - 10, med_y - 2), mask=shadow)
    og.paste(med_resized, (med_x, med_y), mask=med_resized)

    # Typography
    font_title = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 48)
    font_subtitle = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 22)
    font_badge = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 13)

    title_text = 'MRA BASTRALAYA'
    bbox_t = font_title.getbbox(title_text)
    tw = bbox_t[2] - bbox_t[0]
    ty = 360
    og_draw.text(((og_w - tw) // 2, ty), title_text, fill=maroon_color, font=font_title)

    div_y = ty + 62
    og_draw.line([(og_w // 2 - 120, div_y), (og_w // 2 + 120, div_y)], fill=gold_color, width=2)
    draw_diamond(og_w // 2, div_y, dr=5, col=gold_color)

    sub_text = 'Handcrafted Sarees • Ladies Suits • Pure Cotton Bed Sheets'
    bbox_s = font_subtitle.getbbox(sub_text)
    sw = bbox_s[2] - bbox_s[0]
    sy = div_y + 16
    og_draw.text(((og_w - sw) // 2, sy), sub_text, fill=charcoal_color, font=font_subtitle)

    badge_text = 'AUTHENTIC TEXTILES & APPAREL • ESTD. 1980'
    bbox_b = font_badge.getbbox(badge_text)
    bw = bbox_b[2] - bbox_b[0]
    by = sy + 42
    og_draw.text(((og_w - bw) // 2, by), badge_text, fill=accent_gold, font=font_badge)

    og_rgb = og.convert('RGB')
    og_rgb.save('src/app/opengraph-image.png', format='PNG', optimize=True)
    og_rgb.save('src/app/twitter-image.png', format='PNG', optimize=True)
    og_rgb.save('public/brand/opengraph-image.png', format='PNG', optimize=True)
    og_rgb.save('public/brand/twitter-image.png', format='PNG', optimize=True)
    print("All brand assets generated successfully.")

if __name__ == '__main__':
    generate()
