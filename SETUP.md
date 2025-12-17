# FPL League App - Setup & Testing Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd fpl-app
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_SHEET_ID=1VCSA0pfSLoN305EW8jPS20Iu1QxiWwG0TIAR6zTVKmw
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Google Sheets Integration

### Option 1: Public Sheet (Easiest)

If your Google Sheet is public, the app will automatically fetch data via CSV export.

1. Make sure your Google Sheet is set to "Anyone with the link can view"
2. The app will fetch data automatically
3. Check the browser console for any errors

### Option 2: Test with Mock Data

The app includes mock data that will be used if the sheet cannot be accessed:

- Navigate to `/api/sheets` to see the raw API response
- Check if `mockData: true` is present in the response
- The app will still function with mock data for development

### Option 3: Google Sheets API (Production)

For production use with private sheets:

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in details and create
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > JSON
   - Download the JSON file

4. **Share Sheet with Service Account**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (from the JSON file: `client_email`)
   - Give it "Viewer" access

5. **Add Credentials to App**
   - Add to `.env.local`:
     ```
     GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
     GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     ```
   - Copy the `private_key` from the JSON file (keep the newlines as `\n`)

## Testing Checklist

### ✅ Basic Functionality
- [ ] App loads without errors
- [ ] Navigation works between pages
- [ ] Dashboard shows stats cards
- [ ] Leaderboard displays data
- [ ] Team stats page loads
- [ ] Gameweeks page shows data
- [ ] Financial tracker displays

### ✅ Data Integration
- [ ] Google Sheets data is fetched
- [ ] Leaderboard shows correct teams
- [ ] Gameweek data is parsed correctly
- [ ] Team names are displayed
- [ ] Points are calculated correctly

### ✅ Features
- [ ] Auto-refresh works (check after 5 minutes)
- [ ] Manual refresh button works
- [ ] Radar charts display on team stats
- [ ] Financial calculations are correct
- [ ] Gameweek payouts are calculated

### ✅ UI/UX
- [ ] Responsive on mobile
- [ ] Dark mode works (if enabled)
- [ ] Loading states display
- [ ] Error states handle gracefully
- [ ] Navigation highlights active page

## Troubleshooting

### Data Not Loading

**Problem**: No data appears on pages

**Solutions**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_SHEET_ID` is correct
3. Test `/api/sheets` endpoint directly
4. Check if sheet is public or credentials are correct
5. Verify CORS settings if using API

### CSV Parsing Issues

**Problem**: Data appears but is incorrect

**Solutions**:
1. Check the CSV export format matches expected structure
2. Verify team IDs are in row 3 (B3:H3)
3. Verify team names are in row 4
4. Check gameweek data starts at row 5
5. Review `lib/csv-parser.ts` for parsing logic

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Check TypeScript errors: `npm run lint`
2. Verify all imports are correct
3. Check for missing dependencies
4. Clear `.next` folder and rebuild

### API Route Errors

**Problem**: API routes return errors

**Solutions**:
1. Check server logs in terminal
2. Verify environment variables are set
3. Test API routes directly: `http://localhost:3000/api/sheets`
4. Check network tab in browser DevTools

## Google Apps Script Integration

Your existing Google Apps Script updates the sheet. The app reads from the sheet, so:

1. **Script Updates Sheet** → Google Apps Script runs and updates data
2. **App Reads Sheet** → Next.js app fetches updated data
3. **Auto-refresh** → App refreshes every 5 minutes

### Testing Script Integration

1. Run your Google Apps Script manually
2. Wait a few seconds for sheet to update
3. Click "Refresh" in the app
4. Verify new data appears

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SHEET_ID`
   - `NEXT_PUBLIC_APP_URL` (auto-set by Vercel)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` (if using API)
   - `GOOGLE_PRIVATE_KEY` (if using API)
4. Deploy

### Environment Variables for Production

```
NEXT_PUBLIC_SHEET_ID=1VCSA0pfSLoN305EW8jPS20Iu1QxiWwG0TIAR6zTVKmw
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Next Steps

1. **Customize Styling**: Edit `app/globals.css` for colors/themes
2. **Add Features**: Extend components in `components/`
3. **Enhance Charts**: Add more chart types in `components/charts/`
4. **Optimize Performance**: Add caching, pagination, etc.
5. **Add Authentication**: If you want to restrict access

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review server logs
3. Test API endpoints directly
4. Verify Google Sheets access
5. Check environment variables

