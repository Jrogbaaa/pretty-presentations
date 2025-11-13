# Presenton Integration Guide

This guide explains how to set up and use Presenton as an alternative presentation engine for the Look After You AI Presentation Generator.

## What is Presenton?

**Presenton** is an open-source AI presentation generator that runs locally via Docker. It provides:

- **AI-powered slide generation** with OpenAI, Google Gemini, or Ollama
- **Free image generation** via Pexels (no API costs)
- **HTML/CSS-based templates** for modern, responsive designs
- **PPTX export** compatible with PowerPoint, Google Slides, and Canva

## Why Use Presenton?

### Cost Savings
- **75% cheaper** than standard generator ($0.02 vs $0.08-0.14 per presentation)
- Free images via Pexels (vs $0.06-0.12 for Nano Banana)
- Uses same OpenAI API key you already have

### Design Flexibility
- Access to Presenton's HTML/CSS template system
- Different visual styles and layouts
- Easy to customize with web technologies

### Zero Risk
- Your existing generator remains fully functional
- Presenton is optional and can be enabled/disabled
- Automatic fallback to standard generator if Presenton fails

## Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Requires ~2GB RAM and 5GB disk space

2. **API Keys** (already have these):
   - OpenAI API key (you already use this)
   - Pexels API key (free from https://www.pexels.com/api/)

## Installation

### Step 1: Get Pexels API Key

1. Go to https://www.pexels.com/api/
2. Sign up for a free account
3. Generate an API key (takes 1 minute)
4. Copy the key for the next step

### Step 2: Configure Environment Variables

Add these lines to your `.env.local` file:

```bash
# Presenton Integration
PEXELS_API_KEY=your_pexels_api_key_here
NEXT_PUBLIC_ENABLE_PRESENTON=true
PRESENTON_API_URL=http://localhost:5001
```

**Note**: Your existing `OPENAI_API_KEY` will be used by Presenton automatically.

### Step 3: Start Presenton

Use the management script to start Presenton:

```bash
./scripts/presenton-docker.sh start
```

This will:
1. Pull the Presenton Docker image (~500MB, one-time download)
2. Start the container on port 5001
3. Wait for health check to pass
4. Show confirmation when ready

**First-time setup takes 2-3 minutes.** Subsequent starts take 10-20 seconds.

## Usage

### Selecting Presenton in the UI

1. Fill out your client brief as usual
2. Scroll down to the **Presentation Engine** section (below template selection)
3. Select **Presenton (AI-Enhanced)** option
4. Check the status indicator shows "Online" (green checkmark)
5. Click **Generate Presentation**

The system will:
- Process your brief (same as always)
- Match influencers using LAYAI algorithm (same as always)
- Apply brand intelligence (same as always)
- Send formatted data to Presenton for slide generation ⚡ NEW
- Generate presentation with free Pexels images

### Fallback Behavior

If Presenton is unavailable, the system automatically:
1. Shows a warning message
2. Falls back to the standard generator
3. Generates your presentation as usual

**Your work is never blocked** - presentations always get generated!

## Management Scripts

### Start Presenton

```bash
./scripts/presenton-docker.sh start
```

### Check Status

```bash
./scripts/presenton-docker.sh status
```

Shows:
- Whether container is running
- Health status (healthy/starting/unhealthy)
- Access URL (http://localhost:5001)

### View Logs

```bash
./scripts/presenton-docker.sh logs
```

Press `Ctrl+C` to exit log viewer.

### Stop Presenton

```bash
./scripts/presenton-docker.sh stop
```

### Restart Presenton

```bash
./scripts/presenton-docker.sh restart
```

### Update Presenton

```bash
./scripts/presenton-docker.sh pull
./scripts/presenton-docker.sh restart
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User submits brief via UI                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Your Existing Processing (UNCHANGED)                       │
│  • Brief parsing & validation                               │
│  • Brand intelligence lookup (218 brands)                   │
│  • Influencer matching (LAYAI + 4,008 influencers)          │
│  • Content generation (OpenAI GPT-4o-mini)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    [User Choice]
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────────┐    ┌─────────────────────────┐
│ Standard Generator  │    │ Presenton Generator     │
│ • Your templates    │    │ • HTML/CSS templates    │
│ • Nano Banana imgs  │    │ • Pexels images (FREE)  │
│ • $0.08-0.14 cost   │    │ • $0.02 cost (75%↓)     │
└─────────────────────┘    └─────────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PPTX Export → Firestore Storage → Editor                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Brief Processing** (unchanged):
   - User fills brief form
   - System validates and enriches with brand intelligence
   - Matches influencers using LAYAI algorithm

2. **Engine Selection** (new):
   - User chooses Standard or Presenton
   - System checks if Presenton is available
   - Falls back to Standard if Presenton unavailable

3. **Content Formatting** (new for Presenton):
   - `presenton-adapter.ts` transforms your data into Presenton format
   - Creates rich markdown with:
     - Executive summary
     - Campaign objectives
     - Target audience
     - Influencer recommendations (grouped by tier)
     - Budget and ROI projections
     - Timeline and next steps

4. **Generation**:
   - **Standard**: Uses your templates + Nano Banana
   - **Presenton**: Sends formatted data to Docker container API

5. **Post-Processing** (unchanged):
   - Saves to Firestore
   - Uploads images to Storage
   - Shows in editor

## Cost Comparison

### Per Presentation Costs

| Component          | Standard Generator | Presenton Generator | Savings |
|--------------------|-------------------:|--------------------:|--------:|
| OpenAI API         | $0.02              | $0.02               | $0.00   |
| Image Generation   | $0.06-$0.12        | $0.00 (free)        | $0.06-$0.12 |
| **Total**          | **$0.08-$0.14**    | **$0.02**           | **$0.06-$0.12 (75%)** |

### Monthly Costs (100 presentations)

- **Standard**: $8-14/month
- **Presenton**: $2/month
- **Savings**: $6-12/month (75%)

## Troubleshooting

### Presenton Shows "Offline"

**Symptoms**: Status indicator shows red X, "Offline" message

**Solutions**:
1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Start Presenton:
   ```bash
   ./scripts/presenton-docker.sh start
   ```

3. Check logs for errors:
   ```bash
   ./scripts/presenton-docker.sh logs
   ```

### Container Fails to Start

**Symptoms**: Script shows error during startup

**Common Causes**:

1. **Port 5001 already in use**:
   ```bash
   # Find what's using port 5001
   lsof -i :5001
   # Kill the process or change Presenton port in docker-compose.presenton.yml
   ```

2. **Missing API keys**:
   - Check `.env.local` has `OPENAI_API_KEY` and `PEXELS_API_KEY`
   - Keys must be valid and have sufficient quota

3. **Docker out of memory**:
   - Open Docker Desktop → Settings → Resources
   - Increase memory to at least 4GB
   - Restart Docker

### Generation Fails with Presenton

**Symptoms**: Error message, falls back to standard generator

**Solutions**:

1. **Check Presenton is healthy**:
   ```bash
   ./scripts/presenton-docker.sh status
   ```

2. **Test Presenton directly**:
   ```bash
   curl http://localhost:5001/health
   ```
   Should return `{"status": "ok"}` or similar

3. **View detailed logs**:
   ```bash
   ./scripts/presenton-docker.sh logs
   ```
   Look for errors related to API keys or generation

4. **Restart container**:
   ```bash
   ./scripts/presenton-docker.sh restart
   ```

### Images Not Appearing in Presenton Presentations

**Cause**: Pexels API key invalid or quota exceeded

**Solution**:
1. Verify Pexels API key in `.env.local`
2. Check Pexels quota at https://www.pexels.com/api/
3. Free tier: 200 requests/hour, 20,000/month (plenty for most use cases)

## Configuration

### Changing Presenton Port

Edit `docker-compose.presenton.yml`:

```yaml
ports:
  - "5002:80"  # Change 5001 to 5002 (or any available port)
```

Then update `.env.local`:

```bash
PRESENTON_API_URL=http://localhost:5002
```

Restart container for changes to take effect.

### Using Different LLM Provider

By default, Presenton uses OpenAI (same as your standard generator).

To use Google Gemini instead, edit `docker-compose.presenton.yml`:

```yaml
environment:
  - LLM=google
  - GOOGLE_API_KEY=${GOOGLE_AI_API_KEY}
  - IMAGE_PROVIDER=gemini_flash  # Google can generate images too
```

### Customizing Presentation Output

Presenton's request includes these customizable parameters (in `presenton-adapter.ts`):

```typescript
{
  tone: "professional",         // casual, funny, educational, sales_pitch
  verbosity: "standard",        // concise, text-heavy
  n_slides: 10,                 // Number of slides
  language: "English",          // Output language
  template: "general",          // Presenton template ID
  include_table_of_contents: true,
  include_title_slide: true,
}
```

Modify `generatePresentationWithPresenton` function to customize these values.

## Production Deployment

### Running Presenton in Production

For production use, consider:

1. **Use Docker Compose with restart policy**:
   ```yaml
   restart: always
   ```
   (Already configured in `docker-compose.presenton.yml`)

2. **Set up health monitoring**:
   ```bash
   # Add to cron for monitoring
   */5 * * * * /path/to/scripts/presenton-docker.sh status || /path/to/scripts/presenton-docker.sh start
   ```

3. **Configure resource limits**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 4G
   ```

4. **Set up logging**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

### Alternative: Hosted Presenton

If you don't want to self-host:
1. Deploy Presenton to a cloud server (AWS, DigitalOcean, etc.)
2. Update `PRESENTON_API_URL` to point to your server
3. Ensure proper security (API authentication, HTTPS, etc.)

## FAQ

### Can I use both generators?

**Yes!** You can switch between engines per presentation:
- Some clients get standard generator (your templates)
- Other clients get Presenton (different style)
- Compare outputs side-by-side
- Use whichever produces better results for each brief

### Does Presenton have access to my influencer data?

**Yes, but only at generation time.** The data flow:
1. Your system matches influencers using LAYAI
2. Selected influencers sent to Presenton with brief
3. Presenton generates presentation
4. Data not persisted by Presenton (stateless)

### Will my team need to learn Docker?

**No!** The management scripts handle all Docker complexity:
- `./scripts/presenton-docker.sh start` - that's it!
- No Docker commands needed
- Scripts provide friendly output and error messages

### What if I want to remove Presenton?

Easy removal:
1. Stop container: `./scripts/presenton-docker.sh stop`
2. Remove container: `docker-compose -f docker-compose.presenton.yml down -v`
3. Remove image: `docker rmi ghcr.io/presenton/presenton:latest`
4. Set `NEXT_PUBLIC_ENABLE_PRESENTON=false` in `.env.local`

No changes to your code needed - Presenton selector won't appear in UI.

## Support

### Getting Help

1. **Check logs first**:
   ```bash
   ./scripts/presenton-docker.sh logs
   ```

2. **Verify configuration**:
   - API keys in `.env.local`
   - Docker Desktop running
   - Port 5001 available

3. **Presenton documentation**:
   - GitHub: https://github.com/presenton/presenton
   - Docs: https://presenton.ai/docs

4. **Internal support**:
   - Contact: hello@lookafteryou.agency
   - Include: Logs, error messages, brief details

## Next Steps

1. ✅ Install Docker Desktop (if not already installed)
2. ✅ Get Pexels API key (free, takes 1 minute)
3. ✅ Add API keys to `.env.local`
4. ✅ Start Presenton: `./scripts/presenton-docker.sh start`
5. ✅ Test with a sample brief
6. ✅ Compare results with standard generator
7. ✅ Decide which engine to use for each client

**Ready to save 75% on image costs? Let's go!** 🚀

