'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navigation/navbar'
import { CrisisResources } from '@/components/crisis-resources'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG, CRISIS_RESOURCES } from '@/lib/config'
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
  PlayCircle
} from 'lucide-react'
import { format } from 'date-fns'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
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

  const createNewConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          title: `Session - ${format(new Date(), 'MMM d, yyyy')}`,
          conversation_type: 'exploration'
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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
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
          userId: user?.id
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

  const conversationStarters = [
    "Help me understand the root cause of my relationship patterns",
    "Why do I keep repeating the same behaviors?",
    "I want to discover what's really behind my anxiety",
    "Help me connect my past experiences to current challenges",
    "I'd like to explore the deeper reasons for my reactions"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Conversations List */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <Button onClick={createNewConversation} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Pattern Discovery
            </Button>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Pattern Exploration History</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-primary/10 border-primary/20 border'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-gray-500">
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
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{currentConversation.title}</h2>
                    <p className="text-sm text-gray-500">{APP_CONFIG.name} Pattern Discovery Session</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                  <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                        Let's Discover Your Root Patterns
                      </CardTitle>
                      <CardDescription>
                        I'm here to help you understand the deeper origins of your patterns and behaviors. Together we'll explore the 'why' behind your experiences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Common patterns to explore:
                      </p>
                      <div className="space-y-2">
                        {conversationStarters.map((starter, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(starter)}
                            className="block w-full text-left p-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {starter}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200'
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
                          ? 'bg-primary text-white' 
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
                        voiceMode ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            className="flex-1"
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
                        placeholder="What pattern would you like to understand?..."
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
                      <Button onClick={sendMessage} disabled={!inputMessage.trim() || thinking}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {APP_CONFIG.name} is a personal growth coach for educational purposes. If you're in crisis, please call 988.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-6 w-6 mr-2 text-primary" />
                    {APP_CONFIG.name} Pattern Coach
                  </CardTitle>
                  <CardDescription>
                    Discover the root causes behind your patterns and behaviors
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Ready to understand why you do what you do? Start a pattern discovery session to explore the deeper origins of your behaviors.
                  </p>
                  <Button onClick={createNewConversation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Pattern Discovery
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
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