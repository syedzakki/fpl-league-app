"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BlurFade } from "@/components/ui/blur-fade"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, Trophy, AlertCircle, ArrowRightLeft, ArrowUp, ArrowDown, ChevronsUpDown, Medal, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/ui/shine-border"
import { GlobalRefresh } from "@/components/global-refresh"

interface FPLLeaderboardEntry {
  teamId: string
  userName: string
  position: number
  totalPointsFPL: number
  totalPointsNoHits: number
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
  const [sortBy, setSortBy] = useState<"noHits" | "fpl" | "hits" | "hitCost">("fpl")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showNoHits, setShowNoHits] = useState(false)
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
    let comparison = 0
    switch (sortBy) {
      case "noHits": comparison = b.totalPointsNoHits - a.totalPointsNoHits; break
      case "fpl": comparison = b.totalPointsFPL - a.totalPointsFPL; break
      case "hits": comparison = b.totalHits - a.totalHits; break
      case "hitCost": comparison = b.totalHitCost - a.totalHitCost; break
      default: comparison = b.totalPointsFPL - a.totalPointsFPL
    }
    return sortOrder === "desc" ? comparison : -comparison
  })

  const handleSort = (column: "noHits" | "fpl" | "hits" | "hitCost") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getSortIcon = (column: "noHits" | "fpl" | "hits" | "hitCost") => {
    if (sortBy !== column) return <ChevronsUpDown className="h-3 w-3 opacity-50" />
    return sortOrder === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
  }

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"><Trophy className="w-3 h-3 mr-1" />1st</Badge>
    if (position === 2) return <Badge className="bg-slate-400/10 border-slate-400 text-slate-400 hover:bg-slate-400/20"><Medal className="w-3 h-3 mr-1" />2nd</Badge>
    if (position === 3) return <Badge className="bg-orange-700/10 border-orange-700 text-orange-700 hover:bg-orange-700/20"><Award className="w-3 h-3 mr-1" />3rd</Badge>
    return <Badge variant="outline" className="text-muted-foreground">{position}th</Badge>
  }

  const handleTeamClick = (entry: FPLLeaderboardEntry) => {
    setSelectedTeam(entry)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8">
        <BlurFade delay={0}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">FPL Leaderboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Direct API Feed • Includes Hits Analysis</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchLeaderboard} disabled={loading} variant="outline" size="sm" className="gap-2">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Sync
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        {loading ? (
          <LoadingSpinner text="Checking live scores..." />
        ) : error ? (
          <Card className="p-8 text-center border-destructive/50 bg-destructive/5">
            <div className="text-destructive mb-3 flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchLeaderboard} variant="destructive">Retry</Button>
          </Card>
        ) : (
          <BlurFade delay={0.1}>
            <Card className="overflow-hidden relative border-border/50">
              <ShineBorder className="absolute inset-0 w-full h-full pointer-events-none opacity-20" shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} duration={14} />
              <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border/50 bg-muted/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-bold uppercase italic tracking-tight">
                      League Standings
                    </CardTitle>
                    <CardDescription className="text-xs opacity-70">Live tracking direct from FPL API</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={showNoHits ? "default" : "outline"}
                  onClick={() => setShowNoHits(!showNoHits)}
                  className="text-[10px] font-bold uppercase tracking-widest h-8"
                >
                  {showNoHits ? "Hide" : "Show"} Hits Calc
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                      <TableHead className="w-16 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Pos</TableHead>
                      <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Manager</TableHead>
                      {showNoHits && (
                        <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("noHits")}>
                          <div className="flex items-center justify-end gap-1 font-bold uppercase text-[10px] tracking-widest">
                            No Hits {getSortIcon("noHits")}
                          </div>
                        </TableHead>
                      )}
                      <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("fpl")}>
                        <div className="flex items-center justify-end gap-1 font-bold uppercase text-[10px] tracking-widest">
                          Total {getSortIcon("fpl")}
                        </div>
                      </TableHead>
                      <TableHead className="text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("hits")}>
                        <div className="flex items-center justify-center gap-1 font-bold uppercase text-[10px] tracking-widest">
                          Hits {getSortIcon("hits")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("hitCost")}>
                        <div className="flex items-center justify-end gap-1 font-bold uppercase text-[10px] tracking-widest">
                          Cost {getSortIcon("hitCost")}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeaderboard.map((entry, index) => (
                      <TableRow key={entry.teamId} className="border-border/50 transition-colors hover:bg-muted/30">
                        <TableCell className="font-mono">{getPositionBadge(index + 1)}</TableCell>
                        <TableCell>
                          <button onClick={() => handleTeamClick(entry)} className="font-bold hover:text-primary transition-colors flex items-center gap-2 group text-left">
                            {entry.userName}
                            <ArrowRightLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </button>
                        </TableCell>
                        {showNoHits && (
                          <TableCell className="text-right font-mono font-medium text-muted-foreground">
                            {entry.totalPointsNoHits}
                          </TableCell>
                        )}
                        <TableCell className="text-right font-mono font-bold text-lg text-primary">
                          {entry.totalPointsFPL}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.totalHits > 0 ? <Badge variant="destructive">{entry.totalHits}</Badge> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          {entry.totalHitCost > 0 ? `-${entry.totalHitCost}` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Transfer Analysis: {selectedTeam?.userName}</DialogTitle>
                  <DialogDescription>Breakdown of transfer hits per gameweek</DialogDescription>
                </DialogHeader>
                {selectedTeam && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/30 p-4 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Hits</div>
                        <div className="text-2xl font-sports font-bold text-destructive">{selectedTeam.totalHits}</div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Points Lost</div>
                        <div className="text-2xl font-sports font-bold text-destructive">-{selectedTeam.totalHitCost}</div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Net Points</div>
                        <div className="text-2xl font-sports font-bold">{selectedTeam.totalPointsNoHits}</div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary/20">
                        <div className="text-xs text-primary uppercase tracking-wider font-bold">Official Total</div>
                        <div className="text-2xl font-sports font-bold text-primary">{selectedTeam.totalPointsFPL}</div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead>Gameweek</TableHead>
                          <TableHead className="text-center">Tx Made</TableHead>
                          <TableHead className="text-center">Hits</TableHead>
                          <TableHead className="text-center">Cost</TableHead>
                          <TableHead className="text-right">GW Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTeam.gameweeks.sort((a, b) => b.gameweek - a.gameweek).map((gw) => (
                          <TableRow key={gw.gameweek}>
                            <TableCell className="font-bold">GW {gw.gameweek}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{gw.transfers}</TableCell>
                            <TableCell className="text-center">{gw.transfersCost < 0 ? <Badge variant="destructive">{Math.abs(gw.transfersCost) / 4}</Badge> : "-"}</TableCell>
                            <TableCell className="text-center font-mono text-destructive">{gw.transfersCost < 0 ? gw.transfersCost : "-"}</TableCell>
                            <TableCell className="text-right font-mono font-bold">{gw.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </BlurFade>
        )}
      </div>
    </div>
  )
}
