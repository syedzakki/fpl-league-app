import { NextResponse } from "next/server"
import { fetchFixtures } from "@/lib/fpl-api"

export async function GET() {
    try {
        const fixtures = await fetchFixtures()

        if (!fixtures) {
            return NextResponse.json(
                { success: false, error: "Failed to fetch fixtures" },
                { status: 500 }
            )
        }

        return NextResponse.json(fixtures)
    } catch (error) {
        console.error("Error in fixtures proxy:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
