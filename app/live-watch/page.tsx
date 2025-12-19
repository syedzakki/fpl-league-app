"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Activity,
    RefreshCw,
    Trophy,
    Users,
    Zap,
    Timer,
    ChevronRight,
    Star,
    AlertCircle,
    ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlobalRefresh } from "@/components/global-refresh"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Match {
    id: number
    home: string
    homeShort: string
    away: string
    awayShort: string
    homeScore: number | null
    awayScore: number | null
    started: boolean
    finished: boolean
    minutes: number
    kickoff: string
    stats: Record<string, { h: any[], a: any[] }>
}

interface Manager {
    id: string
    name: string
    totalLivePoints: number
    players: {
        id: number
        name: string
        points: number
        multiplier: number
        isCaptain: boolean
        isViceCaptain: boolean
        minutes: number
        defcon: number
        bps: number
        hasCleanSheet: boolean
        isDefensive: boolean
        stats: any[]
    }[]
}

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
                <p className="text-muted-foreground font-medium animate-pulse">Syncing Live Match Center...</p>
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
                            <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Live Watch</h1>
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
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Upcoming Today</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                                {upcomingMatches.map((m, i) => (
                                    <MatchCard key={m.id} match={m} index={i} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Finished Section */}
                    {finishedMatches.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Recently Finished</h3>
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

            {/* Match Detail Dialog (Simulated with fixed overlay for now or could use Dialog component) */}
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

function MatchCard({ match, index, onClick }: { match: Match, index: number, onClick?: () => void }) {
    return (
        <BlurFade delay={0.1 + index * 0.05}>
            <Card
                className={cn(
                    "hover:border-primary/50 transition-all duration-300 group cursor-pointer relative overflow-hidden",
                    match.started && !match.finished && "border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.05)]"
                )}
                onClick={onClick}
            >
                <div className="absolute top-0 right-0 p-2">
                    {match.started && !match.finished && <Activity className="w-3 h-3 text-primary animate-pulse" />}
                </div>
                <CardHeader className="py-4 px-5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        <span>{match.finished ? "Finished" : match.started ? "Live" : "Scheduled"}</span>
                        <span className="font-mono">{match.started ? `${match.minutes}'` : new Date(match.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex flex-col items-start gap-1">
                            <span className="text-sm font-bold truncate w-full">{match.homeShort}</span>
                        </div>
                        <div className="px-3 py-1 rounded bg-muted/50 font-sports font-black text-xl min-w-[3rem] text-center">
                            {match.started ? `${match.homeScore} : ${match.awayScore}` : "vs"}
                        </div>
                        <div className="flex-1 flex flex-col items-end gap-1">
                            <span className="text-sm font-bold truncate w-full text-right">{match.awayShort}</span>
                        </div>
                    </div>
                </CardHeader>
                {match.started && (
                    <CardContent className="px-5 pb-4 pt-0">
                        <div className="flex flex-wrap gap-1 mt-2">
                            {/* Show a few scorers if any */}
                            {match.stats.goals_scored?.h.slice(0, 1).map((s: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-[9px] py-0">{s.player} ⚽</Badge>
                            ))}
                            {match.stats.goals_scored?.a.slice(0, 1).map((s: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-[9px] py-0">{s.player} ⚽</Badge>
                            ))}
                        </div>
                        {onClick && (
                            <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-primary group-hover:gap-1 transition-all">
                                <span>View Breakdown</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </BlurFade>
    )
}

function ManagerLiveCard({ manager, index }: { manager: Manager, index: number }) {
    const sortedPlayers = [...manager.players].sort((a, b) => b.points - a.points)

    return (
        <BlurFade delay={0.1 + index * 0.05}>
            <Card className="h-full flex flex-col border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-border/50 bg-muted/5">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {manager.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-sm font-bold italic uppercase">{manager.name}</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-tighter opacity-50">
                                {manager.players.filter(p => p.minutes > 0).length} / 11 Playing
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-sports font-black text-primary">{manager.totalLivePoints}</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-50">Live Pts</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {sortedPlayers.map((player) => (
                            <div key={player.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/10 transition-colors group">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "text-xs font-bold",
                                            player.minutes > 0 ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {player.name}
                                        </span>
                                        {player.isCaptain && <Badge className="h-4 px-1 text-[8px] font-black bg-primary text-primary-foreground">C</Badge>}
                                        {player.isViceCaptain && <Badge className="h-4 px-1 text-[8px] font-black bg-muted text-muted-foreground uppercase">V</Badge>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-tight">
                                            {player.minutes > 0 ? `${player.minutes}'` : "Not Started"}
                                        </span>
                                        {player.minutes > 0 && (
                                            <div className="flex gap-1">
                                                <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-primary/20 bg-primary/5 text-primary">
                                                    DEFCON {player.defcon}
                                                </Badge>
                                                <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-muted-foreground/20 bg-muted/5 text-muted-foreground">
                                                    BPS {player.bps}
                                                </Badge>
                                            </div>
                                        )}
                                        {player.isDefensive && player.minutes > 0 && player.hasCleanSheet && (
                                            <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-blue-500/20 bg-blue-500/5 text-blue-500">
                                                CS
                                            </Badge>
                                        )}
                                        {player.points > 5 && <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className={cn(
                                        "text-sm font-mono font-bold",
                                        player.points > 0 ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {player.points}
                                    </div>
                                    {/* Points Breakdown Hint */}
                                    <div className="flex gap-1 overflow-hidden h-3">
                                        {player.stats.filter(s => s.value !== 0).map((s, idx) => (
                                            <span key={idx} className="text-[8px] font-medium text-muted-foreground/50 uppercase tracking-tighter">
                                                {s.identifier.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </BlurFade>
    )
}

function MatchStatsBreakdown({ stats }: { stats: Match['stats'] }) {
    const categories = [
        { id: 'goals_scored', label: 'Goals', icon: '⚽' },
        { id: 'assists', label: 'Assists', icon: '👟' },
        { id: 'own_goals', label: 'Own Goals', icon: '❌' },
        { id: 'penalties_saved', label: 'Penalties Saved', icon: '🥅' },
        { id: 'penalties_missed', label: 'Penalties Missed', icon: '🏴' },
        { id: 'yellow_cards', label: 'Yellow Cards', icon: '🟨' },
        { id: 'red_cards', label: 'Red Cards', icon: '🟥' },
        { id: 'saves', label: 'Saves', icon: '🧤' },
        { id: 'bonus', label: 'Bonus Points', icon: '💎' },
        { id: 'bps', label: 'Bonus Point System (BPS)', icon: '📈' },
        { id: 'defensive_contribution', label: 'Defcon Points', icon: '🛡️' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Statistical Breakdown</h4>
            </div>

            <div className="space-y-4">
                {categories.map((cat) => {
                    const data = stats[cat.id]
                    if (!data || (data.h.length === 0 && data.a.length === 0)) return null

                    return (
                        <div key={cat.id} className="grid grid-cols-2 gap-4 border-b border-border/30 pb-4">
                            <div className="col-span-2 text-[10px] font-bold uppercase text-muted-foreground text-center mb-1">
                                {cat.icon} {cat.label}
                            </div>
                            <div className="space-y-1">
                                {data.h.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/20">
                                        <span className="font-medium">{item.player}</span>
                                        <span className="font-mono font-bold text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                {data.a.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/20">
                                        <span className="font-medium">{item.player}</span>
                                        <span className="font-mono font-bold text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
