"use client"

import * as React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"

interface RadarChartProps {
  data: Array<{
    subject: string
    [key: string]: string | number
  }>
  dataKeys: string[]
  colors?: string[]
}

export function RadarChartComponent({ data, dataKeys, colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00", "#ff00ff"] }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} />
        {dataKeys.map((key, index) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
          />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

