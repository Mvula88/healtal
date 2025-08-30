'use client'

import { motion } from 'framer-motion'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navigation/navbar'
import { CrisisResources } from '@/components/crisis-resources'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { APP_CONFIG, CRISIS_RESOURCES } from '@/lib/config'
import { ADDICTION_RECOVERY_PROMPTS, ADDICTION_SPECIFIC_PROMPTS } from '@/lib/ai-prompts/addiction-recovery'
import { 
  Send, 
  Brain,
  Plus,
  MessageCircle,
  AlertTriangle,
  Heart,
  Sparkles,
  User,
  Bot,
  Loader2,
  Search,
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  StopCircle,
  PlayCircle,
  Shield,
  Calendar,
  Phone,
  Activity,
  CheckCircle,
  Zap
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'coach'
  content: string
  created_at: string
  metadata?: {
    emotional_tone?: string
    patterns_detected?: string[]
    growth_opportunities?: string[]
    referral_suggested?: boolean
  }
}

interface Conversation {
  id: string
  title: string
  created_at: string
  conversation_type: string
  messages?: Message[]
  mode?: 'general' | 'recovery'
  addiction_type?: string
}

interface RecoveryData {
  sobriety_date: string | null
  addiction_type: string
  current_streak: number
  longest_streak: number
}

function CoachContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceMode, setVoiceMode] = useState(false)
  const [coachMode, setCoachMode] = useState<'general' | 'recovery'>('general')
  const [selectedAddictionType, setSelectedAddictionType] = useState<string>('')
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)
  const [showAddictionSelector, setShowAddictionSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchConversations()
      fetchRecoveryData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (data) setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchRecoveryData = async () => {
    try {
      const { data } = await supabase
        .from('recovery_data')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setRecoveryData(data)
        setSelectedAddictionType(data.addiction_type || '')
      }
    } catch (error) {
      console.error('Error fetching recovery data:', error)
    }
  }

  const createNewConversation = async () => {
    try {
      const title = coachMode === 'recovery' 
        ? `Recovery Session - ${format(new Date(), 'MMM d, yyyy')}`
        : `Session - ${format(new Date(), 'MMM d, yyyy')}`

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          title,
          conversation_type: coachMode === 'recovery' ? 'recovery' : 'exploration',
          mode: coachMode,
          addiction_type: selectedAddictionType || null
        })
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setCurrentConversation(data)
        setMessages([])
        await fetchConversations()
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation)
    await fetchMessages(conversation.id)
  }

  const sendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend || !currentConversation) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageToSend,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setThinking(true)

    try {
      // Save user message to database
      await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          role: 'user',
          content: userMessage.content
        })

      // Call AI API (using your Anthropic API)
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversation.id,
          userId: user?.id,
          mode: currentConversation.mode || 'general',
          addictionType: currentConversation.addiction_type
        })
      })

      const data = await response.json()

      if (data.content) {
        const coachMessage: Message = {
          id: crypto.randomUUID(),
          role: 'coach',
          content: data.content,
          created_at: new Date().toISOString(),
          metadata: data.metadata
        }

        setMessages(prev => [...prev, coachMessage])

        // Save coach message to database
        await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversation.id,
            role: 'coach',
            content: coachMessage.content,
            metadata: coachMessage.metadata
          })

        // Check for crisis detection
        if (data.metadata?.referral_suggested) {
          showCrisisResources()
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Show error message to user
    } finally {
      setThinking(false)
    }
  }

  const showCrisisResources = () => {
    // Show crisis resources modal or alert
    const resources = CRISIS_RESOURCES.map(r => `• ${r.name}: ${r.number}`).join('\n')
    alert(`If you're in crisis, please reach out for immediate help:\n\n${resources}\n\nRemember: ${APP_CONFIG.name} is a personal growth coach, not a therapist.`)
  }

  const showAddictionCrisisResources = () => {
    const message = `SAMHSA National Helpline: 1-800-662-4357 (24/7, confidential, free)\n\nAddiction Crisis Text Line: Text HOME to 741741\n\nIf you're in immediate danger, call 911.\n\nYou're not alone in this journey.`
    alert(message)
  }

  const handleQuickAction = async (action: string) => {
    if (!currentConversation) return

    const actionMessages = {
      craving: "I'm having a craving right now and need support getting through it.",
      halt: "Can you help me do a HALT check? I want to understand what I'm really feeling.",
      tape: "Can you help me play the tape forward? I want to think through the consequences.",
      root: "I want to explore what's really driving this urge - what's the root cause?"
    }

    await sendMessage(actionMessages[action as keyof typeof actionMessages])
  }

  const calculateSobrietyDays = () => {
    if (!recoveryData?.sobriety_date) return 0
    return differenceInDays(new Date(), new Date(recoveryData.sobriety_date))
  }

  const handleModeChange = (newMode: 'general' | 'recovery') => {
    setCoachMode(newMode)
    if (newMode === 'recovery' && !selectedAddictionType) {
      setShowAddictionSelector(true)
    } else if (newMode === 'general') {
      setShowAddictionSelector(false)
    }
  }

  const handleAddictionTypeSelect = async (type: string) => {
    setSelectedAddictionType(type)
    setShowAddictionSelector(false)
    
    // Save or update recovery data
    try {
      const existingData = await supabase
        .from('recovery_data')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (existingData.data) {
        await supabase
          .from('recovery_data')
          .update({ addiction_type: type })
          .eq('user_id', user?.id)
      } else {
        await supabase
          .from('recovery_data')
          .insert({
            user_id: user?.id,
            addiction_type: type,
            sobriety_date: new Date().toISOString(),
            current_streak: 0,
            longest_streak: 0
          })
      }
      
      await fetchRecoveryData()
    } catch (error) {
      console.error('Error saving addiction type:', error)
    }
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        
        // Convert audio to text and send as message
        await processVoiceMessage(audioBlob)
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
      }
      setIsPaused(!isPaused)
    }
  }
  
  const processVoiceMessage = async (audioBlob: Blob) => {
    if (!currentConversation) return
    
    setThinking(true)
    
    try {
      // Convert audio to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          resolve(base64.split(',')[1])
        }
        reader.readAsDataURL(audioBlob)
      })
      
      // Save voice session to database
      const { data: voiceSession } = await supabase
        .from('voice_sessions')
        .insert({
          user_id: user?.id,
          conversation_id: currentConversation.id,
          audio_url: base64Audio,
          duration_seconds: recordingTime
        })
        .select()
        .single()
      
      // Transcribe audio (mock for now - would use speech-to-text API)
      const transcription = "I've been feeling overwhelmed lately and I'm not sure why. It seems like every time I try to make progress, something holds me back."
      
      // Create user message with transcription
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `[Voice Message ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}]\n${transcription}`,
        created_at: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, userMessage])
      
      // Save message and get AI response
      await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          role: 'user',
          content: userMessage.content
        })
      
      // Call AI API
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcription,
          conversationId: currentConversation.id,
          userId: user?.id,
          isVoiceMessage: true
        })
      })
      
      const data = await response.json()
      
      if (data.content) {
        const coachMessage: Message = {
          id: crypto.randomUUID(),
          role: 'coach',
          content: data.content,
          created_at: new Date().toISOString(),
          metadata: data.metadata
        }
        
        setMessages(prev => [...prev, coachMessage])
        
        // Save coach message
        await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversation.id,
            role: 'coach',
            content: coachMessage.content,
            metadata: coachMessage.metadata
          })
        
        // Text-to-speech for response if in voice mode
        if (voiceMode && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.content)
          utterance.rate = 0.9
          utterance.pitch = 1.0
          window.speechSynthesis.speak(utterance)
        }
      }
    } catch (error) {
      console.error('Error processing voice message:', error)
    } finally {
      setThinking(false)
      setRecordingTime(0)
      setAudioURL(null)
    }
  }
  
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generalConversationStarters = [
    "Help me understand the root cause of my relationship patterns",
    "Why do I keep repeating the same behaviors?",
    "I want to discover what's really behind my anxiety",
    "Help me connect my past experiences to current challenges",
    "I'd like to explore the deeper reasons for my reactions"
  ]

  const recoveryConversationStarters = [
    "What unmet need is my addiction trying to fulfill?",
    "What painful emotion am I trying to avoid or escape?",
    "How is my childhood trauma connected to my addiction?",
    "What would I be without this pattern?",
    "What am I truly hungry for - beyond the substance/behavior?"
  ]

  const addictionTypes = [
    { id: 'alcohol', label: 'Alcohol', icon: '🍷' },
    { id: 'substances', label: 'Substances', icon: '💊' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'pornography', label: 'Pornography', icon: '🔒' },
    { id: 'food', label: 'Food/Eating', icon: '🍽️' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'gambling', label: 'Gambling', icon: '🎰' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'relationships', label: 'Relationships', icon: '💕' },
    { id: 'social_media', label: 'Social Media', icon: '📱' }
  ]

  const conversationStarters = coachMode === 'recovery' 
    ? recoveryConversationStarters 
    : generalConversationStarters

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-96 h-96 top-20 -right-20 opacity-20"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-cyan w-80 h-80 bottom-10 left-10 opacity-20"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Conversations List */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 overflow-y-auto shadow-lg">
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* Mode Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('general')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  coachMode === 'general'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain className="h-4 w-4 inline mr-2" />
                General
              </button>
              <button
                onClick={() => handleModeChange('recovery')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  coachMode === 'recovery'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Recovery
              </button>
            </div>

            {/* Recovery Day Counter */}
            {coachMode === 'recovery' && recoveryData?.sobriety_date && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Sobriety</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-900">{calculateSobrietyDays()}</div>
                    <div className="text-xs text-emerald-600">days</div>
                  </div>
                </div>
              </div>
            )}

            {/* Crisis Button for Recovery Mode */}
            {coachMode === 'recovery' && (
              <button
                onClick={showAddictionCrisisResources}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Crisis Support</span>
              </button>
            )}

            <button 
              onClick={createNewConversation} 
              className="w-full btn-primary group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {coachMode === 'recovery' ? 'New Recovery Session' : 'New Pattern Discovery'}
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Pattern Exploration History</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    currentConversation?.id === conv.id
                      ? 'bg-teal-50 border border-teal-200 shadow-md'
                      : 'hover:bg-gray-50 hover:shadow-sm border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      currentConversation?.id === conv.id ? 'bg-teal-100' : 'bg-gray-100'
                    }`}>
                      <MessageCircle className={`h-4 w-4 ${
                        currentConversation?.id === conv.id ? 'text-teal-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(conv.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {conversations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No explorations yet. Start discovering your patterns!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${
                      currentConversation.mode === 'recovery' ? 'bg-emerald-100' : 'bg-teal-100'
                    } rounded-xl p-2`}>
                      {currentConversation.mode === 'recovery' ? (
                        <Shield className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Brain className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{currentConversation.title}</h2>
                      <p className="text-sm text-gray-600">
                        {currentConversation.mode === 'recovery' 
                          ? `${APP_CONFIG.name} Recovery Support Session`
                          : `${APP_CONFIG.name} Pattern Discovery Session`}
                      </p>
                      {currentConversation.mode === 'recovery' && currentConversation.addiction_type && (
                        <p className="text-xs text-emerald-600 font-medium">
                          {addictionTypes.find(t => t.id === currentConversation.addiction_type)?.label} Support
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    currentConversation.mode === 'recovery' ? 'bg-emerald-50' : 'bg-teal-50'
                  } px-3 py-1 rounded-full`}>
                    <div className={`w-2 h-2 ${
                      currentConversation.mode === 'recovery' ? 'bg-emerald-500' : 'bg-teal-500'
                    } rounded-full animate-pulse`}></div>
                    <span className={`text-sm ${
                      currentConversation.mode === 'recovery' ? 'text-emerald-700' : 'text-teal-700'
                    } font-medium`}>Active</span>
                  </div>
                </div>
                
                {/* Quick Action Buttons for Recovery Mode */}
                {currentConversation.mode === 'recovery' && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleQuickAction('craving')}
                      className="flex items-center justify-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Craving</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('halt')}
                      className="flex items-center justify-center space-x-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>HALT Check</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('tape')}
                      className="flex items-center justify-center space-x-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      <Activity className="h-3 w-3" />
                      <span>Play Tape</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('root')}
                      className="flex items-center justify-center space-x-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      <Search className="h-3 w-3" />
                      <span>Root Cause</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="mx-auto max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center mb-2">
                        <div className={`${
                          currentConversation.mode === 'recovery' ? 'bg-emerald-100' : 'bg-teal-100'
                        } rounded-lg p-2 mr-3`}>
                          {currentConversation.mode === 'recovery' ? (
                            <Shield className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Lightbulb className="h-5 w-5 text-teal-600" />
                          )}
                        </div>
                        {currentConversation.mode === 'recovery' 
                          ? "Recovery Support & Root Cause Exploration"
                          : "Let's Discover Your Root Patterns"}
                      </h3>
                      <p className="text-gray-600">
                        {currentConversation.mode === 'recovery'
                          ? "This is a safe space to explore your recovery journey. I'll help you understand the deeper needs and pain that your addiction has been trying to address, without judgment."
                          : "I'm here to help you understand the deeper origins of your patterns and behaviors. Together we'll explore the 'why' behind your experiences."}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        {currentConversation.mode === 'recovery' 
                          ? "Recovery patterns to explore:"
                          : "Common patterns to explore:"}
                      </p>
                      <div className="space-y-2">
                        {conversationStarters.map((starter, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(starter)}
                            className={`block w-full text-left p-3 text-sm bg-gray-50 rounded-xl ${
                              currentConversation.mode === 'recovery'
                                ? 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                                : 'hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700'
                            } border border-gray-100 transition-all duration-200 font-medium text-gray-700`}
                          >
                            {starter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-200'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-white border'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.metadata?.patterns_detected && message.metadata.patterns_detected.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">Patterns noticed:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.metadata.patterns_detected.map((pattern, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {pattern}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex justify-start">
                    <div className="flex max-w-2xl">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-white border">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t px-6 py-4">
                {/* Voice Mode Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setVoiceMode(!voiceMode)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        voiceMode ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Voice Mode</span>
                    </button>
                    {voiceMode && (
                      <span className="text-xs text-gray-500">
                        Speak naturally and I'll respond with voice
                      </span>
                    )}
                  </div>
                  {isRecording && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-500">
                          Recording {formatRecordingTime(recordingTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Controls */}
                <div className="flex space-x-4">
                  {voiceMode ? (
                    <>
                      {/* Voice Recording Controls */}
                      <div className="flex-1 flex space-x-2">
                        {!isRecording ? (
                          <Button 
                            onClick={startRecording}
                            className="flex-1 gradient-wellness text-white"
                            disabled={thinking}
                            variant="default"
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            Hold to speak (or click to start)
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={pauseRecording}
                              variant="outline"
                              className="flex-1"
                            >
                              {isPaused ? (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Resume
                                </>
                              ) : (
                                <>
                                  <StopCircle className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={stopRecording}
                              variant="destructive"
                            >
                              <MicOff className="h-4 w-4 mr-2" />
                              Stop & Send
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Text Input */}
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder={
                          currentConversation?.mode === 'recovery'
                            ? "Share what you're experiencing or ask for support..."
                            : "What pattern would you like to understand?..."
                        }
                        className="flex-1"
                        disabled={thinking || isRecording}
                      />
                      <Button 
                        onClick={() => setVoiceMode(true)}
                        variant="outline"
                        disabled={thinking}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => sendMessage()} disabled={!inputMessage.trim() || thinking}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {currentConversation?.mode === 'recovery' 
                    ? `${APP_CONFIG.name} provides educational support only. For medical advice or crisis support, contact SAMHSA: 1-800-662-4357 or call 911.`
                    : `${APP_CONFIG.name} is a personal growth coach for educational purposes. If you're in crisis, please call 988.`}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {coachMode === 'recovery' ? (
                      <Shield className="h-6 w-6 mr-2 text-emerald-600" />
                    ) : (
                      <Brain className="h-6 w-6 mr-2 text-teal-600" />
                    )}
                    {APP_CONFIG.name} {coachMode === 'recovery' ? 'Recovery Support' : 'Pattern Coach'}
                  </CardTitle>
                  <CardDescription>
                    {coachMode === 'recovery' 
                      ? "Compassionate support for addiction recovery through understanding root causes"
                      : "Discover the root causes behind your patterns and behaviors"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {coachMode === 'recovery'
                      ? "Ready for a judgment-free space to explore your recovery? Start a session to understand the deeper needs behind your patterns."
                      : "Ready to understand why you do what you do? Start a pattern discovery session to explore the deeper origins of your behaviors."}
                  </p>
                  <Button 
                    onClick={createNewConversation}
                    className={coachMode === 'recovery' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {coachMode === 'recovery' ? 'Start Recovery Session' : 'Start Pattern Discovery'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Addiction Type Selector Modal */}
      {showAddictionSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Focus Area</h3>
              <p className="text-gray-600 text-sm">
                Choose the area you'd like support with. This helps me provide more relevant guidance.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {addictionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAddictionTypeSelect(type.id)}
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors text-left border-2 border-transparent hover:border-emerald-200"
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddictionSelector(false)}
                className="flex-1 py-2 px-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddictionSelector(false)
                  setCoachMode('general')
                }}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CoachPage() {
  return (
    <AuthProvider>
      <CoachContent />
    </AuthProvider>
  )
}