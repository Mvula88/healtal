'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Heart, Ear, Cloud, Send, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

type VentMode = 'vent' | 'listen' | 'comfort';

interface VentSession {
  response: string;
  sessionId: string;
  mode: VentMode;
}

export function VentRelease() {
  const [mode, setMode] = useState<VentMode>('vent');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [session, setSession] = useState<VentSession | null>(null);
  const [emotionBefore, setEmotionBefore] = useState('');
  const { toast } = useToast();

  const modeConfig = {
    vent: {
      icon: Cloud,
      title: 'Vent & Release',
      description: 'Let it all out. No judgment, just release.',
      color: 'from-purple-500 to-pink-500',
      placeholder: 'Tell me what\'s on your mind. I\'m here to listen...',
    },
    listen: {
      icon: Ear,
      title: 'Just Listen',
      description: 'Sometimes you just need someone to hear you.',
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'Share what you need to say. I\'m listening...',
    },
    comfort: {
      icon: Heart,
      title: 'Comfort Me',
      description: 'Receive gentle support and encouragement.',
      color: 'from-pink-500 to-red-500',
      placeholder: 'Tell me what\'s hurting. Let me comfort you...',
    },
  };

  const currentMode = modeConfig[mode];

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: 'Please share something',
        description: 'Even a few words can help you feel better.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/vent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          content,
          emotionBefore,
          isVoice: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to process');

      const data = await response.json();
      setSession(data);
      setContent('');
      
      toast({
        title: 'Thank you for sharing',
        description: 'Your feelings are valid and important.',
      });
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async () => {
    if (!session?.response) return;

    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: session.response,
          voice: 'v2/en_speaker_1', // Sarah - warm voice
        }),
      });

      if (!response.ok) throw new Error('Failed to synthesize');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(modeConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => {
                setMode(key as VentMode);
                setSession(null);
              }}
              className={`p-4 rounded-xl transition-all ${
                mode === key
                  ? 'bg-gradient-to-r text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 hover:scale-102'
              }`}
              style={{
                backgroundImage: mode === key ? `linear-gradient(to right, var(--tw-gradient-stops))` : undefined,
              }}
            >
              <div className={`bg-gradient-to-r ${config.color} ${mode === key ? '' : 'bg-clip-text text-transparent'}`}>
                <Icon className={`w-8 h-8 mx-auto mb-2 ${mode === key ? 'text-white' : ''}`} />
                <h3 className={`font-semibold ${mode === key ? 'text-white' : ''}`}>
                  {config.title}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Input Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className={`text-2xl font-bold bg-gradient-to-r ${currentMode.color} bg-clip-text text-transparent`}>
              {currentMode.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentMode.description}
            </p>
          </div>

          {/* Emotion Before (Optional) */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Feeling:</span>
            {['Angry', 'Sad', 'Anxious', 'Overwhelmed', 'Lost', 'Hurt'].map((emotion) => (
              <button
                key={emotion}
                onClick={() => setEmotionBefore(emotion)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  emotionBefore === emotion
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentMode.placeholder}
              className="min-h-[150px] resize-none pr-12"
              disabled={isProcessing}
            />
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
              }`}
              disabled={isProcessing}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !content.trim()}
            className={`w-full bg-gradient-to-r ${currentMode.color} text-white`}
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Release
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* AI Response */}
      <AnimatePresence>
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                  Your Support Response
                </h3>
                <button
                  onClick={speakResponse}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {session.response}
              </p>
              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-500">
                  Remember: Your feelings are valid. This is a safe space for you.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Relief Tracker */}
      {session && (
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            How do you feel after sharing?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <button
                key={level}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  level <= 3
                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                    : level <= 7
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            1 = Still struggling | 10 = Much better
          </p>
        </Card>
      )}
    </div>
  );
}