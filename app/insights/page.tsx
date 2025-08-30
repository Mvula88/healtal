'use client'

import { motion } from 'framer-motion'
import { useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Skeleton, CardSkeleton, StatsSkeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp,
  Activity,
  Brain,
  Target,
  Award,
  AlertTriangle,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
  Heart,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  CheckCircle
} from 'lucide-react'
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  
  const metrics = [
    { label: 'Average Mood', value: 3.8, change: 12, trend: 'up', unit: '/5' },
    { label: 'Pattern Recognition', value: 85, change: 23, trend: 'up', unit: '%' },
    { label: 'Coping Strategy Use', value: 6.2, change: -8, trend: 'down', unit: '/day' },
    { label: 'Anxiety Level', value: 2.8, change: -15, trend: 'down', unit: '/5' }
  ]

  const moodTrendData = [
    { date: 'Mon', mood: 3.2, anxiety: 3.5, energy: 2.8 },
    { date: 'Tue', mood: 3.5, anxiety: 3.2, energy: 3.0 },
    { date: 'Wed', mood: 3.8, anxiety: 2.9, energy: 3.5 },
    { date: 'Thu', mood: 3.6, anxiety: 3.1, energy: 3.2 },
    { date: 'Fri', mood: 4.0, anxiety: 2.7, energy: 3.8 },
    { date: 'Sat', mood: 4.2, anxiety: 2.5, energy: 4.0 },
    { date: 'Sun', mood: 3.9, anxiety: 2.8, energy: 3.6 }
  ]

  const patternDistribution = [
    { name: 'Anxiety', value: 35, color: '#8B5CF6' },
    { name: 'Relationship', value: 25, color: '#3B82F6' },
    { name: 'Work Stress', value: 20, color: '#10B981' },
    { name: 'Self-Worth', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#6B7280' }
  ]

  const radarData = [
    { subject: 'Mood', A: 75, fullMark: 100 },
    { subject: 'Energy', A: 68, fullMark: 100 },
    { subject: 'Social', A: 55, fullMark: 100 },
    { subject: 'Work', A: 72, fullMark: 100 },
    { subject: 'Sleep', A: 60, fullMark: 100 },
    { subject: 'Exercise', A: 45, fullMark: 100 }
  ]

  return (
    <AuthProvider>
      <div className="min-h-screen relative">
        {/* Animated Background */}
        <motion.div className="absolute inset-0 -z-10">
          <motion.div 
            className="orb orb-teal w-[600px] h-[600px] -top-48 -right-48"
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="orb orb-cyan w-[500px] h-[500px] -bottom-32 -left-32"
            animate={{ 
              y: [0, 20, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Personal <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your progress and discover meaningful patterns in your mental wellness journey
            </p>
            
            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4 text-teal-500" />
                <span>AI analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-teal-500" />
                <span>Personalized insights</span>
              </div>
            </div>
          </motion.div>

          <div className="mb-8 flex justify-between items-start">
            <Button className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
              <Card className="trust-badge">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold">
                        {metric.value}{metric.unit}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
            <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Weekly Mood Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="anxiety" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="energy" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
            <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Life Balance Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}