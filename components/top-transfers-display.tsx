"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface TopTransfer {
  id: number
  name: string
  team: string
  teamShort: string
  position: string
  cost: number
  costChange: number
  transfersIn: number
  transfersOut: number
  netTransfers: number
  selectedBy: number
  form: number
  totalPoints: number
  pointsPerGame: number
}

interface TopTransfersByPosition {
  GK: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
  DEF: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
  MID: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
  FWD: {
    mostBought: TopTransfer[]
    mostSold: TopTransfer[]
  }
}

export function TopTransfersDisplay() {
  const [data, setData] = useState<TopTransfersByPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePosition, setActivePosition] = useState<"GK" | "DEF" | "MID" | "FWD">("DEF")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/top-transfers")
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error fetching top transfers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <LoadingSpinner text="Loading transfer data" />
  }

  if (!data) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load transfer data</p>
        </CardContent>
      </Card>
    )
  }

  const renderTransferTable = (players: TopTransfer[], type: "bought" | "sold") => {
    return (
      <div className="rounded-lg border border-border/50 overflow-hidden bg-card/40 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
              <TableHead className="text-foreground font-bold uppercase tracking-wider text-[10px]">Player</TableHead>
              <TableHead className="text-foreground font-bold uppercase tracking-wider text-[10px]">Team</TableHead>
              <TableHead className="text-foreground font-bold uppercase tracking-wider text-[10px] text-right">Cost</TableHead>
              <TableHead className="text-foreground font-bold uppercase tracking-wider text-[10px] text-right">{type === "bought" ? "Transfers In" : "Transfers Out"}</TableHead>
              <TableHead className="text-foreground font-bold uppercase tracking-wider text-[10px] text-center">Form</TableHead>
              <TableHead className="text-foreground font-bold uppercase tracking-wider text-[10px] text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id} className="border-border/50 hover:bg-muted/20 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50 bg-muted/20">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-bold">{player.name}</span>
                    {player.costChange > 0 && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                        <ArrowUp className="h-2.5 w-2.5" />
                        {player.costChange}
                      </Badge>
                    )}
                    {player.costChange < 0 && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                        <ArrowDown className="h-2.5 w-2.5" />
                        {Math.abs(player.costChange)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {player.teamShort}
                </TableCell>
                <TableCell className="text-right font-mono text-primary font-bold">
                  £{player.cost.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={type === "bought" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>
                    {(type === "bought" ? player.transfersIn : player.transfersOut).toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-border/50 text-foreground text-[10px] bg-muted/20">
                    {player.form.toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {player.totalPoints}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="border-b border-border/50 py-4">
        <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
          <ArrowUp className="h-5 w-5 text-primary" />
          Top Transfers by Position
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activePosition} onValueChange={(value) => setActivePosition(value as typeof activePosition)}>
          <TabsList className="grid w-full grid-cols-4 bg-muted/10 p-1 rounded-xl border border-border/20 mb-4">
            <TabsTrigger value="GK" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
              GK
            </TabsTrigger>
            <TabsTrigger value="DEF" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
              DEF
            </TabsTrigger>
            <TabsTrigger value="MID" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
              MID
            </TabsTrigger>
            <TabsTrigger value="FWD" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
              FWD
            </TabsTrigger>
          </TabsList>

          {(["GK", "DEF", "MID", "FWD"] as const).map((position) => (
            <TabsContent key={position} value={position} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Most Bought</h3>
                </div>
                {renderTransferTable(data[position].mostBought, "bought")}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Most Sold</h3>
                </div>
                {renderTransferTable(data[position].mostSold, "sold")}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

