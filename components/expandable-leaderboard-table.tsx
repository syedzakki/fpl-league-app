"use client"

import { useState } from "react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Medal, Award, ChevronDown, ChevronUp, TrendingUp, TrendingDown, ArrowRightLeft, AlertTriangle } from "lucide-react"
import type { LeaderboardEntry, GameweekDetail } from "@/lib/types"
import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"

interface ExpandableLeaderboardTableProps {
  entries: LeaderboardEntry[]
  showBorderBeam?: boolean
}

export function ExpandableLeaderboardTable({ entries, showBorderBeam = false }: ExpandableLeaderboardTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (teamId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId)
    } else {
      newExpanded.add(teamId)
    }
    setExpandedRows(newExpanded)
  }

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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-[#F7E733]/20 border-[#F7E733]/50 text-[#F7E733]"
    if (rank === 2) return "bg-[#1BE7FF]/20 border-[#1BE7FF]/50 text-[#1BE7FF]"
    if (rank <= 6) return "bg-[#4DAA57]/20 border-[#4DAA57]/50 text-[#4DAA57]"
    return "bg-[#3d3f56]/20 border-[#3d3f56]/50 text-gray-400"
  }

  return (
    <TooltipProvider>
      <Card className="overflow-hidden bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
        <CardHeader className="py-4 px-6 border-b border-[#DBC2CF] dark:border-[#19297C]">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-[#F26430]" />
            </div>
            <div>
              <CardTitle className="text-base text-[#1A1F16] dark:text-[#FFFCF2]">League Leaderboard</CardTitle>
              <CardDescription className="text-xs text-[#19297C] dark:text-[#DBC2CF]">
                Click on any row to view gameweek-by-gameweek breakdown
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#DBC2CF]/30 dark:bg-[#19297C]/30 border-b border-[#DBC2CF] dark:border-[#19297C] hover:bg-[#DBC2CF]/30 dark:hover:bg-[#19297C]/30">
                <TableHead className="py-3 px-4 w-[50px]"></TableHead>
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
                <Collapsible key={entry.teamId} open={expandedRows.has(entry.teamId)} onOpenChange={() => toggleRow(entry.teamId)}>
                  <CollapsibleTrigger asChild>
                    <TableRow 
                      className={cn(
                        "border-b border-[#DBC2CF] dark:border-[#19297C] transition-all cursor-pointer",
                        getRowStyle(entry.position)
                      )}
                    >
                      <TableCell className="py-3 px-4">
                        {expandedRows.has(entry.teamId) ? (
                          <ChevronUp className="h-4 w-4 text-[#19297C] dark:text-[#DBC2CF]" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[#19297C] dark:text-[#DBC2CF]" />
                        )}
                      </TableCell>
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
                  </CollapsibleTrigger>
                  
                  {entry.gameweekHistory && entry.gameweekHistory.length > 0 && (
                    <CollapsibleContent asChild>
                      <TableRow className="bg-[#DBC2CF]/10 dark:bg-[#19297C]/10">
                        <TableCell colSpan={8} className="p-0">
                          <BlurFade delay={0.1}>
                            <div className="p-6 space-y-4">
                              <h4 className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2] mb-4 flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-[#F26430]" />
                                Gameweek Performance
                              </h4>
                              
                              {/* Gameweek cards grid for better UX */}
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                                {entry.gameweekHistory.map((gw) => (
                                  <Card 
                                    key={gw.gameweek}
                                    className={cn(
                                      "overflow-hidden transition-all hover:scale-105",
                                      gw.rank === 1 && "border-[#F7E733]/50 bg-[#F7E733]/5",
                                      gw.rank === 2 && "border-[#1BE7FF]/50 bg-[#1BE7FF]/5",
                                      gw.rank > 2 && gw.rank <= 6 && "border-[#4DAA57]/50 bg-[#4DAA57]/5"
                                    )}
                                  >
                                    <CardContent className="p-3 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-[#19297C] dark:text-[#DBC2CF]">
                                          GW{gw.gameweek}
                                        </span>
                                        <Badge className={cn("text-[10px] px-1.5 py-0", getRankBadge(gw.rank))}>
                                          #{gw.rank}
                                        </Badge>
                                      </div>
                                      
                                      <div className="text-center">
                                        <p className="text-2xl font-bold font-mono text-[#F26430]">
                                          {gw.points}
                                        </p>
                                        <p className="text-[10px] text-[#19297C] dark:text-[#DBC2CF]">points</p>
                                      </div>
                                      
                                      {/* Transfers with tooltip */}
                                      <div className="flex items-center justify-center gap-1 text-xs">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 cursor-help">
                                              <ArrowRightLeft className="h-3 w-3 text-[#028090]" />
                                              <span className="font-mono text-[#028090]">{gw.transfers}</span>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="max-w-xs">
                                            <div className="space-y-2">
                                              <p className="font-semibold text-white">Transfers Made: {gw.transfers}</p>
                                              {gw.transferDetails && (
                                                <>
                                                  {gw.transferDetails.playersIn.length > 0 && (
                                                    <div>
                                                      <p className="text-xs text-[#4DAA57] mb-1">Players In:</p>
                                                      <ul className="text-xs space-y-0.5">
                                                        {gw.transferDetails.playersIn.map((player, idx) => (
                                                          <li key={idx} className="flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3 text-[#4DAA57]" />
                                                            {player}
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  )}
                                                  {gw.transferDetails.playersOut.length > 0 && (
                                                    <div>
                                                      <p className="text-xs text-[#FF3A20] mb-1">Players Out:</p>
                                                      <ul className="text-xs space-y-0.5">
                                                        {gw.transferDetails.playersOut.map((player, idx) => (
                                                          <li key={idx} className="flex items-center gap-1">
                                                            <TrendingDown className="h-3 w-3 text-[#FF3A20]" />
                                                            {player}
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                              {!gw.transferDetails && (
                                                <p className="text-xs text-gray-400">Hover to see transfer details</p>
                                              )}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                      
                                      {/* Hits and Hit Cost */}
                                      {gw.hits > 0 && (
                                        <div className="pt-2 border-t border-[#DBC2CF] dark:border-[#19297C]">
                                          <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1">
                                              <AlertTriangle className="h-3 w-3 text-[#FF3A20]" />
                                              <span className="text-[#FF3A20] font-semibold">{gw.hits} Hit{gw.hits > 1 ? 's' : ''}</span>
                                            </div>
                                            <span className="font-mono text-[#FF3A20] font-bold">-{gw.hitCost}</span>
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                              
                              {/* Summary Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#DBC2CF] dark:border-[#19297C]">
                                <div className="p-3 rounded-lg bg-[#028090]/10 border border-[#028090]/20">
                                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Total Transfers</p>
                                  <p className="text-2xl font-bold font-mono text-[#028090]">
                                    {entry.gameweekHistory.reduce((sum, gw) => sum + gw.transfers, 0)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#FF3A20]/10 border border-[#FF3A20]/20">
                                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Total Hits</p>
                                  <p className="text-2xl font-bold font-mono text-[#FF3A20]">
                                    {entry.gameweekHistory.reduce((sum, gw) => sum + gw.hits, 0)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#FF3A20]/10 border border-[#FF3A20]/20">
                                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Hit Cost</p>
                                  <p className="text-2xl font-bold font-mono text-[#FF3A20]">
                                    -{entry.gameweekHistory.reduce((sum, gw) => sum + gw.hitCost, 0)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#4DAA57]/10 border border-[#4DAA57]/20">
                                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Avg Points</p>
                                  <p className="text-2xl font-bold font-mono text-[#4DAA57]">
                                    {Math.round(entry.gameweekHistory.reduce((sum, gw) => sum + gw.points, 0) / entry.gameweekHistory.length)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </BlurFade>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

