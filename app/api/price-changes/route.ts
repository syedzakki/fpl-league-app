import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
    try {
        // Fetch price changes from FPL API
        const response = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/", {
            next: { revalidate: 3600 }
        })
        
        if (!response.ok) {
            throw new Error("Failed to fetch FPL data")
        }

        const data = await response.json()
        
        // Get all players with their cost change data
        const players = data.elements.map((player: any) => {
            const team = data.teams.find((t: any) => t.id === player.team)
            return {
                id: player.id,
                name: player.web_name,
                fullName: player.first_name + " " + player.second_name,
                team: team?.short_name || "N/A",
                teamFull: team?.name || "N/A",
                position: ["GKP", "DEF", "MID", "FWD"][player.element_type - 1],
                cost: player.now_cost / 10,
                costChange: player.cost_change_event / 10,
                costChangeStart: player.cost_change_start / 10,
                selectedBy: parseFloat(player.selected_by_percent),
                form: parseFloat(player.form),
                transfersIn: player.transfers_in_event,
                transfersOut: player.transfers_out_event,
                status: player.status,
                news: player.news || ""
            }
        })

        // Get recent risers and fallers (based on cost_change_event)
        const risers = players
            .filter((p: any) => p.costChange > 0)
            .sort((a: any, b: any) => b.costChange - a.costChange || b.transfersIn - a.transfersIn)
            .slice(0, 20)

        const fallers = players
            .filter((p: any) => p.costChange < 0)
            .sort((a: any, b: any) => a.costChange - b.costChange || b.transfersOut - a.transfersOut)
            .slice(0, 20)

        // Get players likely to rise/fall (high transfer activity)
        const likelyRisers = players
            .filter((p: any) => p.costChange === 0 && p.transfersIn > 50000)
            .sort((a: any, b: any) => b.transfersIn - a.transfersIn)
            .slice(0, 15)

        const likelyFallers = players
            .filter((p: any) => p.costChange === 0 && p.transfersOut > 50000)
            .sort((a: any, b: any) => b.transfersOut - a.transfersOut)
            .slice(0, 15)

        return NextResponse.json({
            success: true,
            data: {
                risers,
                fallers,
                likelyRisers,
                likelyFallers,
                lastUpdated: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error("Error fetching price changes:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch price changes" },
            { status: 500 }
        )
    }
}

