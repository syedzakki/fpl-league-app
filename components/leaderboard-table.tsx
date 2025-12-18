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
      <Badge className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-[10px] px-1.5 py-0 font-bold h-5">
        <Trophy className="w-2.5 h-2.5 mr-0.5" />1st
      </Badge>
    )
    if (position === 2) return (
      <Badge className="bg-slate-400/10 border border-slate-400/30 text-slate-400 text-[10px] px-1.5 py-0 font-bold h-5">
        <Medal className="w-2.5 h-2.5 mr-0.5" />2nd
      </Badge>
    )
    if (position === 3) return (
      <Badge className="bg-orange-600/10 border border-orange-600/30 text-orange-600 text-[10px] px-1.5 py-0 font-bold h-5">
        <Award className="w-2.5 h-2.5 mr-0.5" />3rd
      </Badge>
    )
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50 h-5 font-mono">
        {position}
      </Badge>
    )
  }

  const getRowStyle = (position: number) => {
    if (position === 1) return "bg-yellow-500/5 hover:bg-yellow-500/10"
    if (position === 2) return "bg-slate-400/5 hover:bg-slate-400/10"
    if (position === 3) return "bg-orange-600/5 hover:bg-orange-600/10"
    return "hover:bg-muted/20"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/20 border-b border-border/50 hover:bg-muted/20">
          <TableHead className="py-2 px-3 font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-[70px]">Pos</TableHead>
          <TableHead className="py-2 px-3 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Team</TableHead>
          <TableHead className="py-2 px-3 text-right font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-[70px]">Pts</TableHead>
          <TableHead className="py-2 px-3 text-center font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-[40px]">W</TableHead>
          <TableHead className="py-2 px-3 text-center font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-[40px]">2nd</TableHead>
          <TableHead className="py-2 px-3 text-center font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-[40px]">L</TableHead>
          <TableHead className="py-2 px-3 text-center font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-[40px]">C</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => (
          <TableRow
            key={entry.teamId}
            className={cn(
              "border-b border-border/50 transition-colors",
              getRowStyle(entry.position)
            )}
          >
            <TableCell className="py-2 px-3">
              {getPositionBadge(entry.position)}
            </TableCell>
            <TableCell className="py-2 px-3">
              <span className="font-semibold text-sm">{entry.teamName}</span>
            </TableCell>
            <TableCell className="py-2 px-3 text-right">
              <span className="font-bold font-mono text-base text-primary">
                {entry.totalPoints}
              </span>
            </TableCell>
            <TableCell className="py-2 px-3 text-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold font-mono text-green-600">
                {entry.gwWins}
              </span>
            </TableCell>
            <TableCell className="py-2 px-3 text-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold font-mono text-blue-500">
                {entry.secondFinishes}
              </span>
            </TableCell>
            <TableCell className="py-2 px-3 text-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold font-mono text-red-500">
                {entry.lastFinishes}
              </span>
            </TableCell>
            <TableCell className="py-2 px-3 text-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold font-mono text-yellow-600">
                {entry.captaincyWins}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
