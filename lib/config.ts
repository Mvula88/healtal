// App configuration
export const APP_CONFIG = {
  name: "Beneathy",
  tagline: "Understand Your Deeper Patterns",
  description: "AI Personal Growth Coach specializing in root cause exploration",
  positioning: "Personal development through deeper pattern understanding",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export const LEGAL_DISCLAIMER = `
Beneathy AI Personal Growth Coach is not a licensed mental health 
professional, therapist, psychologist, or psychiatrist. This platform 
is for personal development and educational purposes only.

For mental health concerns or crisis situations, please contact:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Your local emergency services: 911

If you need professional therapy, we can help connect you with 
licensed mental health professionals in your area.
`

export const CRISIS_RESOURCES = [
  {
    name: "National Suicide Prevention Lifeline",
    number: "988",
    description: "24/7 crisis support",
    url: "https://988lifeline.org/"
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "Free 24/7 text support",
    url: "https://www.crisistextline.org/"
  },
  {
    name: "Emergency Services",
    number: "911",
    description: "Immediate emergency assistance",
    url: null
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Treatment referral and information",
    url: "https://www.samhsa.gov/find-help/national-helpline"
  }
]

export const PRICING_TIERS = [
  {
    name: "Lite",
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LITE_PRICE_ID,
    description: "Start your wellness journey",
    features: [
      "30 AI coach messages/month",
      "Unlimited mood tracking",
      "Unlimited journal entries",
      "Basic Vent & Release mode",
      "Weekly pattern insights",
      "3 basic habits",
      "Browse recovery programs",
      "View achievements",
      "Community access",
      "Crisis resources",
      "Mobile app access",
      "Email support"
    ],
    limits: {
      ai_messages: 30,
      voice_minutes: 0,
      buddy_matching: 0,
      group_sessions: 0,
      habits: 3,
      recovery_programs: 0,
      vent_sessions_daily: 1
    },
    cta: "Get Started"
  },
  {
    name: "Starter",
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: "Core wellness features with voice",
    features: [
      "200 AI coach messages/month",
      "60 voice minutes/month",
      "Voice journaling",
      "Full Vent & Release (all modes)",
      "Daily pattern insights",
      "10 habits with reminders",
      "Start 1 recovery program",
      "Peer messaging",
      "1 buddy match",
      "Progress analytics",
      "Emotional analysis",
      "Achievement tracking",
      "Priority email support"
    ],
    limits: {
      ai_messages: 200,
      voice_minutes: 60,
      buddy_matching: 1,
      group_sessions: 0,
      habits: 10,
      recovery_programs: 1,
      vent_sessions_daily: 3
    },
    cta: "Unlock Voice",
    popular: true
  },
  {
    name: "Growth",
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    description: "Complete growth ecosystem",
    features: [
      "Unlimited AI coach messages",
      "300 voice minutes/month",
      "Real-time pattern insights",
      "Unlimited habits",
      "All recovery programs",
      "JOIN healing circles (10% discount)",
      "3 buddy matches",
      "Advanced gamification",
      "Breakthrough tracking",
      "Export data (CSV/PDF)",
      "Custom AI coaching style",
      "Priority support",
      "Affiliate program access"
    ],
    limits: {
      ai_messages: -1, // unlimited
      voice_minutes: 300,
      buddy_matching: 3,
      group_sessions: 4,
      habits: -1,
      recovery_programs: -1,
      vent_sessions_daily: -1
    },
    cta: "Remove Limits"
  },
  {
    name: "Premium",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    description: "Premium wellness experience",
    features: [
      "Everything unlimited",
      "Unlimited voice minutes",
      "JOIN & LEAD healing circles",
      "20% circle discount + earn 80% as guide",
      "2 family accounts included",
      "Unlimited buddy matches",
      "All recovery programs",
      "Priority gamification rewards",
      "Early access to features",
      "Monthly progress reports",
      "Dedicated support",
      "Business/team features"
    ],
    limits: {
      ai_messages: -1,
      voice_minutes: -1,
      buddy_matching: -1,
      group_sessions: -1,
      habits: -1,
      recovery_programs: -1,
      vent_sessions_daily: -1,
      family_accounts: 2
    },
    cta: "Go Premium"
  }
]

export const FEATURES = {
  patternDiscovery: {
    title: "Pattern Discovery",
    description: "Identify recurring themes and behaviors in your life"
  },
  rootCauseAnalysis: {
    title: "Root Cause Analysis",
    description: "Understand the deeper origins of your challenges"
  },
  personalizedInsights: {
    title: "Personalized Insights",
    description: "AI-powered analysis tailored to your unique journey"
  },
  growthTracking: {
    title: "Growth Tracking",
    description: "Monitor your progress and celebrate breakthroughs"
  }
}

export const COMPETITIVE_MESSAGING = {
  betterHelp: "Before paying for therapy, understand your patterns with Beneathy",
  headspace: "Beyond meditation - discover why you feel the way you do",
  abby: "Not just AI therapy - specialized root cause personal growth"
}