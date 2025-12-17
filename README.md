# FPL League Dashboard

A professional-grade web application for tracking Fantasy Premier League (FPL) league performance, statistics, and finances.

## Features

- 📊 **Real-time Leaderboard** - Track team standings and rankings
- 📈 **Team Statistics** - Detailed performance analysis with radar charts
- 💰 **Financial Tracker** - Complete breakdown of buy-ins, winnings, and payouts
- 🔍 **Custom Team Lookup** - Search any FPL team by ID
- 🎯 **Auto-refresh** - Automatic data updates every 5 minutes
- 📱 **Responsive Design** - Works on all devices

## League Rules

- **FPL Buy-in**: ₹2,000 per person
- **GW Buy-in**: ₹100 per person per gameweek
- **Last Finisher**: -₹200 penalty
- **2nd Finisher**: +₹100 bonus
- **1st Finisher**: Gets the rest of the pot
- **Captaincy Buy-in**: ₹50 per person per gameweek
- **Captaincy Winner**: Gets entire captaincy pot
- **Prize Money**: 1st (₹6,000), 2nd (₹3,500), 3rd (₹2,000)
- **Number of Players**: 6

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Chart library
- **Google Sheets API** - Data source

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Sheets API access (optional, can use public CSV export)

### Installation

1. Clone the repository:
```bash
cd fpl-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `NEXT_PUBLIC_SHEET_ID`: Your Google Sheets ID
- `NEXT_PUBLIC_APP_URL`: Your app URL (default: http://localhost:3000)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google Sheets Integration

The app reads data from a Google Sheet. You have two options:

### Option 1: Public CSV Export (Easiest)
If your Google Sheet is public, the app can fetch data via CSV export. No authentication needed.

### Option 2: Google Sheets API (Recommended)
For private sheets or better performance:

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Download the JSON key file
5. Share your Google Sheet with the service account email
6. Add credentials to `.env.local`:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Project Structure

```
fpl-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── leaderboard/       # Leaderboard page
│   ├── teams/             # Team stats page
│   ├── financials/        # Financial tracker page
│   └── page.tsx           # Dashboard home
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── charts/           # Chart components
│   └── ...               # Other components
├── lib/                   # Utilities and services
│   ├── types.ts          # TypeScript types
│   ├── constants.ts      # League constants
│   ├── sheets-service.ts # Google Sheets integration
│   └── financial-calculator.ts # Financial calculations
└── ...
```

## Data Flow

1. Google Sheets (updated by Google Apps Script)
2. API Routes (`/api/sheets`, `/api/leaderboard`)
3. React Components (fetch and display data)
4. Auto-refresh every 5 minutes

## Customization

### League Configuration
Edit `lib/constants.ts` to adjust:
- Buy-in amounts
- Prize money
- Number of players
- Google Sheets configuration

### Styling
The app uses Tailwind CSS and shadcn/ui. Customize colors in `app/globals.css`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Development

### Adding New Features

1. Create components in `components/`
2. Add API routes in `app/api/`
3. Update types in `lib/types.ts`
4. Add pages in `app/`

### Testing

```bash
npm run lint
```

## Troubleshooting

### Data Not Loading
- Check Google Sheets is accessible
- Verify `NEXT_PUBLIC_SHEET_ID` is correct
- Check browser console for errors

### API Errors
- Verify Google Sheets API credentials
- Check CORS settings
- Ensure service account has access

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
