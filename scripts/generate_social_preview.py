import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def create_social_preview():
    # 1280 x 640 target resolution, render at 2x scale for pristine sharpness
    SCALE = 2
    TARGET_W, TARGET_H = 1280, 640
    W, H = TARGET_W * SCALE, TARGET_H * SCALE

    # 1. Background Canvas
    canvas = Image.new("RGBA", (W, H), (7, 9, 14, 255)) # #07090e
    
    # Gradient overlay
    grad = Image.new("RGBA", (W, H))
    c_start = (7, 9, 14)
    c_mid = (13, 18, 30)
    c_end = (18, 25, 42)
    
    for y in range(H):
        t = y / H
        r = int(c_start[0] * (1 - t) + c_end[0] * t)
        g = int(c_start[1] * (1 - t) + c_end[1] * t)
        b = int(c_start[2] * (1 - t) + c_end[2] * t)
        for x in range(W):
            grad.putpixel((x, y), (r, g, b, 255))
            
    canvas = Image.alpha_composite(canvas, grad)

    # Ambient glows (Emerald on left, Cyan in center, Violet on right)
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow_layer)
    
    # Left emerald glow
    g_draw.ellipse([(-100 * SCALE, -100 * SCALE), (600 * SCALE, 600 * SCALE)], fill=(16, 185, 129, 45))
    # Center cyan glow
    g_draw.ellipse([(450 * SCALE, 200 * SCALE), (1100 * SCALE, 750 * SCALE)], fill=(6, 182, 212, 38))
    # Right violet glow
    g_draw.ellipse([(900 * SCALE, -150 * SCALE), (1450 * SCALE, 450 * SCALE)], fill=(99, 102, 241, 30))
    
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(90 * SCALE))
    canvas = Image.alpha_composite(canvas, glow_layer)

    # Grid line accents
    grid_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid_layer)
    grid_color = (255, 255, 255, 12)
    for gx in range(0, W, 80 * SCALE):
        grid_draw.line([(gx, 0), (gx, H)], fill=grid_color, width=1 * SCALE)
    for gy in range(0, H, 80 * SCALE):
        grid_draw.line([(0, gy), (W, gy)], fill=grid_color, width=1 * SCALE)
    canvas = Image.alpha_composite(canvas, grid_layer)

    # Fonts
    try:
        font_brand = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 68 * SCALE)
        font_tagline = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26 * SCALE)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 19 * SCALE)
        font_card_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 18 * SCALE)
        font_card_val = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 24 * SCALE)
        font_chip = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 14 * SCALE)
        font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13 * SCALE)
    except Exception:
        font_brand = ImageFont.load_default()
        font_tagline = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_card_title = ImageFont.load_default()
        font_card_val = ImageFont.load_default()
        font_chip = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    draw = ImageDraw.Draw(canvas)

    # Brand Icon Box (Left side)
    icon_box_size = 120 * SCALE
    icon_x = 70 * SCALE
    icon_y = 65 * SCALE

    # Icon frame shadow
    icon_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    is_draw = ImageDraw.Draw(icon_shadow)
    is_draw.rounded_rectangle(
        [(icon_x - 5 * SCALE, icon_y + 10 * SCALE), (icon_x + icon_box_size + 5 * SCALE, icon_y + icon_box_size + 20 * SCALE)],
        radius=32 * SCALE,
        fill=(16, 185, 129, 60)
    )
    icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(25 * SCALE))
    canvas = Image.alpha_composite(canvas, icon_shadow)

    # Icon Frame
    icon_frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if_draw = ImageDraw.Draw(icon_frame)
    if_draw.rounded_rectangle(
        [(icon_x, icon_y), (icon_x + icon_box_size, icon_y + icon_box_size)],
        radius=28 * SCALE,
        fill=(13, 18, 30, 240),
        outline=(16, 185, 129, 180),
        width=3 * SCALE
    )
    
    # Trajectory chart path inside icon
    pts = [
        (icon_x + 24 * SCALE, icon_y + 88 * SCALE),
        (icon_x + 52 * SCALE, icon_y + 60 * SCALE),
        (icon_x + 72 * SCALE, icon_y + 72 * SCALE),
        (icon_x + 96 * SCALE, icon_y + 32 * SCALE)
    ]
    for i in range(len(pts) - 1):
        if_draw.line([pts[i], pts[i+1]], fill=(16, 185, 129, 255), width=6 * SCALE)
        if_draw.ellipse([(pts[i][0]-5*SCALE, pts[i][1]-5*SCALE), (pts[i][0]+5*SCALE, pts[i][1]+5*SCALE)], fill=(16, 185, 129, 255))
    # Glowing beacon at apex
    apex = pts[-1]
    if_draw.ellipse([(apex[0]-8*SCALE, apex[1]-8*SCALE), (apex[0]+8*SCALE, apex[1]+8*SCALE)], fill=(6, 182, 212, 255))
    canvas = Image.alpha_composite(canvas, icon_frame)

    # Top Category Pill / Status Badge
    badge_x = icon_x + icon_box_size + 28 * SCALE
    badge_y = icon_y + 6 * SCALE
    badge_w = 270 * SCALE
    badge_h = 32 * SCALE
    
    badge_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(badge_layer)
    b_draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h)],
        radius=16 * SCALE,
        fill=(16, 185, 129, 35),
        outline=(16, 185, 129, 90),
        width=1 * SCALE
    )
    # Green pulse dot
    b_draw.ellipse([(badge_x + 14 * SCALE, badge_y + 11 * SCALE), (badge_x + 24 * SCALE, badge_y + 21 * SCALE)], fill=(16, 185, 129, 255))
    b_draw.text((badge_x + 34 * SCALE, badge_y + 7 * SCALE), "ACTIVE DECISION ENGINE • FAIE READY", font=font_badge, fill=(167, 243, 208, 255))
    canvas = Image.alpha_composite(canvas, badge_layer)

    # Title
    t_draw = ImageDraw.Draw(canvas)
    title_x = badge_x
    title_y = badge_y + 40 * SCALE
    t_draw.text((title_x, title_y), "SANVEKTRO", font=font_brand, fill=(255, 255, 255, 255))

    # Tagline
    tag_y = title_y + 78 * SCALE
    t_draw.text((title_x, tag_y), "30-Day Financial Trajectory & Decision Cockpit", font=font_tagline, fill=(56, 189, 248, 255)) # Cyan-400

    # Subtitle narrative
    sub_y = tag_y + 42 * SCALE
    t_draw.text((icon_x, sub_y), "Simulate before you swipe. Dynamic daily burn, pre-spend sandbox, and opportunity cost advisor.", font=font_sub, fill=(148, 163, 184, 255))

    # 4 Rich Glassmorphic Feature Cards along the bottom
    cards = [
        {"title": "Pre-Spend Sandbox", "val": "Ripple Previews", "sub": "Instant 'What-If' Consequences", "border": (16, 185, 129, 130), "accent": (16, 185, 129, 255)},
        {"title": "Dynamic Allowance", "val": "₹X / Day", "sub": "Safe Non-Linear Burn Corridor", "border": (6, 182, 212, 130), "accent": (6, 182, 212, 255)},
        {"title": "Opportunity Cost", "val": "Hours of Labor", "sub": "24-Hour Cool-Off Policy", "border": (245, 158, 11, 130), "accent": (245, 158, 11, 255)},
        {"title": "Verifiable Testing", "val": "59 Vitest Tests", "sub": "100% Deterministic Pass Rate", "border": (99, 102, 241, 130), "accent": (99, 102, 241, 255)},
    ]

    card_y = 360 * SCALE
    card_h = 135 * SCALE
    card_w = 265 * SCALE
    card_gap = 25 * SCALE
    start_cx = 70 * SCALE

    for i, c in enumerate(cards):
        cx = start_cx + i * (card_w + card_gap)
        c_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(c_layer)
        
        # Glass card body
        cd.rounded_rectangle(
            [(cx, card_y), (cx + card_w, card_y + card_h)],
            radius=20 * SCALE,
            fill=(15, 23, 42, 180),
            outline=c["border"],
            width=2 * SCALE
        )
        # Top accent pip
        cd.rounded_rectangle(
            [(cx + 18 * SCALE, card_y + 18 * SCALE), (cx + 36 * SCALE, card_y + 22 * SCALE)],
            radius=2 * SCALE,
            fill=c["accent"]
        )
        # Title
        cd.text((cx + 18 * SCALE, card_y + 32 * SCALE), c["title"], font=font_card_title, fill=(203, 213, 225, 255))
        # Value
        cd.text((cx + 18 * SCALE, card_y + 60 * SCALE), c["val"], font=font_card_val, fill=(255, 255, 255, 255))
        # Sub
        cd.text((cx + 18 * SCALE, card_y + 98 * SCALE), c["sub"], font=font_chip, fill=(148, 163, 184, 255))
        
        canvas = Image.alpha_composite(canvas, c_layer)

    # Bottom Footer Chips
    footer_y = 535 * SCALE
    footer_chips = [
        "React 19 • Vite 8",
        "Tailwind CSS v4",
        "DOMPurify Hardened",
        "Zero-Latency Web Audio",
        "WCAG AA 100% Contrast",
        "100% Private Client-Side"
    ]
    
    foot_draw = ImageDraw.Draw(canvas)
    fc_x = 70 * SCALE
    for chip in footer_chips:
        chip_box = foot_draw.textbbox((0, 0), chip, font=font_chip)
        cw = (chip_box[2] - chip_box[1]) + 24 * SCALE
        ch = 28 * SCALE
        
        chip_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cp_draw = ImageDraw.Draw(chip_layer)
        cp_draw.rounded_rectangle(
            [(fc_x, footer_y), (fc_x + cw, footer_y + ch)],
            radius=14 * SCALE,
            fill=(255, 255, 255, 14),
            outline=(255, 255, 255, 30),
            width=1 * SCALE
        )
        cp_draw.text((fc_x + 12 * SCALE, footer_y + 5 * SCALE), chip, font=font_chip, fill=(226, 232, 240, 255))
        canvas = Image.alpha_composite(canvas, chip_layer)
        fc_x += cw + 14 * SCALE

    # Resize down to 1280x640 with high quality Lanczos antialiasing
    final_img = canvas.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    
    os.makedirs("public", exist_ok=True)
    out_path = "public/social-preview.png"
    final_img.save(out_path, "PNG", optimize=True)
    print(f"Generated social preview at: {out_path} ({TARGET_W}x{TARGET_H})")

