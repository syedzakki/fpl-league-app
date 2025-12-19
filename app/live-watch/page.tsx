"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    RefreshCw,
    Users,
    Timer,
    ChevronRight,
    Trophy,
    TrendingUp,
    TrendingDown,
} from "lucide-react"
import { GlobalRefresh } from "@/components/global-refresh"
import { cn, formatOrdinal } from "@/lib/utils"
import { Match, Manager } from "@/components/live-watch/types"
import { EnhancedMatchCard } from "@/components/live-watch/enhanced-match-card"
import { ManagerLiveCard } from "@/components/live-watch/manager-live-card"
import { EnhancedMatchModal } from "@/components/live-watch/enhanced-match-modal"
import { TeamPlayerTiles } from "@/components/live-watch/team-player-tiles"
import { LiveGWAnalytics } from "@/components/live-watch/live-gw-analytics"

import { ProtectedRoute } from "@/components/auth/protected-route"

import { useTeam } from "@/components/providers/team-provider"

export default function LiveWatchPage() {
    const { selectedTeamId, teamName } = useTeam()
    const [data, setData] = useState<{ gameweek: number, matches: Match[], managers: Manager[] } | null>(null)
    const [myPlayers, setMyPlayers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showLiveLeaderboard, setShowLiveLeaderboard] = useState(false)

    const fetchMyPlayers = async () => {
        if (!selectedTeamId) return
        try {
            const res = await fetch(`/api/my-team?teamId=${selectedTeamId}`)
            const json = await res.json()
            if (json.success) {
                setMyPlayers(json.data.picks || [])
            }
        } catch (err) {
            console.error("Failed to fetch my players:", err)
        }
    }

    const fetchLiveStats = async () => {
        try {
            setRefreshing(true)
            const res = await fetch("/api/live-watch")
            const json = await res.json()
            if (json.success) {
                setData(json.data)
                setError(null)
            } else {
                setError(json.error || "Failed to fetch live data")
            }
        } catch (err) {
            setError("Failed to connect to FPL API")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLiveStats()
        fetchMyPlayers()
        const interval = setInterval(fetchLiveStats, 60000) // Refresh every minute
        return () => clearInterval(interval)
    }, [selectedTeamId])

    const formattedMyPlayers = myPlayers.map(p => ({
        id: p.element,
        name: p.web_name,
        teamId: p.team
    }))

    const liveMatches = data?.matches.filter(m => m.started && !m.finished) || []
    const upcomingMatches = data?.matches.filter(m => !m.started) || []
    const finishedMatches = data?.matches.filter(m => m.finished).sort((a, b) => b.id - a.id) || []

    // Calculate live leaderboard
    const liveLeaderboard = data?.managers 
        ? [...data.managers].sort((a, b) => b.totalLivePoints - a.totalLivePoints)
        : []
    
    const myLiveRank = liveLeaderboard.findIndex(m => m.name === teamName) + 1
    const myLivePoints = liveLeaderboard.find(m => m.name === teamName)?.totalLivePoints || 0
    
    // Fetch overall rank from leaderboard data
    const [myOverallRank, setMyOverallRank] = useState<number | null>(null)
    
    useEffect(() => {
        const fetchOverallRank = async () => {
            if (!selectedTeamId) return
            try {
                const res = await fetch("/api/leaderboard")
                const json = await res.json()
                if (json.success) {
                    const myTeam = json.data.leaderboard.find((t: any) => t.teamId === selectedTeamId)
                    if (myTeam) {
                        setMyOverallRank(myTeam.overallRank)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch overall rank:", error)
            }
        }
        fetchOverallRank()
    }, [selectedTeamId])

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
                <BlurFade delay={0}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="animate-pulse px-2 py-0 h-5 text-[10px] font-bold uppercase">Live</Badge>
                                <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Match Center</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">Gameweek {data?.gameweek} • Real-time scores and bonus points</p>
                            
                            {/* Rank Display - Clean Layout */}
                            {myLiveRank > 0 && (
                                <div className="flex items-center gap-4">
                                    <Card className="px-4 py-2 bg-card/60 border-border/50">
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">GW Rank</p>
                                        <p className="text-2xl font-sports font-black text-primary">{formatOrdinal(myLiveRank)}</p>
                                    </Card>
                                    <Card className="px-4 py-2 bg-card/60 border-border/50">
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Overall Rank</p>
                                        <p className="text-2xl font-sports font-black text-foreground">
                                            {myOverallRank ? `#${myOverallRank.toLocaleString()}` : "N/A"}
                                        </p>
                                    </Card>
                                    <Card className="px-4 py-2 bg-card/60 border-border/50">
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Live Points</p>
                                        <p className="text-2xl font-mono font-black text-foreground">{myLivePoints}</p>
                                    </Card>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchLiveStats}
                                disabled={refreshing}
                                className="bg-background/50 backdrop-blur-sm"
                            >
                                <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                                {refreshing ? "Refreshing..." : "Sync"}
                            </Button>
                            <GlobalRefresh />
                        </div>
                    </div>
                </BlurFade>

                <Tabs defaultValue="matches" className="space-y-6">
                    <div className="flex items-center justify-center">
                        <TabsList className="bg-muted/30 border border-border/50 p-1">
                            <TabsTrigger value="matches" className="gap-2">
                                <Timer className="w-4 h-4" /> Matches
                            </TabsTrigger>
                            <TabsTrigger value="teams" className="gap-2">
                                <Users className="w-4 h-4" /> Team Watch
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2">
                                <TrendingUp className="w-4 h-4" /> GW Analytics
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="matches" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Fixture Importance Legend */}
                        <Card className="border-border/50 bg-card/40 backdrop-blur-md p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Fixture Importance</h4>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border-2 border-primary/30 bg-primary/10" />
                                        <span className="text-xs font-bold">3+ Players</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border-2 border-green-500/30 bg-green-500/10" />
                                        <span className="text-xs font-bold">2 Players</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border-2 border-blue-500/30 bg-blue-500/10" />
                                        <span className="text-xs font-bold">1 Player</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border-2 border-border/30 bg-muted/10" />
                                        <span className="text-xs font-bold">No Players</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Live Section */}
                        {liveMatches.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/90">Ongoing Matches</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {liveMatches.map((m, i) => (
                                        <EnhancedMatchCard
                                            key={m.id}
                                            match={m}
                                            index={i}
                                            onClick={() => setSelectedMatch(m)}
                                            myPlayers={formattedMyPlayers}
                                            managers={data?.managers}
                                            myTeamId={selectedTeamId}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Section */}
                        {upcomingMatches.length > 0 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 px-1 mb-2">
                                    <div className="p-1 px-2 rounded-md bg-muted text-muted-foreground">
                                        <Timer className="w-3.5 h-3.5" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/90">Upcoming Schedule</h3>
                                </div>

                                {Object.entries(
                                    upcomingMatches.reduce((acc, match) => {
                                        const dateKey = new Date(match.kickoff).toLocaleDateString('en-GB', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'short'
                                        })
                                        if (!acc[dateKey]) acc[dateKey] = []
                                        acc[dateKey].push(match)
                                        return acc
                                    }, {} as Record<string, Match[]>)
                                ).map(([date, matches], groupIndex) => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex items-center gap-4 px-1">
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                                                {date}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {matches.map((m, i) => (
                                                <EnhancedMatchCard
                                                    key={m.id}
                                                    match={m}
                                                    index={i + groupIndex * 10}
                                                    onClick={() => setSelectedMatch(m)}
                                                    myPlayers={formattedMyPlayers}
                                                    managers={data?.managers}
                                                    myTeamId={selectedTeamId}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Finished Section */}
                        {finishedMatches.length > 0 && liveMatches.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="p-1 px-2 rounded-md bg-muted text-muted-foreground">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/90">Finished Today</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                                    {finishedMatches.slice(0, 3).map((m, i) => (
                                        <EnhancedMatchCard
                                            key={m.id}
                                            match={m}
                                            index={i}
                                            onClick={() => setSelectedMatch(m)}
                                            myPlayers={formattedMyPlayers}
                                            managers={data?.managers}
                                            myTeamId={selectedTeamId}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="teams" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {data?.managers && (
                            <TeamPlayerTiles 
                                managers={data.managers} 
                                myTeamId={selectedTeamId}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {data?.managers && (
                            <LiveGWAnalytics 
                                managers={data.managers}
                                myTeamId={selectedTeamId}
                                gameweek={data.gameweek}
                                myTeamName={teamName}
                            />
                        )}
                    </TabsContent>
                </Tabs>

                {/* Match Detail Dialog */}
                {selectedMatch && (
                    <EnhancedMatchModal 
                        match={selectedMatch} 
                        onClose={() => setSelectedMatch(null)} 
                    />
                )}
            </div>
        </ProtectedRoute>
    )
}

