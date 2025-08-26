-- Seed data for Growth Journeys
INSERT INTO public.growth_journeys (name, description, steps, focus_areas, estimated_duration_weeks) VALUES
  (
    'Understanding Your Relationship Patterns',
    'Explore your relationship history to identify recurring patterns and develop healthier connections.',
    '[
      {"title": "Mapping Your Relationship History", "description": "Create a timeline of significant relationships and their impact", "activities": ["Journal about past relationships", "Identify common themes", "Note emotional patterns"]},
      {"title": "Recognizing Attachment Styles", "description": "Understand your attachment style and its origins", "activities": ["Take attachment style assessment", "Explore childhood influences", "Connect patterns to present"]},
      {"title": "Breaking Negative Cycles", "description": "Identify and interrupt unhelpful relationship patterns", "activities": ["Practice boundary setting", "Develop communication skills", "Create new response patterns"]},
      {"title": "Building Healthier Connections", "description": "Apply insights to create more fulfilling relationships", "activities": ["Practice vulnerability", "Implement new boundaries", "Celebrate progress"]}
    ]'::jsonb,
    ARRAY['relationships', 'personal-growth', 'communication'],
    4
  ),
  (
    'Career Fulfillment Discovery',
    'Align your career with your values, strengths, and life purpose for greater satisfaction.',
    '[
      {"title": "Values and Strengths Assessment", "description": "Identify core values and natural strengths", "activities": ["Complete values exercise", "Gather strength feedback", "Define success metrics"]},
      {"title": "Exploring Career History", "description": "Analyze past roles for patterns of satisfaction", "activities": ["Map career timeline", "Identify peak experiences", "Note energy drains"]},
      {"title": "Visioning Your Ideal Path", "description": "Create a vision for meaningful work", "activities": ["Design ideal workday", "Explore possibilities", "Set career intentions"]},
      {"title": "Creating Action Steps", "description": "Develop concrete steps toward career fulfillment", "activities": ["Build transition plan", "Network strategically", "Take first steps"]}
    ]'::jsonb,
    ARRAY['career', 'purpose', 'personal-growth'],
    6
  ),
  (
    'Healing Family Dynamics',
    'Understand and transform challenging family patterns for greater peace and connection.',
    '[
      {"title": "Family System Mapping", "description": "Create a map of family relationships and dynamics", "activities": ["Draw family genogram", "Identify roles and patterns", "Note inherited beliefs"]},
      {"title": "Understanding Your Role", "description": "Explore your position and patterns in the family system", "activities": ["Identify your family role", "Examine coping strategies", "Recognize triggers"]},
      {"title": "Setting Healthy Boundaries", "description": "Develop and implement appropriate family boundaries", "activities": ["Define personal limits", "Practice boundary statements", "Handle resistance"]},
      {"title": "Rewriting Your Story", "description": "Create a new narrative around family experiences", "activities": ["Reframe past events", "Find meaning in challenges", "Celebrate growth"]}
    ]'::jsonb,
    ARRAY['family', 'relationships', 'healing'],
    8
  ),
  (
    'Overcoming Perfectionism',
    'Release the grip of perfectionism and embrace authentic self-expression.',
    '[
      {"title": "Understanding Perfectionism Origins", "description": "Explore where perfectionist tendencies began", "activities": ["Identify early messages", "Examine fear of failure", "Note perfectionist costs"]},
      {"title": "Challenging Perfect Standards", "description": "Question and adjust unrealistic expectations", "activities": ["Reality-test standards", "Practice good enough", "Celebrate imperfection"]},
      {"title": "Embracing Self-Compassion", "description": "Develop a kinder inner dialogue", "activities": ["Practice self-compassion", "Rewrite inner critic", "Celebrate efforts"]},
      {"title": "Living Authentically", "description": "Express your true self without perfect facades", "activities": ["Share vulnerabilities", "Take imperfect action", "Value authenticity"]}
    ]'::jsonb,
    ARRAY['personal-growth', 'self-compassion', 'authenticity'],
    6
  ),
  (
    'Building Emotional Resilience',
    'Strengthen your ability to navigate life challenges with greater ease and confidence.',
    '[
      {"title": "Emotional Awareness Foundation", "description": "Build awareness of emotional patterns and triggers", "activities": ["Track emotional states", "Identify triggers", "Name emotions precisely"]},
      {"title": "Stress Response Mastery", "description": "Develop healthy coping strategies for stress", "activities": ["Learn regulation techniques", "Practice grounding exercises", "Build coping toolkit"]},
      {"title": "Cultivating Inner Resources", "description": "Strengthen internal support systems", "activities": ["Develop self-soothing", "Build confidence practices", "Create safety anchors"]},
      {"title": "Thriving Through Challenges", "description": "Apply resilience skills to current life challenges", "activities": ["Face fears gradually", "Practice bounce-back", "Celebrate resilience wins"]}
    ]'::jsonb,
    ARRAY['emotional-wellness', 'resilience', 'personal-growth'],
    5
  );

-- Sample wellness tips and resources (could be stored in a separate table)
-- These could be displayed as daily tips or in the resource center
CREATE TABLE IF NOT EXISTS public.wellness_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  resource_type TEXT DEFAULT 'article',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.wellness_resources (category, title, content, resource_type) VALUES
  ('self-reflection', 'The Power of Journaling', 'Regular journaling helps process emotions, identify patterns, and track personal growth. Try writing for just 10 minutes each morning to start your day with clarity.', 'tip'),
  ('mindfulness', 'Simple Breathing Exercise', 'When feeling overwhelmed, try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8. This activates your parasympathetic nervous system, promoting calm.', 'exercise'),
  ('relationships', 'Active Listening Practice', 'Improve relationships by practicing active listening: Give full attention, reflect what you hear, and ask clarifying questions before responding.', 'tip'),
  ('personal-growth', 'Growth Mindset Reminder', 'View challenges as opportunities to learn rather than threats to your competence. Ask yourself: What can this situation teach me?', 'insight'),
  ('emotional-wellness', 'Emotion Wheel Tool', 'When struggling to identify feelings, use an emotion wheel to expand your emotional vocabulary and better understand your inner experience.', 'tool'),
  ('self-care', 'Setting Boundaries', 'Healthy boundaries are not walls; they are gates that allow good things in and keep harmful things out. Practice saying no to protect your energy.', 'insight'),
  ('crisis-support', 'When to Seek Help', 'If you are experiencing thoughts of self-harm, persistent hopelessness, or inability to function in daily life, please reach out to a mental health professional immediately. Call 988 for immediate support.', 'resource');

-- Sample affirmations
CREATE TABLE IF NOT EXISTS public.daily_affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affirmation TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.daily_affirmations (affirmation, category) VALUES
  ('I am worthy of love and respect exactly as I am.', 'self-worth'),
  ('My feelings are valid and deserve to be acknowledged.', 'emotional-validation'),
  ('I have the strength to handle whatever comes my way.', 'resilience'),
  ('I am learning and growing every day.', 'growth'),
  ('I choose progress over perfection.', 'self-compassion'),
  ('My story matters and has value.', 'self-worth'),
  ('I trust my ability to make good decisions.', 'confidence'),
  ('I am allowed to take up space and express my needs.', 'boundaries'),
  ('Every challenge is an opportunity for growth.', 'growth'),
  ('I am becoming the person I want to be.', 'personal-development');