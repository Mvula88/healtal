// App configuration
export const APP_CONFIG = {
  name: "Healtal",
  tagline: "Understand Your Deeper Patterns",
  description: "AI Personal Growth Coach specializing in root cause exploration",
  positioning: "Personal development through deeper pattern understanding",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export const LEGAL_DISCLAIMER = `
Healtal AI Personal Growth Coach is not a licensed mental health 
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
    name: "Discover",
    price: 0,
    priceId: null,
    description: "Start your journey",
    features: [
      "5 pattern exploration sessions per month",
      "Basic insights dashboard",
      "Self-guided exercises",
      "Community forum access"
    ],
    cta: "Start Free"
  },
  {
    name: "Understand",
    price: 24.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_UNDERSTAND_PRICE_ID,
    description: "Deepen your self-understanding",
    features: [
      "Unlimited AI coaching sessions",
      "Advanced pattern analysis",
      "Personalized growth plans",
      "Progress tracking",
      "Email support"
    ],
    cta: "Start Understanding",
    popular: true
  },
  {
    name: "Transform",
    price: 44.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_TRANSFORM_PRICE_ID,
    description: "Complete transformation toolkit",
    features: [
      "Everything in Understand",
      "Life mapping tools",
      "Professional referral network",
      "Priority support",
      "Weekly progress reviews",
      "Advanced analytics"
    ],
    cta: "Transform Your Life"
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
  betterHelp: "Before paying for therapy, understand your patterns with Healtal",
  headspace: "Beyond meditation - discover why you feel the way you do",
  abby: "Not just AI therapy - specialized root cause personal growth"
}