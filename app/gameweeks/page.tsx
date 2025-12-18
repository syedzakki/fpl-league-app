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
import { cn } from "@/lib/utils"

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

      const fplDataResponse = await fetch("/api/fpl-data")
      const fplData = await fplDataResponse.json()

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
    const interval = setInterval(fetchData, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const currentGameweek = gameweeks.find(gw => gw.gameweek === selectedGW)
  const currentFixtures = fixtures.filter(f => f.id === selectedGW)

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
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8">
        <BlurFade delay={0}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Gameweek Central</h1>
              <p className="text-sm text-muted-foreground mt-1">Live scores, results, and payouts</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} disabled={loading} variant="outline" size="sm" className="gap-2">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Sync
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        {loading ? (
          <LoadingSpinner text="Loading gameweeks..." />
        ) : (
          <div className="space-y-8">
            {nextDeadline && (
              <BlurFade delay={0.05}>
                <DeadlineCountdown deadline={nextDeadline} />
              </BlurFade>
            )}

            <BlurFade delay={0.1}>
              <Card className="border-border/50">
                <CardHeader className="py-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      Select Gameweek
                    </CardTitle>
                    <Select
                      value={selectedGW?.toString()}
                      onValueChange={(val) => setSelectedGW(parseInt(val))}
                    >
                      <SelectTrigger className="w-32 bg-card border-border/50">
                        <SelectValue placeholder="GW" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameweeks.map((gw) => (
                          <SelectItem key={gw.gameweek} value={gw.gameweek.toString()}>
                            <div className="flex items-center gap-2">
                              <span>GW {gw.gameweek}</span>
                              {gw.isLive && (
                                <Badge className="bg-destructive text-destructive-foreground text-[10px] uppercase font-bold px-1 py-0">LIVE</Badge>
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
                <BlurFade delay={0.15}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-yellow-500/10 border-yellow-500/30 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy className="w-16 h-16" /></div>
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Witness Greatness</span>
                        </div>
                        <p className="font-sports font-bold text-xl">{winners.winner.userName}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-2xl font-mono font-bold text-yellow-500">{winners.winner.points} pts</span>
                          <span className="text-xs font-mono text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+₹{winners.winnerPayout}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-400/10 border-slate-400/30 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Medal className="w-16 h-16" /></div>
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <Medal className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">So Close</span>
                        </div>
                        <p className="font-sports font-bold text-xl">{winners.second.userName}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-2xl font-mono font-bold text-slate-400">{winners.second.points} pts</span>
                          <span className="text-xs font-mono text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+₹{LEAGUE_CONFIG.SECOND_PLACE_BONUS}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-500/10 border-red-500/30 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><AlertCircle className="w-16 h-16" /></div>
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Absolute Stinker</span>
                        </div>
                        <p className="font-sports font-bold text-xl">{winners.last.userName}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-2xl font-mono font-bold text-red-500">{winners.last.points} pts</span>
                          <span className="text-xs font-mono text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">-₹{Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/10 border-primary/30 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-16 h-16" /></div>
                      <CardContent className="p-4 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">Captain Ball</span>
                        </div>
                        <p className="font-sports font-bold text-xl">{winners.captaincyWinner.userName}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-2xl font-mono font-bold text-primary">{winners.captaincyWinner.captaincyPoints} pts</span>
                          <span className="text-xs font-mono text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+₹{winners.captaincyPot}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </BlurFade>

                <BlurFade delay={0.2}>
                  <Card className="overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-border/50">
                      <CardTitle className="text-base uppercase tracking-wider font-bold text-muted-foreground">Gameweek {selectedGW} Standings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                            <TableHead className="w-12 text-center uppercase text-[10px] tracking-widest font-bold">Rank</TableHead>
                            <TableHead className="uppercase text-[10px] tracking-widest font-bold">Manager</TableHead>
                            <TableHead className="text-right uppercase text-[10px] tracking-widest font-bold">Points</TableHead>
                            <TableHead className="text-right uppercase text-[10px] tracking-widest font-bold">C+VC</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...currentGameweek.teams]
                            .sort((a, b) => b.points - a.points)
                            .map((team, index) => {
                              const rank = index + 1
                              return (
                                <TableRow key={team.teamId} className="border-border/50 hover:bg-muted/20">
                                  <TableCell className="text-center">
                                    <Badge variant={rank === 1 ? "default" : "outline"} className={cn("text-[10px] px-1.5 py-0 h-5", rank === 1 ? "bg-yellow-500 hover:bg-yellow-600 border-none text-black font-bold" : "text-muted-foreground border-border/30")}>{rank}</Badge>
                                  </TableCell>
                                  <TableCell className="font-bold text-foreground">
                                    {team.userName}
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-lg text-primary">
                                    {team.points}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-muted-foreground">
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

                {currentFixtures.length > 0 && (
                  <BlurFade delay={0.25}>
                    <div className="pt-4">
                      <h3 className="text-lg font-sports font-bold text-muted-foreground mb-4 px-1">Fixtures</h3>
                      <FixturesDisplay fixtures={currentFixtures} gameweek={selectedGW || 1} />
                    </div>
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

