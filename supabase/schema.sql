-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'explore', 'transform', 'enterprise');
CREATE TYPE conversation_type AS ENUM ('exploration', 'reflection', 'crisis_support', 'growth_journey');
CREATE TYPE insight_type AS ENUM ('pattern', 'connection', 'breakthrough', 'opportunity');
CREATE TYPE message_role AS ENUM ('user', 'coach');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  growth_goals JSONB DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}'
);

-- AI Growth Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  conversation_type conversation_type DEFAULT 'exploration',
  tags TEXT[] DEFAULT '{}',
  insights_generated JSONB DEFAULT '{}'
);

-- Conversation Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Personal Insights & Patterns
CREATE TABLE IF NOT EXISTS public.personal_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight_type insight_type NOT NULL,
  content JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_validated BOOLEAN DEFAULT FALSE
);

-- Wellness Tracking
CREATE TABLE IF NOT EXISTS public.wellness_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  life_satisfaction JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  context JSONB DEFAULT '{}'
);

-- Personal Growth Journeys
CREATE TABLE IF NOT EXISTS public.growth_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  focus_areas TEXT[] DEFAULT '{}',
  estimated_duration_weeks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- User Journey Progress
CREATE TABLE IF NOT EXISTS public.user_journey_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  journey_id UUID REFERENCES public.growth_journeys(id) ON DELETE CASCADE NOT NULL,
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  insights_gained JSONB DEFAULT '[]',
  progress_notes TEXT,
  UNIQUE(user_id, journey_id)
);

-- Life Story Timeline
CREATE TABLE IF NOT EXISTS public.life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  approximate_date DATE,
  emotional_impact INTEGER CHECK (emotional_impact >= 1 AND emotional_impact <= 10),
  life_area TEXT,
  patterns_identified TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Coaching Sessions
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  session_type TEXT,
  notes JSONB DEFAULT '{}',
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Community Comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_personal_insights_user_id ON public.personal_insights(user_id);
CREATE INDEX idx_wellness_entries_user_id ON public.wellness_entries(user_id);
CREATE INDEX idx_wellness_entries_created_at ON public.wellness_entries(created_at);
CREATE INDEX idx_life_events_user_id ON public.life_events(user_id);
CREATE INDEX idx_user_journey_progress_user_id ON public.user_journey_progress(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Users can manage messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can manage their own insights
CREATE POLICY "Users can view own insights" ON public.personal_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" ON public.personal_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.personal_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own wellness entries
CREATE POLICY "Users can view own wellness entries" ON public.wellness_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wellness entries" ON public.wellness_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness entries" ON public.wellness_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness entries" ON public.wellness_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own life events
CREATE POLICY "Users can view own life events" ON public.life_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own life events" ON public.life_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life events" ON public.life_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life events" ON public.life_events
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view and manage their journey progress
CREATE POLICY "Users can view own journey progress" ON public.user_journey_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journey progress" ON public.user_journey_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey progress" ON public.user_journey_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view active growth journeys
CREATE POLICY "Everyone can view active journeys" ON public.growth_journeys
  FOR SELECT USING (is_active = TRUE);

-- Users can view and manage their coaching sessions
CREATE POLICY "Users can view own coaching sessions" ON public.coaching_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coaching sessions" ON public.coaching_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coaching sessions" ON public.coaching_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Everyone can view community posts" ON public.community_posts
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create own posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Community comments policies
CREATE POLICY "Everyone can view comments" ON public.community_comments
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create own comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Subscription plans are public
CREATE POLICY "Everyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (TRUE);

-- Function to automatically create a user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, features) VALUES
  ('Discover', 'free', 0.00, '["Basic mood tracking", "3 AI conversations per month", "Community access"]'),
  ('Explore', 'explore', 19.99, '["Unlimited AI conversations", "Pattern insights", "Journey programs", "Priority support"]'),
  ('Transform', 'transform', 39.99, '["Everything in Explore", "Human coaching sessions", "Advanced analytics", "Custom journeys", "API access"]'),
  ('Enterprise', 'enterprise', NULL, '["Custom pricing", "Dedicated support", "Team management", "Advanced integrations", "HIPAA compliance"]')
ON CONFLICT (tier) DO NOTHING;