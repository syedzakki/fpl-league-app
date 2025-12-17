"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, Trophy, Target, TrendingUp, Award } from "lucide-react"
import { GlobalRefresh } from "@/components/global-refresh"

interface TeamCVData {
  teamId: string
  userName: string
  captainPoints: number
  viceCaptainPoints: number
  captainPlayed: boolean
  viceCaptainPlayed: boolean
  cvTotal: number
  captainId: number
  viceCaptainId: number
}

interface GameweekCVData {
  gameweek: number
  teams: TeamCVData[]
  winner: TeamCVData
}

interface TeamStats {
  teamId: string
  userName: string
  captaincyWins: number
  totalCVPoints: number
  averageCVPoints: number
}

export default function CaptaincyPage() {
  const [captaincyData, setCaptaincyData] = useState<GameweekCVData[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaptaincyData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/captaincy")
      const data = await response.json()

      if (data.success) {
        setCaptaincyData(data.data.captaincyData)
        setTeamStats(data.data.teamStats)
      } else {
        setError("Failed to fetch captaincy data")
      }
    } catch (error) {
      console.error("Error fetching captaincy data:", error)
      setError("Failed to fetch captaincy data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptaincyData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
        <LoadingSpinner text="Loading captaincy data" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16] flex items-center justify-center">
        <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
          <CardContent className="pt-6">
            <p className="text-[#F26430]">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1F16] dark:text-[#FFFCF2] mb-2">
                Captain + Vice Captain Points
              </h1>
              <p className="text-[#19297C] dark:text-[#DBC2CF]">
                Detailed breakdown of C+VC points for each gameweek
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchCaptaincyData} 
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

        {/* Team Stats Summary */}
        <BlurFade delay={0.1}>
          <Card className="mb-6 bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
            <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-[#F26430]" />
                </div>
                <div>
                  <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">
                    Captaincy Wins Summary
                  </CardTitle>
                  <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                    Total captaincy competition wins by team
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {teamStats.map((team, index) => (
                  <Card 
                    key={team.teamId}
                    className={`border-2 ${
                      index === 0 
                        ? "border-[#F26430] bg-[#F26430]/5" 
                        : "border-[#DBC2CF] dark:border-[#19297C] bg-white dark:bg-[#1A1F16]"
                    }`}
                  >
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">
                          {team.userName}
                        </p>
                        {index === 0 && (
                          <Award className="h-4 w-4 text-[#F26430]" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Wins:</span>
                          <Badge className="bg-[#F26430] text-white">
                            {team.captaincyWins}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Total:</span>
                          <span className="text-sm font-mono text-[#1A1F16] dark:text-[#FFFCF2]">
                            {team.totalCVPoints}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Avg:</span>
                          <span className="text-sm font-mono text-[#028090]">
                            {team.averageCVPoints}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Detailed Gameweek Table */}
        <BlurFade delay={0.2}>
          <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
            <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#028090]/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#028090]" />
                </div>
                <div>
                  <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">
                    C+VC Points by Gameweek
                  </CardTitle>
                  <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                    Captain (doubled) + Vice Captain points for each team
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#DBC2CF] dark:border-[#19297C] hover:bg-transparent">
                      <TableHead className="font-bold text-[#1A1F16] dark:text-[#FFFCF2] sticky left-0 bg-white dark:bg-[#1A1F16] z-10">
                        GW
                      </TableHead>
                      {teamStats.map((team) => (
                        <TableHead 
                          key={team.teamId}
                          className="font-bold text-center text-[#1A1F16] dark:text-[#FFFCF2] min-w-[100px]"
                        >
                          {team.userName}
                        </TableHead>
                      ))}
                      <TableHead className="font-bold text-center text-[#F26430] sticky right-0 bg-white dark:bg-[#1A1F16] z-10">
                        Winner
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {captaincyData.map((gwData) => (
                      <TableRow 
                        key={gwData.gameweek}
                        className="border-[#DBC2CF] dark:border-[#19297C] hover:bg-[#DBC2CF]/20 dark:hover:bg-[#19297C]/20"
                      >
                        <TableCell className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2] sticky left-0 bg-white dark:bg-[#1A1F16]">
                          GW{gwData.gameweek}
                        </TableCell>
                        {teamStats.map((team) => {
                          const teamData = gwData.teams.find(t => t.teamId === team.teamId)
                          const isWinner = gwData.winner.teamId === team.teamId
                          
                          return (
                            <TableCell 
                              key={team.teamId}
                              className={`text-center ${
                                isWinner 
                                  ? "bg-[#F26430]/10 font-bold" 
                                  : ""
                              }`}
                            >
                              {teamData ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`font-mono text-lg ${
                                    isWinner 
                                      ? "text-[#F26430] font-bold" 
                                      : "text-[#1A1F16] dark:text-[#FFFCF2]"
                                  }`}>
                                    {teamData.cvTotal}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-[#19297C] dark:text-[#DBC2CF]">
                                    <span title="Captain">C: {teamData.captainPoints}</span>
                                    <span>•</span>
                                    <span title="Vice Captain">VC: {teamData.viceCaptainPoints}</span>
                                  </div>
                                  {!teamData.captainPlayed && teamData.viceCaptainPlayed && (
                                    <Badge variant="outline" className="text-xs border-[#028090] text-[#028090]">
                                      VC
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center font-semibold text-[#F26430] sticky right-0 bg-white dark:bg-[#1A1F16]">
                          <div className="flex items-center justify-center gap-2">
                            <Trophy className="h-4 w-4" />
                            {gwData.winner.userName}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 rounded-lg bg-[#DBC2CF]/10 dark:bg-[#19297C]/10 border border-[#DBC2CF] dark:border-[#19297C]">
                <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2] mb-2">
                  How C+VC Points Work:
                </p>
                <ul className="text-sm text-[#19297C] dark:text-[#DBC2CF] space-y-1">
                  <li>• <strong>C (Captain):</strong> Points shown include the 2× multiplier (e.g., player scored 13 → shows as 26)</li>
                  <li>• <strong>VC (Vice Captain):</strong> Points shown are base points (no multiplier unless captain didn't play)</li>
                  <li>• <strong>C+VC Total:</strong> Sum of Captain's multiplied points + Vice Captain's points</li>
                  <li>• <strong>If Captain doesn't play:</strong> Vice Captain gets the 2× multiplier instead</li>
                  <li>• <strong>Winner:</strong> Highest C+VC total for the gameweek (tie-breaker: Captain points)</li>
                  <li>• <strong>VC Badge:</strong> Indicates Vice Captain was used as Captain (captain didn't play)</li>
                  <li>• <strong>Triple Captain:</strong> When active, shows 3× multiplier instead of 2×</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </div>
  )
}

