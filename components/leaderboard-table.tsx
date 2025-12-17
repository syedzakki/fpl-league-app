"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  showBorderBeam?: boolean
}

export function LeaderboardTable({ entries, showBorderBeam = false }: LeaderboardTableProps) {
  const getPositionBadge = (position: number) => {
    if (position === 1) return (
      <Badge className="bg-[#F26430]/20 border border-[#F26430]/50 text-[#F26430] text-xs px-2 py-0.5 font-semibold">
        <Trophy className="w-3 h-3 mr-1" />1st
      </Badge>
    )
    if (position === 2) return (
      <Badge className="bg-[#028090]/20 border border-[#028090]/50 text-[#028090] text-xs px-2 py-0.5 font-semibold">
        <Medal className="w-3 h-3 mr-1" />2nd
      </Badge>
    )
    if (position === 3) return (
      <Badge className="bg-[#19297C]/20 border border-[#19297C]/50 text-[#19297C] dark:text-[#DBC2CF] text-xs px-2 py-0.5 font-semibold">
        <Award className="w-3 h-3 mr-1" />3rd
      </Badge>
    )
    return (
      <Badge variant="outline" className="border-[#DBC2CF] dark:border-[#19297C] text-[#19297C] dark:text-[#DBC2CF] text-xs px-2 py-0.5">
        {position}th
      </Badge>
    )
  }

  const getRowStyle = (position: number) => {
    if (position === 1) return "bg-[#F26430]/5 hover:bg-[#F26430]/10"
    if (position === 2) return "bg-[#028090]/5 hover:bg-[#028090]/10"
    if (position === 3) return "bg-[#19297C]/5 dark:bg-[#19297C]/10 hover:bg-[#19297C]/10"
    return "hover:bg-[#DBC2CF]/30 dark:hover:bg-[#19297C]/30"
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
      <CardHeader className="py-4 px-6 border-b border-[#DBC2CF] dark:border-[#19297C]">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-[#F26430]" />
          </div>
          <div>
            <CardTitle className="text-base text-[#1A1F16] dark:text-[#FFFCF2]">League Leaderboard</CardTitle>
            <CardDescription className="text-xs text-[#19297C] dark:text-[#DBC2CF]">
              Current standings based on total points
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#DBC2CF]/30 dark:bg-[#19297C]/30 border-b border-[#DBC2CF] dark:border-[#19297C] hover:bg-[#DBC2CF]/30 dark:hover:bg-[#19297C]/30">
              <TableHead className="py-3 px-4 font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Pos</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Team</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Points</TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">W</TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">2nd</TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">L</TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow 
                key={entry.teamId} 
                className={cn(
                  "border-b border-[#DBC2CF] dark:border-[#19297C] transition-colors",
                  getRowStyle(entry.position)
                )}
              >
                <TableCell className="py-3 px-4">
                  {getPositionBadge(entry.position)}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <span className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">{entry.teamName}</span>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <span className="font-bold font-mono text-lg text-[#F26430]">
                    {entry.totalPoints}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#028090]/10 text-[#028090] text-sm font-semibold font-mono">
                    {entry.gwWins}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#19297C]/10 dark:bg-[#19297C]/20 text-[#19297C] dark:text-[#DBC2CF] text-sm font-semibold font-mono">
                    {entry.secondFinishes}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F26430]/10 text-[#F26430] text-sm font-semibold font-mono">
                    {entry.lastFinishes}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F26430]/10 text-[#F26430] text-sm font-semibold font-mono">
                    {entry.captaincyWins}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
