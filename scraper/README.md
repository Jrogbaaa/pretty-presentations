# StarNgage Influencer Scraper

## Overview
This project provides browser console scripts to scrape influencer data from StarNgage and combine the results into a master CSV file. The solution successfully extracted 1000 influencers (ranks 3001-4000) from StarNgage Spain listings.

## Problem
StarNgage has Cloudflare protection that blocks automated browsers, so we need to run the scraper from your regular browser where you're already logged in.

## Solution: Browser Console Scripts

We created two JavaScript console scripts that run directly in your browser:

### Step-by-Step Instructions

1. **Open StarNgage in your browser**
   - Navigate to: https://starngage.com/plus/en-us/influencer/ranking/instagram/spain?page=31
   - Make sure you're logged in and can see the influencer table

2. **Open Developer Tools**
   - **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
   - **Mac**: Press `Cmd + Option + I`
   - Or right-click anywhere on the page and select "Inspect"

3. **Go to the Console tab**
   - In the Developer Tools panel, click on the "Console" tab at the top

4. **Copy the script**
   - Open the file: `scraper/starngage-browser-script.js`
   - Select all the code (`Cmd+A` or `Ctrl+A`)
   - Copy it (`Cmd+C` or `Ctrl+C`)

5. **Paste and run**
   - Click in the console (you'll see a `>` prompt)
   - Paste the code (`Cmd+V` or `Ctrl+V`)
   - Press `Enter` to run

6. **Wait for completion**
   - The script will automatically:
     - Extract influencers from page 31
     - Click "Next" to go to page 32, 33, etc.
     - Continue until it reaches the last page
     - Download a CSV file automatically
   
   - You'll see progress messages like:
     ```
     🚀 Starting StarNgage scraper from page 31...
     📄 Scraping page 31...
     ✅ Extracted 100 influencers from page 31
     📊 Total collected: 100 influencers
     📄 Scraping page 32...
     ```

7. **Get your data**
   - When complete, a file called `starngage_influencers_scraped.csv` will be automatically downloaded
   - The CSV format matches your existing database format

## What the Script Does

- Starts from page 31 (as requested)
- Extracts: Rank, Name, Followers, Engagement Rate, Topics/Genre, Instagram Handle
- Sets Country as "Spain" for all entries
- Leaves Demographics blank (as requested)
- Automatically navigates through all remaining pages
- Formats data to match your existing CSV structure
- Downloads the complete CSV file

## Output Format

The CSV will have these columns matching your existing format:
```
Rank,Name ,Followers,Engagement Rate,Country,GENRE,Demographics,Instagram Handle
```

## Troubleshooting

**If the script stops early:**
- Check if you've been logged out
- Refresh the page and run the script again
- The script has a safety limit of 200 pages to prevent infinite loops

**If data looks wrong:**
- The script waits 2-3 seconds between pages for loading
- If your internet is slow, you might need to increase the wait times in the script

**If no file downloads:**
- Check your browser's download settings
- Some browsers block automatic downloads - check for a notification bar at the top

## Alternative: Single Page Extraction (Recommended for Testing)

If you want to test first or prefer manual control, use `starngage-single-page.js`:

1. Navigate to any page (e.g., page 31)
2. Open Console and paste the single-page script
3. It will extract only the current page and copy the CSV to your clipboard
4. Paste into a text file
5. Manually go to the next page and repeat

This is safer and lets you verify the data quality before doing bulk extraction.

### Quick Test

1. Go to: https://starngage.com/plus/en-us/influencer/ranking/instagram/spain?page=31
2. Open Console (F12)
3. Copy and paste `starngage-single-page.js`
4. Press Enter
5. Check the console output - it should show ~100 influencers
6. The CSV data is automatically copied to your clipboard

If this works well, then run the full auto-pagination script!

## Troubleshooting

**If the script stops early:**
- Check if you've been logged out
- Refresh the page and run the script again
- The script has a safety limit of 200 pages to prevent infinite loops

**If data looks wrong:**
- The script waits 2-3 seconds between pages for loading
- If your internet is slow, you might need to increase the wait times in the script
- Try the single-page version first to verify the extraction logic

**If no file downloads:**
- Check your browser's download settings
- Some browsers block automatic downloads - check for a notification bar at the top
- Use the single-page version which copies to clipboard instead

**If Cloudflare blocks you:**
- The script needs to run in YOUR browser where you're logged in
- Don't try to run it in an automated browser or curl
- Make sure you can manually see the influencer table before running the script

## Results

Successfully scraped **1000 unique influencers** from StarNgage:
- **Rank Range:** 3001-4000
- **Output Files:**
  - 10 individual CSV files (100 influencers each)
  - 1 master combined CSV: `starngage_master_3000-4000.csv`
- **Data Quality:** Clean names, handles, followers, engagement rates, topics/genres
- **Format:** Matches existing influencer database structure

## CSV Format

```csv
Rank,Name ,Followers,Engagement Rate,Country,GENRE,Demographics,Instagram Handle
3001,"Angel Grajales",144.7K,1.5%,Spain,"EntertainmentandMusicFunny",,@eljarcor_
```

Columns:
- **Rank:** Position in StarNgage ranking
- **Name:** Influencer full name
- **Followers:** Follower count (e.g., 144.7K, 3.1M)
- **Engagement Rate:** Percentage (e.g., 1.5%)
- **Country:** "Spain" (hardcoded for all)
- **GENRE:** Combined topics/categories (no spaces)
- **Demographics:** Empty (all Spain-based)
- **Instagram Handle:** Username with @ prefix

## Files

- **`starngage-browser-script.js`** - Full auto-scraper (all pages)
- **`starngage-single-page.js`** - Single page extractor (for testing)
- **`README.md`** - This documentation file

## Python CSV Combiner

A Python script to combine multiple CSV files into one master file:

```python
# Combines all CSV files, removes duplicates, sorts by rank
python3 combine_csvs.py
```

Features:
- Removes duplicate Instagram handles
- Sorts by rank number
- Preserves data quality
- Reports statistics

## Next Steps

The scraped data can now be merged with your existing influencer database (`top 3000 influencers in spain - Influencers.csv`) to expand your Spain influencer list from 3000 to 4000 entries.

## Troubleshooting Tips

**Script doesn't work:**
- Make sure you're logged into StarNgage
- Verify you can see the influencer table manually
- Try the single-page script first to test

**Missing data:**
- Check that page loaded completely before running
- Increase wait times in the script if internet is slow

**Duplicates:**
- The Python combiner script automatically removes duplicates

**Need more pages:**
- Change the starting page number in the script
- The auto-scraper will continue from that page to the end

Let me know if you need help with any step!

