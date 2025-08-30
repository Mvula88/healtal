export const testUsers = {
  admin: {
    email: 'ismaelmvula@gmail.com',
    password: 'Test@Admin123',
    fullName: 'Ismael Mvula'
  },
  regular: {
    email: 'testuser@example.com',
    password: 'Test@User123',
    fullName: 'Test User'
  },
  newUser: {
    email: `test${Date.now()}@example.com`,
    password: 'Test@NewUser123',
    fullName: 'New Test User'
  }
};

export const testMessages = {
  coaching: [
    "I'm feeling overwhelmed with work stress",
    "How can I improve my work-life balance?",
    "I want to develop better habits",
    "Tell me about mindfulness techniques"
  ],
  wellness: {
    mood: 7,
    energy: 6,
    stress: 4,
    gratitude: "Grateful for my health and family",
    intention: "Focus on being present today"
  }
};

export const testJourneys = {
  growth: {
    name: "Personal Growth Journey",
    description: "A journey to discover and enhance personal strengths",
    focusAreas: ["self-awareness", "confidence", "resilience"]
  },
  wellness: {
    name: "Wellness Journey",
    description: "Improving physical and mental wellness",
    focusAreas: ["mindfulness", "exercise", "nutrition"]
  }
};