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

interface FPLGameweekHistory {
  current: Array<{
    event: number
    points: number
    total_points: number
    rank: number
    overall_rank: number
    event_transfers: number
    event_transfers_cost: number
    points_on_bench: number
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

async function fetchTeamHistory(teamId: string): Promise<FPLGameweekHistory | null> {
  try {
    const response = await fetch(FPL_API.TEAM_HISTORY(teamId), {
      next: { revalidate: 60 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching history for team ${teamId}:`, error)
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

function calculateCaptaincyPoints(
  picks: FPLGameweekPicks['picks'],
  liveData: FPLLiveGameweek | null
): number {
  if (!picks || !liveData) return 0
  
  const captain = picks.find(p => p.is_captain)
  const viceCaptain = picks.find(p => p.is_vice_captain)
  
  if (!captain || !viceCaptain) return 0
  
  const capElement = liveData.elements.find(e => e.id === captain.element)
  const viceElement = liveData.elements.find(e => e.id === viceCaptain.element)
  
  const capBasePoints = capElement?.stats?.total_points || 0
  const capMinutes = capElement?.stats?.minutes || 0
  const viceBasePoints = viceElement?.stats?.total_points || 0
  const viceMinutes = viceElement?.stats?.minutes || 0
  
  let cvTotal = 0
  
  if (capMinutes > 0) {
    cvTotal = (capBasePoints * captain.multiplier) + viceBasePoints
  } else if (viceMinutes > 0) {
    cvTotal = capBasePoints + (viceBasePoints * viceCaptain.multiplier)
  } else {
    cvTotal = capBasePoints + viceBasePoints
  }
  
  return cvTotal
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameweek = parseInt(searchParams.get('gw') || '15')
    
    const teamIds = Object.keys(TEAM_MEMBERS)
    
    // Fetch all team histories
    const teamHistories = await Promise.all(teamIds.map(id => fetchTeamHistory(id)))
    
    // Fetch live data for the gameweek
    const liveData = await fetchLiveGameweek(gameweek)
    
    // Get all teams' picks for the gameweek
    const teamPicks = await Promise.all(teamIds.map(id => fetchGameweekPicks(id, gameweek)))
    
    const gwTeams = teamIds.map((teamId, index) => {
      const history = teamHistories[index]
      const picks = teamPicks[index]
      const gwData = history?.current?.find(g => g.event === gameweek)
      
      const cvPoints = calculateCaptaincyPoints(picks?.picks || [], liveData)
      
      return {
        teamId,
        userName: TEAM_MEMBERS[teamId],
        points: gwData?.points || 0,
        captaincyPoints: cvPoints,
        rank: gwData?.rank || 0,
        transfers: gwData?.event_transfers || 0,
        transfersCost: gwData?.event_transfers_cost || 0
      }
    }).filter(t => t.points > 0)
    
    // Sort by points (with tie-breaker: C+VC points)
    const sortedByPoints = [...gwTeams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.captaincyPoints - a.captaincyPoints
    })
    
    // Determine positions (handling ties)
    const positions = sortedByPoints.map((team, index, array) => {
      let position = index + 1
      
      // Check if this team has the same points and C+VC as previous team
      if (index > 0) {
        const prevTeam = array[index - 1]
        if (team.points === prevTeam.points && team.captaincyPoints === prevTeam.captaincyPoints) {
          // Find the position of the first team with these exact points
          for (let i = index - 1; i >= 0; i--) {
            if (array[i].points === team.points && array[i].captaincyPoints === team.captaincyPoints) {
              position = i + 1
            } else {
              break
            }
          }
        }
      }
      
      return {
        ...team,
        position,
        positionLabel: position === 1 ? 'WINNER' : position === 2 ? '2ND' : position === array.length ? 'LAST' : `${position}th`
      }
    })
    
    return NextResponse.json({
      success: true,
      gameweek,
      teams: positions,
      winner: positions[0],
      second: positions[1],
      last: positions[positions.length - 1],
      debugInfo: {
        totalTeams: positions.length,
        note: "Check if there are ties that might affect 2nd place counting"
      }
    })
  } catch (error) {
    console.error("Error in gameweek debug API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

