"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Trophy, Medal, AlertCircle, Radio, CheckCircle2, Clock, TrendingUp, TrendingDown, Target, Zap } from "lucide-react"
import { LEAGUE_CONFIG } from "@/lib/constants"
import type { GameweekFinancials } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { format } from "date-fns"
import { GlobalRefresh } from "@/components/global-refresh"

interface TeamResult {
  teamId: string
  userName: string
  points: number
  captaincyPoints: number
}

interface GameweekData {
  gameweek: number
  teams: TeamResult[]
}

interface CurrentGameweekData {
  gameweek: number
  isLive: boolean
  deadline: string
  averageScore: number
  highestScore: number
  fixtures: Array<{
    id: number
    homeTeam: string
    homeTeamFull: string
    awayTeam: string
    awayTeamFull: string
    kickoff: string | null
    finished: boolean
    started: boolean
    homeScore: number | null
    awayScore: number | null
    minutes: number
  }>
  matchStats: {
    total: number
    finished: number
    ongoing: number
    scheduled: number
  }
  teamPoints: Array<{
    teamId: string
    userName: string
    points: number
    rank: number
  }>
  insights: {
    averagePoints: number
    highestScorer: { name: string; points: number }
    lowestScorer: { name: string; points: number }
    pointsSpread: number
  }
}

