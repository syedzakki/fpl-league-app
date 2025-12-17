import { NextResponse } from "next/server"

interface FPLBootstrap {
  elements: Array<{
    id: number
    web_name: string
    team: number
    element_type: number // 1=GK, 2=DEF, 3=MID, 4=FWD
    now_cost: number
    cost_change_event: number
    cost_change_start: number
    transfers_in_event: number
    transfers_out_event: number
    selected_by_percent: string
    form: string
    total_points: number
    points_per_game: string
  }>
  teams: Array<{
    id: number
    name: string
    short_name: string
  }>
}

interface TopTransfer {
  id: number
  name: string
  team: string
  teamShort: string
  position: string
  cost: number
  costChange: number
  transfersIn: number
  transfersOut: number
  netTransfers: number
  selectedBy: number
  form: number
  totalPoints: number
  pointsPerGame: number
}

interface TopTransfersByPosition {
  GK: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
  DEF: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
  MID: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
  FWD: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
}

const POSITION_MAP: Record<number, string> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
}

export async function GET() {
  try {
    const response = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error("Failed to fetch FPL data")
    }

    const data: FPLBootstrap = await response.json()

    // Create team lookup
    const teamLookup: Record<number, { name: string; short_name: string }> = {}
    data.teams.forEach((team) => {
      teamLookup[team.id] = { name: team.name, short_name: team.short_name }
    })

    // Process players by position
    const playersByPosition: Record<string, TopTransfer[]> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
    }

    data.elements.forEach((player) => {
      const position = POSITION_MAP[player.element_type]
      const team = teamLookup[player.team]

      playersByPosition[position].push({
        id: player.id,
        name: player.web_name,
        team: team?.name || "Unknown",
        teamShort: team?.short_name || "UNK",
        position,
        cost: player.now_cost / 10, // Convert from 0.1 units
        costChange: player.cost_change_event,
        transfersIn: player.transfers_in_event,
        transfersOut: player.transfers_out_event,
        netTransfers: player.transfers_in_event - player.transfers_out_event,
        selectedBy: parseFloat(player.selected_by_percent),
        form: parseFloat(player.form),
        totalPoints: player.total_points,
        pointsPerGame: parseFloat(player.points_per_game),
      })
    })

    // Get top 5 most bought and sold for each position
    const result: TopTransfersByPosition = {
      GK: {
        mostBought: playersByPosition.GK
          .sort((a, b) => b.transfersIn - a.transfersIn)
          .slice(0, 5),
        mostSold: playersByPosition.GK
          .sort((a, b) => b.transfersOut - a.transfersOut)
          .slice(0, 5),
      },
      DEF: {
        mostBought: playersByPosition.DEF
          .sort((a, b) => b.transfersIn - a.transfersIn)
          .slice(0, 5),
        mostSold: playersByPosition.DEF
          .sort((a, b) => b.transfersOut - a.transfersOut)
          .slice(0, 5),
      },
      MID: {
        mostBought: playersByPosition.MID
          .sort((a, b) => b.transfersIn - a.transfersIn)
          .slice(0, 5),
        mostSold: playersByPosition.MID
          .sort((a, b) => b.transfersOut - a.transfersOut)
          .slice(0, 5),
      },
      FWD: {
        mostBought: playersByPosition.FWD
          .sort((a, b) => b.transfersIn - a.transfersIn)
          .slice(0, 5),
        mostSold: playersByPosition.FWD
          .sort((a, b) => b.transfersOut - a.transfersOut)
          .slice(0, 5),
      },
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching top transfers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch top transfers data",
      },
      { status: 500 }
    )
  }
}

