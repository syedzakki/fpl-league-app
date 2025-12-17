"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlurFade } from "@/components/ui/blur-fade"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, TrendingDown, ArrowRight, AlertCircle } from "lucide-react"
import type { TeamTransferHistory, TransferData } from "@/lib/transfer-calculator"
import { GlobalRefresh } from "@/components/global-refresh"

export default function TransfersPage() {
  const [transferData, setTransferData] = useState<TeamTransferHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/transfers")
      const data = await response.json()
      
      if (data.success) {
        setTransferData(data.data)
        if (data.data.length > 0 && !selectedTeam) {
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
    const interval = setInterval(fetchTransfers, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const selectedTeamData = transferData.find(t => t.teamId === selectedTeam)

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1F16] dark:text-[#FFFCF2]">Transfer Tracker</h1>
              <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">Track transfers, free transfers, and hits</p>
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
          <div className="space-y-6">
            {/* Summary Cards */}
            <BlurFade delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-white">Total Hits Taken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#FF3A20]">
                      {transferData.reduce((sum, t) => sum + t.totalHits, 0)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Across all teams</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-white">Total Hit Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#FF3A20]">
                      {transferData.reduce((sum, t) => sum + t.totalHitCost, 0)} pts
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Points deducted</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#2B2D42] border-[#3d3f56]">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-white">Teams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">
                      {transferData.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Active teams</p>
                  </CardContent>
                </Card>
              </div>
            </BlurFade>

            {/* Team Selector & Details */}
            <BlurFade delay={0.2}>
              <Tabs value={selectedTeam || undefined} onValueChange={setSelectedTeam}>
                <TabsList className="bg-[#2B2D42] border border-[#3d3f56] mb-4">
                  {transferData.map((team) => (
                    <TabsTrigger 
                      key={team.teamId} 
                      value={team.teamId}
                      className="data-[state=active]:bg-[#F7E733] data-[state=active]:text-[#2B2D42]"
                    >
                      {team.userName}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {selectedTeamData && (
                  <TabsContent value={selectedTeam} className="space-y-4">
                    {/* Team Summary */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader>
                        <CardTitle className="text-white">{selectedTeamData.userName} - Transfer Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-[#3d3f56]/50">
                            <p className="text-xs text-gray-400 mb-1">Total Hits</p>
                            <p className="text-2xl font-bold text-[#FF3A20]">{selectedTeamData.totalHits}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-[#3d3f56]/50">
                            <p className="text-xs text-gray-400 mb-1">Hit Cost</p>
                            <p className="text-2xl font-bold text-[#FF3A20]">{selectedTeamData.totalHitCost} pts</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-[#3d3f56]/50">
                            <p className="text-xs text-gray-400 mb-1">GW Points</p>
                            <p className="text-2xl font-bold text-white">{selectedTeamData.totalGwPoints}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-[#3d3f56]/50">
                            <p className="text-xs text-gray-400 mb-1">With Hits</p>
                            <p className="text-2xl font-bold text-[#4DAA57]">{selectedTeamData.totalGwPointsWithHits}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gameweek Breakdown */}
                    <Card className="bg-[#2B2D42] border-[#3d3f56]">
                      <CardHeader>
                        <CardTitle className="text-white">Gameweek Breakdown</CardTitle>
                        <CardDescription className="text-gray-400">
                          Transfer activity by gameweek
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#3d3f56] hover:bg-[#3d3f56]/30">
                              <TableHead className="text-gray-400">GW</TableHead>
                              <TableHead className="text-gray-400">Transfers</TableHead>
                              <TableHead className="text-gray-400">Free Used</TableHead>
                              <TableHead className="text-gray-400">Free Available</TableHead>
                              <TableHead className="text-gray-400">Hits</TableHead>
                              <TableHead className="text-gray-400">Hit Cost</TableHead>
                              <TableHead className="text-gray-400">GW Points</TableHead>
                              <TableHead className="text-gray-400">With Hits</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedTeamData.transfers.map((transfer) => (
                              <TableRow 
                                key={transfer.gameweek}
                                className="border-[#3d3f56] hover:bg-[#3d3f56]/30"
                              >
                                <TableCell className="font-medium text-white">GW{transfer.gameweek}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-[#3d3f56] text-white">
                                    {transfer.transfersMade}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-[#4DAA57]">{transfer.freeTransfersUsed}</TableCell>
                                <TableCell className="text-gray-400">{transfer.freeTransfersAvailable}</TableCell>
                                <TableCell>
                                  {transfer.hits > 0 ? (
                                    <Badge className="bg-[#FF3A20] text-white">
                                      {transfer.hits}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-500">0</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {transfer.hitCost < 0 ? (
                                    <span className="text-[#FF3A20] font-bold">{transfer.hitCost}</span>
                                  ) : (
                                    <span className="text-gray-500">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-white font-mono">{transfer.gwPoints}</TableCell>
                                <TableCell className="text-[#4DAA57] font-mono">{transfer.gwPointsWithHits}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </BlurFade>

            {/* All Teams Comparison */}
            <BlurFade delay={0.3}>
              <Card className="bg-[#2B2D42] border-[#3d3f56]">
                <CardHeader>
                  <CardTitle className="text-white">All Teams Comparison</CardTitle>
                  <CardDescription className="text-gray-400">
                    Total hits and transfer costs across all teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#3d3f56] hover:bg-[#3d3f56]/30">
                        <TableHead className="text-gray-400">Team</TableHead>
                        <TableHead className="text-gray-400 text-right">Total Hits</TableHead>
                        <TableHead className="text-gray-400 text-right">Hit Cost</TableHead>
                        <TableHead className="text-gray-400 text-right">GW Points</TableHead>
                        <TableHead className="text-gray-400 text-right">With Hits</TableHead>
                        <TableHead className="text-gray-400 text-right">Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferData
                        .sort((a, b) => b.totalHits - a.totalHits)
                        .map((team) => (
                          <TableRow 
                            key={team.teamId}
                            className="border-[#3d3f56] hover:bg-[#3d3f56]/30 cursor-pointer"
                            onClick={() => setSelectedTeam(team.teamId)}
                          >
                            <TableCell className="font-medium text-white">{team.userName}</TableCell>
                            <TableCell className="text-right">
                              <Badge className={team.totalHits > 0 ? "bg-[#FF3A20] text-white" : "bg-[#3d3f56] text-gray-400"}>
                                {team.totalHits}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-[#FF3A20] font-bold">
                              {team.totalHitCost > 0 ? `-${team.totalHitCost}` : "0"}
                            </TableCell>
                            <TableCell className="text-right text-white font-mono">{team.totalGwPoints}</TableCell>
                            <TableCell className="text-right text-[#4DAA57] font-mono">{team.totalGwPointsWithHits}</TableCell>
                            <TableCell className="text-right">
                              <span className={`font-bold ${team.totalHitCost > 0 ? "text-[#FF3A20]" : "text-gray-400"}`}>
                                {team.totalHitCost > 0 ? `-${team.totalHitCost}` : "0"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </BlurFade>
          </div>
        )}
      </div>
    </div>
  )
}

