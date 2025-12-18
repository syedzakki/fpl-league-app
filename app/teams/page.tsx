"use client"

import { useEffect, useState } from "react"
import { PlayerCard } from "@/components/player-card"
import { ExpandableLeaderboardTable } from "@/components/expandable-leaderboard-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlurFade } from "@/components/ui/blur-fade"
import { LoadingSpinner, SkeletonCard } from "@/components/ui/loading-spinner"
import { Search, RefreshCw, Users, LayoutGrid, Table as TableIcon } from "lucide-react"
import type { TeamStats, LeaderboardEntry } from "@/lib/types"
import { GlobalRefresh } from "@/components/global-refresh"
import { cn } from "@/lib/utils"

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamStats[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [customTeamId, setCustomTeamId] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sheets")
      const data = await response.json()
      const transfersResponse = await fetch("/api/transfers")
      const transfersData = await transfersResponse.json()

      if (data.success && data.data?.summary && data.data?.gameweekData) {
        const gameweekData = data.data.gameweekData
        const teamNames = data.data.teamNames || {}

        const stats: TeamStats[] = data.data.summary.map((item: any) => {
          const teamId = Object.entries(teamNames).find(([id, name]) => name === item.userName)?.[0]
          let bestGW = 0, worstGW = 999
          if (teamId) {
            gameweekData.forEach((gw: any) => {
              const teamGW = gw.teams.find((t: any) => t.teamId === teamId)
              if (teamGW && teamGW.points > 0) {
                if (teamGW.points > bestGW) bestGW = teamGW.points
                if (teamGW.points < worstGW) worstGW = teamGW.points
              }
            })
          }
          return {
            teamId: teamId || `team-${item.leaderboardPos}`,
            teamName: item.userName || `Team ${item.leaderboardPos}`,
            gwWins: item.gwWins || 0,
            secondFinishes: item.secondFinishes || 0,
            lastFinishes: item.lastFinishes || 0,
            captaincyWins: item.captaincyWins || 0,
            leaderboardPosition: item.leaderboardPos || 0,
            totalPoints: item.totalPoints || 0,
            averagePoints: item.totalPoints && data.data.completedGameweeks ? Math.round(item.totalPoints / data.data.completedGameweeks) : 0,
            bestGameweek: bestGW || 0,
            worstGameweek: worstGW === 999 ? 0 : worstGW,
          }
        })
        setTeams(stats)

        const mappedLeaderboard: LeaderboardEntry[] = data.data.summary.map((entry: any) => {
          const teamId = Object.keys(teamNames).find(key => teamNames[key] === entry.userName) || ""
          const gameweekHistory = gameweekData.map((gw: any) => {
            const teamGw = gw.teams.find((t: any) => t.teamId === teamId)
            if (!teamGw) return null
            const teamTransfers = transfersData.success ? transfersData.data.find((t: any) => t.teamId === teamId) : null
            const transferInfo = teamTransfers?.transfers?.find((t: any) => t.gameweek === gw.gameweek)
            const sortedTeams = [...gw.teams].sort((a: any, b: any) => b.points - a.points)
            const rank = sortedTeams.findIndex((t: any) => t.teamId === teamId) + 1
            return {
              gameweek: gw.gameweek,
              points: teamGw.points || 0,
              rank: rank,
              transfers: transferInfo?.transfersMade || 0,
              hits: transferInfo?.hits || 0,
              hitCost: transferInfo?.hitCost || 0,
              transferDetails: transferInfo?.transferDetails || undefined,
            }
          }).filter((gw: any) => gw !== null)

          return {
            teamId: teamId,
            teamName: entry.userName,
            totalPoints: entry.totalPoints,
            gwWins: entry.gwWins,
            secondFinishes: entry.secondFinishes,
            lastFinishes: entry.lastFinishes,
            captaincyWins: entry.captaincyWins,
            position: entry.leaderboardPos,
            gameweekHistory: gameweekHistory,
          }
        })
        setLeaderboard(mappedLeaderboard)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeams() }, [])

  const filteredTeams = teams.filter((team) => team.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredLeaderboard = leaderboard.filter((team) => team.teamName.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8">
        <BlurFade delay={0}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Team Statistics</h1>
              <p className="text-sm text-muted-foreground mt-1">Deep dive into manager performance</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchTeams} disabled={loading} variant="outline" size="sm" className="gap-2">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
              <GlobalRefresh />
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <Tabs defaultValue="league" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="league" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4" /> League
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Custom Lookup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="league" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search managers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card border-border/50"
                  />
                </div>

                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className={viewMode === "cards" ? "bg-primary text-primary-foreground" : ""}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={viewMode === "table" ? "bg-primary text-primary-foreground" : ""}
                  >
                    <TableIcon className="h-4 w-4 mr-1" />
                    Table
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTeams.map((team, i) => (
                    <BlurFade key={team.teamId} delay={0.03 * i}>
                      <PlayerCard stats={team} />
                    </BlurFade>
                  ))}
                </div>
              ) : (
                <BlurFade delay={0.1}>
                  <ExpandableLeaderboardTable entries={filteredLeaderboard} />
                </BlurFade>
              )}
            </TabsContent>

            <TabsContent value="custom">
              <Card className="max-w-md bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Custom Team Lookup</CardTitle>
                  <CardDescription>Enter FPL team ID to analyze</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Team ID (e.g., 6196491)"
                        value={customTeamId}
                        onChange={(e) => setCustomTeamId(e.target.value)}
                        className="bg-card border-border/50"
                        type="number"
                      />
                    </div>
                    <Button>Search</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </BlurFade>
      </div>
    </div>
  )
}
