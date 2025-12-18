import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Oswald } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { TeamProvider } from "@/components/providers/team-provider"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "FPL League | Sports Analytics",
  description: "Track your Fantasy Premier League performance with advanced analytics, real-time stats, and financial tracking",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${oswald.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TeamProvider>
            <Navigation />
            <main className="relative min-h-screen md:pl-64 pt-14 pb-16 md:pb-0 md:pt-0 bg-background transition-all duration-300">
              {children}
            </main>
          </TeamProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
