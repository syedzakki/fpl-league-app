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
      <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
        <CardContent className="p-8 text-center">
          <p className="text-[#19297C] dark:text-[#DBC2CF]">Failed to load transfer data</p>
        </CardContent>
      </Card>
    )
  }

  const renderTransferTable = (players: TopTransfer[], type: "bought" | "sold") => {
    return (
      <div className="rounded-md border border-[#DBC2CF] dark:border-[#19297C] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#19297C] dark:bg-[#19297C] hover:bg-[#19297C]">
              <TableHead className="text-white text-xs">Player</TableHead>
              <TableHead className="text-white text-xs">Team</TableHead>
              <TableHead className="text-white text-xs text-right">Cost</TableHead>
              <TableHead className="text-white text-xs text-right">{type === "bought" ? "Transfers In" : "Transfers Out"}</TableHead>
              <TableHead className="text-white text-xs text-center">Form</TableHead>
              <TableHead className="text-white text-xs text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id} className="border-[#DBC2CF] dark:border-[#19297C]">
                <TableCell className="font-medium text-[#1A1F16] dark:text-[#FFFCF2]">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-[#DBC2CF] dark:border-[#19297C]">
                      {index + 1}
                    </Badge>
                    <span>{player.name}</span>
                    {player.costChange > 0 && (
                      <Badge className="bg-green-500 text-white text-xs px-1.5 py-0 flex items-center gap-0.5">
                        <ArrowUp className="h-2.5 w-2.5" />
                        {player.costChange}
                      </Badge>
                    )}
                    {player.costChange < 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 flex items-center gap-0.5">
                        <ArrowDown className="h-2.5 w-2.5" />
                        {Math.abs(player.costChange)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-[#19297C] dark:text-[#DBC2CF] text-xs">
                  {player.teamShort}
                </TableCell>
                <TableCell className="text-right font-mono text-[#028090] font-bold">
                  £{player.cost.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={type === "bought" ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                    {(type === "bought" ? player.transfersIn : player.transfersOut).toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-[#DBC2CF] dark:border-[#19297C] text-[#19297C] dark:text-[#DBC2CF] text-xs">
                    {player.form.toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-[#1A1F16] dark:text-[#FFFCF2]">
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
    <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
      <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
        <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">
          Top Transfers by Position
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activePosition} onValueChange={(value) => setActivePosition(value as typeof activePosition)}>
          <TabsList className="grid w-full grid-cols-4 bg-[#DBC2CF]/30 dark:bg-[#19297C]/30 mb-4">
            <TabsTrigger value="GK" className="data-[state=active]:bg-[#F26430] data-[state=active]:text-white">
              GK
            </TabsTrigger>
            <TabsTrigger value="DEF" className="data-[state=active]:bg-[#F26430] data-[state=active]:text-white">
              DEF
            </TabsTrigger>
            <TabsTrigger value="MID" className="data-[state=active]:bg-[#F26430] data-[state=active]:text-white">
              MID
            </TabsTrigger>
            <TabsTrigger value="FWD" className="data-[state=active]:bg-[#F26430] data-[state=active]:text-white">
              FWD
            </TabsTrigger>
          </TabsList>

          {(["GK", "DEF", "MID", "FWD"] as const).map((position) => (
            <TabsContent key={position} value={position} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">Most Bought</h3>
                </div>
                {renderTransferTable(data[position].mostBought, "bought")}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <h3 className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">Most Sold</h3>
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

