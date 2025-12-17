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
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">Financial Tracker</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">After {completedGWs} gameweeks</p>
            </div>
            <div className="flex gap-2">
              <Link href="/rules">
                <Button 
                  variant="outline"
                  className="bg-white dark:bg-[#1A1F16] border-[#19297C] dark:border-[#028090] hover:bg-[#DBC2CF] dark:hover:bg-[#19297C] text-[#19297C] dark:text-[#028090]"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Rules
                </Button>
              </Link>
              <Button 
                onClick={fetchFinancials} 
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
          <LoadingSpinner text="Loading" />
        ) : (
          <div className="space-y-4">
            {/* League Rules Summary */}
            <BlurFade delay={0.05}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <CardHeader className="py-3 px-4 border-b border-[#DBC2CF] dark:border-[#19297C]">
                  <CardTitle className="text-sm text-[#1A1F16] dark:text-[#FFFCF2] flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    League Financial Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium">FPL Buy-in</p>
                      <p className="text-lg font-bold font-mono text-[#F26430]">₹{LEAGUE_CONFIG.FPL_BUY_IN}</p>
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">One-time fee</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium">GW Buy-in</p>
                      <p className="text-lg font-bold font-mono text-[#F26430]">₹{LEAGUE_CONFIG.GW_BUY_IN}</p>
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Per gameweek</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium">Captaincy Buy-in</p>
                      <p className="text-lg font-bold font-mono text-[#F26430]">₹{LEAGUE_CONFIG.CAPTAINCY_BUY_IN}</p>
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Per gameweek</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium">Last Place Penalty</p>
                      <p className="text-lg font-bold font-mono text-[#F26430]">₹{Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)}</p>
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Per occurrence</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-[#028090]/10 dark:bg-[#028090]/20 rounded-lg">
                    <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">
                      <strong>Gameweek Winner Payout:</strong> Total GW pot (₹{LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN}) minus 2nd place bonus (₹{LEAGUE_CONFIG.SECOND_PLACE_BONUS}) and last place penalty (₹{Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)}) = <strong>₹{LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN - LEAGUE_CONFIG.SECOND_PLACE_BONUS - Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)}</strong>
                      <br />
                      <strong>Captaincy Winner Payout:</strong> Total Captaincy pot (₹{LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN}) = <strong>₹{LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN}</strong>
                    </p>
                  </div>
                  <div className="mt-3 text-center">
                    <Link href="/rules">
                      <Button variant="outline" size="sm" className="border-[#028090] text-[#028090] hover:bg-[#028090] hover:text-white">
                        <BookOpen className="mr-2 h-3 w-3" />
                        View Full Rules
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Summary Cards */}
            <BlurFade delay={0.1}>
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Total Pot</p>
                        <p className="text-xl font-bold font-mono text-white">
                          ₹<NumberTicker value={totalPot} />
                        </p>
                      </div>
                      <DollarSign className="h-5 w-5 text-[#F7E733]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Winnings</p>
                        <p className="text-xl font-bold font-mono text-[#4DAA57]">
                          ₹<NumberTicker value={totalWinnings} />
                        </p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-[#4DAA57]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Penalties</p>
                        <p className="text-xl font-bold font-mono text-[#FF3A20]">
                          ₹<NumberTicker value={totalPenalties} />
                        </p>
                      </div>
                      <TrendingDown className="h-5 w-5 text-[#FF3A20]" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </BlurFade>

            {/* User Selector */}
            <BlurFade delay={0.15}>
              <Card className="bg-[#2B2D42] border-[#3d3f56]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-white">View Details</span>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="w-32 h-9 bg-[#3d3f56] border-[#3d3f56] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2B2D42] border-[#3d3f56]">
                        {allFinancials.map((f) => (
                          <SelectItem key={f.userName} value={f.userName} className="text-white hover:bg-[#3d3f56]">
                            {f.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selected && (
                    <div className="space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-[#F7E733]/10 border border-[#F7E733]/20">
                          <Trophy className="w-4 h-4 mx-auto text-[#F7E733] mb-1" />
                          <p className="text-lg font-bold text-[#F7E733]">{selected.gwWins}</p>
                          <p className="text-xs text-gray-400">Wins</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#1BE7FF]/10 border border-[#1BE7FF]/20">
                          <Medal className="w-4 h-4 mx-auto text-[#1BE7FF] mb-1" />
                          <p className="text-lg font-bold text-[#1BE7FF]">{selected.secondFinishes}</p>
                          <p className="text-xs text-gray-400">2nd</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FF3A20]/10 border border-[#FF3A20]/20">
                          <AlertCircle className="w-4 h-4 mx-auto text-[#FF3A20] mb-1" />
                          <p className="text-lg font-bold text-[#FF3A20]">{selected.lastFinishes}</p>
                          <p className="text-xs text-gray-400">Last</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#4DAA57]/10 border border-[#4DAA57]/20">
                          <Trophy className="w-4 h-4 mx-auto text-[#4DAA57] mb-1" />
                          <p className="text-lg font-bold text-[#4DAA57]">{selected.captaincyWins}</p>
                          <p className="text-xs text-gray-400">Cap</p>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-[#FF3A20] flex items-center gap-1 text-sm">
                            <TrendingDown className="w-4 h-4" /> Expenses
                          </p>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex justify-between"><span>FPL Buy-in</span><span className="font-mono">-₹{selected.fplBuyIn}</span></div>
                            <div className="flex justify-between"><span>GW Buy-ins</span><span className="font-mono">-₹{selected.gwBuyIns}</span></div>
                            <div className="flex justify-between"><span>Cap Buy-ins</span><span className="font-mono">-₹{selected.captaincyBuyIns}</span></div>
                            <div className="flex justify-between"><span>Penalties</span><span className="font-mono">-₹{selected.gwPenalties}</span></div>
                            <div className="flex justify-between font-semibold text-[#FF3A20] pt-2 border-t border-[#3d3f56]">
                              <span>Total</span><span className="font-mono">-₹{selected.fplBuyIn + selected.gwBuyIns + selected.captaincyBuyIns + selected.gwPenalties}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-[#4DAA57] flex items-center gap-1 text-sm">
                            <TrendingUp className="w-4 h-4" /> Winnings
                          </p>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex justify-between"><span>GW Wins ({selected.gwWins}×)</span><span className="font-mono">+₹{selected.gwWinnings}</span></div>
                            <div className="flex justify-between"><span>2nd Place ({selected.secondFinishes}×)</span><span className="font-mono">+₹{selected.gwSecondPlace}</span></div>
                            <div className="flex justify-between"><span>Captaincy ({selected.captaincyWins}×)</span><span className="font-mono">+₹{selected.captaincyWinnings}</span></div>
                            <div className="flex justify-between font-semibold text-[#4DAA57] pt-2 border-t border-[#3d3f56]">
                              <span>Total</span><span className="font-mono">+₹{selected.gwWinnings + selected.gwSecondPlace + selected.captaincyWinnings}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Net Position */}
                      <div className={`p-4 rounded-lg text-center ${selected.netPosition >= 0 ? 'bg-[#4DAA57]/10 border border-[#4DAA57]/30' : 'bg-[#FF3A20]/10 border border-[#FF3A20]/30'}`}>
                        <p className="text-xs text-gray-400 mb-1">Net Position</p>
                        <p className={`text-3xl font-bold font-mono ${selected.netPosition >= 0 ? 'text-[#4DAA57]' : 'text-[#FF3A20]'}`}>
                          ₹{selected.netPosition.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BlurFade>

            {/* All Users Comparison */}
            <BlurFade delay={0.2}>
              <Card className="bg-[#2B2D42] border-[#3d3f56]">
                <CardHeader className="py-3 px-4 border-b border-[#3d3f56]">
                  <CardTitle className="text-sm text-white">All Users Net Position</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {allFinancials.map((f, idx) => (
                      <div key={f.userName} className="flex items-center justify-between p-3 rounded-lg bg-[#3d3f56]/50">
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={`text-xs ${
                              idx === 0 ? 'bg-[#F7E733] text-[#2B2D42]' : 'bg-[#3d3f56] text-gray-300'
                            }`}
                          >
                            #{idx + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-white">{f.userName}</p>
                            <p className="text-xs text-gray-400">{f.totalPoints} pts • {f.gwWins}W/{f.secondFinishes}S/{f.lastFinishes}L</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold font-mono ${f.netPosition >= 0 ? 'text-[#4DAA57]' : 'text-[#FF3A20]'}`}>
                          ₹{f.netPosition.toLocaleString()}
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
