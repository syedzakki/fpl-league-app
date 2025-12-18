"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/ui/shine-border"

interface LiveRankCardProps {
    rank: number
    lastRank?: number
    points: number
    isLoading?: boolean
}

export function LiveRankCard({ rank, lastRank, points, isLoading }: LiveRankCardProps) {
    if (isLoading) return <Card className="p-6 h-full animate-pulse bg-muted/20" />

    const diff = lastRank ? lastRank - rank : 0
    const isUp = diff > 0
    const isDown = diff < 0

    return (
        <Card className="p-6 relative overflow-hidden group border-border/50">
            <ShineBorder className="absolute inset-0 w-full h-full pointer-events-none opacity-50" shineColor={isUp ? ["#22c55e", "#10b981"] : isDown ? ["#ef4444", "#b91c1c"] : ["#3b82f6", "#1d4ed8"]} duration={10} />

            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 relative z-10">Live Rank</h3>

            <div className="flex items-baseline gap-2 relative z-10">
                <span className="font-sports text-5xl font-bold italic tracking-tighter text-foreground">
                    {rank}
                    <span className="text-lg text-muted-foreground font-normal align-top ml-1">th</span>
                </span>
            </div>

            <div className="mt-2 flex items-center gap-2 relative z-10">
                {isUp ? (
                    <div className="flex items-center text-green-500 text-xs font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span className="font-mono">+{diff}</span>
                    </div>
                ) : isDown ? (
                    <div className="flex items-center text-red-500 text-xs font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        <span className="font-mono">{diff}</span>
                    </div>
                ) : (
                    <div className="flex items-center text-muted-foreground text-xs font-bold bg-muted/20 px-1.5 py-0.5 rounded">
                        <Minus className="h-3 w-3 mr-1" />
                        <span>0</span>
                    </div>
                )}
                <span className="text-muted-foreground text-xs">from GW start</span>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center relative z-10">
                <span className="text-xs text-muted-foreground font-medium">Live Points</span>
                <span className="font-mono text-xl font-bold text-primary">{points} pts</span>
            </div>
        </Card>
    )
}
