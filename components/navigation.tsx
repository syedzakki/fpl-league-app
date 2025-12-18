"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Calendar,
  ArrowRightLeft,
  PieChart,
  Lightbulb,
  Menu,
  X,
  Trophy,
  Activity,
  LogOut
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { useTeam } from "@/components/providers/team-provider"
import { useRouter } from "next/navigation"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaderboard", href: "/leaderboard-fpl", icon: Trophy },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Gameweeks", href: "/gameweeks", icon: Calendar },
  { name: "Transfers", href: "/transfers", icon: ArrowRightLeft },
  { name: "Financials", href: "/financials", icon: PieChart },
  { name: "Insights", href: "/insights", icon: Lightbulb },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { teamName, setSelectedTeamId } = useTeam()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Don't show nav on landing page
  if (pathname === "/") return null

  const handleLogout = () => {
    setSelectedTeamId(null)
    router.push("/")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full lg:translate-x-0 border-r border-sidebar-border bg-sidebar hidden lg:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Logo />
        </div>

        {teamName && (
          <div className="px-6 py-4 border-b border-sidebar-border bg-sidebar-accent/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {teamName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Manager</p>
                <p className="font-bold text-sm truncate text-sidebar-foreground">{teamName}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleLogout} title="Logout">
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground font-mono">v2.0.0</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Header / Bottom Nav */}
      <div className="lg:hidden">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            {teamName && (
              <div className="flex items-center gap-2 mr-2 px-2 py-1 bg-muted/50 rounded-full">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                  {teamName.charAt(0)}
                </div>
                <span className="text-xs font-bold truncate max-w-[80px]">{teamName}</span>
              </div>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-background flex items-center justify-around px-2 pb-safe">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-all", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.name === "Dashboard" ? "Home" : item.name}</span>
              </Link>
            )
          })}

          {/* More Menu Trigger (If needed for remaining items) */}
          <Link
            href="/insights"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1",
              pathname === "/insights" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="text-[10px] font-medium">Insights</span>
          </Link>
        </nav>
      </div>
    </>
  )
}
