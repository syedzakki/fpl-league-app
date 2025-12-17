import { NextResponse } from "next/server";
import { parseCSV } from "@/lib/csv-parser";

// API route to fetch data from Google Sheets
// This will proxy requests to Google Sheets API or use a public CSV export

export async function GET(request: Request) {
  try {
    const spreadsheetId = process.env.NEXT_PUBLIC_SHEET_ID || "1VCSA0pfSLoN305EW8jPS20Iu1QxiWwG0TIAR6zTVKmw";
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    
    // Try to fetch from public CSV export
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0&t=${Date.now()}`;
      const response = await fetch(csvUrl, { 
        next: refresh ? { revalidate: 0 } : { revalidate: 60 },
        cache: refresh ? 'no-store' : 'default',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Cache-Control': refresh ? 'no-cache' : 'max-age=60',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV using our parser
      const parsedData = parseCSV(csvText);
      
      return NextResponse.json({
        success: true,
        data: {
          ...parsedData,
          completedGameweeks: parsedData.completedGameweeks || parsedData.gameweekData.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching from Google Sheets:", error);
      
      // Return mock data for development
      return NextResponse.json({
        success: false,
        error: "Could not fetch from Google Sheets",
        mockData: true,
        data: getMockData(),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getMockData() {
  // Mock data based on the spreadsheet structure
  return {
    summary: [
      { userName: "Zakki", gwWins: 2, secondFinishes: 1, lastFinishes: 1, captaincyWins: 3, leaderboardPos: 1 },
      { userName: "Chiru", gwWins: 2, secondFinishes: 3, lastFinishes: 0, captaincyWins: 2, leaderboardPos: 2 },
      { userName: "Wasim", gwWins: 7, secondFinishes: 0, lastFinishes: 0, captaincyWins: 0, leaderboardPos: 3 },
      { userName: "Sunad", gwWins: 1, secondFinishes: 0, lastFinishes: 0, captaincyWins: 0, leaderboardPos: 4 },
      { userName: "Tejas", gwWins: 1, secondFinishes: 0, lastFinishes: 0, captaincyWins: 1, leaderboardPos: 5 },
      { userName: "Anuj", gwWins: 1, secondFinishes: 0, lastFinishes: 0, captaincyWins: 2, leaderboardPos: 6 },
    ],
    gameweekData: [],
    teamIds: ["6196491", "1717953", "3296482", "8805762", "4375314", "2160638"],
  };
}

