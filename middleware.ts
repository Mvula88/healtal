import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMITS = {
  '/api/coach': 20, // 20 requests per minute for AI coaching
  '/api/crisis-detection': 50, // 50 requests per minute
  '/api/admin': 10, // 10 requests per minute for admin endpoints
}

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`
}

function checkRateLimit(ip: string, path: string): boolean {
  const key = getRateLimitKey(ip, path)
  const now = Date.now()
  const limit = Object.entries(RATE_LIMITS).find(([prefix]) => 
    path.startsWith(prefix)
  )?.[1] || 100 // Default limit

  const record = rateLimitMap.get(key)
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname

  // Get client IP
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown'

  // Apply rate limiting to API routes
  if (path.startsWith('/api/')) {
    if (!checkRateLimit(ip, path)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Protect admin routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    try {
      const supabase = createMiddlewareClient({ req, res })
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        // Redirect to login if not authenticated
        if (path.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/login', req.url))
        }
        // Return 401 for API routes
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check if user is admin (you should add an is_admin field to users table)
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', session.user.id)
        .single()

      // For now, we'll check if it's a specific admin email
      // In production, add proper role-based access control
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      if (!adminEmails.includes(session.user.email || '')) {
        if (path.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/', req.url))
        }
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Admin auth error:', error)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }

  // Add security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return res
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}