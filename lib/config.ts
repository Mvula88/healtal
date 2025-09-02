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
    name: "Starter",
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: "Essential mental wellness tools",
    features: [
      "Unlimited AI coaching sessions",
      "Full pattern analytics dashboard",
      "Daily mood check-ins",
      "Basic community access",
      "Weekly insights reports",
      "Email support",
      "Basic wellness tools"
    ],
    cta: "Start Now"
  },
  {
    name: "Growth",
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    description: "Complete growth ecosystem",
    features: [
      "Everything in Starter",
      "Healing circles access",
      "Personalized growth journeys",
      "Advanced pattern insights",
      "Priority support",
      "Custom recovery programs",
      "Voice sessions",
      "Community full access",
      "Downloadable reports"
    ],
    cta: "Accelerate Growth",
    popular: true
  },
  {
    name: "Premium",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    description: "Premium wellness experience",
    features: [
      "Complete wellness ecosystem",
      "Everything in Growth",
      "Dedicated account manager",
      "Custom integrations",
      "Team analytics & management",
      "White-label options",
      "24/7 priority support",
      "Custom AI training",
      "Unlimited team members",
      "Advanced API access"
    ],
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