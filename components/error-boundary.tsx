"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    private handleReset = () => {
        // Clear potentially corrupted state
        document.cookie = "fpl_selected_team_id=; path=/; max-age=0";
        document.cookie = "fpl_selected_team_name=; path=/; max-age=0";
        localStorage.clear();
        window.location.href = "/";
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 backdrop-blur-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl font-sports font-bold uppercase tracking-tight">Oops! Something went wrong</CardTitle>
                            <CardDescription>
                                A client-side exception occurred. This usually happens due to stale data or a hydration mismatch.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <p className="text-xs text-muted-foreground font-mono bg-background/50 p-3 rounded border border-border/50 overflow-hidden text-ellipsis">
                                {this.state.error?.message || "Unknown Error"}
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button className="w-full gap-2" variant="destructive" onClick={this.handleReset}>
                                <RefreshCw className="w-4 h-4" />
                                Clear Session & Restart
                            </Button>
                            <Button className="w-full gap-2" variant="outline" onClick={() => window.location.reload()}>
                                <RefreshCw className="w-4 h-4" />
                                Retry Page
                            </Button>
                            <Button className="w-full gap-2" variant="ghost" asChild>
                                <a href="/">
                                    <Home className="w-4 h-4" />
                                    Return Home
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
