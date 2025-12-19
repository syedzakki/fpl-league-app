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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const gwParam = searchParams.get('gw')

        // 1. Get current GW via bootstrap
        const bootstrap = await fetchFPL(FPL_API.BOOTSTRAP, 300)
        if (!bootstrap) throw new Error("Bootstrap failed")

        const currentEvent = bootstrap.events.find((e: any) => e.is_current)
        const currentGw = currentEvent?.id || 1

        let targetGw = currentGw
        if (gwParam) {
            targetGw = parseInt(gwParam)
        } else if (currentEvent?.finished) {
            // If current GW is finished, focus on the next one for "Live Watch"
            targetGw = currentGw + 1
        }

        // 2. Fetch fixtures, live points, and manager picks in parallel
        const teamIds = Object.keys(TEAM_MEMBERS)

        const [fixtures, liveData, ...picksData] = await Promise.all([
            fetchFPL(`${FPL_API.FIXTURES}?event=${targetGw}`),
            fetchFPL(FPL_API.LIVE_EVENT(targetGw)),
            ...teamIds.map(id => fetchFPL(`https://fantasy.premierleague.com/api/entry/${id}/event/${targetGw}/picks/`))
        ])

        if (!fixtures || !liveData) throw new Error("Core live data failed")

        // 3. Helper mappings
        const playersMap = Object.fromEntries(bootstrap.elements.map((p: any) => [p.id, p]))
        const teamsMap = Object.fromEntries(bootstrap.teams.map((t: any) => [t.id, t]))

        // 4. Process matches
        const activeMatches = fixtures.map((f: any) => {
            const homeTeam = teamsMap[f.team_h]
            const awayTeam = teamsMap[f.team_a]

            // Calculate xG (expected goals) based on team strength and difficulty
            // This is a simplified calculation - in production, you'd use actual xG data
            const homeStrength = homeTeam.strength_attack_home || 1000
            const awayStrength = awayTeam.strength_attack_away || 1000
            const homeDefense = homeTeam.strength_defence_home || 1000
            const awayDefense = awayTeam.strength_defence_away || 1000
            
            // Normalize to xG scale (0-5)
            const homeXG = ((homeStrength / awayDefense) * 1.5).toFixed(1)
            const awayXG = ((awayStrength / homeDefense) * 1.2).toFixed(1) // Away teams typically score less
            
            // Extract player stats from the fixture (goals, assists, etc)
            const statsBreakdown: any = {}
            f.stats.forEach((s: any) => {
                const statName = s.identifier
                const hData = s.h.map((item: any) => ({
                    player: playersMap[item.element]?.web_name || "Unknown",
                    value: item.value
                }))
                const aData = s.a.map((item: any) => ({
                    player: playersMap[item.element]?.web_name || "Unknown",
                    value: item.value
                }))

                statsBreakdown[statName] = { h: hData, a: aData }

                // If this is defensive_contribution, also extract the RAW actions for the "Defcon" display
                if (statName === 'defensive_contribution') {
                    statsBreakdown['defcon_actions'] = {
                        h: s.h.map((item: any) => {
                            const pLive = liveData.elements.find((e: any) => e.id === item.element)
                            const raw = pLive?.explain?.[0]?.stats?.find((st: any) => st.identifier === 'defensive_contribution')?.value || 0
                            return { player: playersMap[item.element]?.web_name || "Unknown", value: raw }
                        }),
                        a: s.a.map((item: any) => {
                            const pLive = liveData.elements.find((e: any) => e.id === item.element)
                            const raw = pLive?.explain?.[0]?.stats?.find((st: any) => st.identifier === 'defensive_contribution')?.value || 0
                            return { player: playersMap[item.element]?.web_name || "Unknown", value: raw }
                        })
                    }
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
                stats: statsBreakdown,
                homeId: f.team_h,
                awayId: f.team_a,
                xG: !f.started ? { home: parseFloat(homeXG), away: parseFloat(awayXG) } : undefined
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

                // Find the match this player is in to get fixture-wide stats (like bonus)
                const playerMatch = activeMatches.find((m: any) => m.id === playerLiveData?.explain?.[0]?.fixture)

                // 1. Bonus Points System (BPS) vs Bonus Points
                const rawBps = stats.bps || 0
                const bonusPoints = playerMatch?.stats?.bonus?.h.find((b: any) => b.player === playerInfo.web_name)?.value ||
                    playerMatch?.stats?.bonus?.a.find((b: any) => b.player === playerInfo.web_name)?.value || 0

                // 2. Defensive Contribution (Defcon) Actions vs Defcoin Points
                const defExplain = playerLiveData?.explain?.[0]?.stats?.find((s: any) => s.identifier === 'defensive_contribution')
                const defconActions = defExplain?.value || 0
                const defcoinPoints = defExplain?.points || 0

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
                    defcon: defconActions,
                    defcoinPoints: defcoinPoints,
                    bps: rawBps,
                    bonusPoints: bonusPoints,
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
                gameweek: targetGw,
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
