import os
import re
import json
from playwright.sync_api import sync_playwright

def get_smule_data(target_url):
    """
    SEAL TEAM SIX - MASTER EDITION
    1. Camouflage (Custom Cookies & Headers)
    2. Wire Tapper (Network Sniffing)
    3. The Trigger (Clicking Play)
    4. Metadata Scrape (OG Tags)
    5. JSON Hunter (Internal Variables)
    6. Brute Force (Regex Scan)
    """
    
    # --- 1. THE CAMOUFLAGE ---
    # Paste that giant cookie string from your browser between the quotes below
    SMULE_COOKIE = "PLACEHOLDER_FOR_YOUR_SMULE_COOKIE_STRING"

    with sync_playwright() as p:
        print(f"Deploying Seal Team Six to: {target_url}")
        
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        
        # This makes the Oracle Server look exactly like your laptop in Brunswick
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
            extra_http_headers={
                "Cookie": SMULE_COOKIE,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Dest": "document"
            }
        )
        page = context.new_page()

        captured_data = {"url": None, "title": "Unknown Song"}

        # --- 2. THE WIRE TAPPER ---
        def handle_request(request):
            if '.mp4' in request.url and ("smu.le" in request.url or "smule.com" in request.url):
                if not captured_data["url"]:
                    captured_data["url"] = request.url
                    print("✅ Wire Tapper caught the signal!")

        page.on("request", handle_request)

        try:
            # Head to the song page
            page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
            
            # --- 3. THE TRIGGER ---
            print("Deploying The Trigger (Clicking Play)...")
            try:
                # Attempt to click the main play button overlay
                page.click('div[class*="PlayButton"]', timeout=5000)
                page.wait_for_timeout(2000)
            except:
                print("⚠️ Trigger delayed - trying backup click.")
                page.mouse.click(500, 500) # Click the center of the screen

            # --- 4. METADATA SCRAPE ---
            if not captured_data["url"]:
                print("Scanning Metadata...")
                video_meta = page.locator('meta[property="og:video:url"]').get_attribute("content")
                if video_meta:
                    captured_data["url"] = video_meta
                    print("✅ Metadata Scrape successful!")

            # --- 5. JSON HUNTER ---
            if not captured_data["url"]:
                print("Deploying JSON Hunter...")
                content = page.content()
                json_match = re.search(r'window\.Smule\s*=\s*({.*?});', content)
                if json_match:
                    try:
                        smule_data = json.loads(json_match.group(1))
                        url = smule_data.get('recording', {}).get('media_url')
                        if url:
                            captured_data["url"] = url
                            print("✅ JSON Hunter found the hidden link!")
                    except:
                        pass

            # --- 6. BRUTE FORCE ---
            if not captured_data["url"]:
                print("Running Brute Force Regex...")
                brute_match = re.search(r'https?://[^"\'\s]+\.mp4[^"\'\s]*', page.content())
                if brute_match:
                    captured_data["url"] = brute_match.group(0)
                    print("✅ Brute Force extracted the URL!")

            # Final Cleanup: Get the Song Name
            page_title = page.title()
            captured_data["title"] = "".join([c for c in page_title if c.isalnum() or c in (' ', '-', '_')]).strip()
            
            browser.close()
            
            if captured_data["url"]:
                return captured_data
            else:
                return {"error": "All 6 Seal Team members missed the target."}

        except Exception as e:
            if browser: browser.close()
            return {"error": str(e)}