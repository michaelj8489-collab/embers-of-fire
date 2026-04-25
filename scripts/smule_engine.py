import re
import sys
from playwright.sync_api import sync_playwright

# --- 1. THE TOOLS ---

def run_smule_mission(url):
    """
    The Rockstar Engine: Sniffs the link, grabs the song title, 
    cleans the name, and downloads it in one go.
    """
    with sync_playwright() as p:
        print("Launching Ghost Browser...")
        # Let Playwright use its default internal Chromium
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        context = browser.new_context()
        page = context.new_page()

        captured_url = {"url": None}

        # The Sniffer: Listen for the media file
        def handle_request(request):
            if '.mp4' in request.url and ("smu.le" in request.url or "smule.com" in request.url):
                if not captured_url["url"]:
                    captured_url["url"] = request.url

        page.on("request", handle_request)

        try:
            print(f"Investigating: {url}")
            page.goto(url, wait_until="networkidle", timeout=60000)
            print("Listening for media signals...")
            page.wait_for_timeout(5000) 

            # 1. Grab the Song Title
            page_title = page.title()
            
            # 2. Clean the Title for Windows (removes stars, emojis, etc.)
            clean_title = "".join([c for c in page_title if c.isalnum() or c in (' ', '-', '_')]).strip()
            final_filename = f"{clean_title[:50]}.mp4"

            if captured_url["url"]:
                target_url = captured_url["url"]
                print(f"BOOM! Link Caught: {target_url}")
                
                # 3. Download the file using the secure context
                print(f"Downloading as: {final_filename}...")
                response = context.request.get(target_url)
                
                if response.status == 200:
                    with open(final_filename, "wb") as f:
                        f.write(response.body())
                    print(f"Success! '{final_filename}' is in your project folder.")
                else:
                    print(f"Download failed: {response.status}")
            else:
                print("Total lockout. The player never sent the file link.")

            browser.close()
        except Exception as e:
            print(f"Mission Error: {e}")
            browser.close()

# --- 2. THE MISSION ---

# Replace with any Smule recording link
target_link = sys.argv[1] 

if "PASTE" in target_link:
    print("Don't forget to paste the link!")
else:
    run_smule_mission(target_link)