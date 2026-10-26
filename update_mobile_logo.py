import os
import shutil
from PIL import Image, ImageDraw

SOURCE_IMAGE = r"C:/Users/khali/.gemini/antigravity/brain/dfb43046-ef90-46bd-967f-e24fe7a520bc/.user_uploaded/media_1793016921689_8cf0b6e3.jpg"
MOBILE_ROOT = r"C:\music\mobile music"

def generate_assets():
    src = Image.open(SOURCE_IMAGE).convert("RGBA")
    print(f"Loaded source image: {src.size}, format: {src.format}")

    # 1. Base logo (512x512 and 1024x1024)
    logo_512 = src.resize((512, 512), Image.Resampling.LANCZOS)
    icon_192 = src.resize((192, 192), Image.Resampling.LANCZOS)

    # Save to assets/ and www/assets/
    paths_512 = [
        os.path.join(MOBILE_ROOT, "assets", "logo.png"),
        os.path.join(MOBILE_ROOT, "assets", "icons", "icon-512.png"),
        os.path.join(MOBILE_ROOT, "www", "assets", "logo.png"),
        os.path.join(MOBILE_ROOT, "www", "assets", "icons", "icon-512.png"),
        os.path.join(MOBILE_ROOT, "android", "app", "src", "main", "assets", "public", "assets", "logo.png"),
        os.path.join(MOBILE_ROOT, "android", "app", "src", "main", "assets", "public", "assets", "icons", "icon-512.png"),
        os.path.join(MOBILE_ROOT, "ios", "App", "App", "public", "assets", "logo.png"),
        os.path.join(MOBILE_ROOT, "ios", "App", "App", "public", "assets", "icons", "icon-512.png"),
    ]

    paths_192 = [
        os.path.join(MOBILE_ROOT, "assets", "icons", "icon-192.png"),
        os.path.join(MOBILE_ROOT, "www", "assets", "icons", "icon-192.png"),
        os.path.join(MOBILE_ROOT, "android", "app", "src", "main", "assets", "public", "assets", "icons", "icon-192.png"),
        os.path.join(MOBILE_ROOT, "ios", "App", "App", "public", "assets", "icons", "icon-192.png"),
    ]

    for p in paths_512:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        logo_512.save(p, "PNG")
        print(f"Saved: {p}")

    for p in paths_192:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        icon_192.save(p, "PNG")
        print(f"Saved: {p}")

    # iOS AppIcon 1024x1024
    ios_appicon = os.path.join(MOBILE_ROOT, "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset", "AppIcon-512@2x.png")
    if os.path.exists(os.path.dirname(ios_appicon)):
        src.save(ios_appicon, "PNG")
        print(f"Saved iOS AppIcon: {ios_appicon}")

    # 2. Android Mipmap Icons
    # Mipmap densities: mdpi (48), hdpi (72), xhdpi (96), xxhdpi (144), xxxhdpi (192)
    mipmap_configs = [
        ("mipmap-mdpi", 48, 108),
        ("mipmap-hdpi", 72, 162),
        ("mipmap-xhdpi", 96, 216),
        ("mipmap-xxhdpi", 144, 324),
        ("mipmap-xxxhdpi", 192, 432),
    ]

    res_dir = os.path.join(MOBILE_ROOT, "android", "app", "src", "main", "res")

    for folder, icon_sz, fg_sz in mipmap_configs:
        fdir = os.path.join(res_dir, folder)
        os.makedirs(fdir, exist_ok=True)

        # ic_launcher.png (square/legacy)
        launcher_img = src.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(fdir, "ic_launcher.png"), "PNG")

        # ic_launcher_round.png (with clean circular clip)
        mask = Image.new("L", (icon_sz, icon_sz), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, icon_sz - 1, icon_sz - 1), fill=255)
        round_img = Image.new("RGBA", (icon_sz, icon_sz), (0, 0, 0, 0))
        round_img.paste(launcher_img, (0, 0), mask=mask)
        round_img.save(os.path.join(fdir, "ic_launcher_round.png"), "PNG")

        # ic_launcher_foreground.png (Adaptive icon safe zone is ~71% of fg_sz)
        content_sz = int(round(fg_sz * 0.713))
        scaled_content = src.resize((content_sz, content_sz), Image.Resampling.LANCZOS)
        fg_canvas = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        offset = (fg_sz - content_sz) // 2
        fg_canvas.paste(scaled_content, (offset, offset))
        fg_canvas.save(os.path.join(fdir, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated mipmap in {folder}: ic_launcher ({icon_sz}), round ({icon_sz}), foreground ({fg_sz})")

    # Update ic_launcher_background.xml to pure black #000000
    bg_xml_path = os.path.join(res_dir, "values", "ic_launcher_background.xml")
    if os.path.exists(bg_xml_path):
        with open(bg_xml_path, "w", encoding="utf-8") as f:
            f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#000000</color>\n</resources>\n')
        print("Updated ic_launcher_background.xml to #000000")

    # 3. Splash screens (centered logo on pure dark background)
    splash_targets = [
        ("drawable", 480, 320),
        ("drawable-land-mdpi", 480, 320),
        ("drawable-land-hdpi", 800, 480),
        ("drawable-land-xhdpi", 1280, 720),
        ("drawable-land-xxhdpi", 1600, 960),
        ("drawable-land-xxxhdpi", 1920, 1280),
        ("drawable-port-mdpi", 320, 480),
        ("drawable-port-hdpi", 480, 800),
        ("drawable-port-xhdpi", 720, 1280),
        ("drawable-port-xxhdpi", 960, 1600),
        ("drawable-port-xxxhdpi", 1280, 1920),
    ]

    for folder, w, h in splash_targets:
        sdir = os.path.join(res_dir, folder)
        os.makedirs(sdir, exist_ok=True)
        splash_img = Image.new("RGB", (w, h), (0, 0, 0))

        # Logo size on splash should be ~35% of min dimension
        logo_dim = int(min(w, h) * 0.45)
        logo_splash = src.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        pos = ((w - logo_dim) // 2, (h - logo_dim) // 2)
        splash_img.paste(logo_splash, pos, mask=logo_splash.split()[3])
        splash_img.save(os.path.join(sdir, "splash.png"), "PNG")
        print(f"Generated splash: {folder}/splash.png ({w}x{h})")

    # iOS splash screens
    ios_splash_dir = os.path.join(MOBILE_ROOT, "ios", "App", "App", "Assets.xcassets", "Splash.imageset")
    if os.path.exists(ios_splash_dir):
        for sname in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]:
            sp_path = os.path.join(ios_splash_dir, sname)
            ios_splash = Image.new("RGB", (2732, 2732), (0, 0, 0))
            logo_splash = src.resize((1024, 1024), Image.Resampling.LANCZOS)
            ios_splash.paste(logo_splash, ((2732 - 1024) // 2, (2732 - 1024) // 2), mask=logo_splash.split()[3])
            ios_splash.save(sp_path, "PNG")
            print(f"Saved iOS splash: {sp_path}")

    print("\nAll mobile logos, app icons, and splash screens successfully generated!")

if __name__ == "__main__":
    generate_assets()
