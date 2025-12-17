"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DeadlineCountdownProps {
  deadline: string // ISO string
  className?: string
}

export function DeadlineCountdown({ deadline, className = "" }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isPast: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadlineTime = new Date(deadline).getTime()
      const difference = deadlineTime - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false,
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  if (timeLeft.isPast) {
    return (
      <Card className={`bg-[#F26430]/10 border-[#F26430] ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#F26430]" />
            <div>
              <p className="text-sm font-medium text-[#F26430]">Gameweek Ended</p>
              <p className="text-xs text-[#19297C] dark:text-[#DBC2CF]">Awaiting next deadline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white dark:bg-[#1A1F16] border-[#028090] dark:border-[#028090]/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#028090]/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-[#028090]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] uppercase tracking-wider font-medium mb-1">
              Next Deadline
            </p>
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#1A1F16] dark:text-[#FFFCF2]">
              {timeLeft.days > 0 && (
                <span>
                  <span className="text-[#028090]">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[#19297C] dark:text-[#DBC2CF] text-xs mx-0.5">d</span>
                </span>
              )}
              <span>
                <span className="text-[#028090]">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[#19297C] dark:text-[#DBC2CF] text-xs mx-0.5">h</span>
              </span>
              <span>
                <span className="text-[#028090]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[#19297C] dark:text-[#DBC2CF] text-xs mx-0.5">m</span>
              </span>
              <span>
                <span className="text-[#028090]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[#19297C] dark:text-[#DBC2CF] text-xs mx-0.5">s</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface NextDeadlineData {
  deadline: string
  gameweek: number
}

export function NextDeadlineCard() {
  const [deadlineData, setDeadlineData] = useState<NextDeadlineData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
        const data = await response.json()
        
        // Find the next gameweek
        const nextGW = data.events.find((event: any) => !event.finished && !event.is_current)
        if (nextGW) {
          setDeadlineData({
            deadline: nextGW.deadline_time,
            gameweek: nextGW.id,
          })
        }
      } catch (error) {
        console.error("Error fetching deadline:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeadline()
    // Refresh deadline data every 5 minutes
    const interval = setInterval(fetchDeadline, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] h-full">
        <CardContent className="p-4 h-[82px] flex items-center justify-center">
          <div className="animate-pulse flex items-center gap-3 w-full">
            <div className="h-10 w-10 rounded-lg bg-[#DBC2CF] dark:bg-[#19297C]"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#DBC2CF] dark:bg-[#19297C] rounded w-20"></div>
              <div className="h-4 bg-[#DBC2CF] dark:bg-[#19297C] rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!deadlineData) {
    return (
      <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] h-full">
        <CardContent className="p-4 h-[82px] flex items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#19297C] dark:text-[#DBC2CF]" />
            <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">No upcoming deadline</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <DeadlineCountdown deadline={deadlineData.deadline} />
}

