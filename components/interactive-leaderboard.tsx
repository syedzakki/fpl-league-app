"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Crown, Medal, Award, Flame, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/types"

interface InteractiveLeaderboardProps {
  data: LeaderboardEntry[]
  previousData?: LeaderboardEntry[]
}

export function InteractiveLeaderboard({ data, previousData }: InteractiveLeaderboardProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const getPositionChange = (teamId: string) => {
    if (!previousData) return 0
    const current = data.find(t => t.teamId === teamId)
    const previous = previousData.find(t => t.teamId === teamId)
    if (!current || !previous) return 0
    return previous.position - current.position
  }

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return (
        <div className="relative">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-0 trophy-pulse px-3 py-1">
            <Crown className="w-3 h-3 mr-1" />
            1st
          </Badge>
        </div>
      )
    }
    if (position === 2) {
      return (
        <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-0 px-3 py-1">
          <Medal className="w-3 h-3 mr-1" />
          2nd
        </Badge>
      )
    }
    if (position === 3) {
      return (
        <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900 border-0 px-3 py-1">
          <Award className="w-3 h-3 mr-1" />
          3rd
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-[#DBC2CF] dark:border-[#19297C] px-3 py-1">
        {position}th
      </Badge>
    )
  }

  const getPositionChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-[#028090] text-xs font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>+{change}</span>
        </div>
      )
    }
    if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-[#F26430] text-xs font-semibold">
          <TrendingDown className="w-3 h-3" />
          <span>{change}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-[#19297C] dark:text-[#DBC2CF] text-xs">
        <Minus className="w-3 h-3" />
      </div>
    )
  }

  const getRowClassName = (position: number, teamId: string) => {
    const baseClasses = "border-[#DBC2CF] dark:border-[#19297C] smooth-transition cursor-pointer touch-feedback"
    const hoverClasses = hoveredRow === teamId ? "bg-[#DBC2CF]/20 dark:bg-[#19297C]/20 scale-[1.01]" : ""
    const positionClasses = {
      1: "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10 hover:from-yellow-100 dark:hover:from-yellow-900/20",
      2: "bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/10 hover:from-gray-100 dark:hover:from-gray-800/20",
      3: "bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/10 hover:from-orange-100 dark:hover:from-orange-900/20",
    }[position] || "hover:bg-[#DBC2CF]/10 dark:hover:bg-[#19297C]/10"
    
    return cn(baseClasses, hoverClasses, positionClasses)
  }

  const getFormIndicator = (gwWins: number, lastFinishes: number) => {
    if (gwWins >= 3) {
      return (
        <div className="flex items-center gap-1 text-[#028090]">
          <Flame className="w-3 h-3" />
          <span className="text-xs font-semibold">Hot</span>
        </div>
      )
    }
    if (lastFinishes >= 3) {
      return (
        <div className="flex items-center gap-1 text-[#F26430]">
          <TrendingDown className="w-3 h-3" />
          <span className="text-xs font-semibold">Cold</span>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] hover-lift overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-[#DBC2CF] dark:border-[#19297C] hover:bg-transparent bg-[#FFFCF2] dark:bg-[#1A1F16]">
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] w-[80px]">POS</TableHead>
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2]">TEAM</TableHead>
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] text-center">POINTS</TableHead>
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] text-center">W</TableHead>
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] text-center">2ND</TableHead>
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] text-center">L</TableHead>
              <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] text-center">CAP</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry, index) => {
              const change = getPositionChange(entry.teamId)
              const isExpanded = expandedRow === entry.teamId
              const form = getFormIndicator(entry.gwWins, entry.lastFinishes)
              
              return (
                <React.Fragment key={entry.teamId}>
                  <TableRow
                    className={getRowClassName(entry.position, entry.teamId)}
                    onClick={() => setExpandedRow(isExpanded ? null : entry.teamId)}
                    onMouseEnter={() => setHoveredRow(entry.teamId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        {getPositionBadge(entry.position)}
                        {change !== 0 && getPositionChangeIndicator(change)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">
                          {entry.teamName}
                        </span>
                        {form}
                        {entry.position === 1 && (
                          <Trophy className="w-4 h-4 text-yellow-500 trophy-pulse" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold font-mono text-lg text-[#F26430]">
                        {entry.totalPoints}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-[#028090] text-white border-0">
                        {entry.gwWins}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-[#19297C] dark:text-[#DBC2CF]">
                        {entry.secondFinishes}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-[#F26430] text-[#F26430]">
                        {entry.lastFinishes}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="w-3 h-3 text-[#F26430]" />
                        <span className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">
                          {entry.captaincyWins}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button className="smooth-transition hover:scale-110">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#19297C] dark:text-[#DBC2CF]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#19297C] dark:text-[#DBC2CF]" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <TableRow className="border-[#DBC2CF] dark:border-[#19297C] bg-[#FFFCF2] dark:bg-[#1A1F16]">
                      <TableCell colSpan={8} className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                          <div className="text-center p-3 rounded-lg bg-white dark:bg-[#1A1F16] border border-[#DBC2CF] dark:border-[#19297C]">
                            <div className="text-2xl font-bold text-[#028090] mb-1">{entry.gwWins}</div>
                            <div className="text-xs text-[#19297C] dark:text-[#DBC2CF]">GW Wins</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white dark:bg-[#1A1F16] border border-[#DBC2CF] dark:border-[#19297C]">
                            <div className="text-2xl font-bold text-[#19297C] dark:text-[#DBC2CF] mb-1">{entry.secondFinishes}</div>
                            <div className="text-xs text-[#19297C] dark:text-[#DBC2CF]">2nd Places</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white dark:bg-[#1A1F16] border border-[#DBC2CF] dark:border-[#19297C]">
                            <div className="text-2xl font-bold text-[#F26430] mb-1">{entry.lastFinishes}</div>
                            <div className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Last Places</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white dark:bg-[#1A1F16] border border-[#DBC2CF] dark:border-[#19297C]">
                            <div className="text-2xl font-bold text-[#F26430] mb-1">{entry.captaincyWins}</div>
                            <div className="text-xs text-[#19297C] dark:text-[#DBC2CF]">C+VC Wins</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Add React import at the top
import * as React from "react"

