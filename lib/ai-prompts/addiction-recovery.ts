// AI Coach Prompts for Addiction Recovery - Root Cause Focused

export const ADDICTION_RECOVERY_PROMPTS = {
  // Initial Assessment - Understanding the Pattern
  initial_assessment: {
    system: `You are a compassionate AI coach specialized in addiction recovery through root cause analysis. 
    You understand that addiction is a symptom, not a character flaw. Your approach is:
    - Non-judgmental and compassionate
    - Curious about underlying pain and needs
    - Focused on understanding, not fixing
    - Trauma-informed and shame-aware
    Never use labels like "addict" or "alcoholic". Instead use "person exploring their relationship with [substance/behavior]".`,
    
    questions: [
      "What brings you here today? I'm here to listen without judgment.",
      "When did you first notice this pattern in your life?",
      "What were you hoping [substance/behavior] would do for you?",
      "What feeling or situation does [substance/behavior] help you avoid or manage?",
      "If [substance/behavior] could speak, what would it say it's protecting you from?"
    ]
  },

  // Root Cause Exploration
  root_cause_discovery: {
    emotional_roots: [
      "What emotion comes up right before you feel the urge?",
      "What feeling are you trying to create or escape?",
      "When in your life did you first feel this way?",
      "Who in your life made you feel like these emotions weren't okay?",
      "What would happen if you let yourself fully feel this emotion?"
    ],
    
    trauma_connection: [
      "What difficult experience might this be helping you cope with?",
      "When did you first learn that numbing was safer than feeling?",
      "What childhood experience does this remind you of?",
      "Who or what taught you that you needed to escape your feelings?",
      "What would young you have needed instead of learning this coping strategy?"
    ],
    
    unmet_needs: [
      "What basic human need isn't being met in your life?",
      "What are you truly hungry for - connection, safety, validation, peace?",
      "If the craving is a message, what is it trying to tell you?",
      "What would genuinely satisfy this deeper hunger?",
      "How did you learn that this need wasn't okay to have?"
    ],
    
    identity_beliefs: [
      "What story about yourself does this behavior confirm?",
      "What do you believe about your worth when you use?",
      "What shame are you carrying that makes this feel like what you deserve?",
      "Who would you be without this pattern?",
      "What scares you about being free from this?"
    ]
  },

  // Craving Navigation
  craving_support: {
    immediate_response: [
      "I see you're experiencing a craving. You're safe, and this will pass.",
      "Cravings are waves - they rise, peak, and fall. Let's surf this one together.",
      "This craving is information. What is it telling you about what you need right now?",
      "Your brain is doing what it learned to do to protect you. You can choose differently now."
    ],
    
    halt_check: {
      prompt: "Let's do a quick HALT check. Are you:",
      responses: {
        hungry: "Your body needs nourishment. What would truly feed you right now?",
        angry: "Anger is valid. What boundary was crossed? What do you need to express?",
        lonely: "Connection is a basic human need. Who could you reach out to, or how can you connect with yourself?",
        tired: "Rest is not optional. How can you give yourself permission to rest?"
      }
    },
    
    urge_surfing: [
      "Let's ride this wave. Rate the intensity from 1-10. Just observe without judgment.",
      "Where do you feel this craving in your body? Can you breathe into that space?",
      "Imagine the craving as a wave. You're on a surfboard, riding it, not fighting it.",
      "This craving will peak and pass, usually within 20 minutes. You've got this."
    ],
    
    play_tape_forward: [
      "If you use now, how will you feel in 1 hour? Tomorrow morning?",
      "What will this cost you - not just money, but self-respect, relationships, goals?",
      "Now imagine resisting. How will you feel tomorrow having gotten through this?",
      "Which version of tomorrow do you want to wake up to?"
    ]
  },

  // Pattern Recognition
  pattern_identification: {
    triggers: [
      "What happened right before you felt the urge?",
      "What time of day/week/month is this happening most?",
      "Who were you with or thinking about?",
      "What emotion or memory surfaced?",
      "What pattern from childhood is being activated here?"
    ],
    
    cycles: [
      "Let's map this cycle: Trigger → Thought → Feeling → Craving → ?",
      "Where in this cycle do you have the most power to intervene?",
      "What would disrupt this pattern?",
      "What new pattern would you like to create instead?"
    ]
  },

  // Relapse as Information
  relapse_support: {
    immediate: [
      "You're here, and that's what matters. Relapse is data, not failure.",
      "Recovery isn't linear. What can we learn from what happened?",
      "You haven't lost your progress. Every moment is a chance to choose differently.",
      "Be gentle with yourself. Shame fuels the cycle; compassion breaks it."
    ],
    
    learning: [
      "What was happening in your life before this happened?",
      "What need were you trying to meet?",
      "What support was missing?",
      "What warning sign can you watch for next time?",
      "How can we adjust your recovery plan based on this information?"
    ]
  },

  // Recovery Affirmations (Reframes)
  affirmations: [
    "You're not broken; you're human with human needs and human pain.",
    "Your addiction served a purpose. You can thank it and choose something different now.",
    "Recovery isn't about perfection; it's about progress and self-compassion.",
    "Every craving you surf makes you stronger.",
    "You're not giving something up; you're gaining your authentic self back.",
    "The opposite of addiction isn't sobriety; it's connection.",
    "You're brave for looking at what hurts.",
    "Your sensitivity isn't weakness; it's what makes you human.",
    "You deserve to heal the pain, not just numb it.",
    "You're exactly where you need to be in your journey."
  ],

  // Daily Check-ins
  daily_checkin: {
    morning: [
      "How are you feeling as you start this day?",
      "What do you need to feel supported today?",
      "What's one thing you can do for your recovery today?",
      "How can you be kind to yourself today?"
    ],
    
    evening: [
      "What went well today?",
      "What was challenging, and how did you handle it?",
      "What did you learn about yourself today?",
      "What are you grateful for in your recovery today?"
    ]
  },

  // Connection Building
  connection_support: [
    "Addiction thrives in isolation. Who can you connect with today?",
    "What would authentic connection look like for you?",
    "What makes you feel truly seen and understood?",
    "How can you be more connected to yourself?",
    "What would it be like to let someone see the real you?"
  ],

  // Meaning & Purpose
  purpose_exploration: [
    "What would be possible in your life without this pattern?",
    "What dreams has this pattern put on hold?",
    "What gifts do you have that the world needs?",
    "What legacy do you want to leave?",
    "Who could you help with your story of recovery?"
  ]
}

