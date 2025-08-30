// Recovery-Focused Journaling Prompts
// Based on root-cause understanding and compassionate recovery

export const RECOVERY_JOURNAL_PROMPTS = {
  daily: {
    morning: [
      {
        prompt: "What am I feeling as I wake up today? Where do I feel it in my body?",
        focus: "Body awareness",
        followUp: "What is this feeling trying to tell me?"
      },
      {
        prompt: "What do I need to feel supported today?",
        focus: "Self-care",
        followUp: "How can I give this to myself?"
      },
      {
        prompt: "What's one thing I'm grateful for in my recovery?",
        focus: "Gratitude",
        followUp: "How has this changed from before?"
      },
      {
        prompt: "What challenge might I face today, and how will I handle it?",
        focus: "Preparation",
        followUp: "Who can I reach out to if I need support?"
      }
    ],
    
    evening: [
      {
        prompt: "What went well today in my recovery?",
        focus: "Success recognition",
        followUp: "What strength did I use?"
      },
      {
        prompt: "What triggered me today, and what was it really about?",
        focus: "Pattern recognition",
        followUp: "What need was underneath the trigger?"
      },
      {
        prompt: "How did I show myself compassion today?",
        focus: "Self-compassion",
        followUp: "Where could I have been kinder to myself?"
      },
      {
        prompt: "What did I learn about myself today?",
        focus: "Growth",
        followUp: "How will I use this knowledge tomorrow?"
      }
    ]
  },

  weekly: {
    reflection: [
      {
        prompt: "What patterns did I notice this week?",
        focus: "Pattern awareness",
        deepDive: [
          "When were my cravings strongest?",
          "What emotions preceded them?",
          "What helped me through difficult moments?"
        ]
      },
      {
        prompt: "How is my relationship with [substance/behavior] changing?",
        focus: "Progress tracking",
        deepDive: [
          "What feels different?",
          "What old beliefs am I letting go?",
          "What new truths am I discovering?"
        ]
      },
      {
        prompt: "What unmet need kept showing up this week?",
        focus: "Need identification",
        deepDive: [
          "How did I try to meet it?",
          "What would truly satisfy this need?",
          "What's blocking me from meeting it healthily?"
        ]
      }
    ]
  },

  rootCause: {
    trauma: [
      {
        prompt: "What memory or feeling am I avoiding through my addiction?",
        approach: "Write without editing. Let whatever comes up be okay.",
        healing: "What would my younger self have needed instead?"
      },
      {
        prompt: "Who in my past does my addiction remind me of?",
        approach: "Consider who used substances, avoided feelings, or taught you to escape.",
        healing: "What pattern am I repeating? How can I break it?"
      },
      {
        prompt: "When did I first learn that numbing was safer than feeling?",
        approach: "Think about early experiences of overwhelming emotion.",
        healing: "What would make it safe to feel now?"
      }
    ],

    emotions: [
      {
        prompt: "What emotion am I most afraid to feel?",
        approach: "Name it without judgment.",
        healing: "What if this emotion had something important to tell me?"
      },
      {
        prompt: "What feeling does my addiction protect me from?",
        approach: "Go beneath anger to hurt, beneath anxiety to fear.",
        healing: "How can I befriend this feeling instead of fleeing?"
      },
      {
        prompt: "When I imagine life without my addiction, what emotion comes up?",
        approach: "Fear? Grief? Relief? All are valid.",
        healing: "What does this emotion tell me about what I need?"
      }
    ],

    identity: [
      {
        prompt: "Who am I without my addiction?",
        approach: "This might feel scary or empty at first.",
        healing: "What parts of me have been waiting to emerge?"
      },
      {
        prompt: "What story does my addiction tell about who I am?",
        approach: "Am I the 'broken one,' 'black sheep,' 'failure'?",
        healing: "What truer story wants to be written?"
      },
      {
        prompt: "What would change if I believed I deserved to be free?",
        approach: "Imagine deserving recovery, happiness, love.",
        healing: "What would I do differently starting today?"
      }
    ],

    shame: [
      {
        prompt: "What shame am I carrying that feeds my addiction?",
        approach: "Shame thrives in secrecy. Writing it reduces its power.",
        healing: "What would self-forgiveness look like?"
      },
      {
        prompt: "What have I never forgiven myself for?",
        approach: "Be honest but gentle.",
        healing: "Would I forgive a friend for the same thing?"
      },
      {
        prompt: "What part of me do I reject or hate?",
        approach: "This part might be connected to your addiction.",
        healing: "What if this part is trying to protect me?"
      }
    ]
  },

  cravingExploration: [
    {
      prompt: "Right now, what does this craving feel like in my body?",
      realTime: true,
      tracking: "Rate intensity 1-10. Where do you feel it?"
    },
    {
      prompt: "If this craving could speak, what would it say?",
      realTime: true,
      tracking: "What is it asking for? What does it need?"
    },
    {
      prompt: "What happened in the hour before this craving?",
      realTime: true,
      tracking: "Event → Thought → Feeling → Craving"
    },
    {
      prompt: "What am I really hungry for right now?",
      realTime: true,
      tracking: "Connection? Peace? Excitement? Relief?"
    }
  ],

  milestoneReflections: {
    "24hours": {
      prompt: "I made it through the first day. How did I do it?",
      celebration: "What strength did I discover in myself?",
      forward: "What will I do differently tomorrow?"
    },
    "1week": {
      prompt: "One week free. What's different in my body and mind?",
      celebration: "What positive changes am I noticing?",
      forward: "What pattern do I want to build this week?"
    },
    "1month": {
      prompt: "A month of recovery. Who am I becoming?",
      celebration: "What am I capable of that I couldn't do before?",
      forward: "What deeper healing is ready to happen?"
    },
    "3months": {
      prompt: "Three months. What old story can I let go of now?",
      celebration: "How have my relationships changed?",
      forward: "What new chapter am I writing?"
    },
    "6months": {
      prompt: "Half a year. What wisdom have I gained?",
      celebration: "What would I tell someone starting day 1?",
      forward: "What dreams are becoming possible?"
    },
    "1year": {
      prompt: "One year free. Who have I become?",
      celebration: "What seemed impossible a year ago that's normal now?",
      forward: "How can I use my story to help others?"
    }
  },

  relationshipRepair: [
    {
      prompt: "Who have I hurt through my addiction?",
      approach: "Be honest but don't spiral into shame.",
      healing: "What amends would feel meaningful?"
    },
    {
      prompt: "Who has stood by me despite everything?",
      approach: "Consider those who've shown unconditional love.",
      healing: "How can I show gratitude?"
    },
    {
      prompt: "What relationships am I ready to release?",
      approach: "Some relationships may be triggers or enablers.",
      healing: "How can I let go with love?"
    },
    {
      prompt: "What kind of relationships do I want to build?",
      approach: "Imagine healthy, supportive connections.",
      healing: "What would secure attachment feel like?"
    }
  ],

  meaningMaking: [
    {
      prompt: "How might my addiction story help someone else?",
      purpose: "Your pain can become purpose.",
      action: "Who needs to hear that recovery is possible?"
    },
    {
      prompt: "What gifts has recovery given me?",
      purpose: "Empathy, strength, resilience, wisdom.",
      action: "How can I use these gifts?"
    },
    {
      prompt: "What is my 'why' for staying in recovery?",
      purpose: "Beyond 'not using,' what are you choosing?",
      action: "How can I strengthen this why?"
    },
    {
      prompt: "What legacy do I want to leave?",
      purpose: "Think beyond addiction to impact.",
      action: "What step can I take toward this today?"
    }
  ],

  creativeExpressions: [
    {
      type: "Letter Writing",
      prompts: [
        "Write a letter to your addiction, saying goodbye",
        "Write a letter from your future self to today's you",
        "Write a letter of forgiveness to yourself",
        "Write a letter to someone you've hurt (don't send it yet)"
      ]
    },
    {
      type: "Visualization",
      prompts: [
        "Draw or describe your addiction as a character or creature",
        "Create an image of your life one year into recovery",
        "Map the journey from your first use to today",
        "Design your recovery toolbox visually"
      ]
    },
    {
      type: "Dialogue",
      prompts: [
        "Have a conversation between your addicted self and recovery self",
        "Interview your inner child about what they need",
        "Let your craving and your wisdom debate",
        "Write a dialogue with someone you've lost to addiction"
      ]
    }
  ],

  gratitudePractice: [
    "What part of my body is supporting my recovery today?",
    "What person showed me kindness today?",
    "What moment of clarity did I have today?",
    "What choice am I grateful I made today?",
    "What feeling am I grateful to experience clearly again?",
    "What opportunity has recovery given me?",
    "What strength did I discover in myself today?",
    "What beauty did I notice that I would have missed before?"
  ],

  // Specific to different addiction types
  substanceSpecific: {
    alcohol: [
      "How is my relationship with social situations changing without alcohol?",
      "What emotions was alcohol helping me avoid?",
      "What rituals can replace my drinking rituals?"
    ],
    drugs: [
      "What void were substances filling in my life?",
      "How can I find natural highs and healthy escapes?",
      "What trauma was I trying to medicate?"
    ],
    food: [
      "What emotions am I feeding when I'm not physically hungry?",
      "How can I nourish myself beyond food?",
      "What would true satisfaction feel like?"
    ],
    gambling: [
      "What excitement or hope was I chasing?",
      "Where else can I find healthy risk and reward?",
      "What financial fears or fantasies drive me?"
    ],
    sex_porn: [
      "What intimacy am I actually craving?",
      "How can I build genuine connection?",
      "What shame around sexuality am I carrying?"
    ],
    gaming: [
      "What achievements do I need in real life?",
      "What community am I seeking?",
      "How can I find challenge and growth offline?"
    ],
    shopping: [
      "What void am I trying to fill with purchases?",
      "What would true abundance feel like?",
      "How can I feel valuable without buying?"
    ],
    work: [
      "What am I trying to prove through overwork?",
      "What happens when I'm not productive?",
      "How can I find worth beyond achievement?"
    ],
    social_media: [
      "What validation am I seeking online?",
      "How can I connect authentically offline?",
      "What reality am I avoiding?"
    ],
    relationships: [
      "What does healthy love look like?",
      "How can I be whole without another person?",
      "What attachment wounds need healing?"
    ]
  }
}

