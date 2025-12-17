"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Trophy, Medal, AlertCircle, Radio, CheckCircle2, Calendar, TrendingUp } from "lucide-react"
import { LEAGUE_CONFIG } from "@/lib/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BlurFade } from "@/components/ui/blur-fade"
import { DeadlineCountdown } from "@/components/deadline-countdown"
import { FixturesDisplay } from "@/components/fixtures-display"
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
  isLive: boolean
  isFinished: boolean
  deadline?: string
}

interface FixtureData {
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
  minutes?: number
}

export default function GameweeksPage() {
  const [gameweeks, setGameweeks] = useState<GameweekData[]>([])
  const [selectedGW, setSelectedGW] = useState<number | null>(null)
  const [fixtures, setFixtures] = useState<FixtureData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentGW, setCurrentGW] = useState<number>(1)
  const [nextDeadline, setNextDeadline] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch gameweek results
      const fplDataResponse = await fetch("/api/fpl-data")
      const fplData = await fplDataResponse.json()
      
      // Fetch fixtures
      const fixturesResponse = await fetch("/api/fpl")
      const fixturesData = await fixturesResponse.json()

      if (fplData.success && fplData.data?.gameweekResults) {
        const gwData: GameweekData[] = fplData.data.gameweekResults.map((gw: any) => ({
          gameweek: gw.gameweek,
          teams: gw.teams.map((t: any) => ({
            teamId: t.teamId,
            userName: t.userName,
            points: t.points,
            captaincyPoints: t.captaincyPoints || 0,
          })),
          isLive: false,
          isFinished: true,
        }))
        
        setGameweeks(gwData)
        setCurrentGW(fplData.data.currentGameweek || 1)
        
        if (!selectedGW && gwData.length > 0) {
          setSelectedGW(gwData[gwData.length - 1].gameweek)
        }
      }

      if (fixturesData.success) {
        const allFixtures = fixturesData.data.fixtures || []
        setFixtures(allFixtures)
        
        // Get next deadline
        const upcomingEvents = fixturesData.data.events?.filter((e: any) => !e.finished) || []
        if (upcomingEvents.length > 0) {
          setNextDeadline(upcomingEvents[0].deadline_time)
        }
      }
    } catch (error) {
      console.error("Error fetching gameweeks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 2 minutes for live updates
    const interval = setInterval(fetchData, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const currentGameweek = gameweeks.find(gw => gw.gameweek === selectedGW)
  const currentFixtures = fixtures.filter(f => f.id === selectedGW) // This would need proper gameweek matching

  const calculateWinners = (gw: GameweekData) => {
    const sortedByPoints = [...gw.teams].sort((a, b) => b.points - a.points)
    const sortedByCaptaincy = [...gw.teams].sort((a, b) => b.captaincyPoints - a.captaincyPoints)
    
    return {
      winner: sortedByPoints[0],
      second: sortedByPoints[1],
      last: sortedByPoints[sortedByPoints.length - 1],
      captaincyWinner: sortedByCaptaincy[0],
      gwPot: LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN,
      captaincyPot: LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN,
      winnerPayout: LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN - 
                    LEAGUE_CONFIG.SECOND_PLACE_BONUS - 
                    Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY),
    }
  }

  const winners = currentGameweek ? calculateWinners(currentGameweek) : null

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">Gameweeks</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">
                Results and live updates
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchData} 
                disabled={loading} 
                variant="outline"
                className="bg-[#19297C] border-[#028090] hover:bg-[#028090] text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        {loading ? (
          <LoadingSpinner text="Loading gameweeks" />
        ) : (
          <div className="space-y-6">
            {/* Deadline Countdown */}
            {nextDeadline && (
              <BlurFade delay={0.05}>
                <DeadlineCountdown deadline={nextDeadline} />
              </BlurFade>
            )}

            {/* Gameweek Selector */}
            <BlurFade delay={0.1}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <CardHeader className="py-4 border-b border-[#DBC2CF] dark:border-[#19297C]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2] flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Select Gameweek
                    </CardTitle>
                    <Select 
                      value={selectedGW?.toString()} 
                      onValueChange={(val) => setSelectedGW(parseInt(val))}
                    >
                      <SelectTrigger className="w-32 bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                        <SelectValue placeholder="GW" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameweeks.map((gw) => (
                          <SelectItem key={gw.gameweek} value={gw.gameweek.toString()}>
                            <div className="flex items-center gap-2">
                              <span>GW {gw.gameweek}</span>
                              {gw.isLive && (
                                <Badge className="bg-[#F26430] text-white text-xs">
                                  <Radio className="h-2 w-2 mr-1" />
                                  LIVE
                                </Badge>
                              )}
                              {gw.isFinished && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle2 className="h-2 w-2 mr-1" />
                                  Ended
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
              </Card>
            </BlurFade>

            {currentGameweek && winners && (
              <>
                {/* Winners Summary */}
                <BlurFade delay={0.15}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#F26430]/10 border-[#F26430]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-[#F26430]" />
                          <span className="text-xs font-medium text-[#19297C] dark:text-[#DBC2CF] uppercase">Winner</span>
                        </div>
                        <p className="font-bold text-lg text-[#1A1F16] dark:text-[#FFFCF2]">{winners.winner.userName}</p>
                        <p className="text-sm text-[#F26430] font-mono font-bold">{winners.winner.points} pts</p>
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mt-1">+₹{winners.winnerPayout}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#028090]/10 border-[#028090]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Medal className="h-4 w-4 text-[#028090]" />
                          <span className="text-xs font-medium text-[#19297C] dark:text-[#DBC2CF] uppercase">2nd Place</span>
                        </div>
                        <p className="font-bold text-lg text-[#1A1F16] dark:text-[#FFFCF2]">{winners.second.userName}</p>
                        <p className="text-sm text-[#028090] font-mono font-bold">{winners.second.points} pts</p>
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mt-1">+₹{LEAGUE_CONFIG.SECOND_PLACE_BONUS}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-500/10 border-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-medium text-[#19297C] dark:text-[#DBC2CF] uppercase">Last Place</span>
                        </div>
                        <p className="font-bold text-lg text-[#1A1F16] dark:text-[#FFFCF2]">{winners.last.userName}</p>
                        <p className="text-sm text-red-500 font-mono font-bold">{winners.last.points} pts</p>
                        <p className="text-xs text-red-500 mt-1">-₹{Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#19297C]/10 border-[#19297C]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-[#19297C] dark:text-[#028090]" />
                          <span className="text-xs font-medium text-[#19297C] dark:text-[#DBC2CF] uppercase">C+VC Winner</span>
                        </div>
                        <p className="font-bold text-lg text-[#1A1F16] dark:text-[#FFFCF2]">{winners.captaincyWinner.userName}</p>
                        <p className="text-sm text-[#19297C] dark:text-[#028090] font-mono font-bold">{winners.captaincyWinner.captaincyPoints} pts</p>
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mt-1">+₹{winners.captaincyPot}</p>
                      </CardContent>
                    </Card>
                  </div>
                </BlurFade>

                {/* Leaderboard Table */}
                <BlurFade delay={0.2}>
                  <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                    <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                      <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">
                        Gameweek {selectedGW} Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#19297C] hover:bg-[#19297C]">
                            <TableHead className="text-white">Rank</TableHead>
                            <TableHead className="text-white">Team</TableHead>
                            <TableHead className="text-white text-right">Points</TableHead>
                            <TableHead className="text-white text-right">C+VC</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...currentGameweek.teams]
                            .sort((a, b) => b.points - a.points)
                            .map((team, index) => {
                              const rank = index + 1
                              return (
                                <TableRow 
                                  key={team.teamId}
                                  className={`border-[#DBC2CF] dark:border-[#19297C] ${
                                    rank === 1 ? 'bg-[#F26430]/5' :
                                    rank === 2 ? 'bg-[#028090]/5' :
                                    rank === currentGameweek.teams.length ? 'bg-red-500/5' :
                                    ''
                                  }`}
                                >
                                  <TableCell>
                                    <Badge className={
                                      rank === 1 ? 'bg-[#F26430] text-white' :
                                      rank === 2 ? 'bg-[#028090] text-white' :
                                      rank === currentGameweek.teams.length ? 'bg-red-500 text-white' :
                                      'bg-[#DBC2CF] dark:bg-[#19297C] text-[#1A1F16] dark:text-[#FFFCF2]'
                                    }>
                                      {rank}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium text-[#1A1F16] dark:text-[#FFFCF2]">
                                    {team.userName}
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-[#1A1F16] dark:text-[#FFFCF2]">
                                    {team.points}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-[#19297C] dark:text-[#028090]">
                                    {team.captaincyPoints}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </BlurFade>

                {/* Fixtures */}
                {currentFixtures.length > 0 && (
                  <BlurFade delay={0.25}>
                    <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                      <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                        <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">
                          Premier League Fixtures - GW{selectedGW}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <FixturesDisplay fixtures={currentFixtures} gameweek={selectedGW || 1} />
                      </CardContent>
                    </Card>
                  </BlurFade>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

