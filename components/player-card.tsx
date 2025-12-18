"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Skull, Crown } from "lucide-react"
import type { TeamStats } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PlayerCardProps {
  stats: TeamStats
}

const getPositionColor = (position: number) => {
  if (position === 1) return "bg-yellow-500"
  if (position === 2) return "bg-slate-400"
  if (position === 3) return "bg-orange-700"
  return "bg-muted"
}

// These specific player colors can remain as identity markers, but we could soften them
const PLAYER_COLORS: Record<string, string> = {
  "Wasim": "bg-teal-600",
  "Anuj": "bg-blue-800",
  "Chiru": "bg-orange-500",
  "Zakki": "bg-red-500",
  "Tejas": "bg-purple-500",
  "Sunad": "bg-pink-500",
}

export function PlayerCard({ stats }: PlayerCardProps) {
  const color = PLAYER_COLORS[stats.teamName] || "bg-primary"
  const initials = stats.teamName.slice(0, 2).toUpperCase()

  return (
    <Card className="overflow-hidden bg-card border-border/50 hover:border-primary transition-all duration-200 hover:scale-[1.02] group">
      <div className={cn("h-1", getPositionColor(stats.leaderboardPosition))} />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm", color)}>
              {initials}
            </div>
            <div>
              <p className="font-sports font-bold text-lg leading-none">{stats.teamName}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{stats.totalPoints.toLocaleString()} pts</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("text-[10px] w-6 h-6 flex items-center justify-center p-0 rounded-full border-0 font-bold",
              stats.leaderboardPosition === 1 ? "bg-yellow-500 text-black" :
                stats.leaderboardPosition === 2 ? "bg-slate-400 text-white" :
                  stats.leaderboardPosition === 3 ? "bg-orange-700 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            #{stats.leaderboardPosition}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
            <Trophy className="w-3.5 h-3.5 mx-auto text-yellow-500 mb-1" />
            <p className="text-sm font-bold text-yellow-500">{stats.gwWins}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Wins</p>
          </div>

          <div className="p-2 rounded-lg bg-slate-400/10 border border-slate-400/20 group-hover:bg-slate-400/20 transition-colors">
            <Medal className="w-3.5 h-3.5 mx-auto text-slate-400 mb-1" />
            <p className="text-sm font-bold text-slate-400">{stats.secondFinishes}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">2nd</p>
          </div>

          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
            <Skull className="w-3.5 h-3.5 mx-auto text-red-500 mb-1" />
            <p className="text-sm font-bold text-red-500">{stats.lastFinishes}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Last</p>
          </div>

          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Crown className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold text-primary">{stats.captaincyWins}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cap</p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
          <span>Best: <span className="text-primary font-mono ml-1">{stats.bestGameweek}</span></span>
          <span>Worst: <span className="text-destructive font-mono ml-1">{stats.worstGameweek}</span></span>
          <span>Avg: <span className="text-foreground font-mono ml-1">{Math.round(stats.averagePoints)}</span></span>
        </div>
      </CardContent>
    </Card>
  )
}