// Weekly journal template generator
export function generateWeeklyTemplate(weekNumber: number, addictionType?: string) {
  return {
    weekTheme: getWeekTheme(weekNumber),
    dailyPrompts: RECOVERY_JOURNAL_PROMPTS.daily,
    weeklyReflection: RECOVERY_JOURNAL_PROMPTS.weekly.reflection,
    deepDive: getWeeklyDeepDive(weekNumber),
    addictionSpecific: addictionType ? 
      RECOVERY_JOURNAL_PROMPTS.substanceSpecific[addictionType as keyof typeof RECOVERY_JOURNAL_PROMPTS.substanceSpecific] : 
      null
  }
}

function getWeekTheme(weekNumber: number) {
  const themes = [
    "Awareness: Noticing patterns",
    "Acceptance: Embracing where you are",
    "Understanding: Exploring root causes",
    "Compassion: Practicing self-forgiveness",
    "Connection: Building support",
    "Identity: Discovering who you are",
    "Purpose: Finding meaning",
    "Integration: Living your truth"
  ]
  return themes[(weekNumber - 1) % themes.length]
}

function getWeeklyDeepDive(weekNumber: number) {
  const deepDives = [
    RECOVERY_JOURNAL_PROMPTS.rootCause.trauma,
    RECOVERY_JOURNAL_PROMPTS.rootCause.emotions,
    RECOVERY_JOURNAL_PROMPTS.rootCause.identity,
    RECOVERY_JOURNAL_PROMPTS.rootCause.shame
  ]
  return deepDives[(weekNumber - 1) % deepDives.length]
}

export default RECOVERY_JOURNAL_PROMPTS