'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Users, Clock, Lock, Play, Pause, CheckCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface RecoveryProgram {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_days: number;
  modules: any[];
  min_tier: string;
  is_available: boolean;
  user_progress: {
    started_at: string;
    current_module: number;
    progress_percentage: number;
    status: string;
  } | null;
}

const categoryIcons = {
  anxiety: Brain,
  addiction: Heart,
  grief: Users,
  depression: Brain,
  trauma: Heart,
  relationships: Users,
};

const categoryColors = {
  anxiety: 'from-blue-500 to-purple-500',
  addiction: 'from-red-500 to-orange-500',
  grief: 'from-gray-500 to-blue-500',
  depression: 'from-indigo-500 to-purple-500',
  trauma: 'from-pink-500 to-red-500',
  relationships: 'from-green-500 to-teal-500',
};

export function RecoveryPrograms() {
  const [programs, setPrograms] = useState<RecoveryProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<RecoveryProgram | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/recovery/programs');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPrograms(data.programs);
    } catch (error) {
      toast({
        title: 'Error loading programs',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProgramAction = async (programId: string, action: string) => {
    try {
      const response = await fetch('/api/recovery/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, action }),
      });

      if (!response.ok) throw new Error('Failed to update');

      await fetchPrograms();
      
      toast({
        title: action === 'start' ? 'Program started!' : 'Program updated',
        description: action === 'start' ? 'Your journey begins now.' : 'Progress saved.',
      });
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleModuleComplete = async (programId: string, moduleNumber: number) => {
    try {
      const response = await fetch('/api/recovery/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          programId, 
          action: 'complete_module',
          moduleNumber 
        }),
      });

      if (!response.ok) throw new Error('Failed to complete module');

      await fetchPrograms();
      
      toast({
        title: 'Module completed!',
        description: 'Great progress! Keep going.',
      });
    } catch (error) {
      toast({
        title: 'Failed to update progress',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading recovery programs...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Recovery Programs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Evidence-based programs to support your healing journey
        </p>
      </div>

      {/* Active Programs */}
      {programs.some(p => p.user_progress?.status === 'active') && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Active Programs</h2>
          <div className="grid gap-4">
            {programs
              .filter(p => p.user_progress?.status === 'active')
              .map(program => {
                const Icon = categoryIcons[program.category as keyof typeof categoryIcons] || Heart;
                const color = categoryColors[program.category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';
                
                return (
                  <Card key={program.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Module {program.user_progress?.current_module} of {program.modules.length}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProgramAction(program.id, 'pause')}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    </div>

                    <Progress 
                      value={program.user_progress?.progress_percentage || 0} 
                      className="mb-4"
                    />

                    <div className="space-y-2">
                      {program.modules.map((module: any, index: number) => {
                        const isCompleted = index < (program.user_progress?.current_module || 0);
                        const isCurrent = index === (program.user_progress?.current_module || 0) - 1;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isCompleted
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : isCurrent
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                                : 'bg-gray-50 dark:bg-gray-900/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  isCurrent ? 'border-blue-500' : 'border-gray-300'
                                }`} />
                              )}
                              <div>
                                <p className="font-medium">Week {module.week}: {module.title}</p>
                                <p className="text-sm text-gray-600">
                                  {module.exercises?.join(', ')}
                                </p>
                              </div>
                            </div>
                            {isCurrent && (
                              <Button
                                size="sm"
                                onClick={() => handleModuleComplete(program.id, index + 1)}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Available Programs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Programs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs
            .filter(p => !p.user_progress || p.user_progress.status !== 'active')
            .map(program => {
              const Icon = categoryIcons[program.category as keyof typeof categoryIcons] || Heart;
              const color = categoryColors[program.category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';
              
              return (
                <motion.div
                  key={program.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`p-6 h-full ${!program.is_available ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {!program.is_available && <Lock className="w-5 h-5 text-gray-400" />}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {program.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {program.duration_days} days
                      </Badge>
                      <Badge variant="secondary">
                        {program.modules.length} modules
                      </Badge>
                    </div>

                    {program.user_progress?.status === 'completed' ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    ) : program.user_progress?.status === 'paused' ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleProgramAction(program.id, 'resume')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    ) : program.is_available ? (
                      <Button
                        className={`w-full bg-gradient-to-r ${color} text-white`}
                        onClick={() => handleProgramAction(program.id, 'start')}
                      >
                        Start Program
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Upgrade to {program.min_tier}
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}