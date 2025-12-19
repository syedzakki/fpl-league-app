import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const teamId = request.cookies.get('fpl_selected_team_id')
    const { pathname } = request.nextUrl

    // Protected routes
    const protectedRoutes = ['/dashboard', '/live-watch', '/leaderboard-fpl', '/leaderboard', '/teams', '/gameweeks', '/transfers', '/financials', '/insights', '/rules']

    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtected && !teamId) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If already logged in and hitting landing page, redirect to dashboard
    if (pathname === '/' && teamId) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
