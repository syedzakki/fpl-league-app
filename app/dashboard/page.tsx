"use client"

import { useEffect, useState } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { PositionHistoryChart } from "@/components/charts/position-history-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { NextDeadlineWidget } from "@/components/dashboard/deadline-countdown"
import { LiveRankCard } from "@/components/dashboard/live-rank-card"
import { RivalWatch } from "@/components/dashboard/rival-watch"
import { RefreshCw, Trophy, TrendingUp, Info } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { LEAGUE_CONFIG } from "@/lib/constants"
import { GlobalRefresh } from "@/components/global-refresh"
import Link from "next/link"
import { useTeam } from "@/components/providers/team-provider"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PositionData {
    gameweek: number
    [playerName: string]: number
}

export default function Dashboard() {
    const { selectedTeamId, teamName, isLoading: authLoading } = useTeam()
    const router = useRouter()
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [positionHistory, setPositionHistory] = useState<PositionData[]>([])
    const [players, setPlayers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [completedGWs, setCompletedGWs] = useState(0)
    const [totalPot, setTotalPot] = useState(0)

    useEffect(() => {
        console.log("Dashboard Auth Check:", { authLoading, selectedTeamId })
        if (!authLoading) {
            if (!selectedTeamId) {
                console.log("Redirecting to / from Dashboard because no team selected")
                router.push("/")
            } else {
                console.log("Authenticated on Dashboard as:", selectedTeamId)
            }
        }
    }, [authLoading, selectedTeamId, router])

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><RefreshCw className="animate-spin h-8 w-8 text-primary" /></div>
    if (!selectedTeamId) return null

    const fetchLeaderboard = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/fpl-data")
            const data = await response.json()

            if (data.success && data.data?.leaderboard) {
                const entries: LeaderboardEntry[] = data.data.leaderboard.map((team: any) => ({
                    position: team.leaderboardPos || 0,
                    teamId: team.teamId,
                    teamName: team.userName,
                    totalPoints: team.totalPoints || 0,
                    gwWins: team.gwWins || 0,
                    secondFinishes: team.secondFinishes || 0,
                    lastFinishes: team.lastFinishes || 0,
                    captaincyWins: team.captaincyWins || 0,
                    netFinancial: 0,
                }))
                setLeaderboard(entries)
                setCompletedGWs(data.data.completedGameweeks || 0)

                const numTeams = entries.length
                const pot = numTeams * LEAGUE_CONFIG.FPL_BUY_IN +
                    (data.data.completedGameweeks || 0) * numTeams * (LEAGUE_CONFIG.GW_BUY_IN + LEAGUE_CONFIG.CAPTAINCY_BUY_IN)
                setTotalPot(pot)

                if (data.data.gameweekResults) {
                    calculatePositionHistoryFromResults(data.data.gameweekResults, data.data.leaderboard)
                }
                setLastUpdated(new Date(data.timestamp || Date.now()))
            }
        } catch (err) {
            console.error("Error fetching leaderboard:", err)
        } finally {
            setLoading(false)
        }
    }

    const calculatePositionHistoryFromResults = (
        gameweekResults: Array<{ gameweek: number; teams: Array<{ teamId: string; userName: string; points: number }> }>,
        leaderboardData: Array<{ teamId: string; userName: string }>
    ) => {
        const playerNames = new Set<string>()
        leaderboardData.forEach(team => playerNames.add(team.userName))
        const playerList = Array.from(playerNames)
        setPlayers(playerList)

        const history: PositionData[] = []
        const runningTotals: Record<string, number> = {}
        playerList.forEach(name => runningTotals[name] = 0)

        gameweekResults.forEach(gw => {
            gw.teams.forEach(team => runningTotals[team.userName] = (runningTotals[team.userName] || 0) + team.points)
            const sorted = playerList.map(name => ({ name, points: runningTotals[name] || 0 })).sort((a, b) => b.points - a.points)
            const posData: PositionData = { gameweek: gw.gameweek }
            sorted.forEach((p, i) => posData[p.name] = i + 1)
            history.push(posData)
        })
        setPositionHistory(history)
    }

    useEffect(() => {
        fetchLeaderboard()
        const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    // Derived Data
    const myTeam = leaderboard.find(l => l.teamName === teamName) || leaderboard[0]
    // Filter rivals: everyone except me, take top 5
    const rivals = leaderboard
        .filter(l => l.teamName !== teamName)
        .slice(0, 5)
        .map((l, i) => ({
            name: l.teamName,
            teamName: `Team ${l.teamName}`,
            points: l.totalPoints,
            rank: l.position,
            captain: "Haaland" // Placeholder
        }))

    const previousHistory = positionHistory.length > 1 ? positionHistory[positionHistory.length - 2] : null
    const myLastRank = previousHistory && myTeam ? previousHistory[myTeam.teamName] : undefined

    // Safety check to prevent rendering if we're redirecting
    if (!selectedTeamId && !authLoading) return null

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-6">
            <div className="container mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <BlurFade delay={0}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-sports font-bold uppercase italic tracking-wide text-foreground">
                                Gameweek <span className="text-primary">{completedGWs + 1}</span>
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    Live Updates
                                </span>
                                <span>Last synced {lastUpdated?.toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="text-right hidden md:block mr-4">
                                <p className="text-xs text-muted-foreground uppercase">Logged in as</p>
                                <p className="font-bold text-primary">{teamName}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchLeaderboard} disabled={loading} className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Sync
                            </Button>
                            <GlobalRefresh />
                        </div>
                    </div>
                </BlurFade>

                {/* Hero Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                    <BlurFade delay={0.1} className="md:col-span-5 lg:col-span-4">
                        <NextDeadlineWidget />
                    </BlurFade>

                    <BlurFade delay={0.2} className="md:col-span-4 lg:col-span-4">
                        <LiveRankCard
                            rank={myTeam?.position || 0}
                            lastRank={myLastRank}
                            points={myTeam?.totalPoints || 0}
                            isLoading={loading}
                        />
                    </BlurFade>

                    <BlurFade delay={0.3} className="md:col-span-3 lg:col-span-4 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4">
                        <Card className="flex flex-col justify-center px-4 py-3 md:px-6 bg-primary/5 border-primary/20 relative overflow-hidden">
                            <div className="absolute top-2 right-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-4 h-4 text-primary/50" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Total pot value based on buy-ins and weekly contributions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Pot</div>
                            <div className="text-2xl md:text-3xl font-mono font-bold text-primary">₹{totalPot}</div>
                        </Card>
                        <Card className="flex flex-col justify-center px-4 py-3 md:px-6 bg-secondary/30 relative">
                            <div className="absolute top-2 right-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-4 h-4 text-muted-foreground/50" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Number of active managers in the league</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Active Players</div>
                            <div className="text-2xl md:text-3xl font-mono font-bold">{leaderboard.length}</div>
                        </Card>
                    </BlurFade>
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <BlurFade delay={0.4} className="lg:col-span-1">
                        <RivalWatch rivals={rivals} />
                    </BlurFade>

                    <BlurFade delay={0.5} className="lg:col-span-2">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 sm:px-6 border-b border-border/50">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate">Live Leaderboard</span>
                                </CardTitle>
                                <Link
                                    href="/leaderboard-fpl"
                                    className="text-[10px] sm:text-xs text-primary hover:underline font-medium whitespace-nowrap ml-2"
                                >
                                    Detailed View →
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                {loading ? (
                                    <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-muted-foreground" /></div>
                                ) : (
                                    // Show ALL teams, no slice
                                    <LeaderboardTable entries={leaderboard} />
                                )}
                            </CardContent>
                        </Card>
                    </BlurFade>
                </div>

                {/* Trend Chart */}
                {!loading && positionHistory.length > 0 && (
                    <BlurFade delay={0.6}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" /> Season Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PositionHistoryChart data={positionHistory} players={players} />
                            </CardContent>
                        </Card>
                    </BlurFade>
                )}

            </div>
        </div>
    )
}
