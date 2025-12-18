"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, Trophy, Medal, AlertCircle, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LEAGUE_CONFIG } from "@/lib/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { GlobalRefresh } from "@/components/global-refresh"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface UserFinancials {
  userName: string
  fplBuyIn: number
  gwBuyIns: number
  captaincyBuyIns: number
  gwWinnings: number
  gwSecondPlace: number
  gwPenalties: number
  captaincyWinnings: number
  netPosition: number
  gwWins: number
  secondFinishes: number
  lastFinishes: number
  captaincyWins: number
  totalPoints: number
}

export default function FinancialsPage() {
  const [allFinancials, setAllFinancials] = useState<UserFinancials[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("Wasim")
  const [loading, setLoading] = useState(true)
  const [completedGWs, setCompletedGWs] = useState(0)

  const fetchFinancials = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/fpl-data")
      const data = await response.json()

      if (data.success && data.data?.leaderboard) {
        const gwCount = data.data.completedGameweeks || 15
        setCompletedGWs(gwCount)

        const financials: UserFinancials[] = data.data.leaderboard.map((entry: any) => {
          const gwBuyIns = gwCount * LEAGUE_CONFIG.GW_BUY_IN
          const captaincyBuyIns = gwCount * LEAGUE_CONFIG.CAPTAINCY_BUY_IN
          const gwWinnerPayout = LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN - LEAGUE_CONFIG.SECOND_PLACE_BONUS - Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)
          const gwWinnings = entry.gwWins * gwWinnerPayout
          const gwSecondPlace = entry.secondFinishes * LEAGUE_CONFIG.SECOND_PLACE_BONUS
          const gwPenalties = entry.lastFinishes * Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)
          const captaincyWinnings = entry.captaincyWins * (LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN)

          const netPosition = -LEAGUE_CONFIG.FPL_BUY_IN - gwBuyIns - captaincyBuyIns + gwWinnings + gwSecondPlace - gwPenalties + captaincyWinnings

          return {
            userName: entry.userName,
            fplBuyIn: LEAGUE_CONFIG.FPL_BUY_IN,
            gwBuyIns,
            captaincyBuyIns,
            gwWinnings,
            gwSecondPlace,
            gwPenalties,
            captaincyWinnings,
            netPosition,
            gwWins: entry.gwWins,
            secondFinishes: entry.secondFinishes,
            lastFinishes: entry.lastFinishes,
            captaincyWins: entry.captaincyWins,
            totalPoints: entry.totalPoints,
          }
        })

        setAllFinancials(financials.sort((a, b) => b.netPosition - a.netPosition))
      }
    } catch (error) {
      console.error("Error fetching financials:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFinancials() }, [])

  const selected = allFinancials.find(f => f.userName === selectedUser)
  const totalPot = allFinancials.length * (LEAGUE_CONFIG.FPL_BUY_IN + completedGWs * (LEAGUE_CONFIG.GW_BUY_IN + LEAGUE_CONFIG.CAPTAINCY_BUY_IN))
  const totalWinnings = allFinancials.reduce((sum, f) => sum + f.gwWinnings + f.gwSecondPlace + f.captaincyWinnings, 0)
  const totalPenalties = allFinancials.reduce((sum, f) => sum + f.gwPenalties, 0)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8">
        <BlurFade delay={0}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Financial Tracker</h1>
              <p className="text-sm text-muted-foreground mt-1">League pot, winnings, and penalties (After {completedGWs} GWs)</p>
            </div>
            <div className="flex gap-2">
              <Link href="/rules">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Rules
                </Button>
              </Link>
              <Button
                onClick={fetchFinancials}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Sync
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        {loading ? (
          <LoadingSpinner text="Calculating financials..." />
        ) : (
          <div className="space-y-6">
            <BlurFade delay={0.05}>
              <Card className="border-border/50 bg-primary/5">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    League Financial Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">FPL Buy-in</p>
                      <p className="text-lg font-bold font-mono text-foreground">₹{LEAGUE_CONFIG.FPL_BUY_IN}</p>
                      <p className="text-[10px] text-muted-foreground">One-time fee</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">GW Buy-in</p>
                      <p className="text-lg font-bold font-mono text-foreground">₹{LEAGUE_CONFIG.GW_BUY_IN}</p>
                      <p className="text-[10px] text-muted-foreground">Per gameweek</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Captaincy Buy-in</p>
                      <p className="text-lg font-bold font-mono text-foreground">₹{LEAGUE_CONFIG.CAPTAINCY_BUY_IN}</p>
                      <p className="text-[10px] text-muted-foreground">Per gameweek</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Last Place</p>
                      <p className="text-lg font-bold font-mono text-destructive">₹{Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)}</p>
                      <p className="text-[10px] text-muted-foreground">Penalty per GW</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Pot</p>
                        <p className="text-xl font-bold font-mono text-yellow-500">
                          ₹<NumberTicker value={totalPot} />
                        </p>
                      </div>
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Distributed</p>
                        <p className="text-xl font-bold font-mono text-green-500">
                          ₹<NumberTicker value={totalWinnings} />
                        </p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Penalties</p>
                        <p className="text-xl font-bold font-mono text-red-500">
                          ₹<NumberTicker value={totalPenalties} />
                        </p>
                      </div>
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </BlurFade>

            <BlurFade delay={0.15}>
              <Card className="border-border/50">
                <CardHeader className="py-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base uppercase tracking-wider font-bold">Manager Deep Dive</CardTitle>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="w-[140px] h-8 bg-muted/30 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allFinancials.map((f) => (
                          <SelectItem key={f.userName} value={f.userName}>
                            {f.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {selected && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <Trophy className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                          <p className="text-lg font-bold text-yellow-500">{selected.gwWins}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Wins</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-400/10 border border-slate-400/20">
                          <Medal className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <p className="text-lg font-bold text-slate-400">{selected.secondFinishes}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">2nd</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <AlertCircle className="w-4 h-4 mx-auto text-red-500 mb-1" />
                          <p className="text-lg font-bold text-red-500">{selected.lastFinishes}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Last</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <Trophy className="w-4 h-4 mx-auto text-primary mb-1" />
                          <p className="text-lg font-bold text-primary">{selected.captaincyWins}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Caps</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                          <p className="font-bold text-destructive flex items-center gap-2 text-sm uppercase tracking-wider">
                            <TrendingDown className="w-4 h-4" /> Expenses
                          </p>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between"><span>FPL Buy-in</span><span className="font-mono text-foreground">-₹{selected.fplBuyIn}</span></div>
                            <div className="flex justify-between"><span>GW Buy-ins</span><span className="font-mono text-foreground">-₹{selected.gwBuyIns}</span></div>
                            <div className="flex justify-between"><span>Cap Buy-ins</span><span className="font-mono text-foreground">-₹{selected.captaincyBuyIns}</span></div>
                            <div className="flex justify-between"><span>Penalties</span><span className="font-mono text-foreground">-₹{selected.gwPenalties}</span></div>
                            <div className="flex justify-between font-bold text-destructive pt-2 border-t border-border/50">
                              <span>Total Out</span><span className="font-mono">-₹{selected.fplBuyIn + selected.gwBuyIns + selected.captaincyBuyIns + selected.gwPenalties}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                          <p className="font-bold text-green-500 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4" /> Winnings
                          </p>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between"><span>GW Wins ({selected.gwWins}×)</span><span className="font-mono text-foreground">+₹{selected.gwWinnings}</span></div>
                            <div className="flex justify-between"><span>2nd Place ({selected.secondFinishes}×)</span><span className="font-mono text-foreground">+₹{selected.gwSecondPlace}</span></div>
                            <div className="flex justify-between"><span>Captaincy ({selected.captaincyWins}×)</span><span className="font-mono text-foreground">+₹{selected.captaincyWinnings}</span></div>
                            <div className="flex justify-between font-bold text-green-500 pt-2 border-t border-border/50">
                              <span>Total In</span><span className="font-mono">+₹{selected.gwWinnings + selected.gwSecondPlace + selected.captaincyWinnings}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={cn("p-6 rounded-lg text-center border", selected.netPosition >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30')}>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">Net Position</p>
                        <p className={cn("text-4xl font-bold font-mono tracking-tight", selected.netPosition >= 0 ? 'text-green-500' : 'text-red-500')}>
                          ₹{selected.netPosition.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.2}>
              <Card className="border-border/50">
                <CardHeader className="py-4 px-6 border-b border-border/50">
                  <CardTitle className="text-base uppercase tracking-wider font-bold">Leaderboard: Net P&L</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {allFinancials.map((f, idx) => (
                      <div key={f.userName} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center p-0 text-xs font-bold border-0",
                              idx === 0 ? 'bg-yellow-500 text-black' :
                                idx === 1 ? 'bg-slate-400 text-white' :
                                  idx === 2 ? 'bg-orange-700 text-white' :
                                    'bg-muted text-muted-foreground'
                            )}
                          >
                            #{idx + 1}
                          </Badge>
                          <div>
                            <p className="font-bold text-foreground text-sm">{f.userName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.gwWins}W / {f.secondFinishes}S / {f.lastFinishes}L</p>
                          </div>
                        </div>
                        <span className={cn("text-sm font-bold font-mono", f.netPosition >= 0 ? 'text-green-500' : 'text-red-500')}>
                          {f.netPosition > 0 ? '+' : ''}₹{f.netPosition.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          </div>
        )}
      </div>
    </div>
  )
}
