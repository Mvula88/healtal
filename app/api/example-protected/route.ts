import { NextRequest, NextResponse } from 'next/server'
import ratelimit, { withRateLimit, rateLimiters } from '@/lib/rate-limit'

// Example 1: Using the default rate limiter with helper function
export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    // Your API logic here
    return NextResponse.json({
      message: "This endpoint is rate limited to 10 requests per 10 seconds",
      timestamp: new Date().toISOString()
    })
  })
}

// Example 2: Using a specific rate limiter manually
export async function POST(request: NextRequest) {
  // Use the API rate limiter (30 requests per minute)
  return withRateLimit(request, async () => {
    // Your API logic here
    const data = await request.json()
    
    // Process the data...
    return NextResponse.json({
      success: true,
      message: "Data processed successfully",
      data
    })
  }, rateLimiters.api)
}

// Example 3: Manual rate limiting with custom logic
export async function PUT(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  
  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json(
      { 
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: new Date(reset).toISOString()
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
          "Retry-After": Math.floor((reset - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  // Your API logic here
  const response = NextResponse.json({
    success: true,
    message: "Update successful"
  })
  
  // Add rate limit headers to successful response
  response.headers.set("X-RateLimit-Limit", limit.toString())
  response.headers.set("X-RateLimit-Remaining", remaining.toString())
  response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString())
  
  return response
}

// Example 4: Different rate limits for different user tiers
export async function DELETE(request: NextRequest) {
  // Get user tier (you'd normally get this from your auth/database)
  const userTier = request.headers.get("x-user-tier") ?? "free"
  
  // Use different rate limiters based on user tier
  const limiter = userTier === "premium" 
    ? rateLimiters.api  // Premium users get higher limits
    : ratelimit         // Free users get standard limits
  
  return withRateLimit(request, async () => {
    // Your API logic here
    return NextResponse.json({
      success: true,
      message: "Resource deleted",
      userTier
    })
  }, limiter)
}