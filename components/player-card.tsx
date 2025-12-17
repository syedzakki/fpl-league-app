"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Skull, Crown } from "lucide-react"
import type { TeamStats } from "@/lib/types"

interface PlayerCardProps {
  stats: TeamStats
  rank: number
}

const getPositionColor = (position: number) => {
  if (position === 1) return "bg-[#F26430]"
  if (position === 2) return "bg-[#028090]"
  if (position === 3) return "bg-[#19297C]"
  return "bg-[#DBC2CF] dark:bg-[#19297C]"
}

const PLAYER_COLORS: Record<string, string> = {
  "Wasim": "bg-[#028090]",
  "Anuj": "bg-[#19297C]",
  "Chiru": "bg-[#F26430]",
  "Zakki": "bg-[#F26430]",
  "Tejas": "bg-purple-500",
  "Sunad": "bg-pink-500",
}

export function PlayerCard({ stats, rank }: PlayerCardProps) {
  const color = PLAYER_COLORS[stats.teamName] || "bg-[#3d3f56]"
  const initials = stats.teamName.slice(0, 2).toUpperCase()
  
  return (
    <Card className="overflow-hidden bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] hover:border-[#F26430] dark:hover:border-[#028090] transition-all duration-200 hover:scale-[1.02]">
      <div className={`h-1 ${getPositionColor(stats.leaderboardPosition)}`} />
      
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold`}>
              {initials}
            </div>
            <div>
              <p className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">{stats.teamName}</p>
              <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">{stats.totalPoints.toLocaleString()} pts</p>
            </div>
          </div>
          <Badge 
            className={`text-xs ${
              stats.leaderboardPosition === 1 ? "bg-[#F26430] text-white" :
              stats.leaderboardPosition === 2 ? "bg-[#028090] text-white" :
              stats.leaderboardPosition === 3 ? "bg-[#19297C] text-white dark:text-[#FFFCF2]" : "bg-[#DBC2CF] dark:bg-[#19297C] text-[#1A1F16] dark:text-[#FFFCF2]"
            }`}
          >
            #{stats.leaderboardPosition}
          </Badge>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-[#028090]/10 border border-[#028090]/20">
            <Trophy className="w-3.5 h-3.5 mx-auto text-[#028090] mb-1" />
            <p className="text-sm font-bold text-[#028090]">{stats.gwWins}</p>
            <p className="text-[10px] text-[#19297C] dark:text-[#DBC2CF]">Wins</p>
          </div>
          
          <div className="p-2 rounded-lg bg-[#19297C]/10 dark:bg-[#19297C]/20 border border-[#19297C]/20 dark:border-[#19297C]/30">
            <Medal className="w-3.5 h-3.5 mx-auto text-[#19297C] dark:text-[#DBC2CF] mb-1" />
            <p className="text-sm font-bold text-[#19297C] dark:text-[#DBC2CF]">{stats.secondFinishes}</p>
            <p className="text-[10px] text-[#19297C] dark:text-[#DBC2CF]">2nd</p>
          </div>
          
          <div className="p-2 rounded-lg bg-[#F26430]/10 border border-[#F26430]/20">
            <Skull className="w-3.5 h-3.5 mx-auto text-[#F26430] mb-1" />
            <p className="text-sm font-bold text-[#F26430]">{stats.lastFinishes}</p>
            <p className="text-[10px] text-[#19297C] dark:text-[#DBC2CF]">Last</p>
          </div>
          
          <div className="p-2 rounded-lg bg-[#F26430]/10 border border-[#F26430]/20">
            <Crown className="w-3.5 h-3.5 mx-auto text-[#F26430] mb-1" />
            <p className="text-sm font-bold text-[#F26430]">{stats.captaincyWins}</p>
            <p className="text-[10px] text-[#19297C] dark:text-[#DBC2CF]">Cap</p>
          </div>
        </div>
        
        {/* Footer Stats */}
        <div className="flex justify-between mt-3 pt-3 border-t border-[#DBC2CF] dark:border-[#19297C] text-xs text-[#19297C] dark:text-[#DBC2CF]">
          <span>Best: <span className="text-[#028090] font-mono">{stats.bestGameweek}</span></span>
          <span>Worst: <span className="text-[#F26430] font-mono">{stats.worstGameweek}</span></span>
          <span>Avg: <span className="text-[#1A1F16] dark:text-[#FFFCF2] font-mono">{Math.round(stats.averagePoints)}</span></span>
        </div>
      </CardContent>
    </Card>
  )
}
