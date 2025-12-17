"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { FinancialRecord } from "@/lib/types"

interface FinancialTrackerProps {
  records: FinancialRecord[]
}

export function FinancialTracker({ records }: FinancialTrackerProps) {
  const sortedRecords = [...records].sort((a, b) => b.netPosition - a.netPosition)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Tracker</CardTitle>
        <CardDescription>Complete financial breakdown for all teams</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">FPL Buy-in</TableHead>
              <TableHead className="text-right">GW Buy-ins</TableHead>
              <TableHead className="text-right">Captaincy Buy-ins</TableHead>
              <TableHead className="text-right">GW Winnings</TableHead>
              <TableHead className="text-right">2nd Place</TableHead>
              <TableHead className="text-right">Penalties</TableHead>
              <TableHead className="text-right">Captaincy Winnings</TableHead>
              <TableHead className="text-right font-semibold">Net Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.map((record) => (
              <TableRow key={record.teamId}>
                <TableCell className="font-medium">{record.teamName}</TableCell>
                <TableCell className="text-right">-₹{record.fplBuyIn.toLocaleString()}</TableCell>
                <TableCell className="text-right">-₹{record.gwBuyIns.toLocaleString()}</TableCell>
                <TableCell className="text-right">-₹{record.captaincyBuyIns.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">+₹{record.gwWinnings.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">+₹{record.gwSecondPlace.toLocaleString()}</TableCell>
                <TableCell className="text-right text-red-600">-₹{record.gwPenalties.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">+₹{record.captaincyWinnings.toLocaleString()}</TableCell>
                <TableCell className={`text-right font-bold ${record.netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{record.netPosition.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

