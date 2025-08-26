# InnerRoot - Personal Growth & Self-Discovery Wellness Platform

A comprehensive wellness platform focused on personal growth, self-discovery, and emotional wellness through AI-powered conversations and pattern exploration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Anthropic API key

### Setup Instructions

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL scripts in order:
     - `supabase/schema.sql` - Creates all tables and policies
     - `supabase/seed.sql` - Adds initial data

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials (already added if you provided them)
   - Add your Anthropic API key
   - Generate a NextAuth secret: `openssl rand -base64 32`

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
innerroot-platform/
├── app/                    # Next.js 14 app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── navigation/       # Nav components
├── lib/                  # Utility libraries
│   └── supabase/        # Supabase clients
├── types/               # TypeScript types
├── contexts/            # React contexts
└── supabase/           # Database scripts
```

## ✅ Completed Features

- ✅ Next.js 14 with TypeScript setup
- ✅ Tailwind CSS configuration
- ✅ Supabase integration
- ✅ Database schema with RLS policies
- ✅ Authentication context
- ✅ Core UI components
- ✅ Navigation (Navbar & Footer)
- ✅ Landing page with features
- ✅ Responsive design

## 🚧 Next Steps

The following features are ready to be implemented:

### Authentication Pages
- Login page (`/login`)
- Signup page (`/signup`) 
- Password reset flow

### Core User Features
- User Dashboard (`/dashboard`)
- AI Growth Coach (`/coach`)
- Wellness Tracking (`/wellness`)
- Personal Insights (`/insights`)
- Growth Journeys (`/journeys`)
- Life Story Mapping (`/story-map`)

### AI Integration
- Anthropic Claude API integration
- Conversation management
- Pattern recognition
- Crisis detection

### Community Features
- Community posts and comments
- Peer support groups
- Anonymous sharing

### Additional Features
- Human coaching integration
- Subscription management
- Admin dashboard
- Analytics and metrics

## 🔐 Security & Privacy

- All user data is protected with Row Level Security (RLS) in Supabase
- Users can only access their own data
- Enterprise-grade encryption for sensitive information
- GDPR-compliant data handling

## 📝 Important Disclaimers

InnerRoot is a personal growth and wellness platform designed for self-discovery and emotional wellness. This app is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any medical or mental health condition.

**Crisis Support:** If experiencing a mental health emergency, please contact:
- Emergency Services: 911
- Crisis Hotline: 988
- Or seek immediate professional help

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📚 Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Anthropic Claude API
- **Icons:** Lucide React
- **State Management:** Zustand
- **Animations:** Framer Motion

## 🤝 Contributing

This is a wellness platform focused on helping people with personal growth and self-discovery. Please ensure any contributions align with our mission of providing safe, supportive tools for emotional wellness.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for personal growth and self-discovery