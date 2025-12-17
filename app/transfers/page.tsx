"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowRightLeft, AlertTriangle, TrendingDown } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { GlobalRefresh } from "@/components/global-refresh"
import type { TeamTransferHistory } from "@/lib/transfer-calculator"

export default function TransfersPage() {
  const [transferData, setTransferData] = useState<TeamTransferHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/transfers")
      const data = await response.json()
      
      if (data.success && data.data) {
        setTransferData(data.data)
        if (!selectedTeam && data.data.length > 0) {
          setSelectedTeam(data.data[0].teamId)
        }
      }
    } catch (error) {
      console.error("Error fetching transfers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  const totalHits = transferData.reduce((sum, team) => sum + team.totalHits, 0)
  const totalHitCost = transferData.reduce((sum, team) => sum + team.totalHitCost, 0)
  const selectedTeamData = transferData.find(t => t.teamId === selectedTeam)

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">Transfer Tracker</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">Track free transfers, hits, and costs</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchTransfers} 
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
          <LoadingSpinner text="Loading transfer data" />
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <BlurFade delay={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Total Hits</p>
                        <p className="text-3xl font-bold font-mono text-[#F26430]">
                          <NumberTicker value={totalHits} />
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-[#F26430]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Hit Cost</p>
                        <p className="text-3xl font-bold font-mono text-[#F26430]">
                          -<NumberTicker value={totalHitCost} />
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-[#F26430]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">Teams</p>
                        <p className="text-3xl font-bold font-mono text-[#19297C] dark:text-[#028090]">
                          <NumberTicker value={transferData.length} />
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-[#19297C]/10 dark:bg-[#028090]/10 flex items-center justify-center">
                        <ArrowRightLeft className="h-6 w-6 text-[#19297C] dark:text-[#028090]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </BlurFade>

            {/* Team Details */}
            <BlurFade delay={0.1}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                  <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">Transfer Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Tabs value={selectedTeam || undefined} onValueChange={setSelectedTeam}>
                    <TabsList className="grid w-full grid-cols-6 bg-[#DBC2CF]/30 dark:bg-[#19297C]/30 mb-4">
                      {transferData.map((team) => (
                        <TabsTrigger 
                          key={team.teamId} 
                          value={team.teamId}
                          className="data-[state=active]:bg-[#F26430] data-[state=active]:text-white"
                        >
                          {team.userName}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {transferData.map((team) => (
                      <TabsContent key={team.teamId} value={team.teamId} className="space-y-4">
                        {/* Team Summary */}
                        <div className="grid grid-cols-4 gap-4 p-4 bg-[#DBC2CF]/10 dark:bg-[#19297C]/10 rounded-lg">
                          <div className="text-center">
                            <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Total Hits</p>
                            <p className="text-2xl font-bold text-[#F26430]">{team.totalHits}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Hit Cost</p>
                            <p className="text-2xl font-bold text-[#F26430]">-{team.totalHitCost}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Points (No Hits)</p>
                            <p className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">{team.totalGwPoints}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-1">Points (With Hits)</p>
                            <p className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">{team.totalGwPointsWithHits}</p>
                          </div>
                        </div>

                        {/* Gameweek Table */}
                        <div className="rounded-md border border-[#DBC2CF] dark:border-[#19297C] overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-[#19297C] dark:bg-[#19297C] hover:bg-[#19297C]">
                                <TableHead className="text-white">GW</TableHead>
                                <TableHead className="text-white">Transfers</TableHead>
                                <TableHead className="text-white">Free</TableHead>
                                <TableHead className="text-white">Hits</TableHead>
                                <TableHead className="text-white">Hit Cost</TableHead>
                                <TableHead className="text-white">GW Points</TableHead>
                                <TableHead className="text-white">Points (With Hits)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {team.transfers
                                .sort((a, b) => b.gameweek - a.gameweek)
                                .map((gw) => (
                                  <TableRow key={gw.gameweek} className="border-[#DBC2CF] dark:border-[#19297C]">
                                    <TableCell className="font-medium text-[#1A1F16] dark:text-[#FFFCF2]">
                                      GW{gw.gameweek}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="border-[#DBC2CF] dark:border-[#19297C]">
                                        {gw.transfersMade}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-[#19297C] dark:text-[#DBC2CF]">
                                      {gw.freeTransfersUsed}/{gw.freeTransfersAvailable}
                                    </TableCell>
                                    <TableCell>
                                      {gw.hits > 0 ? (
                                        <Badge className="bg-[#F26430] text-white">
                                          {gw.hits}
                                        </Badge>
                                      ) : (
                                        <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {gw.hitCost < 0 ? (
                                        <span className="text-[#F26430] font-bold font-mono">
                                          {gw.hitCost}
                                        </span>
                                      ) : (
                                        <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="font-mono text-[#1A1F16] dark:text-[#FFFCF2]">
                                      {gw.gwPoints}
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-[#1A1F16] dark:text-[#FFFCF2]">
                                      {gw.gwPointsWithHits}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </BlurFade>

            {/* All Teams Comparison */}
            <BlurFade delay={0.15}>
              <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
                <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                  <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">All Teams Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="rounded-md border border-[#DBC2CF] dark:border-[#19297C] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#19297C] dark:bg-[#19297C] hover:bg-[#19297C]">
                          <TableHead className="text-white">Team</TableHead>
                          <TableHead className="text-white">Total Hits</TableHead>
                          <TableHead className="text-white">Hit Cost</TableHead>
                          <TableHead className="text-white">Points (No Hits)</TableHead>
                          <TableHead className="text-white">Points (With Hits)</TableHead>
                          <TableHead className="text-white">Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transferData
                          .sort((a, b) => b.totalHits - a.totalHits)
                          .map((team) => (
                            <TableRow key={team.teamId} className="border-[#DBC2CF] dark:border-[#19297C]">
                              <TableCell className="font-medium text-[#1A1F16] dark:text-[#FFFCF2]">
                                {team.userName}
                              </TableCell>
                              <TableCell>
                                {team.totalHits > 0 ? (
                                  <Badge className="bg-[#F26430] text-white">
                                    {team.totalHits}
                                  </Badge>
                                ) : (
                                  <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {team.totalHitCost > 0 ? (
                                  <span className="text-[#F26430] font-bold font-mono">
                                    -{team.totalHitCost}
                                  </span>
                                ) : (
                                  <span className="text-[#19297C] dark:text-[#DBC2CF]">0</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-[#1A1F16] dark:text-[#FFFCF2]">
                                {team.totalGwPoints}
                              </TableCell>
                              <TableCell className="font-mono font-bold text-[#1A1F16] dark:text-[#FFFCF2]">
                                {team.totalGwPointsWithHits}
                              </TableCell>
                              <TableCell>
                                <span className="text-[#F26430] font-mono">
                                  -{team.totalHitCost}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
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
