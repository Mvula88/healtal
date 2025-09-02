'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Trophy, Calendar, Check, X, Edit2, Archive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  target_days: number[];
  reminder_time: string;
  color: string;
  icon: string;
  streak: {
    current_streak: number;
    longest_streak: number;
    total_completions: number;
  };
  completed_today: boolean;
}

const categoryColors = {
  health: '#10B981',
  mindfulness: '#8B5CF6',
  productivity: '#3B82F6',
  relationships: '#EC4899',
  recovery: '#F59E0B',
  custom: '#6B7280',
};

const categoryIcons = {
  health: '💪',
  mindfulness: '🧘',
  productivity: '📈',
  relationships: '❤️',
  recovery: '🌱',
  custom: '⭐',
};

export function HabitBuilder() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'health',
    frequency: 'daily',
    target_days: [] as number[],
    reminder_time: '',
    color: '#10B981',
    icon: '💪',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setHabits(data.habits);
    } catch (error) {
      toast({
        title: 'Error loading habits',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async () => {
    if (!newHabit.name.trim()) {
      toast({
        title: 'Habit name required',
        description: 'Please enter a name for your habit.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit),
      });

      if (!response.ok) throw new Error('Failed to create');

      await fetchHabits();
      setIsCreating(false);
      setNewHabit({
        name: '',
        description: '',
        category: 'health',
        frequency: 'daily',
        target_days: [],
        reminder_time: '',
        color: '#10B981',
        icon: '💪',
      });

      toast({
        title: 'Habit created!',
        description: 'Start building your new habit today.',
      });
    } catch (error) {
      toast({
        title: 'Failed to create habit',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          action: 'complete',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      await fetchHabits();

      toast({
        title: 'Habit completed!',
        description: `Streak: ${data.streak} days 🔥`,
      });
    } catch (error: any) {
      toast({
        title: 'Already completed',
        description: error.message || 'This habit was already marked complete today.',
        variant: 'destructive',
      });
    }
  };

  const archiveHabit = async (habitId: string) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          action: 'archive',
        }),
      });

      if (!response.ok) throw new Error('Failed to archive');

      await fetchHabits();
      toast({
        title: 'Habit archived',
        description: 'You can restore it anytime from settings.',
      });
    } catch (error) {
      toast({
        title: 'Failed to archive habit',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Habit Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build positive habits, one day at a time
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Morning meditation"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  placeholder="Why is this habit important to you?"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={newHabit.category} 
                  onValueChange={(value) => {
                    setNewHabit({ 
                      ...newHabit, 
                      category: value,
                      color: categoryColors[value as keyof typeof categoryColors],
                      icon: categoryIcons[value as keyof typeof categoryIcons],
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select 
                  value={newHabit.frequency} 
                  onValueChange={(value) => setNewHabit({ ...newHabit, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Reminder Time (Optional)</label>
                <Input
                  type="time"
                  value={newHabit.reminder_time}
                  onChange={(e) => setNewHabit({ ...newHabit, reminder_time: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={createHabit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  Create Habit
                </Button>
                <Button 
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Habits</p>
              <p className="text-2xl font-bold">{habits.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Completions</p>
              <p className="text-2xl font-bold">
                {habits.reduce((sum, h) => sum + (h.streak?.total_completions || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold">
                {Math.max(...habits.map(h => h.streak?.longest_streak || 0), 0)} days
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
            >
              <Card className={`p-5 ${habit.completed_today ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-3xl p-2 rounded-lg"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{habit.name}</h3>
                      <p className="text-sm text-gray-600">{habit.category}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => archiveHabit(habit.id)}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>

                {habit.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {habit.description}
                  </p>
                )}

                {/* Streak Display */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">{habit.streak?.current_streak || 0}</span>
                    <span className="text-sm text-gray-600">day streak</span>
                  </div>
                  <Badge variant="secondary">
                    {habit.streak?.total_completions || 0} total
                  </Badge>
                </div>

                {/* Complete Button */}
                {habit.completed_today ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Completed Today
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    style={{ 
                      background: `linear-gradient(to right, ${habit.color}, ${habit.color}CC)`,
                      color: 'white'
                    }}
                    onClick={() => completeHabit(habit.id)}
                  >
                    Mark Complete
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {habits.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">Start Your First Habit</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Building positive habits is the key to lasting change
          </p>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Habit
          </Button>
        </Card>
      )}
    </div>
  );
}