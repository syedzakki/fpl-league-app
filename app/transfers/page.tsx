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
import { cn } from "@/lib/utils"

import { ProtectedRoute } from "@/components/auth/protected-route"

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
  // const selectedTeamData = transferData.find(t => t.teamId === selectedTeam) // Unused?

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-8">
          <BlurFade delay={0}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-sports font-bold uppercase italic tracking-wide">Transfer Tracker</h1>
                <p className="text-sm text-muted-foreground mt-1">Monitor market moves and points hits</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchTransfers} disabled={loading} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  Sync
                </Button>
                <GlobalRefresh />
              </div>
            </div>
          </BlurFade>

          {loading ? (
            <LoadingSpinner text="Analyzing transfer data..." />
          ) : (
            <div className="space-y-6">
              <BlurFade delay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Hits Taken</p>
                          <p className="text-3xl font-bold font-mono text-destructive">
                            <NumberTicker value={totalHits} />
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Cost</p>
                          <p className="text-3xl font-bold font-mono text-destructive">
                            -<NumberTicker value={totalHitCost} />
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-destructive" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Active Managers</p>
                          <p className="text-3xl font-bold font-mono text-primary">
                            <NumberTicker value={transferData.length} />
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ArrowRightLeft className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </BlurFade>

              <BlurFade delay={0.1}>
                <Card className="border-border/50">
                  <CardHeader className="border-b border-border/50 py-4">
                    <CardTitle className="text-base uppercase tracking-wider font-bold">Transfer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Tabs value={selectedTeam || undefined} onValueChange={setSelectedTeam}>
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4 h-auto p-1 bg-muted/50 gap-1">
                        {transferData.map((team) => (
                          <TabsTrigger
                            key={team.teamId}
                            value={team.teamId}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
                          >
                            {team.userName}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {transferData.map((team) => (
                        <TabsContent key={team.teamId} value={team.teamId} className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Hits</p>
                              <p className="text-2xl font-bold text-destructive">{team.totalHits}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Cost</p>
                              <p className="text-2xl font-bold text-destructive">-{team.totalHitCost}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">FPL Total</p>
                              <p className="text-2xl font-bold text-primary">{team.totalGwPointsWithHits}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Points (Clean)</p>
                              <p className="text-2xl font-bold text-foreground">{team.totalGwPoints}</p>
                            </div>
                          </div>

                          <div className="rounded-md border border-border/50 overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 border-border/50">
                                  <TableHead className="font-bold text-xs uppercase tracking-wider">GW</TableHead>
                                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Transfers</TableHead>
                                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Free</TableHead>
                                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Hits</TableHead>
                                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Cost</TableHead>
                                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Points</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {team.transfers
                                  .sort((a, b) => b.gameweek - a.gameweek)
                                  .map((gw) => (
                                    <TableRow key={gw.gameweek} className="border-border/50 hover:bg-muted/20">
                                      <TableCell className="font-bold text-foreground">
                                        GW{gw.gameweek}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className="border-border/50">
                                          {gw.transfersMade}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center text-muted-foreground">
                                        {gw.freeTransfersUsed}/{gw.freeTransfersAvailable}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {gw.hits > 0 ? (
                                          <Badge variant="destructive" className="font-bold">
                                            {gw.hits}
                                          </Badge>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {gw.hitCost < 0 ? (
                                          <span className="text-destructive font-bold font-mono">
                                            {gw.hitCost}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right font-mono font-bold text-primary">
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

              <BlurFade delay={0.15}>
                <Card className="border-border/50">
                  <CardHeader className="border-b border-border/50 py-4">
                    <CardTitle className="text-base uppercase tracking-wider font-bold">Transfer Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-md border-0 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50 border-border/50">
                            <TableHead className="font-bold text-xs uppercase tracking-wider">Manager</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Total Hits</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Hit Cost</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Net Points</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Delta</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transferData
                            .sort((a, b) => b.totalHits - a.totalHits)
                            .map((team) => (
                              <TableRow key={team.teamId} className="border-border/50 hover:bg-muted/20">
                                <TableCell className="font-bold text-foreground">
                                  {team.userName}
                                </TableCell>
                                <TableCell className="text-center">
                                  {team.totalHits > 0 ? (
                                    <Badge variant="secondary" className="bg-destructive/10 text-destructive font-bold hover:bg-destructive/20">
                                      {team.totalHits}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {team.totalHitCost > 0 ? (
                                    <span className="text-destructive font-bold font-mono">
                                      -{team.totalHitCost}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-primary">
                                  {team.totalGwPointsWithHits}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-destructive font-mono text-sm">
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
    </ProtectedRoute>
  )
}
