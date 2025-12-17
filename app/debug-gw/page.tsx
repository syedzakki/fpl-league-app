"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DebugGWPage() {
  const [data, setData] = useState<any>(null)
  const [gw15, setGw15] = useState<any>(null)
  const [gw16, setGw16] = useState<any>(null)

  useEffect(() => {
    fetch('/api/fpl-data')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setData(data.data)
        }
      })
    
    fetch('/api/gameweek-debug?gw=15')
      .then(res => res.json())
      .then(setGw15)
    
    fetch('/api/gameweek-debug?gw=16')
      .then(res => res.json())
      .then(setGw16)
  }, [])

  if (!data || !gw15 || !gw16) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16] p-8">
      <h1 className="text-3xl font-bold mb-6">Gameweek Debug - 2nd Place Investigation</h1>
      
      {/* Team Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Stats Summary (From Main API)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>GW Wins</TableHead>
                <TableHead>2nd Finishes</TableHead>
                <TableHead>Last Finishes</TableHead>
                <TableHead>Cap Wins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leaderboard.map((team: any) => (
                <TableRow key={team.teamId} className={team.userName === 'Zakki' ? 'bg-yellow-100 dark:bg-yellow-900' : ''}>
                  <TableCell className="font-semibold">{team.userName}</TableCell>
                  <TableCell>{team.gwWins}</TableCell>
                  <TableCell className="font-bold text-lg">{team.secondFinishes}</TableCell>
                  <TableCell>{team.lastFinishes}</TableCell>
                  <TableCell>{team.captaincyWins}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GW15 Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GW15 Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>C+VC</TableHead>
                <TableHead>Transfers</TableHead>
                <TableHead>Hit Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gw15.teams?.map((team: any, idx: number) => (
                <TableRow key={team.teamId} className={team.userName === 'Zakki' ? 'bg-yellow-100 dark:bg-yellow-900' : ''}>
                  <TableCell>
                    <Badge variant={idx === 0 ? 'default' : idx === 1 ? 'secondary' : 'outline'}>
                      {team.positionLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{team.userName}</TableCell>
                  <TableCell className="font-mono">{team.points}</TableCell>
                  <TableCell className="font-mono">{team.captaincyPoints}</TableCell>
                  <TableCell>{team.transfers}</TableCell>
                  <TableCell className="text-red-600">{team.transfersCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
            <p className="font-semibold">Winner: {gw15.winner?.userName}</p>
            <p className="font-semibold">2nd Place: {gw15.second?.userName}</p>
          </div>
        </CardContent>
      </Card>

      {/* GW16 Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GW16 Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>C+VC</TableHead>
                <TableHead>Transfers</TableHead>
                <TableHead>Hit Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gw16.teams?.map((team: any, idx: number) => (
                <TableRow key={team.teamId} className={team.userName === 'Zakki' ? 'bg-yellow-100 dark:bg-yellow-900' : ''}>
                  <TableCell>
                    <Badge variant={idx === 0 ? 'default' : idx === 1 ? 'secondary' : 'outline'}>
                      {team.positionLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{team.userName}</TableCell>
                  <TableCell className="font-mono">{team.points}</TableCell>
                  <TableCell className="font-mono">{team.captaincyPoints}</TableCell>
                  <TableCell>{team.transfers}</TableCell>
                  <TableCell className="text-red-600">{team.transfersCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
            <p className="font-semibold">Winner: {gw16.winner?.userName}</p>
            <p className="font-semibold">2nd Place: {gw16.second?.userName}</p>
          </div>
        </CardContent>
      </Card>

      {/* All Gameweeks with 2nd Place */}
      <Card>
        <CardHeader>
          <CardTitle>All Zakki 2nd Place Finishes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.gameweekResults
              .filter((gwr: any) => gwr.second?.userName === 'Zakki')
              .map((gwr: any) => (
                <div key={gwr.gameweek} className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
                  <p className="font-semibold">GW{gwr.gameweek}</p>
                  <p>Winner: {gwr.winner?.userName} ({gwr.winner?.points} pts)</p>
                  <p>2nd: {gwr.second?.userName} ({gwr.second?.points} pts)</p>
                </div>
              ))}
          </div>
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="font-bold">Total Zakki 2nd Places: {
              data.gameweekResults.filter((gwr: any) => gwr.second?.userName === 'Zakki').length
            }</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

