# Monitoring & Rate Limiting Setup Guide

## 1. Sentry Setup (Error Monitoring)

Sentry provides real-time error tracking and performance monitoring for your application.

### Step 1: Create Sentry Account
1. Go to [Sentry.io](https://sentry.io)
2. Sign up for a free account (includes 5,000 errors/month free)
3. Click "Create Project"

### Step 2: Create a New Project
1. Select platform: **Next.js**
2. Set alert frequency: **Alert me on every new issue**
3. Name your project: **beneathy** (or your app name)
4. Select team: **Your team name**

### Step 3: Get Your DSN
After creating the project, you'll see your DSN. It looks like:
```
https://abc123def456@o123456.ingest.sentry.io/1234567
```

### Step 4: Generate Auth Token
1. Go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Click **Create New Token**
3. Give it a name: "Beneathy Production"
4. Select scopes:
   - ✅ `project:releases`
   - ✅ `org:read`
   - ✅ `project:write`
5. Click **Create Token**
6. Copy the token (you won't see it again!)

### Step 5: Update Your .env.local
```env
# Monitoring
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
SENTRY_ORG=your-org-name
SENTRY_PROJECT=beneathy
```

### Step 6: Install Sentry SDK (Optional - if not already installed)
```bash
npm install @sentry/nextjs
```

### Step 7: Initialize Sentry
Run the Sentry wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```

Or manually create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

---

## 2. Upstash Redis Setup (Rate Limiting)

Upstash provides serverless Redis for rate limiting without managing infrastructure.

### Step 1: Create Upstash Account
1. Go to [Upstash Console](https://console.upstash.com)
2. Sign up with GitHub, Google, or email
3. Verify your email

### Step 2: Create a Redis Database
1. Click **Create Database**
2. Configure your database:
   - **Name**: `beneathy-ratelimit`
   - **Type**: **Regional** (lower latency)
   - **Region**: Select closest to your users (e.g., `us-east-1`)
   - **Enable TLS**: ✅ Yes (recommended)
   - **Eviction**: ✅ Enable (for automatic cleanup)

3. Click **Create**

### Step 3: Get Your Credentials
After creation, you'll see your credentials:
1. Click on your database name
2. Go to **Details** tab
3. Find **REST API** section
4. Copy:
   - **UPSTASH_REDIS_REST_URL** (looks like: `https://your-db.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string starting with `AX...`)

### Step 4: Update Your .env.local
```env
# Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXYourLongTokenHere...
```

### Step 5: Install Upstash SDK (if not already installed)
```bash
npm install @upstash/redis @upstash/ratelimit
```

### Step 6: Create Rate Limiter Utility
Create `lib/rate-limit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export default ratelimit;
```

### Step 7: Use Rate Limiting in API Routes
Example in your API route:
```typescript
import ratelimit from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { 
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      }
    });
  }

  // Continue with your API logic
}
```

---

## 3. Testing Your Setup

### Test Sentry
1. Add a test error in any page:
```javascript
<button onClick={() => {
  throw new Error("Test Sentry Error");
}}>
  Test Error
</button>
```
2. Click the button
3. Check Sentry dashboard for the error

### Test Upstash Rate Limiting
1. Make rapid API calls to a protected endpoint
2. After 10 requests, you should get a 429 error
3. Check Upstash dashboard for analytics

---

## 4. Free Tier Limits

### Sentry Free Tier
- 5,000 errors per month
- 10,000 performance units
- 50 replays per month
- 1GB attachments
- Perfect for small to medium apps

### Upstash Free Tier
- 10,000 commands per day
- 256MB max database size
- 1 database
- Unlimited requests (pay per use after free tier)
- Perfect for rate limiting

---

## 5. Environment Variables Summary

Add these to your `.env.local`:

```env
# Monitoring (Sentry)
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
SENTRY_ORG=your-org-name
SENTRY_PROJECT=beneathy

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXYourLongTokenHere
```

---

## 6. Production Checklist

- [ ] Sentry DSN is set in production environment
- [ ] Sentry is capturing errors correctly
- [ ] Rate limiting is active on sensitive endpoints
- [ ] Upstash Redis is in the same region as your app
- [ ] Error alerts are configured in Sentry
- [ ] Rate limit thresholds are appropriate for your use case

---

## 7. Monitoring Best Practices

### For Sentry:
- Set up alerts for critical errors
- Use Sentry.captureException() for handled errors
- Add user context for better debugging
- Set up performance monitoring for slow queries

### For Upstash:
- Different rate limits for different endpoints
- Higher limits for authenticated users
- Monitor Redis memory usage
- Use sliding window for smoother rate limiting

---

## Support Links

- **Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Upstash Documentation**: https://docs.upstash.com/redis
- **Rate Limit Examples**: https://github.com/upstash/ratelimit