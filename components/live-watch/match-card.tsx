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
