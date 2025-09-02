import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis instance from environment variables
const redis = Redis.fromEnv();

// Create different rate limiters for different purposes
export const rateLimiters = {
  // General API rate limit: 30 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/api",
  }),

  // AI Coaching sessions: 10 requests per minute (more expensive)
  aiCoaching: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/ai",
  }),

  // Auth endpoints: 5 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  }),

  // Stripe webhooks: 100 per minute (higher limit for webhooks)
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/webhook",
  }),

  // File uploads: 5 per hour
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/upload",
  }),
};

// Default rate limiter for general use
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export default ratelimit;

// Helper function to get identifier from request
export function getIdentifier(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] ?? real ?? "127.0.0.1";
  
  return ip;
}

// Helper function to create rate limit response
export function rateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
): Response {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: "You have exceeded the rate limit. Please try again later.",
      limit,
      remaining,
      resetAt: new Date(reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
        "Retry-After": Math.floor((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

// Middleware function for easy use in API routes
export async function withRateLimit(
  req: Request,
  handler: () => Promise<Response>,
  limiter: Ratelimit = ratelimit
): Promise<Response> {
  const identifier = getIdentifier(req);
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    return rateLimitResponse(limit, remaining, reset);
  }

  // Add rate limit headers to successful response
  const response = await handler();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());
  
  return response;
}