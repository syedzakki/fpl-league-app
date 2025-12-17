"use client"

import { useEffect, useState } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { PositionHistoryChart } from "@/components/charts/position-history-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { LoadingSpinner, SkeletonCard, SkeletonTable } from "@/components/ui/loading-spinner"
import { NextDeadlineCard } from "@/components/deadline-countdown"
import Link from "next/link"
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  RefreshCw, 
  Calendar, 
  Lightbulb, 
  Zap,
  Crown
} from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { LEAGUE_CONFIG } from "@/lib/constants"
import { GlobalRefresh } from "@/components/global-refresh"

interface PositionData {
  gameweek: number
  [playerName: string]: number
}

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [positionHistory, setPositionHistory] = useState<PositionData[]>([])
  const [players, setPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completedGWs, setCompletedGWs] = useState(0)
  const [totalPot, setTotalPot] = useState(0)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/fpl-data")
      const data = await response.json()
      
      if (data.success && data.data?.leaderboard) {
        const entries: LeaderboardEntry[] = data.data.leaderboard.map((team: any) => ({
          position: team.leaderboardPos || 0,
          teamId: team.teamId,
          teamName: team.userName,
          totalPoints: team.totalPointsNoHits || 0,
          gwWins: team.gwWins || 0,
          secondFinishes: team.secondFinishes || 0,
          lastFinishes: team.lastFinishes || 0,
          captaincyWins: team.captaincyWins || 0,
          netFinancial: 0,
        }))
        setLeaderboard(entries)
        
        const gwCount = data.data.completedGameweeks || 0
        setCompletedGWs(gwCount)
        
        const numTeams = entries.length
        const pot = numTeams * LEAGUE_CONFIG.FPL_BUY_IN + 
                    gwCount * numTeams * (LEAGUE_CONFIG.GW_BUY_IN + LEAGUE_CONFIG.CAPTAINCY_BUY_IN)
        setTotalPot(pot)
        
        if (data.data.gameweekResults) {
          calculatePositionHistoryFromResults(data.data.gameweekResults, data.data.leaderboard)
        }
        
        setLastUpdated(new Date(data.timestamp || Date.now()))
      } else {
        setError("Failed to fetch data")
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const calculatePositionHistoryFromResults = (
    gameweekResults: Array<{ gameweek: number; teams: Array<{ teamId: string; userName: string; points: number }> }>,
    leaderboardData: Array<{ teamId: string; userName: string; gameweeks: Array<{ gameweek: number; points: number }> }>
  ) => {
    const playerNames = new Set<string>()
    const cumulativePoints: Record<string, number> = {}
    
    // Initialize all players
    leaderboardData.forEach(team => {
      playerNames.add(team.userName)
      cumulativePoints[team.userName] = 0
    })
    
    const playerList = Array.from(playerNames)
    setPlayers(playerList)
    
    const history: PositionData[] = []
    const runningTotals: Record<string, number> = {}
    
    playerList.forEach(name => {
      runningTotals[name] = 0
    })
    
    // Process each gameweek
    gameweekResults.forEach(gw => {
      gw.teams.forEach(team => {
        runningTotals[team.userName] = (runningTotals[team.userName] || 0) + team.points
      })
      
      const sortedPlayers = playerList
        .map(name => ({ name, points: runningTotals[name] || 0 }))
        .sort((a, b) => b.points - a.points)
      
      const positionData: PositionData = { gameweek: gw.gameweek }
      sortedPlayers.forEach((player, index) => {
        positionData[player.name] = index + 1
      })
      
      history.push(positionData)
    })
    
    setPositionHistory(history)
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const stats = {
    totalTeams: leaderboard.length || 6,
    totalGWs: completedGWs,
    totalPot: totalPot,
    leader: leaderboard[0] || null,
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <BlurFade delay={0}>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F16] dark:text-[#FFFCF2] mb-1">
                  FPL League Dashboard
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#19297C] dark:text-[#DBC2CF]">
                    Season 25/26
                  </span>
                  {lastUpdated && (
                    <span className="text-[#19297C] dark:text-[#DBC2CF]">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  {!loading && (
                    <span className="flex items-center gap-1.5 text-[#028090]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#028090] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#028090]"></span>
                      </span>
                      Live
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={fetchLeaderboard} 
                  disabled={loading} 
                  variant="outline"
                  className="bg-[#19297C] border-[#028090] hover:bg-[#028090] hover:border-[#F26430] text-white"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 transition-transform ${loading ? "animate-spin" : "group-hover:rotate-180"}`} />
                  Refresh
                </Button>
                <GlobalRefresh />
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Teams Card */}
            <BlurFade delay={0.05}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] h-full">
                <CardContent className="p-5 h-[100px] flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Teams</p>
                      <p className="text-3xl font-bold font-mono text-[#1A1F16] dark:text-[#FFFCF2]">
                        <NumberTicker value={stats.totalTeams} />
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-[#19297C]/10 dark:bg-[#028090]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-[#19297C] dark:text-[#028090]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Gameweeks Card */}
            <BlurFade delay={0.1}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] h-full">
                <CardContent className="p-5 h-[100px] flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Gameweeks</p>
                      <p className="text-3xl font-bold font-mono text-[#1A1F16] dark:text-[#FFFCF2]">
                        <NumberTicker value={stats.totalGWs} />
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-[#028090]/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-[#028090]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Total Pot Card */}
            <BlurFade delay={0.15}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#028090] dark:border-[#028090]/50 h-full">
                <CardContent className="p-5 h-[100px] flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Total Pot</p>
                      <p className="text-3xl font-bold font-mono text-[#028090]">
                        ₹<NumberTicker value={stats.totalPot} />
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-[#028090]/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-[#028090]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Leader Card */}
            <BlurFade delay={0.2}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#F26430] dark:border-[#F26430]/50 h-full">
                <CardContent className="p-5 h-[100px] flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Leader</p>
                      <p className="text-xl font-bold text-[#1A1F16] dark:text-[#FFFCF2] truncate">
                        {stats.leader?.teamName || "—"}
                      </p>
                      <p className="text-sm font-mono text-[#F26430]">
                        {stats.leader?.totalPoints || 0} pts
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-[#F26430]/10 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-6 w-6 text-[#F26430]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Deadline Countdown Card */}
            <BlurFade delay={0.25} className="col-span-2 lg:col-span-1">
              <NextDeadlineCard />
            </BlurFade>
          </div>
        )}

          {/* Quick Navigation */}
          <BlurFade delay={0.3}>
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider mb-4">
                Quick Access
              </h2>
              <div className="grid grid-cols-4 gap-3">
              {[
                { href: "/leaderboard", Icon: Trophy, name: "Leaderboard", color: "#F26430" },
                { href: "/gameweeks", Icon: Calendar, name: "Gameweeks", color: "#028090" },
                { href: "/financials", Icon: DollarSign, name: "Financials", color: "#028090" },
                { href: "/insights", Icon: Lightbulb, name: "Insights", color: "#19297C" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white dark:bg-[#1A1F16] border border-[#DBC2CF] dark:border-[#19297C] hover:border-[#F26430] dark:hover:border-[#028090] transition-all duration-200 hover:scale-105"
                >
                  <item.Icon
                    className="h-6 w-6 transition-colors"
                    style={{ color: item.color }}
                  />
                  <span className="text-xs font-medium text-[#1A1F16] dark:text-[#FFFCF2] group-hover:text-[#F26430] dark:group-hover:text-[#028090] transition-colors">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
            </div>
          </BlurFade>

        {/* Leaderboard */}
        <BlurFade delay={0.35}>
          {loading ? (
            <SkeletonTable />
            ) : error ? (
              <Card className="p-8 text-center bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <div className="text-[#F26430] mb-3 flex flex-col items-center">
                  <Zap className="h-8 w-8 mb-2" />
                  <p>{error}</p>
                </div>
                <Button 
                  onClick={fetchLeaderboard} 
                  variant="outline"
                  className="bg-[#19297C] border-[#028090] hover:bg-[#028090] text-white"
                >
                  Try Again
                </Button>
              </Card>
            ) : leaderboard.length > 0 ? (
              <LeaderboardTable entries={leaderboard.slice(0, 6)} />
            ) : (
              <Card className="p-8 text-center bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <p className="text-[#19297C] dark:text-[#DBC2CF]">No data available</p>
              </Card>
            )}
        </BlurFade>

        {/* Position History Chart */}
        {!loading && positionHistory.length > 0 && players.length > 0 && (
          <BlurFade delay={0.4}>
            <div className="mt-6">
              <PositionHistoryChart data={positionHistory} players={players} />
            </div>
          </BlurFade>
        )}
      </div>
    </div>
  )
}
