import { NextResponse } from "next/server"
import { FPL_API } from "@/lib/constants"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
        return NextResponse.json({ success: false, error: "Team ID required" }, { status: 400 })
    }

    try {
        // Get bootstrap to find current gameweek
        const bootstrapRes = await fetch(FPL_API.BOOTSTRAP)
        const bootstrap = await bootstrapRes.json()
        const currentGw = bootstrap.events.find((e: any) => e.is_current)?.id || 1

        // Fetch picks for current gameweek
        const picksRes = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/event/${currentGw}/picks/`)

        if (!picksRes.ok) {
            return NextResponse.json({ success: false, error: "Failed to fetch picks" }, { status: 500 })
        }

        const picksData = await picksRes.json()

        // Enhance picks with player names and teams
        const playerMap = new Map(bootstrap.elements.map((e: any) => [e.id, {
            name: e.web_name,
            teamId: e.team,
            positionId: e.element_type,
            now_cost: e.now_cost,
            form: e.form,
            status: e.status
        }]))

        const teamMap = new Map(bootstrap.teams.map((t: any) => [t.id, t.short_name]))

        const enhancedPicks = picksData.picks.map((p: any) => {
            const details = playerMap.get(p.element) as any
            return {
                ...p,
                ...(details || {}),
                teamName: details ? teamMap.get(details.teamId) : "?"
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                picks: enhancedPicks,
                active_chip: picksData.active_chip,
                entry_history: picksData.entry_history
            }
        })
    } catch (error) {
        console.error("Error fetching my team:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
