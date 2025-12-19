import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const teamId = request.cookies.get('fpl_selected_team_id')
    const { pathname } = request.nextUrl

    // 1. API Route Protection
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/cron')) {
        if (!teamId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
    }

    // 2. Page Route Protection
    const protectedRoutes = ['/dashboard', '/live-watch', '/leaderboard-fpl', '/leaderboard', '/teams', '/gameweeks', '/transfers', '/financials', '/insights', '/rules']

    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtected && !teamId) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 3. Authenticated Landing Page Redirect
    if (pathname === '/' && teamId) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
