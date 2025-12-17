# Daily Auto-Update Setup

## Production URL
**https://fpl-app-sooty.vercel.app**

## Cron Job Configuration

The app is configured to automatically refresh all data daily at **23:59 UTC** (end of day).

### How It Works

1. **Vercel Cron Job** runs daily at 23:59 UTC
2. Calls `/api/cron/refresh` endpoint
3. Refreshes cache for all API routes:
   - `/api/sheets`
   - `/api/fpl`
   - `/api/fpl-league`
   - `/api/current-gameweek`
   - `/api/recommendations`
   - `/api/leaderboard`

### Configuration Files

- `vercel.json` - Contains cron schedule: `"59 23 * * *"` (23:59 UTC daily)
- `app/api/cron/refresh/route.ts` - Cron endpoint that refreshes all caches

### Requirements

**Note:** Vercel Cron Jobs require a **Pro plan** ($20/month). 

If you don't have Pro plan, you can:
1. Use an external cron service (e.g., cron-job.org, EasyCron) to call:
   ```
   https://fpl-app-sooty.vercel.app/api/cron/refresh
   ```
   Set it to run daily at 23:59 UTC

2. Or manually trigger the endpoint when needed

### Environment Variables

- `CRON_SECRET` - Optional security token (already set in Vercel)

### Testing

You can manually test the cron endpoint:
```bash
curl https://fpl-app-sooty.vercel.app/api/cron/refresh
```

Or visit it in your browser (if no CRON_SECRET is required).

