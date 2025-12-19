import { NextResponse } from "next/server"
import { TEAM_MEMBERS, FPL_API } from "@/lib/constants"

/**
 * Live Watch API
 * 
 * Aggregates:
 * 1. Bootstrap data (Player names, team names)
 * 2. Current fixtures (Live matches, scores)
 * 3. Live points (Per-player points breakdown)
 * 4. Manager picks (Who our managers have)
 */

async function fetchFPL(url: string, revalidate = 60) {
    try {
        const res = await fetch(url, { next: { revalidate } })
        if (!res.ok) return null
        return await res.json()
    } catch (e) {
        console.error(`Error fetching ${url}:`, e)
        return null
    }
}

export async function GET() {
    try {
        // 1. Get current GW via bootstrap
        const bootstrap = await fetchFPL(FPL_API.BOOTSTRAP, 300)
        if (!bootstrap) throw new Error("Bootstrap failed")

        const currentGw = bootstrap.events.find((e: any) => e.is_current)?.id || 1

        // 2. Fetch fixtures, live points, and manager picks in parallel
        const teamIds = Object.keys(TEAM_MEMBERS)

        const [fixtures, liveData, ...picksData] = await Promise.all([
            fetchFPL(`${FPL_API.FIXTURES}?event=${currentGw}`),
            fetchFPL(FPL_API.LIVE_EVENT(currentGw)),
            ...teamIds.map(id => fetchFPL(`https://fantasy.premierleague.com/api/entry/${id}/event/${currentGw}/picks/`))
        ])

        if (!fixtures || !liveData) throw new Error("Core live data failed")

        // 3. Helper mappings
        const playersMap = Object.fromEntries(bootstrap.elements.map((p: any) => [p.id, p]))
        const teamsMap = Object.fromEntries(bootstrap.teams.map((t: any) => [t.id, t]))

        // 4. Process matches
        const activeMatches = fixtures.map((f: any) => {
            const homeTeam = teamsMap[f.team_h]
            const awayTeam = teamsMap[f.team_a]

            // Extract player stats from the fixture (goals, assists, etc)
            const statsBreakdown: any = {}
            f.stats.forEach((s: any) => {
                const statName = s.identifier
                statsBreakdown[statName] = {
                    h: s.h.map((item: any) => ({
                        player: playersMap[item.element]?.web_name || "Unknown",
                        value: item.value
                    })),
                    a: s.a.map((item: any) => ({
                        player: playersMap[item.element]?.web_name || "Unknown",
                        value: item.value
                    }))
                }
            })

            return {
                id: f.id,
                home: homeTeam.name,
                homeShort: homeTeam.short_name,
                away: awayTeam.name,
                awayShort: awayTeam.short_name,
                homeScore: f.team_h_score,
                awayScore: f.team_a_score,
                started: f.started,
                finished: f.finished,
                minutes: f.minutes,
                kickoff: f.kickoff_time,
                stats: statsBreakdown
            }
        })

        // 5. Process managers live status
        const managersLive = teamIds.map((id, idx) => {
            const picks = picksData[idx]?.picks || []
            const managerName = TEAM_MEMBERS[id]

            let livePoints = 0
            const players = picks.map((p: any) => {
                const playerInfo = playersMap[p.element]
                const playerLiveData = liveData.elements.find((e: any) => e.id === p.element)
                const stats = playerLiveData?.stats || {}
                const points = (stats.total_points || 0) * p.multiplier

                livePoints += points

                // Extract specific "Defcon" metrics (BPS, bonus progress, defensive stats)
                const defcon = stats.bps || 0
                const hasCleanSheet = stats.clean_sheets > 0
                const isDefensive = [1, 2].includes(playerInfo.element_type) // GKP or DEF

                return {
                    id: p.element,
                    name: playerInfo.web_name,
                    points: points,
                    multiplier: p.multiplier,
                    isCaptain: p.is_captain,
                    isViceCaptain: p.is_vice_captain,
                    minutes: stats.minutes || 0,
                    defcon: defcon,
                    hasCleanSheet,
                    isDefensive,
                    stats: playerLiveData?.explain?.[0]?.stats || [] // detailed points source
                }
            })

            return {
                id,
                name: managerName,
                totalLivePoints: livePoints,
                players
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                gameweek: currentGw,
                matches: activeMatches,
                managers: managersLive
            },
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error("Live Watch API Error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
