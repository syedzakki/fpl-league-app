import { NextResponse } from "next/server";

// This endpoint will be called by Vercel Cron Jobs daily at 23:59 UTC
// It refreshes the cache by calling all API routes to warm them up

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    // Vercel sends a special header, but we can also use CRON_SECRET for extra security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    
    // Allow if it's from Vercel cron OR if CRON_SECRET matches (if set)
    if (cronSecret && !vercelCronHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use production URL - Vercel sets VERCEL_URL, but for production use the actual domain
    const baseUrl = process.env.VERCEL_ENV === "production"
      ? "https://fpl-app-sooty.vercel.app"
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Call all API endpoints to refresh their cache
    const endpoints = [
      "/api/sheets",
      "/api/fpl",
      "/api/fpl-league",
      "/api/current-gameweek",
      "/api/recommendations",
      "/api/leaderboard",
    ];

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${baseUrl}${endpoint}`, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
            },
            // Use a timeout to prevent hanging
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });
          return {
            endpoint,
            status: response.status,
            success: response.ok,
          };
        } catch (error) {
          return {
            endpoint,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: "Cache refresh initiated",
      results: {
        total: endpoints.length,
        successful,
        failed,
      },
      timestamp: new Date().toISOString(),
      timezone: "UTC",
    });
  } catch (error) {
    console.error("Cron refresh error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