export default function GameweeksPage() {
  const [gameweeks, setGameweeks] = useState<GameweekData[]>([])
  const [selectedGW, setSelectedGW] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [teamNames, setTeamNames] = useState<Record<string, string>>({})
  const [currentGwData, setCurrentGwData] = useState<CurrentGameweekData | null>(null)
  const [loadingCurrent, setLoadingCurrent] = useState(true)

  const fetchGameweeks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sheets")
      const data = await response.json()
      
      if (data.success && data.data?.gameweekData) {
        const names = data.data.teamNames || {}
        setTeamNames(names)
        
        const gwData = data.data.gameweekData.map((gw: any) => ({
          gameweek: gw.gameweek,
          teams: gw.teams.map((t: any) => ({
            teamId: t.teamId,
            userName: names[t.teamId] || `Team ${t.teamId}`,
            points: t.points,
            captaincyPoints: t.captaincyPoints || 0,
          })),
        }))
        
        setGameweeks(gwData)
        
        if (gwData.length > 0 && !selectedGW) {
          setSelectedGW(gwData[gwData.length - 1].gameweek)
        }
      }
    } catch (error) {
      console.error("Error fetching gameweeks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentGameweek = async () => {
    try {
      setLoadingCurrent(true)
      const response = await fetch("/api/current-gameweek")
      const data = await response.json()
      
      if (data.success && data.data) {
        setCurrentGwData(data.data)
      }
    } catch (error) {
      console.error("Error fetching current gameweek:", error)
    } finally {
      setLoadingCurrent(false)
    }
  }

  useEffect(() => {
    fetchGameweeks()
    fetchCurrentGameweek()
    const interval = setInterval(() => {
      fetchGameweeks()
      fetchCurrentGameweek()
    }, 2 * 60 * 1000) // Refresh every 2 minutes for live data
    return () => clearInterval(interval)
  }, [])

  const currentGW = gameweeks.find(gw => gw.gameweek === selectedGW)
  
  const calculateGWFinancials = (gw: GameweekData): GameweekFinancials | null => {
    if (!gw || !gw.teams || gw.teams.length === 0) return null

    const sorted = [...gw.teams].sort((a, b) => b.points - a.points)
    const sortedCap = [...gw.teams].sort((a, b) => b.captaincyPoints - a.captaincyPoints)

    const winner = sorted[0]
    const second = sorted[1]
    const last = sorted[sorted.length - 1]
    const captaincyWinner = sortedCap[0]

    const gwPot = LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN
    const captaincyPot = LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN
    const winnerPayout = gwPot - LEAGUE_CONFIG.SECOND_PLACE_BONUS - Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)

    return {
      gameweek: gw.gameweek,
      gwPot,
      captaincyPot,
      winner: {
        teamId: winner.teamId,
        teamName: winner.userName,
        points: winner.points,
        payout: winnerPayout,
      },
      second: {
        teamId: second?.teamId || "",
        teamName: second?.userName || "N/A",
        points: second?.points || 0,
        payout: LEAGUE_CONFIG.SECOND_PLACE_BONUS,
      },
      last: {
        teamId: last.teamId,
        teamName: last.userName,
        points: last.points,
        penalty: LEAGUE_CONFIG.LAST_PLACE_PENALTY,
      },
      captaincyWinner: {
        teamId: captaincyWinner?.teamId || "",
        teamName: captaincyWinner?.userName || "N/A",
        points: captaincyWinner?.captaincyPoints || 0,
        payout: captaincyPot,
      },
    }
  }

  const financials = currentGW ? calculateGWFinancials(currentGW) : null

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">Gameweek Results</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">View results and payouts for each gameweek</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  fetchGameweeks()
                  fetchCurrentGameweek()
                }} 
                disabled={loading || loadingCurrent} 
                variant="outline"
                className="bg-[#19297C] border-[#028090] hover:bg-[#028090] hover:border-[#F26430] text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading || loadingCurrent ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        {/* Current Gameweek Live Section */}
        {currentGwData && (
          <BlurFade delay={0.05}>
            <Card className="bg-[#2B2D42] border-[#F7E733]/50 mb-6">
              <CardHeader className="border-b border-[#3d3f56]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-white">Gameweek {currentGwData.gameweek} - Live</CardTitle>
                      {currentGwData.isLive && (
                        <Badge className="bg-[#4DAA57] text-white animate-pulse">
                          <Radio className="w-3 h-3 mr-1" />
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-400">
                      {currentGwData.deadline && `Deadline: ${format(new Date(currentGwData.deadline), "EEE, MMM d, HH:mm")}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                {/* Match Status Overview */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#3d3f56]/50 border border-[#3d3f56]">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#F7E733]" />
                      <p className="text-xs text-gray-400">Total Matches</p>
                    </div>
                    <p className="text-2xl font-bold font-mono text-white">
                      <NumberTicker value={currentGwData.matchStats.total} />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#4DAA57]/10 border border-[#4DAA57]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-[#4DAA57]" />
                      <p className="text-xs text-gray-400">Finished</p>
                    </div>
                    <p className="text-2xl font-bold font-mono text-[#4DAA57]">
                      <NumberTicker value={currentGwData.matchStats.finished} />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7E733]/10 border border-[#F7E733]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="w-4 h-4 text-[#F7E733] animate-pulse" />
                      <p className="text-xs text-gray-400">Ongoing</p>
                    </div>
                    <p className="text-2xl font-bold font-mono text-[#F7E733]">
                      <NumberTicker value={currentGwData.matchStats.ongoing} />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#1BE7FF]/10 border border-[#1BE7FF]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[#1BE7FF]" />
                      <p className="text-xs text-gray-400">Scheduled</p>
                    </div>
                    <p className="text-2xl font-bold font-mono text-[#1BE7FF]">
                      <NumberTicker value={currentGwData.matchStats.scheduled} />
                    </p>
                  </div>
                </div>

                {/* Current Team Points */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#F7E733]" />
                    Current Standings
                  </h3>
                  <div className="space-y-2">
                    {currentGwData.teamPoints.map((team, index) => (
                      <div
                        key={team.teamId}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === 0 
                            ? "bg-[#F7E733]/10 border border-[#F7E733]/30"
                            : index === 1
                            ? "bg-[#1BE7FF]/10 border border-[#1BE7FF]/30"
                            : index === currentGwData.teamPoints.length - 1
                            ? "bg-[#FF3A20]/10 border border-[#FF3A20]/30"
                            : "bg-[#3d3f56]/30 border border-[#3d3f56]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={
                              index === 0 
                                ? "bg-[#F7E733] text-[#2B2D42]" 
                                : index === 1 
                                ? "bg-[#1BE7FF] text-[#2B2D42]" 
                                : "bg-[#3d3f56] text-gray-300"
                            }
                          >
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold text-white">{team.userName}</p>
                            <p className="text-xs text-gray-400">Overall Rank: {team.rank.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold font-mono text-[#F7E733]">
                            <NumberTicker value={team.points} />
                          </p>
                          <p className="text-xs text-gray-400">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-[#3d3f56]">
                  <div className="p-3 rounded-lg bg-[#3d3f56]/30">
                    <p className="text-xs text-gray-400 mb-1">Average Points</p>
                    <p className="text-lg font-bold font-mono text-white">
                      <NumberTicker value={currentGwData.insights.averagePoints} />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#4DAA57]/10 border border-[#4DAA57]/30">
                    <p className="text-xs text-gray-400 mb-1">Highest Scorer</p>
                    <p className="text-sm font-semibold text-white">{currentGwData.insights.highestScorer.name}</p>
                    <p className="text-lg font-bold font-mono text-[#4DAA57]">
                      <NumberTicker value={currentGwData.insights.highestScorer.points} />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FF3A20]/10 border border-[#FF3A20]/30">
                    <p className="text-xs text-gray-400 mb-1">Lowest Scorer</p>
                    <p className="text-sm font-semibold text-white">{currentGwData.insights.lowestScorer.name}</p>
                    <p className="text-lg font-bold font-mono text-[#FF3A20]">
                      <NumberTicker value={currentGwData.insights.lowestScorer.points} />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#1BE7FF]/10 border border-[#1BE7FF]/30">
                    <p className="text-xs text-gray-400 mb-1">Points Spread</p>
                    <p className="text-lg font-bold font-mono text-[#1BE7FF]">
                      <NumberTicker value={currentGwData.insights.pointsSpread} />
                    </p>
                  </div>
                </div>

                {/* Fixtures */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F7E733]" />
                    Fixtures
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {currentGwData.fixtures.map((fixture) => (
                      <div
                        key={fixture.id}
                        className={`p-3 rounded-lg border ${
                          fixture.finished
                            ? "bg-[#4DAA57]/10 border-[#4DAA57]/30"
                            : fixture.started
                            ? "bg-[#F7E733]/10 border-[#F7E733]/30"
                            : "bg-[#3d3f56]/30 border-[#3d3f56]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {fixture.finished && (
                              <CheckCircle2 className="w-3 h-3 text-[#4DAA57]" />
                            )}
                            {fixture.started && !fixture.finished && (
                              <Radio className="w-3 h-3 text-[#F7E733] animate-pulse" />
                            )}
                            {!fixture.started && (
                              <Clock className="w-3 h-3 text-[#1BE7FF]" />
                            )}
                            <span className="text-xs text-gray-400">
                              {fixture.kickoff
                                ? format(new Date(fixture.kickoff), "HH:mm")
                                : "TBC"}
                            </span>
                          </div>
                          {fixture.started && !fixture.finished && (
                            <Badge className="bg-[#F7E733] text-[#2B2D42] text-[10px]">
                              {fixture.minutes}' LIVE
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{fixture.homeTeam}</span>
                            {fixture.finished || fixture.started ? (
                              <span className="text-sm font-bold font-mono text-white">
                                {fixture.homeScore ?? "-"}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{fixture.awayTeam}</span>
                            {fixture.finished || fixture.started ? (
                              <span className="text-sm font-bold font-mono text-white">
                                {fixture.awayScore ?? "-"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        )}

        {gameweeks.length > 0 && (
          <BlurFade delay={0.1}>
            <div className="mb-6">
              <Select
                value={selectedGW?.toString() || ""}
                onValueChange={(value) => setSelectedGW(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[180px] bg-[#2B2D42] border-[#3d3f56] text-white">
                  <SelectValue placeholder="Select Gameweek" />
                </SelectTrigger>
                <SelectContent className="bg-[#2B2D42] border-[#3d3f56]">
                  {gameweeks.map((gw) => (
                    <SelectItem key={gw.gameweek} value={gw.gameweek.toString()} className="text-white hover:bg-[#3d3f56]">
                      Gameweek {gw.gameweek}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </BlurFade>
        )}

        {loading ? (
          <LoadingSpinner text="Loading gameweeks..." />
        ) : currentGW ? (
          <div className="space-y-6">
            {/* Results Table */}
            <BlurFade delay={0.15}>
              <Card className="bg-[#2B2D42] border-[#3d3f56]">
                <CardHeader className="border-b border-[#3d3f56]">
                  <CardTitle className="text-white">Gameweek {currentGW.gameweek} Results</CardTitle>
                  <CardDescription className="text-gray-400">Points and rankings for this gameweek</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {[...currentGW.teams]
                      .sort((a, b) => b.points - a.points)
                      .map((team, index) => (
                        <div
                          key={team.teamId}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                            index === 0 
                              ? "bg-[#F7E733]/10 border border-[#F7E733]/30"
                              : index === 1
                              ? "bg-[#1BE7FF]/10 border border-[#1BE7FF]/30"
                              : index === currentGW.teams.length - 1
                              ? "bg-[#FF3A20]/10 border border-[#FF3A20]/30"
                              : "bg-[#3d3f56]/30 border border-[#3d3f56]"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <Badge 
                              className={
                                index === 0 
                                  ? "bg-[#F7E733] text-[#2B2D42]" 
                                  : index === 1 
                                  ? "bg-[#1BE7FF] text-[#2B2D42]" 
                                  : "bg-[#3d3f56] text-gray-300"
                              }
                            >
                              #{index + 1}
                            </Badge>
                            <div>
                              <p className="font-semibold text-lg text-white">{team.userName}</p>
                              <p className="text-sm text-gray-400">
                                Captaincy: {team.captaincyPoints} pts
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold font-mono text-white">{team.points}</p>
                            <p className="text-sm text-gray-400">points</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Financials */}
            {financials && (
              <BlurFade delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#2B2D42] border-[#F7E733]/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Trophy className="mr-2 h-5 w-5 text-[#F7E733]" />
                        GW Winner
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2 text-white">{financials.winner.teamName}</p>
                      <p className="text-gray-400 mb-4">{financials.winner.points} points</p>
                      <p className="text-lg font-semibold font-mono text-[#4DAA57]">
                        +₹{financials.winner.payout.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2B2D42] border-[#1BE7FF]/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Medal className="mr-2 h-5 w-5 text-[#1BE7FF]" />
                        2nd Place
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2 text-white">{financials.second.teamName}</p>
                      <p className="text-gray-400 mb-4">{financials.second.points} points</p>
                      <p className="text-lg font-semibold font-mono text-[#4DAA57]">
                        +₹{financials.second.payout.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2B2D42] border-[#FF3A20]/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <AlertCircle className="mr-2 h-5 w-5 text-[#FF3A20]" />
                        Last Place
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2 text-white">{financials.last.teamName}</p>
                      <p className="text-gray-400 mb-4">{financials.last.points} points</p>
                      <p className="text-lg font-semibold font-mono text-[#FF3A20]">
                        ₹{financials.last.penalty.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2B2D42] border-[#4DAA57]/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Trophy className="mr-2 h-5 w-5 text-[#4DAA57]" />
                        Captaincy Winner
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2 text-white">{financials.captaincyWinner.teamName}</p>
                      <p className="text-gray-400 mb-4">{financials.captaincyWinner.points} C+VC points</p>
                      <p className="text-lg font-semibold font-mono text-[#4DAA57]">
                        +₹{financials.captaincyWinner.payout.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </BlurFade>
            )}

            {/* Pot Summary */}
            {financials && (
              <BlurFade delay={0.25}>
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardHeader className="border-b border-[#3d3f56]">
                    <CardTitle className="text-white">Pot Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">GW Pot</p>
                        <p className="text-xl font-semibold font-mono text-white">₹{financials.gwPot.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Captaincy Pot</p>
                        <p className="text-xl font-semibold font-mono text-white">₹{financials.captaincyPot.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </BlurFade>
            )}
          </div>
        ) : (
          <Card className="bg-[#2B2D42] border-[#3d3f56]">
            <CardContent className="py-12">
              <div className="text-center text-gray-400">No gameweek data available</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
