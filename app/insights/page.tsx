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
import { RefreshCw, Calendar, AlertTriangle, TrendingUp, Star, Users, Target, BarChart3, ArrowRightLeft, Lightbulb, Bot, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { GlobalRefresh } from "@/components/global-refresh"
import { TopTransfersDisplay } from "@/components/top-transfers-display"
import { cn } from "@/lib/utils"
// import { Switch } from "@/components/ui/switch" // We will create this
// import { useTeam } from "@/components/providers/team-provider" // We will use this

// Temporarily inline Switch if we can't create it immediately, but better to create it.
// Assuming we will create components/ui/switch.tsx next.
import { Switch } from "@/components/ui/switch"
import { useTeam } from "@/components/providers/team-provider"


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
    position: string
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
  isForNextGameweek?: boolean
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

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function InsightsPage() {
  const { teamName } = useTeam()
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [injuries, setInjuries] = useState<InjuryInfo[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null)
  const [leagueStats, setLeagueStats] = useState<LeagueStats[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [currentGw, setCurrentGw] = useState<number>(1)
  const [completedGWs, setCompletedGWs] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transfers")
  const [aiMode, setAiMode] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)

      const [fplResponse, recsResponse, fplDataResponse, fixturesResponse] = await Promise.all([
        fetch("/api/fpl"),
        fetch("/api/recommendations"),
        fetch("/api/fpl-data"),
        fetch("/api/fixtures"),
      ])

      const fplData = await fplResponse.json()
      const recsData = await recsResponse.json()
      const fplLeagueData = await fplDataResponse.json()
      const allFixtures = await fixturesResponse.json()

      if (fplData.success) {
        setInjuries(fplData.data.injuries || [])
        setCurrentGw(fplData.data.gameweek?.current || 1)

        if (allFixtures && fplData.data.teamStrengths) {
          const currentGw = fplData.data.gameweek?.current || 1
          const teamMap = new Map(fplData.data.teamStrengths.map((t: any) => [t.id, t] as [number, any]))

          const processedFixtures = allFixtures
            .filter((f: any) => f.event && f.event >= currentGw && f.event <= currentGw + 9)
            .map((f: any) => {
              const homeTeam: any = teamMap.get(f.team_h)
              const awayTeam: any = teamMap.get(f.team_a)
              return {
                id: f.id,
                gameweek: f.event,
                homeTeam: (homeTeam && homeTeam.shortName) ? homeTeam.shortName : '?',
                awayTeam: (awayTeam && awayTeam.shortName) ? awayTeam.shortName : '?',
                kickoff: f.kickoff_time,
                finished: f.finished || false,
                started: f.started || false,
                homeScore: f.team_h_score,
                awayScore: f.team_a_score,
                homeDifficulty: f.team_h_difficulty || 3,
                awayDifficulty: f.team_a_difficulty || 3,
              }
            })

          setFixtures(processedFixtures)
          setTeams(fplData.data.teamStrengths || [])
        }
      }

      if (recsData.success) {
        setRecommendations(recsData.data)
      }

      if (fplLeagueData.success && fplLeagueData.data?.leaderboard) {
        const completedGWs = fplLeagueData.data.completedGameweeks || 0
        const stats: LeagueStats[] = fplLeagueData.data.leaderboard.map((item: any) => ({
          teamName: item.userName,
          gwWins: item.gwWins || 0,
          secondFinishes: item.secondFinishes || 0,
          lastFinishes: item.lastFinishes || 0,
          captaincyWins: item.captaincyWins || 0,
          totalPoints: item.totalPoints || 0,
          averagePoints: completedGWs
            ? Math.round((item.totalPoints || 0) / completedGWs)
            : 0,
        }))

        setLeagueStats(stats)
        setCompletedGWs(completedGWs)
      }
    } catch (error) {
      console.error("❌ Error fetching insights:", error)
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
    if (difficulty === 1) return "bg-[#00FF87] text-[#2B2D42]"
    if (difficulty === 2) return "bg-green-500 text-white"
    if (difficulty === 3) return "bg-yellow-500 text-black"
    if (difficulty === 4) return "bg-orange-500 text-white"
    return "bg-destructive text-destructive-foreground"
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "Strong Buy": return "bg-green-500 text-white"
      case "Buy": return "bg-green-600/80 text-white"
      case "Hold": return "bg-yellow-500 text-black"
      case "Sell": return "bg-orange-500 text-white"
      case "Strong Sell": return "bg-destructive text-destructive-foreground"
      default: return "bg-muted text-muted-foreground"
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
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-8">
          <BlurFade delay={0}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide flex items-center gap-2">
                  FPL Insights
                  {aiMode && <Badge variant="outline" className="border-primary text-primary text-xs tracking-normal normal-case"><Bot className="w-3 h-3 mr-1" /> AI Enhanced</Badge>}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">League analytics, schedule, injuries, and recommendations</p>
              </div>

              <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
                <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
                  <Switch id="ai-mode" checked={aiMode} onCheckedChange={setAiMode} />
                  <label htmlFor="ai-mode" className="text-sm cursor-pointer select-none flex items-center gap-1.5 font-medium">
                    <Sparkles className={`w-4 h-4 ${aiMode ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />
                    AI Mode
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchData}
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
            </div>
          </BlurFade>

          {loading ? (
            <LoadingSpinner text="Analyzing FPL data..." />
          ) : (
            <BlurFade delay={0.1}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 flex flex-wrap h-auto gap-1">
                  <TabsTrigger value="transfers" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfers
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Picks
                  </TabsTrigger>
                  <TabsTrigger value="bestteam" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Star className="h-4 w-4" />
                    Best Team
                  </TabsTrigger>
                  <TabsTrigger value="leaguestats" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BarChart3 className="h-4 w-4" />
                    League Stats
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger value="injuries" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Injuries
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transfers" className="space-y-6">
                  <TopTransfersDisplay />
                </TabsContent>

                <TabsContent value="leaguestats" className="space-y-6">
                  {leagueStats.length > 0 ? (
                    <LeagueComparisonChart stats={leagueStats} completedGWs={completedGWs} />
                  ) : (
                    <Card className="border-border/50 border-dashed">
                      <CardContent className="p-8 text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No league statistics available</p>
                        <p className="text-sm text-muted-foreground/50 mt-2">Data will appear once gameweeks are completed</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-sm px-3 py-1 border-primary text-primary">
                      Current: GW{currentGw}
                    </Badge>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-[#00FF87]"></span> 1
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-green-500"></span> 2
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-yellow-500"></span> 3
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-orange-500"></span> 4
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-destructive"></span> 5
                      </span>
                    </div>
                  </div>

                  {Object.keys(fixturesByGw).length > 0 ? (
                    <Card className="border-border/50 overflow-x-auto">
                      <CardHeader className="border-b border-border/50 py-4">
                        <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
                          <Calendar className="h-5 w-5 text-primary" />
                          Fixture Difficulty Rating (FDR)
                        </CardTitle>
                        <CardDescription>
                          Next 10 gameweeks - Color-coded by difficulty
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-muted/30">
                              <TableHead className="font-bold uppercase tracking-wider text-[10px] w-24 sticky left-0 bg-background z-10">Team</TableHead>
                              <TableHead className="font-bold uppercase tracking-wider text-[10px] w-20 bg-background z-10">Rank</TableHead>
                              {Object.keys(fixturesByGw).slice(0, 10).map(gw => (
                                <TableHead key={gw} className="text-center font-bold uppercase tracking-wider text-[10px] min-w-[80px]">
                                  GW {gw}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teams.filter(t => t.id <= 20).sort((a, b) => a.name.localeCompare(b.name)).map(team => {
                              const teamFixtures = Object.entries(fixturesByGw).slice(0, 10).map(([gw, fixtures]) => {
                                const fixture = fixtures.find(f => f.homeTeam === team.shortName || f.awayTeam === team.shortName)
                                if (!fixture) return { gw, opponent: '-', difficulty: 0, isHome: false }

                                const isHome = fixture.homeTeam === team.shortName
                                const opponent = isHome ? fixture.awayTeam : fixture.homeTeam
                                const difficulty = isHome ? fixture.homeDifficulty : fixture.awayDifficulty

                                return { gw, opponent, difficulty, isHome }
                              })

                              return (
                                <TableRow key={team.id} className="border-border/50 hover:bg-muted/20">
                                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                                    {team.shortName}
                                  </TableCell>
                                  <TableCell className="text-center sticky left-24 bg-background z-10">
                                    <Badge variant="outline" className="text-[10px] border-border/50 font-mono">
                                      {team.id}
                                    </Badge>
                                  </TableCell>
                                  {teamFixtures.map(({ gw, opponent, difficulty, isHome }) => (
                                    <TableCell key={gw} className="p-1 text-center">
                                      {opponent !== '-' ? (
                                        <div className={cn("px-1 py-1 rounded text-[10px] font-bold uppercase", getDifficultyColor(difficulty))}>
                                          {opponent} {isHome ? '(H)' : '(A)'}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-border/50 border-dashed">
                      <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No fixture schedule available</p>
                        <p className="text-sm text-muted-foreground/50 mt-2">Fixtures will appear when available</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="injuries" className="space-y-6">
                  <Card className="border-border/50">
                    <CardHeader className="border-b border-border/50 py-4">
                      <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Injury & Suspension News
                      </CardTitle>
                      <CardDescription>
                        All players with fitness concerns across teams
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {injuries.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No injury news available</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-muted/30">
                              <TableHead className="font-bold uppercase tracking-wider text-[10px] w-12 text-center">Status</TableHead>
                              <TableHead className="font-bold uppercase tracking-wider text-[10px]">Player</TableHead>
                              <TableHead className="font-bold uppercase tracking-wider text-[10px] w-32">Team</TableHead>
                              <TableHead className="font-bold uppercase tracking-wider text-[10px] w-20">Pos</TableHead>
                              <TableHead className="font-bold uppercase tracking-wider text-[10px]">News</TableHead>
                              <TableHead className="font-bold uppercase tracking-wider text-[10px] w-24 text-center">Chance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {injuries.flatMap((team) =>
                              team.players.map((player) => (
                                <TableRow key={player.id} className="border-border/50 hover:bg-muted/20">
                                  <TableCell className="text-center">
                                    {getStatusIcon(player.status, player.chanceOfPlaying)}
                                  </TableCell>
                                  <TableCell className="font-bold">{player.name}</TableCell>
                                  <TableCell className="text-muted-foreground text-xs">{team.teamName}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px] border-border/50">
                                      {player.position}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                                    {player.news || 'No details available'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {player.chanceOfPlaying !== null ? (
                                      <Badge className={cn("text-[10px]", player.chanceOfPlaying >= 75 ? "bg-green-500" : player.chanceOfPlaying >= 50 ? "bg-yellow-500 text-black" : "bg-destructive")}>
                                        {player.chanceOfPlaying}%
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                  {recommendations ? (
                    <>
                      {recommendations.isForNextGameweek && (
                        <Card className="bg-yellow-500/10 border-yellow-500/30">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Lightbulb className="h-6 w-6 text-yellow-500" />
                            <div>
                              <p className="font-bold text-yellow-500">Showing Next Gameweek Recommendations</p>
                              <p className="text-sm text-yellow-500/80">Current gameweek has ended. These picks are for GW{recommendations.currentGameweek}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card className="border-border/50">
                        <CardHeader className="border-b border-border/50 py-4">
                          <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
                            <Target className="h-5 w-5 text-primary" />
                            Captain Picks for GW{recommendations.currentGameweek}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {recommendations.captainPicks.map((player, idx) => (
                              <div
                                key={player.id}
                                className={cn("p-4 rounded-lg border", idx === 0 ? "border-yellow-500/50 bg-yellow-500/10" : "border-border/50 bg-muted/20")}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className="bg-background border-border">{player.position}</Badge>
                                  {idx === 0 && <span className="text-xl">👑</span>}
                                </div>
                                <p className="font-bold text-lg">{player.name}</p>
                                <p className="text-xs text-muted-foreground uppercase">{player.team}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Form: <span className="text-foreground font-bold">{player.form}</span></span>
                                  <span className="text-sm font-bold text-primary text-green-500">
                                    £{player.cost}m
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/50">
                        <CardHeader className="border-b border-border/50 py-4">
                          <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
                            <Users className="h-5 w-5 text-blue-500" />
                            Differential Picks (&lt;10% ownership)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50 hover:bg-transparent bg-muted/30">
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Player</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Team</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Pos</TableHead>
                                <TableHead className="text-right font-bold uppercase tracking-wider text-[10px]">Form</TableHead>
                                <TableHead className="text-right font-bold uppercase tracking-wider text-[10px]">Cost</TableHead>
                                <TableHead className="text-right font-bold uppercase tracking-wider text-[10px]">Selected</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Recommendation</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {recommendations.differentials.slice(0, 8).map((player) => (
                                <TableRow key={player.id} className="border-border/50 hover:bg-muted/20">
                                  <TableCell className="font-bold">{player.name}</TableCell>
                                  <TableCell className="text-muted-foreground text-xs">{player.team}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px] border-border/50">{player.position}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-green-500">
                                    {player.form}
                                  </TableCell>
                                  <TableCell className="text-right text-muted-foreground font-mono">£{player.cost}m</TableCell>
                                  <TableCell className="text-right text-muted-foreground">{player.selectedBy}%</TableCell>
                                  <TableCell>
                                    <Badge className={cn("text-[10px]", getRecommendationColor(player.recommendation))}>
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
                    <Card className="border-border/50 border-dashed">
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No player recommendations available</p>
                        <p className="text-sm text-muted-foreground/50 mt-2">Recommendations will appear when data is available</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="bestteam" className="space-y-6">
                  {recommendations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-border/50">
                        <CardHeader className="border-b border-border/50 py-3">
                          <CardTitle className="text-sm uppercase tracking-wider font-bold">🧤 Goalkeepers</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border/50">
                            {recommendations.bestTeam.goalkeepers.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-muted/20">
                                <div>
                                  <span className="font-bold text-sm block">{p.name}</span>
                                  <span className="text-xs text-muted-foreground">{p.team}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{p.form}</Badge>
                                  <span className="text-sm font-mono">£{p.cost}m</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/50">
                        <CardHeader className="border-b border-border/50 py-3">
                          <CardTitle className="text-sm uppercase tracking-wider font-bold">🛡️ Defenders</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border/50">
                            {recommendations.bestTeam.defenders.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-muted/20">
                                <div>
                                  <span className="font-bold text-sm block">{p.name}</span>
                                  <span className="text-xs text-muted-foreground">{p.team}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{p.form}</Badge>
                                  <span className="text-sm font-mono">£{p.cost}m</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/50">
                        <CardHeader className="border-b border-border/50 py-3">
                          <CardTitle className="text-sm uppercase tracking-wider font-bold">⚽ Midfielders</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border/50">
                            {recommendations.bestTeam.midfielders.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-muted/20">
                                <div>
                                  <span className="font-bold text-sm block">{p.name}</span>
                                  <span className="text-xs text-muted-foreground">{p.team}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{p.form}</Badge>
                                  <span className="text-sm font-mono">£{p.cost}m</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/50">
                        <CardHeader className="border-b border-border/50 py-3">
                          <CardTitle className="text-sm uppercase tracking-wider font-bold">🎯 Forwards</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border/50">
                            {recommendations.bestTeam.forwards.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-muted/20">
                                <div>
                                  <span className="font-bold text-sm block">{p.name}</span>
                                  <span className="text-xs text-muted-foreground">{p.team}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{p.form}</Badge>
                                  <span className="text-sm font-mono">£{p.cost}m</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2 border-border/50">
                        <CardHeader className="border-b border-border/50 py-3">
                          <CardTitle className="text-sm uppercase tracking-wider font-bold">💰 Budget Picks (Under £6m)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {recommendations.budgetPicks.slice(0, 10).map((p) => (
                              <div key={p.id} className="p-3 bg-muted/20 rounded text-center border border-border/30">
                                <Badge variant="outline" className="mb-2 border-border text-[10px]">{p.position}</Badge>
                                <p className="font-bold text-sm truncate">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground">{p.team}</p>
                                <p className="text-green-500 font-bold mt-1 text-xs">£{p.cost}m</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="border-border/50 border-dashed">
                      <CardContent className="p-8 text-center">
                        <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No best team data available</p>
                        <p className="text-sm text-muted-foreground/50 mt-2">Team recommendations will appear when data is available</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </BlurFade>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
