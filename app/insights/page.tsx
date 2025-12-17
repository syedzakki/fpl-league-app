"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BlurFade } from "@/components/ui/blur-fade"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LeagueComparisonChart } from "@/components/charts/league-comparison-chart"
import { RefreshCw, Calendar, AlertTriangle, TrendingUp, Star, Users, Target, BarChart3 } from "lucide-react"
import { format } from "date-fns"
import { GlobalRefresh } from "@/components/global-refresh"

interface Fixture {
  id: number
  gameweek: number
  homeTeam: string
  homeTeamFull: string
  awayTeam: string
  awayTeamFull: string
  kickoff: string | null
  finished: boolean
  started: boolean
  homeScore: number | null
  awayScore: number | null
  homeDifficulty: number
  awayDifficulty: number
}

interface InjuryInfo {
  teamId: number
  teamName: string
  players: {
    id: number
    name: string
    news: string
    newsAdded: string | null
    chanceOfPlaying: number | null
    status: string
  }[]
}

interface PlayerRecommendation {
  id: number
  name: string
  team: string
  position: string
  cost: number
  form: number
  totalPoints: number
  expectedPoints: number
  fixturesDifficulty: number
  selectedBy: number
  recommendation: string
  reasons: string[]
}

interface RecommendationsData {
  currentGameweek: number
  recommendations: PlayerRecommendation[]
  bestTeam: {
    goalkeepers: PlayerRecommendation[]
    defenders: PlayerRecommendation[]
    midfielders: PlayerRecommendation[]
    forwards: PlayerRecommendation[]
  }
  differentials: PlayerRecommendation[]
  premiums: PlayerRecommendation[]
  budgetPicks: PlayerRecommendation[]
  captainPicks: PlayerRecommendation[]
}

interface LeagueStats {
  teamName: string
  gwWins: number
  secondFinishes: number
  lastFinishes: number
  captaincyWins: number
  totalPoints: number
  averagePoints: number
}

