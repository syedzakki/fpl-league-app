import { NextResponse } from "next/server"
import { TEAM_MEMBERS, FPL_API } from "@/lib/constants"

interface FPLBootstrap {
  events: Array<{
    id: number
    is_current: boolean
    is_next: boolean
    finished: boolean
    data_checked: boolean
  }>
}

interface FPLGameweekPicks {
  picks: Array<{
    element: number
    position: number
    multiplier: number
    is_captain: boolean
    is_vice_captain: boolean
  }>
}

interface FPLLiveGameweek {
  elements: Array<{
    id: number
    stats: {
      total_points: number
      minutes: number
    }
  }>
}

async function fetchBootstrap(): Promise<FPLBootstrap | null> {
  try {
    const response = await fetch(FPL_API.BOOTSTRAP, {
      next: { revalidate: 300 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error fetching bootstrap:", error)
    return null
  }
}

async function fetchGameweekPicks(teamId: string, gameweek: number): Promise<FPLGameweekPicks | null> {
  try {
    const url = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gameweek}/picks/`
    const response = await fetch(url, {
      next: { revalidate: 60 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching picks for team ${teamId} GW${gameweek}:`, error)
    return null
  }
}

async function fetchLiveGameweek(gameweek: number): Promise<FPLLiveGameweek | null> {
  try {
    const response = await fetch(FPL_API.LIVE_EVENT(gameweek), {
      next: { revalidate: 60 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching live data for GW${gameweek}:`, error)
    return null
  }
}

function calculateDetailedCaptaincyPoints(
  picks: FPLGameweekPicks['picks'],
  liveData: FPLLiveGameweek | null
): {
  captainPoints: number
  viceCaptainPoints: number
  captainPlayed: boolean
  viceCaptainPlayed: boolean
  cvTotal: number
  captainId: number
  viceCaptainId: number
} {
  const defaultResult = {
    captainPoints: 0,
    viceCaptainPoints: 0,
    captainPlayed: false,
    viceCaptainPlayed: false,
    cvTotal: 0,
    captainId: 0,
    viceCaptainId: 0
  }

  if (!picks || !liveData) return defaultResult
  
  const captain = picks.find(p => p.is_captain)
  const viceCaptain = picks.find(p => p.is_vice_captain)
  
  if (!captain || !viceCaptain) return defaultResult
  
  const capElement = liveData.elements.find(e => e.id === captain.element)
  const viceElement = liveData.elements.find(e => e.id === viceCaptain.element)
  
  const capBasePoints = capElement?.stats?.total_points || 0
  const capMinutes = capElement?.stats?.minutes || 0
  const viceBasePoints = viceElement?.stats?.total_points || 0
  const viceMinutes = viceElement?.stats?.minutes || 0
  
  const captainPlayed = capMinutes > 0
  const viceCaptainPlayed = viceMinutes > 0
  
  // C+VC Logic:
  // Captain points shown = base points * multiplier (e.g., 13 * 2 = 26 for captain)
  // Vice captain points shown = base points (no multiplier unless captain didn't play)
  // C+VC Total = Captain's actual scored points + Vice's actual scored points
  
  let captainPointsWithMultiplier = 0
  let viceCaptainPointsWithMultiplier = 0
  let cvTotal = 0
  
  if (captainPlayed) {
    // Captain played - captain gets multiplier, vice doesn't
    captainPointsWithMultiplier = capBasePoints * captain.multiplier
    viceCaptainPointsWithMultiplier = viceBasePoints
    cvTotal = captainPointsWithMultiplier + viceCaptainPointsWithMultiplier
  } else if (viceCaptainPlayed) {
    // Captain didn't play - vice captain gets the multiplier instead
    captainPointsWithMultiplier = capBasePoints // No multiplier since didn't play
    viceCaptainPointsWithMultiplier = viceBasePoints * viceCaptain.multiplier
    cvTotal = captainPointsWithMultiplier + viceCaptainPointsWithMultiplier
  } else {
    // Neither played (rare case) - no multipliers
    captainPointsWithMultiplier = capBasePoints
    viceCaptainPointsWithMultiplier = viceBasePoints
    cvTotal = captainPointsWithMultiplier + viceCaptainPointsWithMultiplier
  }
  
  return {
    captainPoints: captainPointsWithMultiplier,
    viceCaptainPoints: viceCaptainPointsWithMultiplier,
    captainPlayed,
    viceCaptainPlayed,
    cvTotal,
    captainId: captain.element,
    viceCaptainId: viceCaptain.element
  }
}

export async function GET() {
  try {
    const teamIds = Object.keys(TEAM_MEMBERS)
    
    // Fetch bootstrap to get completed gameweeks
    const bootstrap = await fetchBootstrap()
    if (!bootstrap) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch FPL bootstrap data" },
        { status: 500 }
      )
    }
    
    const completedGameweeks = bootstrap.events.filter(e => e.finished).length
    
    // Fetch C+VC data for all completed gameweeks
    const captaincyData = []
    
    for (let gw = 1; gw <= completedGameweeks; gw++) {
      const liveData = await fetchLiveGameweek(gw)
      
      const teamsCVData = await Promise.all(
        teamIds.map(async (teamId) => {
          const picks = await fetchGameweekPicks(teamId, gw)
          const cvData = calculateDetailedCaptaincyPoints(
            picks?.picks || [],
            liveData
          )
          
          return {
            teamId,
            userName: TEAM_MEMBERS[teamId],
            ...cvData
          }
        })
      )
      
      // Sort by C+VC points to determine winner
      const sortedByCVC = [...teamsCVData].sort((a, b) => {
        if (b.cvTotal !== a.cvTotal) return b.cvTotal - a.cvTotal
        // Tie-breaker: captain points
        return b.captainPoints - a.captainPoints
      })
      
      captaincyData.push({
        gameweek: gw,
        teams: teamsCVData,
        winner: sortedByCVC[0]
      })
    }
    
    // Calculate total captaincy wins per team
    const teamCaptaincyStats = teamIds.map(teamId => {
      const wins = captaincyData.filter(gw => gw.winner.teamId === teamId).length
      const totalCV = captaincyData.reduce((sum, gw) => {
        const teamData = gw.teams.find(t => t.teamId === teamId)
        return sum + (teamData?.cvTotal || 0)
      }, 0)
      
      return {
        teamId,
        userName: TEAM_MEMBERS[teamId],
        captaincyWins: wins,
        totalCVPoints: totalCV,
        averageCVPoints: Math.round(totalCV / completedGameweeks)
      }
    })
    
    // Sort by captaincy wins
    teamCaptaincyStats.sort((a, b) => {
      if (b.captaincyWins !== a.captaincyWins) return b.captaincyWins - a.captaincyWins
      return b.totalCVPoints - a.totalCVPoints
    })
    
    return NextResponse.json({
      success: true,
      data: {
        captaincyData,
        teamStats: teamCaptaincyStats,
        completedGameweeks
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error in captaincy API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

