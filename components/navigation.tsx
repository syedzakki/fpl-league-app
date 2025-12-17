"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Users, DollarSign, Home, Calendar, Lightbulb, Sun, Moon, Menu, X, ArrowRightLeft, BarChart3, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/leaderboard-fpl", label: "FPL Leaderboard", icon: BarChart3 },
  { href: "/gameweeks", label: "Gameweeks", icon: Calendar },
  { href: "/transfers", label: "Transfers", icon: ArrowRightLeft },
  { href: "/financials", label: "Financials", icon: DollarSign },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/rules", label: "Rules", icon: BookOpen },
]

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A1F16] border-b border-[#DBC2CF] dark:border-[#19297C]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Trophy className="h-6 w-6 text-[#F26430]" />
            <span className="font-bold text-lg text-[#1A1F16] dark:text-[#FFFCF2]">
              FPL League
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
                      isActive
                        ? "bg-[#DBC2CF] dark:bg-[#19297C] text-[#F26430] dark:text-[#028090]"
                        : "text-[#19297C] dark:text-[#DBC2CF] hover:text-[#F26430] dark:hover:text-[#028090] hover:bg-[#DBC2CF]/50 dark:hover:bg-[#19297C]/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-[#F26430] dark:text-[#028090]" : ""
                    )} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-[#F26430] dark:bg-[#028090]" />
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-md text-[#19297C] dark:text-[#DBC2CF] hover:text-[#F26430] dark:hover:text-[#028090] hover:bg-[#DBC2CF]/50 dark:hover:bg-[#19297C]/50"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-md text-[#19297C] dark:text-[#DBC2CF] hover:text-[#F26430] dark:hover:text-[#028090] hover:bg-[#DBC2CF]/50 dark:hover:bg-[#19297C]/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white dark:bg-[#1A1F16] border-b border-[#DBC2CF] dark:border-[#19297C] shadow-lg">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-md transition-all",
                        isActive
                          ? "bg-[#DBC2CF] dark:bg-[#19297C] text-[#F26430] dark:text-[#028090]"
                          : "text-[#19297C] dark:text-[#DBC2CF] hover:text-[#F26430] dark:hover:text-[#028090] hover:bg-[#DBC2CF]/50 dark:hover:bg-[#19297C]/50"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-[#F26430] dark:text-[#028090]" : ""
                      )} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
