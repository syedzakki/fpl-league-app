import { NextResponse } from "next/server"
import { TEAM_MEMBERS, FPL_API } from "@/lib/constants"
import { processTeamTransfers, SPECIAL_TRANSFER_EVENTS } from "@/lib/transfer-calculator"

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
    
    // Fetch all team histories in parallel
    const teamHistories = await Promise.all(
      teamIds.map(id => fetchTeamHistory(id))
    )
    
    // Process transfer data for each team
    const transferData = teamIds.map((teamId, index) => {
      const history = teamHistories[index]
      const userName = TEAM_MEMBERS[teamId]
      
      if (!history || !history.current || history.current.length === 0) {
        return {
          teamId,
          userName,
          transfers: [],
          totalHits: 0,
          totalHitCost: 0,
          totalGwPoints: 0,
          totalGwPointsWithHits: 0,
        }
      }
      
      // Convert FPL API data to our format
      const gameweekData = history.current.map((gw: any) => ({
        gameweek: gw.event,
        transfers: gw.event_transfers || 0,
        transfersCost: gw.event_transfers_cost || 0, // Negative value from FPL
        points: gw.points, // GW points before hits
      }))
      
      // Process transfers with special events
      return processTeamTransfers(
        teamId,
        userName,
        gameweekData,
        SPECIAL_TRANSFER_EVENTS
      )
    })
    
    return NextResponse.json({
      success: true,
      data: transferData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching transfer data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transfer data" },
      { status: 500 }
    )
  }
}


