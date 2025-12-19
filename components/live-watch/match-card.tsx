"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ChevronRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import { Match } from "./types"

interface MatchCardProps {
    match: Match
    index: number
    onClick?: () => void
}

export function MatchCard({ match, index, onClick }: MatchCardProps) {
    const kickoffDate = new Date(match.kickoff)
    const timeStr = kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dayStr = kickoffDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

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
                        </div>
                        <span className="font-mono text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                            {match.started && !match.finished && <Activity className="w-3 h-3 text-primary animate-pulse" />}
                            {match.started ? `${match.minutes}'` : timeStr}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 flex flex-col items-start min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-0.5 opacity-70">
                                {match.homeShort}
                            </span>
                            <span className="text-sm font-sports font-bold tracking-tight truncate w-full group-hover:text-primary transition-colors">
                                {match.home}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 shrink-0 px-4">
                            <div className={cn(
                                "font-sports font-black text-2xl tracking-tighter flex items-center gap-2 px-3 py-1 rounded-lg",
                                match.started ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground/50 italic opacity-50"
                            )}>
                                {match.started ? (
                                    <>
                                        <span>{match.homeScore}</span>
                                        <span className="text-muted-foreground/30 text-lg">:</span>
                                        <span>{match.awayScore}</span>
                                    </>
                                ) : (
                                    <span className="text-lg">VS</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-end min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-0.5 opacity-70">
                                {match.awayShort}
                            </span>
                            <span className="text-sm font-sports font-bold tracking-tight truncate w-full text-right group-hover:text-primary transition-colors">
                                {match.away}
                            </span>
                        </div>
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
