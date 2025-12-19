"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ChevronRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import { Match } from "./types"

export interface MatchCardProps {
    match: Match
    index: number
    onClick?: () => void
    myPlayers?: { id: number; name: string; teamId: number }[]
}

export function MatchCard({ match, index, onClick, myPlayers = [] }: MatchCardProps) {
    const kickoffDate = new Date(match.kickoff)
    const timeStr = kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dayStr = kickoffDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    const playersInThisMatch = myPlayers.filter(p => p.teamId === match.homeId || p.teamId === match.awayId);

    return (
        <BlurFade delay={0.1 + index * 0.05}>
            <Card
                className={cn(
                    "group cursor-pointer relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                    "border-border/50 bg-card/40 backdrop-blur-md",
                    match.started && !match.finished && "border-primary/50 ring-1 ring-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]"
                )}
                onClick={onClick}
            >
                {/* Visual Accent */}
                <div className={cn(
                    "absolute top-0 left-0 w-1 h-full bg-muted transition-colors duration-500 group-hover:bg-primary/50",
                    match.started && !match.finished && "bg-primary animate-pulse"
                )} />

                <CardHeader className="py-5 px-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
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
                            {playersInThisMatch.length > 0 && (
                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tight h-4 px-1 border-primary/30 text-primary bg-primary/5">
                                    {playersInThisMatch.length} OF MY SQUAD
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
                            </div>
                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="font-sports text-xl font-black italic tracking-tight text-foreground/90 uppercase text-right">{match.awayShort}</span>
                            </div>
                        </div>

                        {playersInThisMatch.length > 0 && (
                            <div className="pt-3 border-t border-border/10">
                                <div className="flex flex-wrap gap-1">
                                    {playersInThisMatch.map(p => (
                                        <span key={p.id} className="text-[8px] font-bold py-0.5 px-1.5 rounded bg-primary/5 border border-primary/10 text-primary/70 uppercase">
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
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
                            <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-primary/70 group-hover:text-primary transition-all">
                                <span>Detailed Stats</span>
                                <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </BlurFade>
    )
}
