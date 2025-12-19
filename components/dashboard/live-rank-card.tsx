"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/ui/shine-border"
import { Badge } from "@/components/ui/badge"

interface LiveRankCardProps {
    rank: number
    lastRank?: number
    overallRank?: number
    points: number
    isLoading?: boolean
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
}

export function LiveRankCard({ rank, lastRank, overallRank, points, isLoading }: LiveRankCardProps) {
    if (isLoading) return <Card className="p-6 h-full animate-pulse bg-muted/20 border-dashed" />

    const diff = lastRank ? lastRank - rank : 0
    const isUp = diff > 0
    const isDown = diff < 0
    const suffix = getOrdinal(rank)

    return (
        <Card className="relative h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur-2xl group border-l-4" style={{
            borderLeftColor: isUp ? "#22c55e" : isDown ? "#ef4444" : "transparent"
        }}>
            <ShineBorder
                className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
                shineColor={isUp ? ["#22c55e", "#4ade80"] : isDown ? ["#ef4444", "#f87171"] : ["#a1a1aa", "#d4d4d8"]}
                duration={10}
            />

            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 scale-150 -rotate-12 translate-x-4 -translate-y-4">
                <Trophy className="w-32 h-32" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isUp ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : isDown ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-muted-foreground"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">League Standings</span>
                    </div>
                    {overallRank && (
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-0.5">Overall Rank</span>
                            <span className="text-[10px] font-mono font-bold text-foreground">#{overallRank.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-7xl font-sports font-black italic tracking-tighter text-foreground leading-none drop-shadow-[0_4px_16px_rgba(255,255,255,0.05)]">
                                {rank}
                            </span>
                            <span className="text-2xl font-sports font-bold text-muted-foreground/60 italic uppercase">{suffix}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            {isUp ? (
                                <div className="flex items-center px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-black italic tracking-wider uppercase border border-green-500/20">
                                    <TrendingUp className="h-3 w-3 mr-1.5" />
                                    <span>Gained {diff} Ranks</span>
                                </div>
                            ) : isDown ? (
                                <div className="flex items-center px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-black italic tracking-wider uppercase border border-red-500/20">
                                    <TrendingDown className="h-3 w-3 mr-1.5" />
                                    <span>Lost {Math.abs(diff)} Ranks</span>
                                </div>
                            ) : (
                                <div className="flex items-center px-2 py-0.5 rounded bg-muted/20 text-muted-foreground text-[10px] font-black italic tracking-wider uppercase border border-border/50">
                                    <Minus className="h-3 w-3 mr-1.5" />
                                    <span>Steady at {rank}{getOrdinal(rank)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t border-border/10 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1">Live GC Points</p>
                        <p className="text-3xl font-mono font-black text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.4)] leading-none">{points}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1">Net GW Trend</p>
                        <div className={cn(
                            "text-2xl font-mono font-black leading-none",
                            isUp ? "text-green-500" : isDown ? "text-red-500" : "text-foreground"
                        )}>
                            {isUp ? "+" : ""}{diff}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
