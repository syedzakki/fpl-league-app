"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function GlobalRefresh() {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Refresh Google Sheets data
      await fetch("/api/sheets?refresh=true", { cache: "no-store" })
      
      // Refresh FPL data
      await fetch("/api/leaderboard-fpl", { cache: "no-store" })
      await fetch("/api/transfers", { cache: "no-store" })
      
      // Force refresh all routes
      router.refresh()
      
      // Reload page after a short delay to ensure fresh data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Refresh error:", error)
      setRefreshing(false)
      // Still reload even if some requests fail
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={refreshing}
      variant="outline"
      size="sm"
      className="bg-[#19297C] border-[#028090] hover:bg-[#028090] hover:border-[#F26430] text-white"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
      {refreshing ? "Refreshing..." : "Refresh All"}
    </Button>
  )
}

