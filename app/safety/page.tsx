'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { CRISIS_RESOURCES } from '@/lib/config'
import { 
  Shield,
  Phone,
  Heart,
  AlertTriangle,
  Users,
  Home,
  Sparkles,
  Plus,
  X,
  Edit,
  Save,
  CheckCircle,
  MessageCircle,
  Zap,
  AlertCircle as SOS,
  PhoneCall,
  MapPin,
  User,
  Clock,
  FileText,
  Download,
  Share2,
  Brain,
  Waves,
  Target,
  Calendar,
  Timer,
  UserCheck,
  Activity,
  Lightbulb,
  AlertCircle
} from 'lucide-react'

interface SafetyContact {
  id: string
  name: string
  phone: string
  relationship: string
  isEmergency: boolean
}

interface SafetyPlan {
  warning_signs: string[]
  coping_strategies: string[]
  support_contacts: SafetyContact[]
  safe_environments: string[]
  professional_contacts: SafetyContact[]
  emergency_services: SafetyContact[]
  personal_strengths: string[]
  reasons_for_living: string[]
  trigger_warnings: string[]
  alternative_activities: string[]
  recovery_tools: string[]
  relapse_warning_signs: string[]
  emergency_action_plan: string
}

function SafetyContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
    warning_signs: [],
    coping_strategies: [],
    support_contacts: [],
    safe_environments: [],
    professional_contacts: [],
    emergency_services: [
      { id: '1', name: '988 Crisis Lifeline', phone: '988', relationship: 'Crisis Support', isEmergency: true },
      { id: '2', name: 'Emergency Services', phone: '911', relationship: 'Emergency', isEmergency: true },
      { id: '3', name: 'Crisis Text Line', phone: 'Text HOME to 741741', relationship: 'Text Support', isEmergency: true },
      { id: '4', name: 'SAMHSA National Helpline', phone: '1-800-662-4357', relationship: 'Addiction Support', isEmergency: true },
      { id: '5', name: 'Alcohol Helpline', phone: '1-800-662-2873', relationship: 'Alcohol Support', isEmergency: true },
      { id: '6', name: 'Drug Abuse Hotline', phone: '1-844-289-0879', relationship: 'Drug Support', isEmergency: true },
      { id: '7', name: 'National Problem Gambling Helpline', phone: '1-800-522-4700', relationship: 'Gambling Support', isEmergency: true }
    ],
    personal_strengths: [],
    reasons_for_living: [],
    trigger_warnings: [],
    alternative_activities: [],
    recovery_tools: [],
    relapse_warning_signs: [],
    emergency_action_plan: ''
  })
  
  const [editMode, setEditMode] = useState(false)
  const [newWarningSign, setNewWarningSign] = useState('')
  const [newCopingStrategy, setNewCopingStrategy] = useState('')
  const [newSafePlace, setNewSafePlace] = useState('')
  const [newStrength, setNewStrength] = useState('')
  const [newReason, setNewReason] = useState('')
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' })
  const [showCrisisMode, setShowCrisisMode] = useState(false)
  const [showCravingEmergency, setShowCravingEmergency] = useState(false)
  const [haltCheck, setHaltCheck] = useState({ hungry: false, angry: false, lonely: false, tired: false })
  const [urgeSurfingTimer, setUrgeSurfingTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [newTrigger, setNewTrigger] = useState('')
  const [newActivity, setNewActivity] = useState('')
  const [newTool, setNewTool] = useState('')
  const [newRelapseSign, setNewRelapseSign] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchSafetyPlan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchSafetyPlan = async () => {
    try {
      const { data } = await supabase
        .from('crisis_safety_plans')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single()
      
      if (data) {
        setSafetyPlan({
          warning_signs: data.warning_signs || [],
          coping_strategies: data.coping_strategies || [],
          support_contacts: data.support_contacts || [],
          safe_environments: data.safe_environments || [],
          professional_contacts: data.professional_contacts || [],
          emergency_services: data.emergency_services || safetyPlan.emergency_services,
          personal_strengths: data.personal_strengths || [],
          reasons_for_living: data.reasons_for_living || [],
          trigger_warnings: data.trigger_warnings || [],
          alternative_activities: data.alternative_activities || [],
          recovery_tools: data.recovery_tools || [],
          relapse_warning_signs: data.relapse_warning_signs || [],
          emergency_action_plan: data.emergency_action_plan || ''
        })
      }
    } catch (error) {
      console.error('Error fetching safety plan:', error)
    }
  }

  const saveSafetyPlan = async () => {
    if (!user) return
    
    try {
      await supabase
        .from('crisis_safety_plans')
        .upsert({
          user_id: user.id,
          ...safetyPlan,
          is_active: true,
          updated_at: new Date().toISOString()
        })
      
      setEditMode(false)
      alert('Safety plan saved successfully!')
    } catch (error) {
      console.error('Error saving safety plan:', error)
    }
  }

  // Timer for urge surfing
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && urgeSurfingTimer < 600) { // 10 minutes max
      interval = setInterval(() => {
        setUrgeSurfingTimer(prev => prev + 1)
      }, 1000)
    } else if (urgeSurfingTimer >= 600) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, urgeSurfingTimer])

  const startUrgeSurfing = () => {
    setUrgeSurfingTimer(0)
    setIsTimerRunning(true)
  }

  const stopUrgeSurfing = () => {
    setIsTimerRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addWarningSign = () => {
    if (newWarningSign.trim()) {
      setSafetyPlan({
        ...safetyPlan,
        warning_signs: [...safetyPlan.warning_signs, newWarningSign]
      })
      setNewWarningSign('')
    }
  }

  const addCopingStrategy = () => {
    if (newCopingStrategy.trim()) {
      setSafetyPlan({
        ...safetyPlan,
        coping_strategies: [...safetyPlan.coping_strategies, newCopingStrategy]
      })
      setNewCopingStrategy('')
    }
  }

  const addContact = (type: 'support' | 'professional') => {
    if (newContact.name && newContact.phone) {
      const contact: SafetyContact = {
        id: crypto.randomUUID(),
        ...newContact,
        isEmergency: false
      }
      
      if (type === 'support') {
        setSafetyPlan({
          ...safetyPlan,
          support_contacts: [...safetyPlan.support_contacts, contact]
        })
      } else {
        setSafetyPlan({
          ...safetyPlan,
          professional_contacts: [...safetyPlan.professional_contacts, contact]
        })
      }
      
      setNewContact({ name: '', phone: '', relationship: '' })
    }
  }

  const removeItem = (category: keyof SafetyPlan, index: number) => {
    const updated = { ...safetyPlan }
    if (Array.isArray(updated[category])) {
      ;(updated[category] as any[]).splice(index, 1)
      setSafetyPlan(updated)
    }
  }

  const exportPlan = () => {
    const planText = `
SAFETY PLAN
Created: ${new Date().toLocaleDateString()}

WARNING SIGNS:
${safetyPlan.warning_signs.map(s => `• ${s}`).join('\n')}

COPING STRATEGIES:
${safetyPlan.coping_strategies.map(s => `• ${s}`).join('\n')}

SUPPORT CONTACTS:
${safetyPlan.support_contacts.map(c => `• ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}

SAFE PLACES:
${safetyPlan.safe_environments.map(s => `• ${s}`).join('\n')}

PROFESSIONAL HELP:
${safetyPlan.professional_contacts.map(c => `• ${c.name}: ${c.phone}`).join('\n')}

EMERGENCY CONTACTS:
${safetyPlan.emergency_services.map(c => `• ${c.name}: ${c.phone}`).join('\n')}

PERSONAL STRENGTHS:
${safetyPlan.personal_strengths.map(s => `• ${s}`).join('\n')}

REASONS FOR LIVING:
${safetyPlan.reasons_for_living.map(s => `• ${s}`).join('\n')}

TRIGGER WARNINGS:
${safetyPlan.trigger_warnings?.map(s => `• ${s}`).join('\n') || ''}

ALTERNATIVE ACTIVITIES:
${safetyPlan.alternative_activities?.map(s => `• ${s}`).join('\n') || ''}

RECOVERY TOOLS:
${safetyPlan.recovery_tools?.map(s => `• ${s}`).join('\n') || ''}

RELAPSE WARNING SIGNS:
${safetyPlan.relapse_warning_signs?.map(s => `• ${s}`).join('\n') || ''}

EMERGENCY ACTION PLAN:
${safetyPlan.emergency_action_plan || ''}
    `
    
    const blob = new Blob([planText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'safety-plan.txt'
    a.click()
  }

  if (showCravingEmergency) {
    return (
      <div className="min-h-screen bg-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6 border-orange-500 bg-orange-100">
            <Brain className="h-4 w-4" />
            <AlertDescription className="text-lg font-medium">
              You're experiencing a craving - this is normal and temporary. Let's work through it together.
            </AlertDescription>
          </Alert>

          {/* HALT Check */}
          <Card className="mb-6 border-2 border-orange-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                HALT Check
              </CardTitle>
              <CardDescription>
                Check if you're Hungry, Angry, Lonely, or Tired - basic needs that can trigger cravings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(haltCheck).map(([key, checked]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={key}
                      checked={checked}
                      onChange={(e) => setHaltCheck({...haltCheck, [key]: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor={key} className="capitalize text-sm font-medium">
                      {key}
                    </label>
                  </div>
                ))}
              </div>
              {Object.values(haltCheck).some(v => v) && (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Address these basic needs first - they may be contributing to your craving.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Urge Surfing Timer */}
          <Card className="mb-6 border-2 border-teal-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-teal-500" />
                Urge Surfing - Ride the Wave
              </CardTitle>
              <CardDescription>
                Cravings peak and pass like waves. Time yours to see it's temporary.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-teal-600 mb-4">
                {formatTime(urgeSurfingTimer)}
              </div>
              <div className="space-x-4">
                {!isTimerRunning ? (
                  <Button onClick={startUrgeSurfing} className="bg-teal-600 hover:bg-teal-700">
                    <Timer className="h-4 w-4 mr-2" />
                    Start Surfing
                  </Button>
                ) : (
                  <Button onClick={stopUrgeSurfing} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Stop Timer
                  </Button>
                )}
              </div>
              {urgeSurfingTimer > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  You've been riding this wave for {formatTime(urgeSurfingTimer)}. Great job staying strong!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Immediate Coping Strategies */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Immediate Coping Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Activity className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Deep Breathing</p>
                    <p className="text-xs text-gray-600">4-7-8 technique: inhale 4, hold 7, exhale 8</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Brain className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Play the Tape Forward</p>
                    <p className="text-xs text-gray-600">Think through the full consequences</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Call Your Sponsor</p>
                    <p className="text-xs text-gray-600">Reach out for immediate support</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Change Your Environment</p>
                    <p className="text-xs text-gray-600">Go to a safe place immediately</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Play the Tape Forward Exercise */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Play the Tape Forward
              </CardTitle>
              <CardDescription>
                Think through what happens if you use - be honest about the consequences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">If I use right now...</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• I'll feel guilt and shame immediately after</li>
                    <li>• I'll have to reset my sobriety counter</li>
                    <li>• I'll disappoint the people who believe in me</li>
                    <li>• I'll risk losing my progress and relationships</li>
                    <li>• I'll feel worse about myself tomorrow</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">If I stay strong right now...</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• I'll be proud of myself for resisting</li>
                    <li>• I'll continue building my recovery strength</li>
                    <li>• I'll keep the trust of my support network</li>
                    <li>• I'll wake up tomorrow without regrets</li>
                    <li>• I'll prove to myself that I can overcome this</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Call for Support Right Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyPlan.support_contacts.slice(0, 4).map(contact => (
                  <div key={contact.id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                    <Button variant="outline" className="w-full mt-2">
                      <Phone className="h-4 w-4 mr-2" />
                      {contact.phone}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowCravingEmergency(false)}
            >
              I'm Feeling Better
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setShowCravingEmergency(false)
                setShowCrisisMode(true)
              }}
            >
              I Need More Help
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showCrisisMode) {
    return (
      <div className="min-h-screen bg-red-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6 border-red-500 bg-red-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-lg font-medium">
              If you're in immediate danger, call 911 or go to your nearest emergency room.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {safetyPlan.emergency_services.map(contact => (
              <Card key={contact.id} className="border-2 border-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{contact.name}</h3>
                      <p className="text-2xl font-bold text-red-600">{contact.phone}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                    </div>
                    <PhoneCall className="h-8 w-8 text-red-500" />
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {safetyPlan.coping_strategies.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Try These Coping Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {safetyPlan.coping_strategies.slice(0, 5).map((strategy, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{strategy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {safetyPlan.support_contacts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Support Network</CardTitle>
                <CardDescription>People who care about you and can help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safetyPlan.support_contacts.map(contact => (
                    <div key={contact.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <Button variant="outline" className="w-full mt-2">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowCrisisMode(false)}
          >
            Exit Crisis Mode
          </Button>
        </div>
      </div>
    )
  }

  return (
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Safety <span className="gradient-text">Planning</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a personalized safety plan to support you through difficult moments
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-teal-500" />
              <span>Private & secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-teal-500" />
              <span>Crisis support 24/7</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-teal-500" />
              <span>Immediate access</span>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 flex justify-between items-start">
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              variant="destructive"
              onClick={() => setShowCrisisMode(true)}
              className="shadow-lg"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Crisis Mode
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              onClick={() => setShowCravingEmergency(true)}
            >
              <Brain className="h-4 w-4 mr-2" />
              Craving Emergency
            </Button>
            <Button className="btn-secondary" onClick={exportPlan}>
              <Download className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
            {editMode ? (
              <Button className="btn-primary" onClick={saveSafetyPlan}>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
            ) : (
              <Button className="btn-secondary" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
            )}
          </div>
        </div>

        {/* Warning Signs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <Card className="mb-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Warning Signs
            </CardTitle>
            <CardDescription>
              Thoughts, feelings, or behaviors that signal you need to use your safety plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {safetyPlan.warning_signs.map((sign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span>{sign}</span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('warning_signs', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a warning sign..."
                  value={newWarningSign}
                  onChange={(e) => setNewWarningSign(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWarningSign()}
                />
                <Button onClick={addWarningSign}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Coping Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
        <Card className="mb-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Coping Strategies
            </CardTitle>
            <CardDescription>
              Things you can do on your own to feel better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {safetyPlan.coping_strategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>{strategy}</span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('coping_strategies', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a coping strategy..."
                  value={newCopingStrategy}
                  onChange={(e) => setNewCopingStrategy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCopingStrategy()}
                />
                <Button onClick={addCopingStrategy}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Support Contacts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Support Contacts
              </CardTitle>
              <CardDescription>
                Friends and family who can help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {safetyPlan.support_contacts.map((contact, index) => (
                  <div key={contact.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                      {editMode && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const contacts = [...safetyPlan.support_contacts]
                            contacts.splice(index, 1)
                            setSafetyPlan({ ...safetyPlan, support_contacts: contacts })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="space-y-2">
                  <Input
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  />
                  <Button className="w-full" onClick={() => addContact('support')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>

          {/* Safe Places */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Safe Places
              </CardTitle>
              <CardDescription>
                Places where you feel calm and safe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {safetyPlan.safe_environments.map((place, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span>{place}</span>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem('safe_environments', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a safe place..."
                    value={newSafePlace}
                    onChange={(e) => setNewSafePlace(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSafePlace.trim()) {
                        setSafetyPlan({
                          ...safetyPlan,
                          safe_environments: [...safetyPlan.safe_environments, newSafePlace]
                        })
                        setNewSafePlace('')
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (newSafePlace.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        safe_environments: [...safetyPlan.safe_environments, newSafePlace]
                      })
                      setNewSafePlace('')
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Addiction-Specific Crisis Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
        <Card className="mb-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              Addiction Crisis Hotlines
            </CardTitle>
            <CardDescription>
              24/7 support for addiction-related emergencies - you're not alone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold text-lg">SAMHSA National Helpline</h4>
                <p className="text-2xl font-bold text-orange-600">1-800-662-4357</p>
                <p className="text-sm text-gray-600 mt-1">Treatment referral & information service (24/7, 365 days)</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-lg">Alcohol Support Line</h4>
                <p className="text-2xl font-bold text-blue-600">1-800-662-2873</p>
                <p className="text-sm text-gray-600 mt-1">Confidential, free alcohol addiction support</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-lg">Drug Abuse Hotline</h4>
                <p className="text-2xl font-bold text-green-600">1-844-289-0879</p>
                <p className="text-sm text-gray-600 mt-1">Immediate help for drug-related crises</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-bold text-lg">Gambling Helpline</h4>
                <p className="text-2xl font-bold text-purple-600">1-800-522-4700</p>
                <p className="text-sm text-gray-600 mt-1">National problem gambling support</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Recovery-Specific Safety Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trigger Avoidance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-red-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Trigger Warnings
              </CardTitle>
              <CardDescription>
                Situations, people, or places that increase craving risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {safetyPlan.trigger_warnings?.map((trigger, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span>{trigger}</span>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem('trigger_warnings', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )) || []}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a trigger warning..."
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTrigger.trim()) {
                        setSafetyPlan({
                          ...safetyPlan,
                          trigger_warnings: [...(safetyPlan.trigger_warnings || []), newTrigger]
                        })
                        setNewTrigger('')
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (newTrigger.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        trigger_warnings: [...(safetyPlan.trigger_warnings || []), newTrigger]
                      })
                      setNewTrigger('')
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>

          {/* Alternative Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Alternative Activities
              </CardTitle>
              <CardDescription>
                Healthy activities to do instead of using
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {safetyPlan.alternative_activities?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span>{activity}</span>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem('alternative_activities', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )) || []}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an alternative activity..."
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newActivity.trim()) {
                        setSafetyPlan({
                          ...safetyPlan,
                          alternative_activities: [...(safetyPlan.alternative_activities || []), newActivity]
                        })
                        setNewActivity('')
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (newActivity.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        alternative_activities: [...(safetyPlan.alternative_activities || []), newActivity]
                      })
                      setNewActivity('')
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Recovery Toolbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
        <Card className="mb-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-500" />
              Recovery Toolbox
            </CardTitle>
            <CardDescription>
              Your personal collection of recovery tools and techniques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {safetyPlan.recovery_tools?.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-teal-400" />
                    {tool}
                  </span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('recovery_tools', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )) || []}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a recovery tool..."
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTool.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        recovery_tools: [...(safetyPlan.recovery_tools || []), newTool]
                      })
                      setNewTool('')
                    }
                  }}
                />
                <Button onClick={() => {
                  if (newTool.trim()) {
                    setSafetyPlan({
                      ...safetyPlan,
                      recovery_tools: [...(safetyPlan.recovery_tools || []), newTool]
                    })
                    setNewTool('')
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Relapse Prevention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Relapse Warning Signs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-yellow-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Relapse Warning Signs
              </CardTitle>
              <CardDescription>
                Early indicators that you may be at risk - catch them early
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {safetyPlan.relapse_warning_signs?.map((sign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span>{sign}</span>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem('relapse_warning_signs', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )) || []}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a warning sign..."
                    value={newRelapseSign}
                    onChange={(e) => setNewRelapseSign(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newRelapseSign.trim()) {
                        setSafetyPlan({
                          ...safetyPlan,
                          relapse_warning_signs: [...(safetyPlan.relapse_warning_signs || []), newRelapseSign]
                        })
                        setNewRelapseSign('')
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (newRelapseSign.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        relapse_warning_signs: [...(safetyPlan.relapse_warning_signs || []), newRelapseSign]
                      })
                      setNewRelapseSign('')
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>

          {/* Emergency Action Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Emergency Action Plan
              </CardTitle>
              <CardDescription>
                Your step-by-step plan when you're in crisis or feeling close to relapse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  placeholder="Write your emergency action plan...

Example:
1. Acknowledge I'm in crisis
2. Call my sponsor immediately
3. Go to a meeting or safe place
4. Practice breathing exercises
5. Review my reasons for recovery"
                  value={safetyPlan.emergency_action_plan || ''}
                  onChange={(e) => setSafetyPlan({ ...safetyPlan, emergency_action_plan: e.target.value })}
                  className="min-h-32"
                />
              ) : (
                <div className="whitespace-pre-wrap p-3 bg-blue-50 rounded-lg min-h-16">
                  {safetyPlan.emergency_action_plan || 'Click "Edit Plan" to add your emergency action plan.'}
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Support Group Meeting Finder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
        <Card className="mb-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Find Support Group Meetings
            </CardTitle>
            <CardDescription>
              Connect with others in recovery - you don't have to do this alone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium">AA Meetings</p>
                  <p className="text-xs text-gray-600">aa.org/meeting-finder</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium">NA Meetings</p>
                  <p className="text-xs text-gray-600">na.org/meetingsearch</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium">SMART Recovery</p>
                  <p className="text-xs text-gray-600">smartrecovery.org/meetings</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Reasons for Living & Recovery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
        <Card className="mb-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Reasons for Living & Recovery
            </CardTitle>
            <CardDescription>
              Things that are important to you and worth staying sober for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {safetyPlan.reasons_for_living.map((reason, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    {reason}
                  </span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('reasons_for_living', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a reason for living/recovery..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newReason.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        reasons_for_living: [...safetyPlan.reasons_for_living, newReason]
                      })
                      setNewReason('')
                    }
                  }}
                />
                <Button onClick={() => {
                  if (newReason.trim()) {
                    setSafetyPlan({
                      ...safetyPlan,
                      reasons_for_living: [...safetyPlan.reasons_for_living, newReason]
                    })
                    setNewReason('')
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Recovery Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
        <Alert className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <Heart className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Remember:</strong> Recovery is a journey, not a destination. Relapse doesn't mean failure - it's often part of the process. 
            Every day you choose recovery is a victory. You are stronger than your addiction, and you deserve a life of freedom and peace.
          </AlertDescription>
        </Alert>
        </motion.div>
      </div>
    </div>
  )
}

export default function SafetyPage() {
  return (
    <AuthProvider>
      <SafetyContent />
    </AuthProvider>
  )
}