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
} from "lucide-react"
import { GlobalRefresh } from "@/components/global-refresh"
import { cn } from "@/lib/utils"
import { Match, Manager } from "@/components/live-watch/types"
import { MatchCard } from "@/components/live-watch/match-card"
import { ManagerLiveCard } from "@/components/live-watch/manager-live-card"
import { MatchStatsBreakdown } from "@/components/live-watch/match-stats-breakdown"

export default function LiveWatchPage() {
    const [data, setData] = useState<{ gameweek: number, matches: Match[], managers: Manager[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const [error, setError] = useState<string | null>(null)

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
        const interval = setInterval(fetchLiveStats, 60000) // Refresh every minute
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Syncing Match Center...</p>
            </div>
        )
    }

    const liveMatches = data?.matches.filter(m => m.started && !m.finished) || []
    const upcomingMatches = data?.matches.filter(m => !m.started) || []
    const finishedMatches = data?.matches.filter(m => m.finished).sort((a, b) => b.id - a.id) || []

    return (
        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
            <BlurFade delay={0}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="animate-pulse px-2 py-0 h-5 text-[10px] font-bold uppercase">Live</Badge>
                            <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Match Center</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">Gameweek {data?.gameweek} • Real-time scores and bonus points</p>
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
                            {refreshing ? "Refreshing..." : "Fresh Sync"}
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
                        <TabsTrigger value="managers" className="gap-2">
                            <Users className="w-4 h-4" /> Managers
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="matches" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Live Section */}
                    {liveMatches.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Ongoing Matches</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {liveMatches.map((m, i) => (
                                    <MatchCard key={m.id} match={m} index={i} onClick={() => setSelectedMatch(m)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Section */}
                    {upcomingMatches.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Upcoming This Gameweek</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                                {upcomingMatches.map((m, i) => (
                                    <MatchCard key={m.id} match={m} index={i} onClick={() => setSelectedMatch(m)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Finished Section - Only if live matches are active to reduce "historical" clutter */}
                    {finishedMatches.length > 0 && liveMatches.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Finished Today</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                                {finishedMatches.slice(0, 3).map((m, i) => (
                                    <MatchCard key={m.id} match={m} index={i} onClick={() => setSelectedMatch(m)} />
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="managers" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.managers.sort((a, b) => b.totalLivePoints - a.totalLivePoints).map((manager, i) => (
                            <ManagerLiveCard key={manager.id} manager={manager} index={i} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Match Detail Dialog */}
            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl border-primary/20">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10"
                            onClick={() => setSelectedMatch(null)}
                        >
                            <ChevronRight className="rotate-90" />
                        </Button>
                        <CardHeader className="text-center border-b border-border/50 bg-muted/5">
                            <div className="flex items-center justify-center gap-6 mb-4">
                                <div className="text-center">
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Home</div>
                                    <div className="text-xl font-sports font-bold tracking-tight">{selectedMatch.home}</div>
                                </div>
                                <div className="text-4xl font-sports font-black flex items-center gap-3">
                                    <span>{selectedMatch.homeScore}</span>
                                    <span className="text-muted-foreground/30 text-2xl">-</span>
                                    <span>{selectedMatch.awayScore}</span>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Away</div>
                                    <div className="text-xl font-sports font-bold tracking-tight">{selectedMatch.away}</div>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Badge variant="secondary" className="font-mono">{selectedMatch.finished ? "FT" : `${selectedMatch.minutes}'`}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <MatchStatsBreakdown stats={selectedMatch.stats} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