export default function InsightsPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [injuries, setInjuries] = useState<InjuryInfo[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null)
  const [leagueStats, setLeagueStats] = useState<LeagueStats[]>([])
  const [currentGw, setCurrentGw] = useState<number>(1)
  const [completedGWs, setCompletedGWs] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("leaguestats")

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [fplResponse, recsResponse, sheetsResponse] = await Promise.all([
        fetch("/api/fpl"),
        fetch("/api/recommendations"),
        fetch("/api/sheets"),
      ])
      
      const fplData = await fplResponse.json()
      const recsData = await recsResponse.json()
      const sheetsData = await sheetsResponse.json()
      
      if (fplData.success) {
        setFixtures(fplData.data.upcomingFixtures || [])
        setInjuries(fplData.data.injuries || [])
        setCurrentGw(fplData.data.gameweek?.current || 1)
      }
      
      if (recsData.success) {
        setRecommendations(recsData.data)
      }
      
      if (sheetsData.success && sheetsData.data?.summary) {
        const stats: LeagueStats[] = sheetsData.data.summary.map((item: any) => ({
          teamName: item.userName,
          gwWins: item.gwWins || 0,
          secondFinishes: item.secondFinishes || 0,
          lastFinishes: item.lastFinishes || 0,
          captaincyWins: item.captaincyWins || 0,
          totalPoints: item.totalPoints || 0,
          averagePoints: sheetsData.data.completedGameweeks 
            ? Math.round(item.totalPoints / sheetsData.data.completedGameweeks)
            : 0,
        }))
        setLeagueStats(stats)
        setCompletedGWs(sheetsData.data.completedGameweeks || 0)
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-[#4DAA57] text-white"
    if (difficulty === 3) return "bg-[#F7E733] text-[#2B2D42]"
    if (difficulty === 4) return "bg-orange-500 text-white"
    return "bg-[#FF3A20] text-white"
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "Strong Buy": return "bg-[#4DAA57] text-white"
      case "Buy": return "bg-[#4DAA57]/80 text-white"
      case "Hold": return "bg-[#F7E733] text-[#2B2D42]"
      case "Sell": return "bg-orange-500 text-white"
      case "Strong Sell": return "bg-[#FF3A20] text-white"
      default: return "bg-[#3d3f56] text-white"
    }
  }

  const getStatusIcon = (status: string, chance: number | null) => {
    if (status === "a") return null
    if (chance === 0) return "❌"
    if (chance && chance <= 25) return "🔴"
    if (chance && chance <= 50) return "🟠"
    if (chance && chance <= 75) return "🟡"
    return "⚠️"
  }

  const fixturesByGw = fixtures.reduce((acc, f) => {
    const gw = f.gameweek || 0
    if (!acc[gw]) acc[gw] = []
    acc[gw].push(f)
    return acc
  }, {} as Record<number, Fixture[]>)

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">FPL Insights</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">League analytics, schedule, injuries, and recommendations</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchData} 
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
          <LoadingSpinner text="Loading FPL insights" />
        ) : (
          <BlurFade delay={0.1}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-[#2B2D42] border border-[#3d3f56]">
                <TabsTrigger value="leaguestats" className="flex items-center gap-2 data-[state=active]:bg-[#F7E733] data-[state=active]:text-[#2B2D42]">
                  <BarChart3 className="h-4 w-4" />
                  League Stats
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2 data-[state=active]:bg-[#F7E733] data-[state=active]:text-[#2B2D42]">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="injuries" className="flex items-center gap-2 data-[state=active]:bg-[#F7E733] data-[state=active]:text-[#2B2D42]">
                  <AlertTriangle className="h-4 w-4" />
                  Injuries
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2 data-[state=active]:bg-[#F7E733] data-[state=active]:text-[#2B2D42]">
                  <TrendingUp className="h-4 w-4" />
                  Picks
                </TabsTrigger>
                <TabsTrigger value="bestteam" className="flex items-center gap-2 data-[state=active]:bg-[#F7E733] data-[state=active]:text-[#2B2D42]">
                  <Star className="h-4 w-4" />
                  Best Team
                </TabsTrigger>
              </TabsList>

              {/* League Stats Tab */}
              <TabsContent value="leaguestats" className="space-y-6">
                {leagueStats.length > 0 ? (
                  <LeagueComparisonChart stats={leagueStats} completedGWs={completedGWs} />
                ) : (
                  <Card className="bg-[#2B2D42] border-[#3d3f56]">
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">No league statistics available</p>
                      <p className="text-sm text-gray-500 mt-2">Data will appear once gameweeks are completed</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="text-sm px-3 py-1 bg-[#2B2D42] border border-[#F7E733] text-[#F7E733]">
                    Current: GW{currentGw}
                  </Badge>
                  <div className="flex gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-[#4DAA57]"></span> Easy
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-[#F7E733]"></span> Medium
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-[#FF3A20]"></span> Hard
                    </span>
                  </div>
                </div>

                {Object.keys(fixturesByGw).length > 0 ? (
                  Object.entries(fixturesByGw).map(([gw, gwFixtures]) => (
                    <Card key={gw} className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Calendar className="h-5 w-5 text-[#F7E733]" />
                          Gameweek {gw}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {gwFixtures.map((fixture) => (
                            <div
                              key={fixture.id}
                              className="flex items-center justify-between p-3 border border-[#3d3f56] rounded-lg bg-[#3d3f56]/30"
                            >
                              <div className="flex items-center gap-2">
                                <Badge className={getDifficultyColor(fixture.awayDifficulty)}>
                                  {fixture.homeTeam}
                                </Badge>
                                <span className="font-bold text-white">
                                  {fixture.finished
                                    ? `${fixture.homeScore} - ${fixture.awayScore}`
                                    : "vs"}
                                </span>
                                <Badge className={getDifficultyColor(fixture.homeDifficulty)}>
                                  {fixture.awayTeam}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-400">
                                {fixture.kickoff
                                  ? format(new Date(fixture.kickoff), "EEE MMM d, HH:mm")
                                  : "TBC"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-[#2B2D42] border-[#3d3f56]">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">No fixture schedule available</p>
                      <p className="text-sm text-gray-500 mt-2">Fixtures will appear when available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Injuries Tab */}
              <TabsContent value="injuries" className="space-y-6">
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardHeader className="border-b border-[#3d3f56]">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <AlertTriangle className="h-5 w-5 text-[#F7E733]" />
                      Injury & Suspension News
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Players with reported fitness concerns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {injuries.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No injury news available</p>
                    ) : (
                      <div className="space-y-6">
                        {injuries.map((team) => (
                          <div key={team.teamId} className="border border-[#3d3f56] rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-3 text-white">{team.teamName}</h3>
                            <div className="space-y-2">
                              {team.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between p-3 bg-[#3d3f56]/50 rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{getStatusIcon(player.status, player.chanceOfPlaying)}</span>
                                    <span className="font-medium text-white">{player.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 max-w-md truncate">
                                      {player.news}
                                    </span>
                                    {player.chanceOfPlaying !== null && (
                                      <Badge className={player.chanceOfPlaying >= 75 ? "bg-[#4DAA57]" : "bg-[#FF3A20]"}>
                                        {player.chanceOfPlaying}%
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                {recommendations ? (
                  <>
                    {/* Captain Picks */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Target className="h-5 w-5 text-[#F7E733]" />
                          Captain Picks for GW{recommendations.currentGameweek}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {recommendations.captainPicks.map((player, idx) => (
                            <div
                              key={player.id}
                              className={`p-4 rounded-lg border ${idx === 0 ? "border-[#F7E733] bg-[#F7E733]/10" : "border-[#3d3f56] bg-[#3d3f56]/30"}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-[#3d3f56] text-white">{player.position}</Badge>
                                {idx === 0 && <span className="text-[#F7E733]">👑</span>}
                              </div>
                              <p className="font-bold text-lg text-white">{player.name}</p>
                              <p className="text-sm text-gray-400">{player.team}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-400">Form: {player.form}</span>
                                <span className="text-sm font-bold text-[#4DAA57]">
                                  £{player.cost}m
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Differentials */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Users className="h-5 w-5 text-[#1BE7FF]" />
                          Differential Picks (&lt;10% ownership)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#3d3f56] hover:bg-transparent">
                              <TableHead className="text-gray-400">Player</TableHead>
                              <TableHead className="text-gray-400">Team</TableHead>
                              <TableHead className="text-gray-400">Pos</TableHead>
                              <TableHead className="text-right text-gray-400">Form</TableHead>
                              <TableHead className="text-right text-gray-400">Cost</TableHead>
                              <TableHead className="text-right text-gray-400">Selected</TableHead>
                              <TableHead className="text-gray-400">Recommendation</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recommendations.differentials.slice(0, 8).map((player) => (
                              <TableRow key={player.id} className="border-[#3d3f56] hover:bg-[#3d3f56]/30">
                                <TableCell className="font-medium text-white">{player.name}</TableCell>
                                <TableCell className="text-gray-300">{player.team}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-[#3d3f56] text-gray-300">{player.position}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold text-[#4DAA57]">
                                  {player.form}
                                </TableCell>
                                <TableCell className="text-right text-gray-300">£{player.cost}m</TableCell>
                                <TableCell className="text-right text-gray-300">{player.selectedBy}%</TableCell>
                                <TableCell>
                                  <Badge className={getRecommendationColor(player.recommendation)}>
                                    {player.recommendation}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="bg-[#2B2D42] border-[#3d3f56]">
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">No player recommendations available</p>
                      <p className="text-sm text-gray-500 mt-2">Recommendations will appear when data is available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Best Team Tab */}
              <TabsContent value="bestteam" className="space-y-6">
                {recommendations ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Goalkeepers */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="text-white">🧤 Goalkeepers</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {recommendations.bestTeam.goalkeepers.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-[#3d3f56]/50 rounded">
                              <div>
                                <span className="font-medium text-white">{p.name}</span>
                                <span className="text-sm text-gray-400 ml-2">{p.team}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#4DAA57] font-bold">{p.form}</span>
                                <span className="text-sm text-gray-400">£{p.cost}m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Defenders */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="text-white">🛡️ Defenders</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {recommendations.bestTeam.defenders.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-[#3d3f56]/50 rounded">
                              <div>
                                <span className="font-medium text-white">{p.name}</span>
                                <span className="text-sm text-gray-400 ml-2">{p.team}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#4DAA57] font-bold">{p.form}</span>
                                <span className="text-sm text-gray-400">£{p.cost}m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Midfielders */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="text-white">⚽ Midfielders</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {recommendations.bestTeam.midfielders.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-[#3d3f56]/50 rounded">
                              <div>
                                <span className="font-medium text-white">{p.name}</span>
                                <span className="text-sm text-gray-400 ml-2">{p.team}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#4DAA57] font-bold">{p.form}</span>
                                <span className="text-sm text-gray-400">£{p.cost}m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Forwards */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="text-white">🎯 Forwards</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {recommendations.bestTeam.forwards.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-[#3d3f56]/50 rounded">
                              <div>
                                <span className="font-medium text-white">{p.name}</span>
                                <span className="text-sm text-gray-400 ml-2">{p.team}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#4DAA57] font-bold">{p.form}</span>
                                <span className="text-sm text-gray-400">£{p.cost}m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Budget Picks */}
                    <Card className="md:col-span-2 bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader className="border-b border-[#3d3f56]">
                        <CardTitle className="text-white">💰 Budget Picks (Under £6m)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {recommendations.budgetPicks.slice(0, 10).map((p) => (
                            <div key={p.id} className="p-3 bg-[#3d3f56]/50 rounded text-center">
                              <Badge variant="outline" className="mb-2 border-[#3d3f56] text-gray-300">{p.position}</Badge>
                              <p className="font-medium text-white">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.team}</p>
                              <p className="text-[#4DAA57] font-bold mt-1">£{p.cost}m</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-[#2B2D42] border-[#3d3f56]">
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">No best team data available</p>
                      <p className="text-sm text-gray-500 mt-2">Team recommendations will appear when data is available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </BlurFade>
        )}
      </div>
    </div>
  )
}