// Conversation Starters by Addiction Type
export const ADDICTION_SPECIFIC_PROMPTS = {
  alcohol: {
    opener: "I understand you're exploring your relationship with alcohol. What role has it been playing in your life?",
    root_exploration: "Alcohol often numbs emotional pain or social anxiety. What feelings come up when you imagine social situations without it?"
  },
  
  substances: {
    opener: "You're brave for looking at your relationship with substances. What were you hoping they would help you with?",
    root_exploration: "Substances often help us escape unbearable feelings or trauma. What are you trying to escape from?"
  },
  
  gaming: {
    opener: "Gaming can be a powerful escape. What does the virtual world offer you that the real world doesn't?",
    root_exploration: "In games, we often find achievement, community, and control. Which of these are you missing in daily life?"
  },
  
  pornography: {
    opener: "This is a safe space to explore without shame. What need is pornography meeting for you?",
    root_exploration: "Often this connects to intimacy, loneliness, or stress relief. What's your relationship with real intimacy?"
  },
  
  food: {
    opener: "Food and eating patterns often connect to deeper needs. What does food provide beyond nutrition for you?",
    root_exploration: "Food can be about control, comfort, or filling emotional emptiness. What are you truly hungry for?"
  },
  
  shopping: {
    opener: "Shopping can temporarily fill a void. What feeling are you chasing when you shop?",
    root_exploration: "The hunt and acquisition often mask feelings of emptiness or low self-worth. What would make you feel truly valuable?"
  },
  
  gambling: {
    opener: "Gambling often represents hope for change. What are you hoping will change in your life?",
    root_exploration: "The excitement might be masking desperation or powerlessness. Where in life do you feel out of control?"
  },
  
  work: {
    opener: "Work addiction often hides behind productivity. What are you proving through your work?",
    root_exploration: "Overwork can mask feelings of inadequacy or avoid intimacy. What happens when you stop being productive?"
  },
  
  relationships: {
    opener: "Love and relationship addiction often stems from early attachment. What did love look like in your childhood?",
    root_exploration: "The intensity might be familiar chaos. What would safe, calm love feel like to you?"
  },
  
  social_media: {
    opener: "Social media can be about connection or validation. What are you seeking when you scroll?",
    root_exploration: "The dopamine hits might be replacing real connection. What would genuine connection look like?"
  }
}

// Crisis Intervention Scripts
export const CRISIS_SCRIPTS = {
  immediate_danger: {
    response: "I'm concerned for your safety. You deserve support from a human right now.",
    resources: "Would you like me to provide crisis hotline numbers? SAMHSA: 1-800-662-4357 is available 24/7.",
    grounding: "While you decide, let's breathe together. In for 4, hold for 4, out for 8."
  },
  
  active_craving: {
    normalize: "Cravings are normal in recovery. This will pass, usually within 20 minutes.",
    redirect: "What can you do right now instead? Movement, cold shower, call someone?",
    encourage: "You've made it through cravings before. What helped last time?"
  },
  
  post_relapse: {
    compassion: "You're here. That's courage. Relapse doesn't erase your progress.",
    safety: "First, are you safe? Do you need medical attention?",
    forward: "When you're ready, we can explore what this experience can teach us."
  }
}

// Recovery Stages Guidance
export const RECOVERY_STAGES = {
  precontemplation: {
    approach: "Focus on building awareness without pushing for change",
    questions: "What concerns you about your current pattern? What do others say?"
  },
  
  contemplation: {
    approach: "Explore ambivalence and reasons for/against change",
    questions: "What would be better if you changed? What makes change difficult?"
  },
  
  preparation: {
    approach: "Build concrete plans and identify resources",
    questions: "What's your first step? Who can support you? What obstacles might arise?"
  },
  
  action: {
    approach: "Support active changes and problem-solve obstacles",
    questions: "What's working? What's challenging? How can we adjust your plan?"
  },
  
  maintenance: {
    approach: "Prevent relapse and deepen recovery",
    questions: "What new patterns are emerging? How is life different? What still needs healing?"
  }
}

const addictionPrompts = {
  ADDICTION_RECOVERY_PROMPTS,
  ADDICTION_SPECIFIC_PROMPTS,
  CRISIS_SCRIPTS,
  RECOVERY_STAGES
}

export default addictionPrompts