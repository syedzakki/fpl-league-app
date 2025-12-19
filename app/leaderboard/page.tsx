"use client"

import { useEffect, useState } from "react"
import { ExpandableLeaderboardTable } from "@/components/expandable-leaderboard-table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Zap } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BlurFade } from "@/components/ui/blur-fade"
import { GlobalRefresh } from "@/components/global-refresh"

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch main data
      const response = await fetch("/api/sheets")
      const data = await response.json()

      // Fetch transfer data
      const transfersResponse = await fetch("/api/transfers")
      const transfersData = await transfersResponse.json()

      if (data.success && data.data?.summary) {
        const teamNames = data.data.teamNames || {}
        const gameweekData = data.data.gameweekData || []

        const mappedLeaderboard: LeaderboardEntry[] = data.data.summary.map((entry: any) => {
          const teamId = Object.keys(teamNames).find(key => teamNames[key] === entry.userName) || ""

          // Get gameweek history for this team
          const gameweekHistory = gameweekData
            .map((gw: any) => {
              const teamGw = gw.teams.find((t: any) => t.teamId === teamId)
              if (!teamGw) return null

              // Find transfer data for this team and gameweek
              const teamTransfers = transfersData.success
                ? transfersData.data.find((t: any) => t.teamId === teamId)
                : null

              const transferInfo = teamTransfers?.transfers?.find((t: any) => t.gameweek === gw.gameweek)

              // Sort teams by points to get rank
              const sortedTeams = [...gw.teams].sort((a: any, b: any) => b.points - a.points)
              const rank = sortedTeams.findIndex((t: any) => t.teamId === teamId) + 1

              // Calculate hits properly - hitCost from API is the negative value
              const hitCost = Math.abs(transferInfo?.hitCost || 0)
              const hits = hitCost > 0 ? hitCost / 4 : 0

              return {
                gameweek: gw.gameweek,
                points: teamGw.points || 0,
                rank: rank,
                transfers: transferInfo?.transfersMade || 0,
                hits: hits,
                hitCost: hitCost, // Positive value for display
                transferDetails: transferInfo?.transferDetails || undefined,
              }
            })
            .filter((gw: any) => gw !== null)

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
        <div className="container mx-auto px-4 py-6">
          <BlurFade delay={0}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">League Leaderboard</h1>
                <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">Complete standings</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={fetchLeaderboard}
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

          <BlurFade delay={0.1}>
            {loading ? (
              <LoadingSpinner text="Loading" />
            ) : error ? (
              <Card className="p-8 text-center bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <div className="text-[#F26430] mb-3 flex flex-col items-center">
                  <Zap className="h-8 w-8 mb-2" />
                  <p>{error}</p>
                </div>
                <Button
                  onClick={fetchLeaderboard}
                  className="bg-[#F26430] text-white hover:bg-[#F26430]/90"
                >
                  Try Again
                </Button>
              </Card>
            ) : (
              <ExpandableLeaderboardTable entries={leaderboard} showBorderBeam />
            )}
          </BlurFade>
        </div>
      </div>
    </ProtectedRoute>
  )
}
