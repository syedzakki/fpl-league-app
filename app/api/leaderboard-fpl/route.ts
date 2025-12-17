import { NextResponse } from "next/server"
import { TEAM_MEMBERS, FPL_API } from "@/lib/constants"
import { processTeamTransfers, SPECIAL_TRANSFER_EVENTS } from "@/lib/transfer-calculator"

interface FPLTeamEntry {
  id: number
  name: string
  player_first_name: string
  player_last_name: string
  summary_overall_points: number
  summary_event_points: number
  summary_overall_rank: number
}

interface FPLTeamHistory {
  current: Array<{
    event: number
    points: number
    total_points: number
    event_transfers: number
    event_transfers_cost: number
    points_on_bench: number
  }>
  past: any[]
  chips: any[]
}

async function fetchTeamEntry(teamId: string): Promise<FPLTeamEntry | null> {
  try {
    const response = await fetch(FPL_API.TEAM_ENTRY(teamId), {
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching entry for team ${teamId}:`, error)
    return null
  }
}

async function fetchTeamHistory(teamId: string): Promise<FPLTeamHistory | null> {
  try {
    const response = await fetch(FPL_API.TEAM_HISTORY(teamId), {
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching history for team ${teamId}:`, error)
    return null
  }
}

export async function GET() {
  try {
    const teamIds = Object.keys(TEAM_MEMBERS)
    
    // Fetch all team data in parallel
    const [teamEntries, teamHistories] = await Promise.all([
      Promise.all(teamIds.map(id => fetchTeamEntry(id))),
      Promise.all(teamIds.map(id => fetchTeamHistory(id))),
    ])
    
    // Process each team's data - use actual FPL API names, fallback to mapping
    const leaderboardData = teamIds.map((teamId, index) => {
      const entry = teamEntries[index]
      const history = teamHistories[index]
      // Use actual player name from FPL API, fallback to mapping
      const userName = entry?.player_first_name && entry?.player_last_name
        ? `${entry.player_first_name} ${entry.player_last_name}`
        : entry?.name || TEAM_MEMBERS[teamId] || `Team ${teamId}`
      
      if (!entry || !history || !history.current) {
        return {
          teamId,
          userName,
          position: 0,
          totalPointsFPL: 0, // FPL total (includes hits)
          totalPointsNoHits: 0, // Without hits
          totalHits: 0,
          totalHitCost: 0,
          gameweeks: [],
        }
      }
      
      // Calculate points without hits
      const gameweekData = history.current.map((gw: any) => ({
        gameweek: gw.event,
        transfers: gw.event_transfers || 0,
        transfersCost: gw.event_transfers_cost || 0,
        points: gw.points, // GW points before hits
      }))
      
      const transferData = processTeamTransfers(
        teamId,
        userName,
        gameweekData,
        SPECIAL_TRANSFER_EVENTS
      )
      
      // FPL total points (includes hits) vs our calculated total without hits
      const totalPointsFPL = entry.summary_overall_points // FPL total (includes hits)
      const totalPointsNoHits = transferData.totalGwPoints // Sum of GW points without hits
      
      return {
        teamId,
        userName,
        position: 0, // Will be set after sorting
        totalPointsFPL,
        totalPointsNoHits,
        totalHits: transferData.totalHits,
        totalHitCost: transferData.totalHitCost,
        gameweeks: history.current.map((gw: any) => ({
          gameweek: gw.event,
          points: gw.points, // Before hits
          pointsWithHits: gw.points + (gw.event_transfers_cost || 0), // After hits
          transfers: gw.event_transfers || 0,
          transfersCost: gw.event_transfers_cost || 0,
        })),
      }
    })
    
    // Sort by totalPointsNoHits (without hits) for league leaderboard
    leaderboardData.sort((a, b) => b.totalPointsNoHits - a.totalPointsNoHits)
    
    // Add positions
    leaderboardData.forEach((entry, index) => {
      entry.position = index + 1
    })
    
    return NextResponse.json({
      success: true,
      data: leaderboardData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching FPL leaderboard:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard data" },
      { status: 500 }
    )
  }
}

