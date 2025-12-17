"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BlurFade } from "@/components/ui/blur-fade"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, Trophy, TrendingDown, AlertCircle, ArrowRightLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlobalRefresh } from "@/components/global-refresh"

interface FPLLeaderboardEntry {
  teamId: string
  userName: string
  position: number
  totalPointsFPL: number // FPL total (includes hits)
  totalPointsNoHits: number // Without hits
  totalHits: number
  totalHitCost: number
  gameweeks: Array<{
    gameweek: number
    points: number
    pointsWithHits: number
    transfers: number
    transfersCost: number
  }>
}

export default function FPLLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<FPLLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"noHits" | "fpl">("noHits")
  const [selectedTeam, setSelectedTeam] = useState<FPLLeaderboardEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/leaderboard-fpl")
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.data)
      } else {
        setError("Failed to fetch leaderboard data")
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      setError("Failed to fetch leaderboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === "noHits") {
      return b.totalPointsNoHits - a.totalPointsNoHits
    } else {
      return b.totalPointsFPL - a.totalPointsFPL
    }
  })

  const getPositionBadge = (position: number) => {
    if (position === 1) return (
      <Badge className="bg-[#F26430]/20 border border-[#F26430]/50 text-[#F26430] text-xs px-2 py-0.5 font-semibold">
        <Trophy className="w-3 h-3 mr-1" />1st
      </Badge>
    )
    if (position === 2) return (
      <Badge className="bg-[#028090]/20 border border-[#028090]/50 text-[#028090] text-xs px-2 py-0.5 font-semibold">
        2nd
      </Badge>
    )
    if (position === 3) return (
      <Badge className="bg-[#19297C]/20 border border-[#19297C]/50 text-[#19297C] dark:text-[#DBC2CF] text-xs px-2 py-0.5 font-semibold">
        3rd
      </Badge>
    )
    return (
      <Badge variant="outline" className="border-[#DBC2CF] dark:border-[#19297C] text-[#19297C] dark:text-[#DBC2CF] text-xs px-2 py-0.5">
        {position}th
      </Badge>
    )
  }

  const handleTeamClick = (entry: FPLLeaderboardEntry) => {
    setSelectedTeam(entry)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">FPL Leaderboard (Direct from API)</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">
                Compare points with and without transfer hits
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchLeaderboard} 
                disabled={loading} 
                variant="outline"
                className="bg-[#19297C] border-[#028090] hover:bg-[#028090] hover:border-[#F26430] text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        {loading ? (
          <LoadingSpinner text="Loading FPL leaderboard" />
        ) : error ? (
          <Card className="p-8 text-center bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
            <div className="text-[#F26430] mb-3 flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
            <Button 
              onClick={fetchLeaderboard}
              className="bg-[#F26430] text-white hover:bg-[#F26430]/90"
            >
              Try Again
            </Button>
          </Card>
        ) : (
          <BlurFade delay={0.1}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] mb-4">
              <CardHeader className="py-3 border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2] text-base">Sort By</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSortBy("noHits")}
                      className={cn(
                        "text-xs",
                        sortBy === "noHits"
                          ? "bg-[#F26430] text-white"
                          : "bg-[#DBC2CF] dark:bg-[#19297C] text-[#1A1F16] dark:text-[#FFFCF2]"
                      )}
                    >
                      Points (No Hits)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSortBy("fpl")}
                      className={cn(
                        "text-xs",
                        sortBy === "fpl"
                          ? "bg-[#F26430] text-white"
                          : "bg-[#DBC2CF] dark:bg-[#19297C] text-[#1A1F16] dark:text-[#FFFCF2]"
                      )}
                    >
                      FPL Total (With Hits)
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-[#F26430]" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-[#1A1F16] dark:text-[#FFFCF2]">FPL Leaderboard</CardTitle>
                    <CardDescription className="text-xs text-[#19297C] dark:text-[#DBC2CF]">
                      Points comparison: Without hits vs FPL total (with hits) • Click team name for transfer history
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
                      <TableHead className="py-3 px-4 text-right font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Points (No Hits)</TableHead>
                      <TableHead className="py-3 px-4 text-right font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">FPL Total</TableHead>
                      <TableHead className="py-3 px-4 text-center font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Hits</TableHead>
                      <TableHead className="py-3 px-4 text-right font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Hit Cost</TableHead>
                      <TableHead className="py-3 px-4 text-right font-semibold text-[#19297C] dark:text-[#DBC2CF] text-xs uppercase tracking-wider">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeaderboard.map((entry, index) => {
                      const actualPosition = index + 1
                      const difference = entry.totalPointsFPL - entry.totalPointsNoHits
                      
                      return (
                        <TableRow 
                          key={entry.teamId}
                          className={cn(
                            "border-b border-[#DBC2CF] dark:border-[#19297C] transition-colors",
                            actualPosition === 1 && "bg-[#F26430]/5 hover:bg-[#F26430]/10",
                            actualPosition === 2 && "bg-[#028090]/5 hover:bg-[#028090]/10",
                            actualPosition === 3 && "bg-[#19297C]/5 dark:bg-[#19297C]/10 hover:bg-[#19297C]/10",
                            actualPosition > 3 && "hover:bg-[#DBC2CF]/30 dark:hover:bg-[#19297C]/30"
                          )}
                        >
                          <TableCell className="py-3 px-4">
                            {getPositionBadge(actualPosition)}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <button
                              onClick={() => handleTeamClick(entry)}
                              className="font-semibold text-[#19297C] dark:text-[#028090] hover:text-[#F26430] dark:hover:text-[#F26430] transition-colors cursor-pointer flex items-center gap-2"
                            >
                              {entry.userName}
                              <ArrowRightLeft className="h-3 w-3" />
                            </button>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <span className="font-bold font-mono text-lg text-[#1A1F16] dark:text-[#FFFCF2]">
                              {entry.totalPointsNoHits}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <span className="font-bold font-mono text-lg text-[#028090]">
                              {entry.totalPointsFPL}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center">
                            {entry.totalHits > 0 ? (
                              <Badge className="bg-[#F26430] text-white">
                                {entry.totalHits}
                              </Badge>
                            ) : (
                              <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            {entry.totalHitCost > 0 ? (
                              <span className="text-[#F26430] font-bold font-mono">
                                -{entry.totalHitCost}
                              </span>
                            ) : (
                              <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <span className={cn(
                              "font-bold font-mono",
                              difference < 0 ? "text-[#F26430]" : difference > 0 ? "text-[#028090]" : "text-[#19297C] dark:text-[#DBC2CF]"
                            )}>
                              {difference < 0 ? difference : difference > 0 ? `+${difference}` : "0"}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Transfer History Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">
                    Transfer History - {selectedTeam?.userName}
                  </DialogTitle>
                  <DialogDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                    Gameweek-by-gameweek transfer activity and hits
                  </DialogDescription>
                </DialogHeader>
                {selectedTeam && (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-[#DBC2CF]/10 dark:bg-[#19297C]/10 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Total Hits</p>
                        <p className="text-2xl font-bold text-[#F26430]">{selectedTeam.totalHits}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Hit Cost</p>
                        <p className="text-2xl font-bold text-[#F26430]">-{selectedTeam.totalHitCost}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Points (No Hits)</p>
                        <p className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">{selectedTeam.totalPointsNoHits}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">FPL Total</p>
                        <p className="text-2xl font-bold text-[#028090]">{selectedTeam.totalPointsFPL}</p>
                      </div>
                    </div>

                    {/* Gameweek Table */}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#DBC2CF]/30 dark:bg-[#19297C]/30">
                          <TableHead className="text-[#19297C] dark:text-[#DBC2CF]">GW</TableHead>
                          <TableHead className="text-[#19297C] dark:text-[#DBC2CF]">Transfers</TableHead>
                          <TableHead className="text-[#19297C] dark:text-[#DBC2CF]">Hits</TableHead>
                          <TableHead className="text-[#19297C] dark:text-[#DBC2CF]">Hit Cost</TableHead>
                          <TableHead className="text-right text-[#19297C] dark:text-[#DBC2CF]">Points</TableHead>
                          <TableHead className="text-right text-[#19297C] dark:text-[#DBC2CF]">With Hits</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTeam.gameweeks
                          .sort((a, b) => b.gameweek - a.gameweek)
                          .map((gw) => {
                            const hits = gw.transfersCost < 0 ? Math.abs(gw.transfersCost) / 4 : 0
                            return (
                              <TableRow key={gw.gameweek} className="border-[#DBC2CF] dark:border-[#19297C]">
                                <TableCell className="font-medium text-[#1A1F16] dark:text-[#FFFCF2]">GW{gw.gameweek}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-[#DBC2CF] dark:border-[#19297C] text-[#19297C] dark:text-[#DBC2CF]">
                                    {gw.transfers}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {hits > 0 ? (
                                    <Badge className="bg-[#F26430] text-white">
                                      {hits}
                                    </Badge>
                                  ) : (
                                    <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {gw.transfersCost < 0 ? (
                                    <span className="text-[#F26430] font-bold font-mono">
                                      {gw.transfersCost}
                                    </span>
                                  ) : (
                                    <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono text-[#1A1F16] dark:text-[#FFFCF2]">{gw.points}</TableCell>
                                <TableCell className="text-right font-mono text-[#028090]">{gw.pointsWithHits}</TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Info Card */}
            <Card className="mt-4 bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#F26430] mt-0.5" />
                  <div className="text-sm text-[#19297C] dark:text-[#DBC2CF]">
                    <p className="font-semibold mb-1 text-[#1A1F16] dark:text-[#FFFCF2]">Note:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong className="text-[#1A1F16] dark:text-[#FFFCF2]">Points (No Hits):</strong> Sum of all gameweek points without transfer deductions</li>
                      <li><strong className="text-[#1A1F16] dark:text-[#FFFCF2]">FPL Total:</strong> Official FPL total points (includes transfer hits)</li>
                      <li><strong className="text-[#1A1F16] dark:text-[#FFFCF2]">Difference:</strong> Shows how hits affect total points (negative = points lost)</li>
                      <li>FPL does NOT include -4 hits in individual gameweek points, but includes them in the final total</li>
                      <li>Click on a team name to view detailed transfer history by gameweek</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        )}
      </div>
    </div>
  )
}
