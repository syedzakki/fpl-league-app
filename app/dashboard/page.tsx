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
import { RankFeed } from "@/components/dashboard/rank-feed"
import { TeamDependency } from "@/components/dashboard/team-dependency"
import { RefreshCw, Trophy, TrendingUp, Info, ArrowRight, Users } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { LEAGUE_CONFIG } from "@/lib/constants"
import { GlobalRefresh } from "@/components/global-refresh"
import Link from "next/link"
import { useTeam } from "@/components/providers/team-provider"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { ProtectedRoute } from "@/components/auth/protected-route"

interface PositionData {
    gameweek: number
    [playerName: string]: number
}

export default function Dashboard() {
    const { selectedTeamId, teamName } = useTeam()
    const router = useRouter()
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [positionHistory, setPositionHistory] = useState<PositionData[]>([])
    const [players, setPlayers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [completedGWs, setCompletedGWs] = useState(0)
    const [totalPot, setTotalPot] = useState(0)
    const [myTeamPicks, setMyTeamPicks] = useState<any[]>([])

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
                    overallRank: team.overallRank || 0,
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
        
        // Fetch my team picks
        const fetchMyTeam = async () => {
            if (selectedTeamId) {
                try {
                    const res = await fetch(`/api/my-team?teamId=${selectedTeamId}`)
                    const data = await res.json()
                    if (data.success) {
                        setMyTeamPicks(data.data.picks || [])
                    }
                } catch (err) {
                    console.error("Failed to fetch my team:", err)
                }
            }
        }
        
        fetchMyTeam()
        const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [selectedTeamId])

    // Derived Data
    const myTeam = leaderboard.find(l => l.teamName === teamName) || leaderboard[0]

    // Filter rivals: everyone except me, take top 5
    const rivals = leaderboard
        .filter(l => l.teamName !== teamName)
        .slice(0, 5)
        .map((l, i) => {
            const prevHistory = positionHistory.length > 1 ? positionHistory[positionHistory.length - 2] : null
            const lastRank = prevHistory ? prevHistory[l.teamName] : l.position

            return {
                name: l.teamName,
                teamName: `Team ${l.teamName}`,
                points: l.totalPoints,
                rank: l.position,
                captain: "Haaland", // Still placeholder until we have real pick data
                isUp: lastRank > l.position,
                isDown: lastRank < l.position,
                gap: myTeam ? l.totalPoints - myTeam.totalPoints : 0
            }
        })

    const previousHistory = positionHistory.length > 1 ? positionHistory[positionHistory.length - 2] : null
    const myLastRank = previousHistory && myTeam ? previousHistory[myTeam.teamName] : undefined
    
    // Calculate previous overall rank from gameweek history
    const myPreviousOverallRank = leaderboard.length > 0 && completedGWs > 0 
        ? (() => {
            // Find my team's previous gameweek data from the API response
            const myTeamData = leaderboard.find(l => l.teamName === teamName)
            if (myTeamData && (myTeamData as any).gameweeks) {
                const gameweeks = (myTeamData as any).gameweeks
                const prevGw = gameweeks.find((gw: any) => gw.gameweek === completedGWs)
                return prevGw?.overallRank
            }
            return undefined
        })()
        : undefined

    return (
        <ProtectedRoute>
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
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
                        <BlurFade delay={0.1} className="md:col-span-5 lg:col-span-4 h-full">
                            <NextDeadlineWidget />
                        </BlurFade>

                        <BlurFade delay={0.2} className="md:col-span-4 lg:col-span-4 h-full">
                            <LiveRankCard
                                rank={myTeam?.position || 0}
                                lastRank={myLastRank}
                                overallRank={myTeam?.overallRank}
                                previousOverallRank={myPreviousOverallRank}
                                points={myTeam?.totalPoints || 0}
                                isLoading={loading}
                            />
                        </BlurFade>

                        <BlurFade delay={0.3} className="md:col-span-3 lg:col-span-4 grid grid-cols-1 gap-4 lg:gap-6">
                            <Card className="flex flex-col justify-center px-6 py-4 bg-primary/5 border-primary/20 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <div className="w-24 h-24 rounded-full bg-primary" />
                                </div>
                                <div className="absolute top-4 right-4 leading-none">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-primary/40 hover:text-primary transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-popover border-border/50 text-popover-foreground">
                                                <p className="max-w-xs text-xs">Total pot value calculated from league buy-ins and weekly gameweek/captaincy contributions.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 opacity-70">Total League Pot</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-primary">₹</span>
                                    <span className="text-4xl font-mono font-black text-primary drop-shadow-[0_4px_12px_rgba(var(--primary),0.3)]">
                                        {totalPot.toLocaleString()}
                                    </span>
                                </div>
                            </Card>

                            <Card className="flex flex-col justify-center px-6 py-4 bg-muted/20 border-border/50 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Users className="w-24 h-24" />
                                </div>
                                <div className="absolute top-4 right-4 leading-none">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-muted-foreground/40 hover:text-foreground transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-popover border-border/50 text-popover-foreground">
                                                <p className="max-w-xs text-xs">Total number of active managers competing in this league season.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 opacity-70">Active Managers</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-mono font-black">{leaderboard.length}</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Players</span>
                                </div>
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
                                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border/50 bg-muted/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Trophy className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-base font-bold uppercase italic tracking-tight">
                                            Live Leaderboard
                                        </CardTitle>
                                    </div>
                                    <Link
                                        href="/leaderboard-fpl"
                                        className="text-xs text-primary hover:text-primary/80 transition-colors font-bold uppercase tracking-widest flex items-center gap-1 group"
                                    >
                                        Detailed View
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

                    {/* Rank Feed & Team Dependency */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BlurFade delay={0.6}>
                            <RankFeed 
                                myRank={myTeam?.overallRank || 0}
                                myPoints={myTeam?.totalPoints || 0}
                                totalManagers={10000000}
                            />
                        </BlurFade>
                        <BlurFade delay={0.7}>
                            <TeamDependency myTeamPicks={myTeamPicks} />
                        </BlurFade>
                    </div>

                    {/* Trend Chart */}
                    {!loading && positionHistory.length > 0 && (
                        <BlurFade delay={0.8}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border/50 bg-muted/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-base font-bold uppercase italic tracking-tight">
                                            Season Trends
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <PositionHistoryChart data={positionHistory} players={players} />
                                </CardContent>
                            </Card>
                        </BlurFade>
                    )}

                </div>
            </div>
        </ProtectedRoute>
    )
}
