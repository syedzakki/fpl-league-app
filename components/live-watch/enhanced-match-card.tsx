"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ChevronRight, Shield, Zap, AlertTriangle, Clock } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import { Match, Manager } from "./types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

export interface EnhancedMatchCardProps {
    match: Match
    index: number
    onClick?: () => void
    myPlayers?: { id: number; name: string; teamId: number }[]
    managers?: Manager[]
    myTeamId?: string | null
}

export function EnhancedMatchCard({ match, index, onClick, myPlayers = [], managers = [], myTeamId }: EnhancedMatchCardProps) {
    const [showPlayers, setShowPlayers] = useState(false)
    const kickoffDate = new Date(match.kickoff)
    const timeStr = kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dayStr = kickoffDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    // Find my players in this match
    const myPlayersInMatch = myPlayers.filter(p => p.teamId === match.homeId || p.teamId === match.awayId)
    
    // Get detailed player info from managers data
    const myManager = managers.find(m => m.id === myTeamId)
    const myPlayersDetailed = myPlayersInMatch.map(mp => {
        const playerData = myManager?.players.find(p => p.id === mp.id)
        return {
            ...mp,
            points: playerData?.points || 0,
            minutes: playerData?.minutes || 0,
            bps: playerData?.bps || 0,
            bonusPoints: playerData?.bonusPoints || 0,
            defcon: playerData?.defcon || 0,
            defcoinPoints: playerData?.defcoinPoints || 0,
            isCaptain: playerData?.isCaptain || false,
            isViceCaptain: playerData?.isViceCaptain || false,
            hasCleanSheet: playerData?.hasCleanSheet || false,
            isDefensive: playerData?.isDefensive || false
        }
    })

    // Count unavailable players (0 minutes)
    const unavailablePlayers = myPlayersDetailed.filter(p => match.started && p.minutes === 0)
    const activePlayers = myPlayersDetailed.filter(p => match.started && p.minutes > 0)

    // Determine fixture importance based on number of players
    const getFixtureImportance = () => {
        const playerCount = myPlayersInMatch.length
        if (playerCount === 0) return { color: "bg-muted/10", borderColor: "border-border/30", label: "No players" }
        if (playerCount === 1) return { color: "bg-blue-500/10", borderColor: "border-blue-500/30", label: "1 player" }
        if (playerCount === 2) return { color: "bg-green-500/10", borderColor: "border-green-500/30", label: "2 players" }
        if (playerCount >= 3) return { color: "bg-primary/10", borderColor: "border-primary/30", label: "3+ players" }
        return { color: "bg-muted/10", borderColor: "border-border/30", label: "No players" }
    }

    const importance = getFixtureImportance()

    return (
        <BlurFade delay={0.1 + index * 0.05}>
            <Card
                className={cn(
                    "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                    "backdrop-blur-md",
                    importance.color,
                    importance.borderColor,
                    "border-2",
                    match.started && !match.finished && "ring-2 ring-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.15)]"
                )}
            >
                {/* Visual Accent - Color coded by importance */}
                <div className={cn(
                    "absolute top-0 left-0 w-2 h-full transition-colors duration-500",
                    myPlayersInMatch.length === 0 && "bg-muted/30",
                    myPlayersInMatch.length === 1 && "bg-blue-500/50",
                    myPlayersInMatch.length === 2 && "bg-green-500/50",
                    myPlayersInMatch.length >= 3 && "bg-primary/70",
                    match.started && !match.finished && "animate-pulse"
                )} />

                <CardHeader className="py-5 px-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                                variant={match.started && !match.finished ? "destructive" : "secondary"}
                                className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-1.5 py-0 h-4 rounded-sm",
                                    match.started && !match.finished && "animate-pulse"
                                )}
                            >
                                {match.finished ? "FT" : match.started ? "Live" : "Upcoming"}
                            </Badge>
                            {!match.started && (
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 px-1.5 py-0 rounded-sm border border-border/50">
                                    {dayStr}
                                </span>
                            )}
                            {myPlayersInMatch.length > 0 && (
                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tight h-4 px-1 border-primary/30 text-primary bg-primary/5">
                                    {myPlayersInMatch.length} MY PLAYERS
                                </Badge>
                            )}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                            {match.started && !match.finished && <Activity className="w-3 h-3 text-primary animate-pulse" />}
                            {match.started ? `${match.minutes}'` : timeStr}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="font-sports text-xl font-black italic tracking-tight text-foreground/90 uppercase">{match.homeShort}</span>
                            </div>
                            <div className="flex flex-col items-center px-4">
                                {match.started ? (
                                    <span className="font-mono text-2xl font-black tracking-tighter text-foreground tabular-nums">
                                        {match.homeScore} <span className="text-muted-foreground/30 text-lg mx-1">-</span> {match.awayScore}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/20 px-2 py-0.5 rounded-full">VS</span>
                                )}
                                {match.xG && !match.started && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[8px] text-muted-foreground font-mono">xG: {match.xG.home.toFixed(1)}</span>
                                        <span className="text-[8px] text-muted-foreground">-</span>
                                        <span className="text-[8px] text-muted-foreground font-mono">{match.xG.away.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="font-sports text-xl font-black italic tracking-tight text-foreground/90 uppercase text-right">{match.awayShort}</span>
                            </div>
                        </div>

                        {/* My Players Section */}
                        {myPlayersDetailed.length > 0 && (
                            <Collapsible open={showPlayers} onOpenChange={setShowPlayers}>
                                <CollapsibleTrigger className="w-full">
                                    <div className="pt-3 border-t border-border/10 cursor-pointer hover:bg-muted/5 -mx-2 px-2 py-1 rounded transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">My Squad</span>
                                                {match.started && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] px-1 py-0 h-3.5">
                                                        {myPlayersDetailed.reduce((sum, p) => sum + p.points, 0)} pts
                                                    </Badge>
                                                )}
                                            </div>
                                            <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform", showPlayers && "rotate-90")} />
                                        </div>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-2">
                                    {!match.started && (
                                        <div className="flex flex-wrap gap-1">
                                            {myPlayersDetailed.map(p => (
                                                <div key={p.id} className="flex items-center gap-1 text-[8px] font-bold py-0.5 px-1.5 rounded bg-primary/5 border border-primary/10 text-primary/70 uppercase">
                                                    {p.isCaptain && <span className="text-[7px]">©</span>}
                                                    {p.isViceCaptain && <span className="text-[7px]">V</span>}
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {match.started && activePlayers.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[8px] font-black uppercase tracking-wider text-green-500 flex items-center gap-1">
                                                <Activity className="w-2.5 h-2.5" /> Active
                                            </div>
                                            {activePlayers.map(p => (
                                                <div key={p.id} className="flex items-center justify-between text-[9px] px-2 py-1.5 rounded bg-green-500/5 border border-green-500/10">
                                                    <div className="flex items-center gap-1.5">
                                                        {p.isCaptain && <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[7px] px-1 py-0 h-3">C</Badge>}
                                                        {p.isViceCaptain && <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[7px] px-1 py-0 h-3">V</Badge>}
                                                        <span className="font-bold">{p.name}</span>
                                                        <span className="text-[7px] text-muted-foreground">{p.minutes}'</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {p.isDefensive && p.defcon > 0 && (
                                                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[7px] px-1 py-0 h-3 flex items-center gap-0.5">
                                                                <Shield className="w-2 h-2" /> {p.defcon}
                                                            </Badge>
                                                        )}
                                                        {p.bps > 0 && (
                                                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[7px] px-1 py-0 h-3 flex items-center gap-0.5">
                                                                <Zap className="w-2 h-2" /> {p.bps}
                                                            </Badge>
                                                        )}
                                                        {p.bonusPoints > 0 && (
                                                            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[7px] px-1 py-0 h-3">
                                                                +{p.bonusPoints}
                                                            </Badge>
                                                        )}
                                                        <span className="font-mono font-black text-primary">{p.points}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {match.started && unavailablePlayers.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[8px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                                                <AlertTriangle className="w-2.5 h-2.5" /> Unavailable
                                            </div>
                                            {unavailablePlayers.map(p => (
                                                <div key={p.id} className="flex items-center justify-between text-[9px] px-2 py-1.5 rounded bg-red-500/5 border border-red-500/10 opacity-60">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold">{p.name}</span>
                                                        <span className="text-[7px] text-muted-foreground">0'</span>
                                                    </div>
                                                    <span className="font-mono font-black text-muted-foreground">0</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>
                </CardHeader>

                {match.started && (
                    <CardContent className="px-6 pb-5 pt-0">
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/20">
                            {match.stats.goals_scored?.h.map((s: any, i: number) => (
                                <div key={`h-${i}`} className="inline-flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/50">
                                    <span className="text-primary">⚽</span> {s.player}
                                </div>
                            ))}
                            {match.stats.goals_scored?.a.map((s: any, i: number) => (
                                <div key={`a-${i}`} className="inline-flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/50">
                                    <span className="text-primary">⚽</span> {s.player}
                                </div>
                            ))}
                        </div>
                        {onClick && (
                            <button
                                onClick={onClick}
                                className="mt-4 w-full flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-all group"
                            >
                                <span>Full Match Stats</span>
                                <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </CardContent>
                )}
            </Card>
        </BlurFade>
    )
}

