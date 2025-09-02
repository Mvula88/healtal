'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Brain,
  Heart,
  Sparkles,
  Headphones,
  MessageSquare,
  Activity
} from 'lucide-react'

interface VoiceSession {
  id: string
  audioUrl?: string
  transcription: string
  emotionalTone: {
    primary: string
    confidence: number
    valence: number // -1 to 1 (negative to positive)
    arousal: number // 0 to 1 (calm to excited)
  }
  keyInsights: string[]
  detectedPatterns: string[]
  duration: number
  timestamp: Date
}

export function VoiceInteraction({ userId, conversationId }: { userId: string, conversationId?: string }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcription, setTranscription] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [voiceResponse, setVoiceResponse] = useState('')
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<any>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState('v2/en_speaker_0') // Replicate voice options
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript
          }
        }

        if (final) {
          setTranscription(prev => prev + final)
          analyzeEmotionalTone(final)
        }
        setInterimTranscript(interim)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // Restart recognition
          recognitionRef.current.start()
        }
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = new SpeechSynthesisUtterance()
      synthRef.current.rate = 0.9
      synthRef.current.pitch = 1.0
      synthRef.current.volume = 1.0
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Set up audio visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      visualizeAudio()

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudioRecording(audioBlob)
      }

      mediaRecorderRef.current.start()
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      setIsRecording(false)
      setAudioLevel(0)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        recognitionRef.current?.start()
      } else {
        mediaRecorderRef.current.pause()
        recognitionRef.current?.stop()
      }
      setIsPaused(!isPaused)
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      if (!isRecording) return
      
      analyserRef.current!.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255)
      
      animationFrameRef.current = requestAnimationFrame(updateLevel)
    }
    
    updateLevel()
  }

  const processAudioRecording = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setTranscription(prev => prev + ' [Processing audio...]')

    try {
      // Upload audio to storage
      const fileName = `voice_${userId}_${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, audioBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-recordings')
        .getPublicUrl(fileName)

      // Send to API for processing
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: publicUrl,
          userId,
          conversationId,
          duration: recordingTime,
          transcription: transcription
        })
      })

      const result = await response.json()

      if (result.success) {
        setVoiceResponse(result.response)
        setEmotionalAnalysis(result.emotionalTone)
        
        // Save to database
        await saveVoiceSession({
          audioUrl: publicUrl,
          transcription: transcription,
          emotionalTone: result.emotionalTone,
          keyInsights: result.insights,
          detectedPatterns: result.patterns,
          duration: recordingTime
        })

        // Speak the response if voice is enabled
        if (voiceEnabled && result.response) {
          await speakResponse(result.response)
        }
      }

    } catch (error) {
      console.error('Error processing audio:', error)
      setTranscription('Error processing audio. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeEmotionalTone = async (text: string) => {
    try {
      const response = await fetch('/api/voice/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      const analysis = await response.json()
      setEmotionalAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing emotion:', error)
    }
  }

  const speakResponse = async (text: string) => {
    if (!synthRef.current) return

    setIsSpeaking(true)
    
    // Use OpenAI TTS API for better quality
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice
        })
      })

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      // Fallback to browser TTS
      synthRef.current.text = text
      
      // Select best available voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
      if (preferredVoice) {
        synthRef.current.voice = preferredVoice
      }

      synthRef.current.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(synthRef.current)
    }
  }

  const saveVoiceSession = async (session: Partial<VoiceSession>) => {
    const { error } = await supabase
      .from('voice_sessions')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        audio_url: session.audioUrl,
        transcription: session.transcription,
        emotional_tone: session.emotionalTone,
        key_insights: session.keyInsights,
        detected_patterns: session.detectedPatterns,
        duration_seconds: session.duration,
        crisis_indicators: session.emotionalTone?.valence < -0.7
      })

    if (error) {
      console.error('Error saving voice session:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-teal-600" />
          Voice Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Visualizer */}
        <div className="relative h-32 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4">
          <div className="flex items-center justify-center h-full">
            {isRecording ? (
              <motion.div
                className="flex items-center gap-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-teal-500 rounded-full"
                    animate={{
                      height: isRecording && !isPaused
                        ? [10, Math.random() * 60 + 20, 10]
                        : 10
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + Math.random() * 0.5,
                      delay: i * 0.05
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-center">
                <Mic className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to start voice session</p>
              </div>
            )}
          </div>

          {/* Recording Timer */}
          {isRecording && (
            <div className="absolute top-2 right-2">
              <Badge variant={isPaused ? 'secondary' : 'destructive'}>
                {isPaused ? 'Paused' : 'Recording'} • {formatTime(recordingTime)}
              </Badge>
            </div>
          )}

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="absolute bottom-2 left-2 right-2">
              <Progress value={audioLevel * 100} className="h-1" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={pauseRecording}
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          )}

          <Button
            size="icon"
            variant="outline"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>

        {/* Transcription */}
        {(transcription || interimTranscript) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Transcription
            </h3>
            <p className="text-sm text-gray-700">
              {transcription}
              <span className="text-gray-400 italic">{interimTranscript}</span>
            </p>
          </div>
        )}

        {/* Emotional Analysis */}
        {emotionalAnalysis && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Emotional Tone Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Primary Emotion</p>
                <Badge variant="outline" className="bg-white">
                  {emotionalAnalysis.primary}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Confidence</p>
                <Progress value={emotionalAnalysis.confidence * 100} className="h-2" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Emotional Valence</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Negative</span>
                  <Progress 
                    value={(emotionalAnalysis.valence + 1) * 50} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs">Positive</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Arousal Level</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Calm</span>
                  <Progress 
                    value={emotionalAnalysis.arousal * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs">Excited</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Response */}
        {voiceResponse && (
          <div className="bg-teal-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-teal-600" />
              AI Coach Response
            </h3>
            <p className="text-sm text-gray-700 mb-3">{voiceResponse}</p>
            {isSpeaking && (
              <div className="flex items-center gap-2 text-teal-600">
                <Activity className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Speaking...</span>
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600 mr-2" />
            <span className="text-sm text-gray-600">Processing your voice session...</span>
          </div>
        )}

        {/* Voice Settings */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">Voice Settings</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'v2/en_speaker_0', name: 'Alex' },
              { id: 'v2/en_speaker_1', name: 'Sarah' },
              { id: 'v2/en_speaker_2', name: 'John' },
              { id: 'v2/en_speaker_3', name: 'Emma' },
              { id: 'v2/en_speaker_4', name: 'Michael' },
              { id: 'v2/en_speaker_5', name: 'Sophia' },
              { id: 'v2/en_speaker_6', name: 'James' },
              { id: 'v2/en_speaker_7', name: 'Olivia' },
              { id: 'v2/en_speaker_8', name: 'David' },
              { id: 'v2/en_speaker_9', name: 'Isabella' }
            ].map(voice => (
              <Button
                key={voice.id}
                size="sm"
                variant={selectedVoice === voice.id ? 'default' : 'outline'}
                onClick={() => setSelectedVoice(voice.id)}
              >
                {voice.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}