def create_readme_banner():
    # 1440 x 310 banner optimized for GitHub README headers
    SCALE = 2
    TARGET_W, TARGET_H = 1440, 310
    W, H = TARGET_W * SCALE, TARGET_H * SCALE

    canvas = Image.new("RGBA", (W, H), (7, 9, 14, 255))
    
    # Gradient
    grad = Image.new("RGBA", (W, H))
    c_start = (7, 9, 14)
    c_mid = (13, 20, 36)
    c_end = (16, 26, 48)
    for y in range(H):
        t = y / H
        r = int(c_start[0] * (1 - t) + c_end[0] * t)
        g = int(c_start[1] * (1 - t) + c_end[1] * t)
        b = int(c_start[2] * (1 - t) + c_end[2] * t)
        for x in range(W):
            grad.putpixel((x, y), (r, g, b, 255))
    canvas = Image.alpha_composite(canvas, grad)

    # Ambient glows
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow_layer)
    g_draw.ellipse([(40 * SCALE, -50 * SCALE), (600 * SCALE, 380 * SCALE)], fill=(16, 185, 129, 45))
    g_draw.ellipse([(650 * SCALE, 50 * SCALE), (1200 * SCALE, 450 * SCALE)], fill=(6, 182, 212, 40))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(60 * SCALE))
    canvas = Image.alpha_composite(canvas, glow_layer)

    # Rounded container mask
    CORNER_RADIUS = 28 * SCALE
    mask = Image.new("L", (W, H), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle([(0, 0), (W, H)], radius=CORNER_RADIUS, fill=255)
    rounded_bg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rounded_bg.paste(canvas, (0, 0), mask)

    # Fonts
    try:
        font_brand = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 62 * SCALE)
        font_tagline = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22 * SCALE)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 16 * SCALE)
        font_card_head = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 17 * SCALE)
        font_chip = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13 * SCALE)
    except Exception:
        font_brand = ImageFont.load_default()
        font_tagline = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_card_head = ImageFont.load_default()
        font_chip = ImageFont.load_default()

    # Icon frame (Left)
    icon_box_size = 110 * SCALE
    icon_x = 50 * SCALE
    icon_y = (H - icon_box_size) // 2

    icon_frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if_draw = ImageDraw.Draw(icon_frame)
    if_draw.rounded_rectangle(
        [(icon_x, icon_y), (icon_x + icon_box_size, icon_y + icon_box_size)],
        radius=26 * SCALE,
        fill=(13, 18, 30, 240),
        outline=(16, 185, 129, 180),
        width=3 * SCALE
    )
    # Trajectory chart path inside icon
    pts = [
        (icon_x + 22 * SCALE, icon_y + 80 * SCALE),
        (icon_x + 48 * SCALE, icon_y + 54 * SCALE),
        (icon_x + 66 * SCALE, icon_y + 66 * SCALE),
        (icon_x + 88 * SCALE, icon_y + 28 * SCALE)
    ]
    for i in range(len(pts) - 1):
        if_draw.line([pts[i], pts[i+1]], fill=(16, 185, 129, 255), width=5 * SCALE)
        if_draw.ellipse([(pts[i][0]-4*SCALE, pts[i][1]-4*SCALE), (pts[i][0]+4*SCALE, pts[i][1]+4*SCALE)], fill=(16, 185, 129, 255))
    apex = pts[-1]
    if_draw.ellipse([(apex[0]-7*SCALE, apex[1]-7*SCALE), (apex[0]+7*SCALE, apex[1]+7*SCALE)], fill=(6, 182, 212, 255))
    rounded_bg = Image.alpha_composite(rounded_bg, icon_frame)

    # Brand Title and Tagline (Left Center)
    t_draw = ImageDraw.Draw(rounded_bg)
    text_x = icon_x + icon_box_size + 30 * SCALE
    text_y = icon_y + 4 * SCALE
    t_draw.text((text_x, text_y), "SANVEKTRO", font=font_brand, fill=(255, 255, 255, 255))
    t_draw.text((text_x, text_y + 70 * SCALE), "30-Day Financial Trajectory & Decision Engine", font=font_tagline, fill=(56, 189, 248, 255))
    t_draw.text((text_x, text_y + 104 * SCALE), "Simulate before you swipe • Dynamic daily burn & pre-spend sandbox", font=font_sub, fill=(148, 163, 184, 255))

    # Right Side Two Glass Cards
    right_x = 780 * SCALE
    card_w = 610 * SCALE
    card_h = 105 * SCALE
    card_gap = 14 * SCALE
    cards_y = (H - ((card_h * 2) + card_gap)) // 2

    # Card 1: Core Engine
    c1_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c1_draw = ImageDraw.Draw(c1_layer)
    c1_draw.rounded_rectangle([(right_x, cards_y), (right_x + card_w, cards_y + card_h)], radius=18 * SCALE, fill=(15, 23, 42, 170), outline=(16, 185, 129, 100), width=1 * SCALE)
    c1_draw.text((right_x + 20 * SCALE, cards_y + 14 * SCALE), "Core Decision Innovations", font=font_card_head, fill=(255, 255, 255, 255))
    
    # Chips for Card 1
    c1_chips = ["Pre-Spend Sandbox", "Dynamic Safe Burn", "Opportunity Cost", "24h Cool-Off"]
    cx = right_x + 20 * SCALE
    cy = cards_y + 52 * SCALE
    for chip in c1_chips:
        cb = c1_draw.textbbox((0, 0), chip, font=font_chip)
        cw = (cb[2] - cb[0]) + 18 * SCALE
        c1_draw.rounded_rectangle([(cx, cy), (cx + cw, cy + 28 * SCALE)], radius=12 * SCALE, fill=(16, 185, 129, 35), outline=(16, 185, 129, 80), width=1 * SCALE)
        c1_draw.text((cx + 9 * SCALE, cy + 5 * SCALE), chip, font=font_chip, fill=(167, 243, 208, 255))
        cx += cw + 10 * SCALE
    rounded_bg = Image.alpha_composite(rounded_bg, c1_layer)

    # Card 2: Architecture & Reliability
    c2_y = cards_y + card_h + card_gap
    c2_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c2_draw = ImageDraw.Draw(c2_layer)
    c2_draw.rounded_rectangle([(right_x, c2_y), (right_x + card_w, c2_y + card_h)], radius=18 * SCALE, fill=(15, 23, 42, 170), outline=(6, 182, 212, 100), width=1 * SCALE)
    c2_draw.text((right_x + 20 * SCALE, c2_y + 14 * SCALE), "Architecture & Verification", font=font_card_head, fill=(255, 255, 255, 255))
    
    c2_chips = ["React 19 + Vite 8", "Tailwind CSS v4", "59 Vitest Tests", "Web Audio API"]
    cx = right_x + 20 * SCALE
    cy = c2_y + 52 * SCALE
    for chip in c2_chips:
        cb = c2_draw.textbbox((0, 0), chip, font=font_chip)
        cw = (cb[2] - cb[0]) + 18 * SCALE
        c2_draw.rounded_rectangle([(cx, cy), (cx + cw, cy + 28 * SCALE)], radius=12 * SCALE, fill=(6, 182, 212, 35), outline=(6, 182, 212, 80), width=1 * SCALE)
        c2_draw.text((cx + 9 * SCALE, cy + 5 * SCALE), chip, font=font_chip, fill=(186, 230, 253, 255))
        cx += cw + 10 * SCALE
    rounded_bg = Image.alpha_composite(rounded_bg, c2_layer)

    # Final resize to 1440x310
    final_banner = rounded_bg.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    out_path = "public/readme_banner.png"
    final_banner.save(out_path, "PNG", optimize=True)
    print(f"Generated README banner at: {out_path} ({TARGET_W}x{TARGET_H})")

if __name__ == "__main__":
    create_social_preview()
    create_readme_banner()
