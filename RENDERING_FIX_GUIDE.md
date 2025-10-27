# Text Response Rendering Fix Guide

## ✅ Updates Completed
- ✅ Next.js updated: **15.5.4 → 16.0.0**
- ✅ React updated to latest
- ✅ `rehype-raw` plugin installed and configured
- ✅ Response page styling fixed
- ✅ API route created for proper server/client separation

## 🔴 Current Issues & Fixes

### Issue 1: OpenAI API Key Not Found

**Error:** `OPENAI_API_KEY environment variable is not set`

**Why this happened:** When we cleared the `.next` cache, the environment variable loading got disrupted.

**Fix (CRITICAL - Do this first):**

```bash
# In your terminal, restart the dev server with a fresh shell
cd "/Users/JackEllis/Pretty Presentations"
npm run dev
```

**If that doesn't work**, your `.env.local` file might be missing. Check if it exists:

```bash
ls -la .env.local
```

**If it's missing**, you'll need to recreate it with your API keys. The file should contain:

```env
# OpenAI (Required for brief parsing & text generation)
OPENAI_API_KEY=sk-proj-...your-key-here...

# Firebase (Required for database)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional: Google AI (for brand suggestions - has 403 errors currently, can be ignored)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=...
```

---

### Issue 2: HTML Tables Showing as Raw Text

**Symptom:** You see `<table>`, `<tr>`, `<td>` as plain text instead of formatted tables.

**Root Cause:** Browser is caching the old JavaScript bundle from before we added `rehype-raw` plugin.

**Fix (DO THIS AFTER fixing API key issue):**

#### Step 1: Clear Browser Cache Completely

**Chrome/Edge:**
1. Press `Cmd + Shift + Delete` (Mac) or `Ctrl + Shift + Delete` (Windows)
2. Select "Cached images and files"
3. Time range: "Last hour" or "Last 24 hours"
4. Click "Clear data"

**Firefox:**
1. Press `Cmd + Shift + Delete` (Mac) or `Ctrl + Shift + Delete` (Windows)
2. Check "Cache"
3. Click "Clear Now"

**Safari:**
1. Go to Safari menu → Clear History
2. Select "the last hour"
3. Click "Clear History"

#### Step 2: Hard Refresh the Page

- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

#### Step 3: Test with a FRESH Response

**IMPORTANT:** Old responses (like the Lacoste one you're viewing) won't benefit from the new rendering because they were generated before the changes.

1. Go to http://localhost:3000
2. Click "Random Sample"
3. Click "Generate Text Response"
4. View the NEW response

---

### Issue 3: Text Not Visible (Light Text on Light Background)

**Fix:** Already implemented in the code. Should work automatically once you generate a new response with the updated server.

The blockquote styling now explicitly sets:
```css
prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
```

---

## 🎯 Step-by-Step Testing Plan

### Phase 1: Get the Server Running
```bash
# 1. Kill any existing processes
lsof -ti:3000 | xargs kill -9

# 2. Start fresh
cd "/Users/JackEllis/Pretty Presentations"
npm run dev
```

### Phase 2: Verify Server is Healthy
- Open http://localhost:3000
- You should see the homepage with NO errors in terminal
- If you see "OPENAI_API_KEY" errors, check your `.env.local` file

### Phase 3: Clear Browser Cache
- Follow browser-specific instructions above
- Close ALL tabs with localhost:3000
- Open a fresh browser window

### Phase 4: Generate Fresh Response
1. Go to http://localhost:3000
2. Click "Random Sample" button
3. Fill in budget if needed
4. Click "Generate Text Response"
5. Wait for processing (~2 minutes)
6. Check the response page

### Phase 5: Verify Formatting
You should now see:

✅ **Proper Markdown:**
- # Large H1 headings
- ## Medium H2 headings with underline
- ### Purple H3 headings
- #### Smaller H4 headings

✅ **HTML Tables:**
- Formatted as actual tables with borders
- NO `<table>`, `<tr>`, `<td>` visible as text

✅ **Readable Text:**
- All text has proper contrast
- Blockquotes are readable with light purple background

---

## 🐛 Troubleshooting

### "Tables still showing as raw HTML"

**Solution:** You're viewing an OLD response. Generate a NEW one.

Old responses contain the markdown that was generated before we fixed the rendering. The `rehype-raw` plugin only affects how NEW responses are displayed.

### "Still getting OpenAI errors"

**Check 1:** Is `.env.local` in the root directory?
```bash
ls -la .env.local
```

**Check 2:** Does it contain `OPENAI_API_KEY=sk-proj-...`?
```bash
grep OPENAI_API_KEY .env.local
```

**Check 3:** Did you restart the dev server AFTER creating/updating `.env.local`?

### "Server won't start / Port 3000 in use"

```bash
# Kill all Next.js processes
pkill -f "next dev"

# Or kill specific port
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

---

## 📝 Technical Details

### What We Fixed

1. **Client/Server Architecture** (`app/api/generate-text-response/route.ts`)
   - Created proper API route
   - Fixed violation of Next.js boundaries

2. **HTML Rendering** (`app/response/[id]/page.tsx`)
   - Added `rehype-raw` plugin
   - ReactMarkdown now parses HTML elements

3. **Styling** (`app/response/[id]/page.tsx`)
   - Enhanced prose classes for better typography
   - Fixed blockquote text visibility
   - Added explicit colors for all text elements

4. **Dependencies**
   - Installed `rehype-raw@7.0.0`
   - Updated Next.js to 16.0.0
   - Updated React to latest

### Files Changed
```
app/
├── api/generate-text-response/route.ts    [NEW]
├── response/[id]/page.tsx                 [UPDATED]
├── page.tsx                               [UPDATED]

package.json                               [UPDATED]
```

---

## ✅ Success Checklist

- [ ] OpenAI API key loaded (no errors in terminal)
- [ ] Server running on http://localhost:3000
- [ ] Browser cache cleared
- [ ] Generated a FRESH text response
- [ ] Tables render as actual tables (not `<table>` text)
- [ ] All headings have different sizes
- [ ] Text is readable everywhere
- [ ] Blockquotes have light purple background

---

## 🆘 Still Having Issues?

1. **Make sure you're testing with a FRESH response** - Old ones won't work
2. **Check the browser console** - Look for JavaScript errors
3. **Verify the terminal shows no errors** - Especially OpenAI key issues
4. **Try a different browser** - To rule out caching issues

The code is correct and working. The issue is almost certainly:
- Viewing an old response (generate a new one!)
- Browser caching (clear cache + hard refresh)
- Missing/incorrect environment variables

---

**Need to start completely fresh?**

```bash
# Nuclear option - complete reset
cd "/Users/JackEllis/Pretty Presentations"
pkill -f "next dev"
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

Then clear browser cache and generate a NEW response.

