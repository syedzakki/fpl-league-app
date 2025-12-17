import { NextResponse } from "next/server"
import { TEAM_MEMBERS, LEAGUE_CONFIG, FPL_API } from "@/lib/constants"

interface FPLBootstrap {
  events: Array<{
    id: number
    is_current: boolean
    is_next: boolean
    finished: boolean
    data_checked: boolean
  }>
  elements: Array<{
    id: number
    web_name: string
    first_name: string
    second_name: string
  }>
}

interface FPLTeamEntry {
  id: number
  player_first_name: string
  player_last_name: string
  name: string
  summary_overall_points: number
  summary_overall_rank: number
  summary_event_points: number
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

async function fetchTeamEntry(teamId: string): Promise<FPLTeamEntry | null> {
  try {
    const response = await fetch(FPL_API.TEAM_ENTRY(teamId), {
      next: { revalidate: 60 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching entry for team ${teamId}:`, error)
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
  
  // C+VC Logic:
  // C+VC Total = Captain's points with multiplier + Vice's points
  // If captain played: (captain base * multiplier) + vice base
  // If captain didn't play: captain base + (vice base * multiplier)
  
  let cvTotal = 0
  
  if (capMinutes > 0) {
    // Captain played - captain gets multiplier, vice doesn't
    cvTotal = (capBasePoints * captain.multiplier) + viceBasePoints
  } else if (viceMinutes > 0) {
    // Captain didn't play - vice captain gets the multiplier instead
    cvTotal = capBasePoints + (viceBasePoints * viceCaptain.multiplier)
  } else {
    // Neither played (rare case)
    cvTotal = capBasePoints + viceBasePoints
  }
  
  return cvTotal
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
    const currentGameweek = bootstrap.events.find(e => e.is_current)?.id || completedGameweeks
    
    // Fetch all team data in parallel
    const [teamEntries, teamHistories] = await Promise.all([
      Promise.all(teamIds.map(id => fetchTeamEntry(id))),
      Promise.all(teamIds.map(id => fetchTeamHistory(id)))
    ])
    
    // Fetch C+VC data for all completed gameweeks
    const gameweeksWithCVData = await Promise.all(
      Array.from({ length: completedGameweeks }, (_, i) => i + 1).map(async (gw) => {
        const liveData = await fetchLiveGameweek(gw)
        const picksData = await Promise.all(
          teamIds.map(id => fetchGameweekPicks(id, gw))
        )
        
        return {
          gameweek: gw,
          liveData,
          teamPicks: teamIds.map((id, idx) => ({
            teamId: id,
            picks: picksData[idx]
          }))
        }
      })
    )
    
    // Process each team's complete data
    const teamsData = teamIds.map((teamId, index) => {
      const entry = teamEntries[index]
      const history = teamHistories[index]
      const userName = TEAM_MEMBERS[teamId]
      
      if (!entry || !history || !history.current) {
        return {
          teamId,
          userName,
          totalPoints: 0,
          gameweeks: []
        }
      }
      
      // Process each gameweek with C+VC data
      const gameweeks = history.current.map((gw) => {
        const gwCVData = gameweeksWithCVData.find(g => g.gameweek === gw.event)
        const teamPicks = gwCVData?.teamPicks.find(tp => tp.teamId === teamId)?.picks
        
        const cvPoints = calculateCaptaincyPoints(
          teamPicks?.picks || [],
          gwCVData?.liveData || null
        )
        
        // Calculate hits
        const hitCost = Math.abs(gw.event_transfers_cost || 0)
        const hits = hitCost / 4
        
        return {
          gameweek: gw.event,
          points: gw.points, // Points before hits
          pointsWithHits: gw.points + (gw.event_transfers_cost || 0), // With hits
          totalPoints: gw.total_points,
          rank: gw.rank,
          overallRank: gw.overall_rank,
          transfers: gw.event_transfers || 0,
          transfersCost: gw.event_transfers_cost || 0, // Negative value
          hits: hits,
          hitCost: hitCost, // Positive value for display
          captaincyPoints: cvPoints,
          benchPoints: gw.points_on_bench || 0
        }
      })
      
      return {
        teamId,
        userName,
        totalPoints: entry.summary_overall_points,
        totalPointsNoHits: gameweeks.reduce((sum, gw) => sum + gw.points, 0),
        totalHits: gameweeks.reduce((sum, gw) => sum + gw.hits, 0),
        totalHitCost: gameweeks.reduce((sum, gw) => sum + gw.hitCost, 0),
        overallRank: entry.summary_overall_rank,
        gameweeks
      }
    })
    
    // Calculate GW winners, second place, last place, and captaincy winners for each GW
    const gameweekResults = []
    
    for (let gw = 1; gw <= completedGameweeks; gw++) {
      const gwTeams = teamsData
        .map(team => {
          const gwData = team.gameweeks.find(g => g.gameweek === gw)
          return {
            teamId: team.teamId,
            userName: team.userName,
            points: gwData?.points || 0,
            captaincyPoints: gwData?.captaincyPoints || 0
          }
        })
        .filter(t => t.points > 0)
      
      if (gwTeams.length === 0) continue
      
      // Sort by points for GW winner (with tie-breaker: C+VC points)
      const sortedByPoints = [...gwTeams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        // Tie-breaker: C+VC points
        return b.captaincyPoints - a.captaincyPoints
      })
      
      const winner = sortedByPoints[0]
      const second = sortedByPoints.length > 1 ? sortedByPoints[1] : null
      const last = sortedByPoints[sortedByPoints.length - 1]
      
      // Sort by C+VC for captaincy winner (with tie-breaker: GW points)
      const sortedByCVC = [...gwTeams].sort((a, b) => {
        if (b.captaincyPoints !== a.captaincyPoints) return b.captaincyPoints - a.captaincyPoints
        // Tie-breaker: GW points
        return b.points - a.points
      })
      
      const capWinner = sortedByCVC[0]
      
      gameweekResults.push({
        gameweek: gw,
        winner,
        second,
        last,
        capWinner,
        teams: sortedByPoints // Store sorted teams for debugging
      })
    }
    
    // Calculate wins, seconds, lasts, cap wins for each team
    const teamStats = teamsData.map(team => {
      let gwWins = 0
      let secondFinishes = 0
      let lastFinishes = 0
      let captaincyWins = 0
      
      gameweekResults.forEach(gwr => {
        if (gwr.winner.teamId === team.teamId) {
          gwWins++
        }
        // Only count as second if NOT the winner (in case of data issues)
        if (gwr.second && gwr.second.teamId === team.teamId && gwr.winner.teamId !== team.teamId) {
          secondFinishes++
        }
        // Only count as last if not the winner (for 2-player games or ties)
        if (gwr.last.teamId === team.teamId && gwr.last.teamId !== gwr.winner.teamId) {
          lastFinishes++
        }
        if (gwr.capWinner.teamId === team.teamId) {
          captaincyWins++
        }
      })
      
      return {
        ...team,
        gwWins,
        secondFinishes,
        lastFinishes,
        captaincyWins
      }
    })
    
    // Sort by total points (no hits) for final leaderboard
    teamStats.sort((a, b) => b.totalPointsNoHits - a.totalPointsNoHits)
    
    // Add positions
    const leaderboard = teamStats.map((team, index) => ({
      ...team,
      leaderboardPos: index + 1
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        gameweekResults,
        completedGameweeks,
        currentGameweek
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error in FPL data API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

