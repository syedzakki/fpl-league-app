import { NextResponse } from "next/server";
import { TEAM_MEMBERS, LEAGUE_CONFIG, FPL_API } from "@/lib/constants";

interface FPLTeamHistory {
  current: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  }[];
  past: any[];
  chips: any[];
}

interface FPLTeamEntry {
  id: number;
  player_first_name: string;
  player_last_name: string;
  name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
}

interface FPLGameweekPicks {
  active_chip: string | null;
  automatic_subs: any[];
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }[];
}

// Fetch team entry info
async function fetchTeamEntry(teamId: string): Promise<FPLTeamEntry | null> {
  try {
    const response = await fetch(FPL_API.TEAM_ENTRY(teamId), {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error);
    return null;
  }
}

// Fetch team history (all gameweeks)
async function fetchTeamHistory(teamId: string): Promise<FPLTeamHistory | null> {
  try {
    const response = await fetch(FPL_API.TEAM_HISTORY(teamId), {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching history for team ${teamId}:`, error);
    return null;
  }
}

// Fetch gameweek picks for a team
async function fetchGameweekPicks(teamId: string, gameweek: number): Promise<FPLGameweekPicks | null> {
  try {
    const url = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gameweek}/picks/`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching GW${gameweek} picks for team ${teamId}:`, error);
    return null;
  }
}

// Fetch bootstrap for player info
async function fetchBootstrap(): Promise<any | null> {
  try {
    const response = await fetch(FPL_API.BOOTSTRAP, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching bootstrap:", error);
    return null;
  }
}

export async function GET() {
  try {
    const teamIds = Object.keys(TEAM_MEMBERS);
    
    // Fetch bootstrap data for current gameweek and player info
    const bootstrap = await fetchBootstrap();
    if (!bootstrap) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch FPL data" },
        { status: 500 }
      );
    }
    
    // Get current/completed gameweek
    const currentEvent = bootstrap.events.find((e: any) => e.is_current);
    const finishedEvents = bootstrap.events.filter((e: any) => e.finished);
    const completedGameweeks = finishedEvents.length;
    const currentGameweek = currentEvent?.id || completedGameweeks;
    
    // Fetch all team data in parallel
    const [teamEntries, teamHistories] = await Promise.all([
      Promise.all(teamIds.map(id => fetchTeamEntry(id))),
      Promise.all(teamIds.map(id => fetchTeamHistory(id))),
    ]);
    
    // Build leaderboard from FPL API data
    const leaderboardData = teamIds.map((teamId, index) => {
      const entry = teamEntries[index];
      const history = teamHistories[index];
      const userName = TEAM_MEMBERS[teamId];
      
      if (!entry || !history) {
        return {
          teamId,
          userName,
          totalPoints: 0,
          overallRank: 0,
          gwWins: 0,
          secondFinishes: 0,
          lastFinishes: 0,
          captaincyWins: 0,
          gameweeks: [],
        };
      }
      
      return {
        teamId,
        userName,
        teamName: entry.name,
        totalPoints: entry.summary_overall_points,
        overallRank: entry.summary_overall_rank,
        currentGwPoints: entry.summary_event_points,
        gwWins: 0,
        secondFinishes: 0,
        lastFinishes: 0,
        captaincyWins: 0,
        gameweeks: history.current.map(gw => ({
          gameweek: gw.event,
          points: gw.points,
          totalPoints: gw.total_points,
          rank: gw.rank,
          overallRank: gw.overall_rank,
          transfers: gw.event_transfers,
          transfersCost: gw.event_transfers_cost,
          benchPoints: gw.points_on_bench,
        })),
      };
    });
    
    // Calculate GW wins, second finishes, last finishes for each completed gameweek
    const gameweekResults: any[] = [];
    
    for (let gw = 1; gw <= completedGameweeks; gw++) {
      const gwResults = leaderboardData
        .map(team => {
          const gwData = team.gameweeks.find(g => g.gameweek === gw);
          return {
            teamId: team.teamId,
            userName: team.userName,
            points: gwData?.points || 0,
            captaincyPoints: 0, // Will be calculated separately
          };
        })
        .filter(t => t.points > 0);
      
      if (gwResults.length === 0) continue;
      
      // Sort by points
      gwResults.sort((a, b) => b.points - a.points);
      
      const maxPoints = gwResults[0].points;
      const minPoints = gwResults[gwResults.length - 1].points;
      const secondPoints = gwResults.find(t => t.points < maxPoints)?.points;
      
      gwResults.forEach(result => {
        const team = leaderboardData.find(t => t.teamId === result.teamId);
        if (!team) return;
        
        if (result.points === maxPoints) team.gwWins++;
        if (secondPoints && result.points === secondPoints) team.secondFinishes++;
        if (result.points === minPoints && result.points !== maxPoints) team.lastFinishes++;
      });
      
      gameweekResults.push({
        gameweek: gw,
        teams: gwResults,
      });
    }
    
    // Sort leaderboard by total points
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Add leaderboard position
    const leaderboard = leaderboardData.map((team, index) => ({
      ...team,
      leaderboardPos: index + 1,
    }));
    
    // Calculate total pot
    const numTeams = teamIds.length;
    const gwPotPerWeek = numTeams * LEAGUE_CONFIG.GW_BUY_IN;
    const captaincyPotPerWeek = numTeams * LEAGUE_CONFIG.CAPTAINCY_BUY_IN;
    const totalBuyIns = numTeams * LEAGUE_CONFIG.FPL_BUY_IN;
    const totalGwPot = completedGameweeks * gwPotPerWeek;
    const totalCaptaincyPot = completedGameweeks * captaincyPotPerWeek;
    const totalPot = totalBuyIns + totalGwPot + totalCaptaincyPot;
    
    return NextResponse.json({
      success: true,
      leaderboard,
      gameweekResults,
      summary: {
        totalTeams: numTeams,
        completedGameweeks,
        currentGameweek,
        totalPot,
        totalBuyIns,
        totalGwPot,
        totalCaptaincyPot,
      },
      teamMembers: TEAM_MEMBERS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("FPL League API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

