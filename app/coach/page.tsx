'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
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
  Loader2
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
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
    alert('If you\'re in crisis, please reach out for immediate help:\n\n' +
          '• Crisis Hotline: 988\n' +
          '• Emergency: 911\n' +
          '• Text HOME to 741741')
  }

  const conversationStarters = [
    "I'd like to explore my relationship patterns",
    "Help me understand why I react this way",
    "I want to work on setting boundaries",
    "I'm feeling stuck in my career",
    "I'd like to understand my family dynamics better"
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
              New Conversation
            </Button>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Recent Sessions</h3>
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
                  No conversations yet. Start a new session!
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
                    <p className="text-sm text-gray-500">AI Growth Coach Session</p>
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
                        <Sparkles className="h-5 w-5 mr-2 text-primary" />
                        Welcome to Your Growth Session
                      </CardTitle>
                      <CardDescription>
                        I'm here to help you explore your thoughts, understand patterns, and support your personal growth journey.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        You might want to explore:
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
                <div className="flex space-x-4">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Share what's on your mind..."
                    className="flex-1"
                    disabled={thinking}
                  />
                  <Button onClick={sendMessage} disabled={!inputMessage.trim() || thinking}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your conversations are private and secure. If you're in crisis, please call 988.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-6 w-6 mr-2 text-primary" />
                    AI Growth Coach
                  </CardTitle>
                  <CardDescription>
                    Start a conversation to explore your personal growth journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a previous conversation or start a new session to begin exploring your thoughts and patterns.
                  </p>
                  <Button onClick={createNewConversation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Session
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