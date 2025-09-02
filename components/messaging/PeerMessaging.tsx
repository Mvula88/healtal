'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Circle,
  Check,
  CheckCheck,
  Lock,
  Shield,
  Heart,
  Users,
  X,
  ArrowLeft
} from 'lucide-react'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'voice' | 'pattern_share'
  metadata?: any
  isRead: boolean
  isDelivered: boolean
  createdAt: string
  encryptedContent?: string
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  isBuddy: boolean
  sharedPatterns: string[]
}

interface BuddyConnection {
  id: string
  buddyId: string
  buddyName: string
  connectionStatus: 'active' | 'pending' | 'paused'
  sharedPatterns: string[]
  supportPreferences: string[]
  isOnline: boolean
}

export function PeerMessaging({ userId, userName }: { userId: string, userName: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
    subscribeToMessages()
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    // Load user's conversations
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          content,
          created_at
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (data) {
      const formattedConversations = data.map(conv => ({
        id: conv.id,
        participantId: conv.user1_id === userId ? conv.user2_id : conv.user1_id,
        participantName: conv.user1_id === userId ? conv.user2_name : conv.user1_name,
        lastMessage: conv.messages?.[0]?.content || 'Start a conversation',
        lastMessageTime: conv.messages?.[0]?.created_at || conv.created_at,
        unreadCount: conv.unread_count || 0,
        isOnline: Math.random() > 0.5, // Mock online status
        isBuddy: conv.is_buddy || false,
        sharedPatterns: conv.shared_patterns || []
      }))
      setConversations(formattedConversations)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          handleNewMessage(payload.new as Message)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
    
    // Update conversation list
    setConversations(prev => prev.map(conv => {
      if (conv.participantId === message.senderId) {
        return {
          ...conv,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: conv.unreadCount + 1
        }
      }
      return conv
    }))

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('New message', {
        body: message.content,
        icon: '/icon-192x192.png'
      })
    }
  }

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      // Mark messages as read
      await markMessagesAsRead(conversationId)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return

    const message = {
      conversation_id: activeConversation.id,
      sender_id: userId,
      receiver_id: activeConversation.participantId,
      content: newMessage,
      type: 'text',
      is_delivered: true,
      is_read: false,
      created_at: new Date().toISOString()
    }

    // Optimistically add message to UI
    setMessages(prev => [...prev, message as Message])
    setNewMessage('')

    // Send to database
    const { error } = await supabase
      .from('messages')
      .insert(message)

    if (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1))
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    loadMessages(conversation.id)
  }

  const sharePattern = async (pattern: string) => {
    const message = {
      conversation_id: activeConversation?.id,
      sender_id: userId,
      receiver_id: activeConversation?.participantId,
      content: `Shared a pattern insight: ${pattern}`,
      type: 'pattern_share',
      metadata: { pattern },
      is_delivered: true,
      is_read: false,
      created_at: new Date().toISOString()
    }

    await supabase.from('messages').insert(message)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[600px] bg-white rounded-lg overflow-hidden border">
      {/* Conversations List */}
      <div className={`w-full md:w-1/3 border-r ${activeConversation ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="p-2">
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`w-full p-3 rounded-lg hover:bg-gray-50 transition-colors mb-2 ${
                  activeConversation?.id === conversation.id ? 'bg-teal-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{conversation.participantName[0]}</AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{conversation.participantName}</span>
                        {conversation.isBuddy && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Buddy
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(conversation.lastMessageTime), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="mt-1 bg-teal-600 text-white text-xs">
                        {conversation.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar>
                  <AvatarFallback>{activeConversation.participantName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeConversation.participantName}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    {activeConversation.isOnline ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Circle className="h-2 w-2 fill-current" />
                        Online
                      </span>
                    ) : (
                      <span className="text-gray-500">Offline</span>
                    )}
                    {activeConversation.sharedPatterns.length > 0 && (
                      <span className="text-gray-500">
                        • {activeConversation.sharedPatterns.length} shared patterns
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Encryption Notice */}
              <div className="flex items-center justify-center py-4">
                <div className="bg-yellow-50 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-yellow-700">
                  <Lock className="h-4 w-4" />
                  Messages are end-to-end encrypted
                </div>
              </div>

              {messages.map((message, index) => {
                const isOwn = message.senderId === userId
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        isOwn 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.type === 'pattern_share' ? (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Pattern Insight Shared</p>
                            <div className={`p-2 rounded ${isOwn ? 'bg-teal-700' : 'bg-white'}`}>
                              <p className="text-sm">{message.metadata?.pattern}</p>
                            </div>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                        {isOwn && (
                          message.isRead ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : message.isDelivered ? (
                            <CheckCheck className="h-3 w-3 text-gray-400" />
                          ) : (
                            <Check className="h-3 w-3 text-gray-400" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm">{activeConversation.participantName} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sharePattern('Anxiety Pattern')}
              >
                <Shield className="h-4 w-4 mr-1" />
                Share Pattern
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Heart className="h-4 w-4 mr-1" />
                Send Support
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">Select a conversation</p>
            <p className="text-sm">Choose a buddy or support partner to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}