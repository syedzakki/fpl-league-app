import { NextResponse } from "next/server";
import { TEAM_MEMBERS, LEAGUE_CONFIG, FPL_API } from "@/lib/constants";

// Direct FPL API approach - no recursive calls
interface FPLTeamEntry {
  id: number;
  name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
}

async function fetchTeamEntry(teamId: string): Promise<FPLTeamEntry | null> {
  try {
    const response = await fetch(FPL_API.TEAM_ENTRY(teamId), {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const teamIds = Object.keys(TEAM_MEMBERS);
    
    // Fetch all team entries in parallel directly from FPL API
    const teamEntries = await Promise.all(
      teamIds.map(id => fetchTeamEntry(id))
    );
    
    // Build leaderboard from FPL API data
    const leaderboardData = teamIds.map((teamId, index) => {
      const entry = teamEntries[index];
      const userName = TEAM_MEMBERS[teamId];
      
      return {
        teamId,
        userName,
        teamName: entry?.name || userName,
        totalPoints: entry?.summary_overall_points || 0,
        overallRank: entry?.summary_overall_rank || 0,
        gwWins: 0,
        secondFinishes: 0,
        lastFinishes: 0,
        captaincyWins: 0,
        leaderboardPos: 0,
      };
    });
    
    // Sort by total points and assign positions
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    const leaderboard = leaderboardData.map((team, index) => ({
      ...team,
      leaderboardPos: index + 1,
    }));
    
    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", leaderboard: [] },
      { status: 500 }
    );
  }
}
