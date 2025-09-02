'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Award, Lock, TrendingUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  requirement_key: string;
  badge_color: string;
  rarity: string;
  is_secret: boolean;
  earned: boolean;
  earned_at: string;
  progress: number;
  progress_percentage: number;
}

interface UserStats {
  total_points: number;
  level: number;
  rank: string;
  total_breakthroughs: number;
  achievements_count: number;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600',
};

const rarityBorderColors = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const categoryIcons = {
  milestones: Target,
  streaks: Zap,
  breakthroughs: Star,
  social: Trophy,
  special: Award,
};

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAchievements(data.achievements);
      setStats(data.stats);
      
      // Check for new achievements
      const newAchievements = data.achievements.filter(
        (a: Achievement) => a.earned && !a.notified
      );
      
      if (newAchievements.length > 0) {
        newAchievements.forEach((achievement: Achievement) => {
          toast({
            title: '🎉 Achievement Unlocked!',
            description: `${achievement.name} - ${achievement.points} points`,
          });
          
          // Mark as notified
          fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'claim',
              achievementId: achievement.id,
            }),
          });
        });
      }
    } catch (error) {
      toast({
        title: 'Error loading achievements',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const currentLevelPoints = (stats.level - 1) * (stats.level - 1) * 50;
    const nextLevelPoints = stats.level * stats.level * 50;
    const progressPoints = stats.total_points - currentLevelPoints;
    const neededPoints = nextLevelPoints - currentLevelPoints;
    return Math.min(100, (progressPoints / neededPoints) * 100);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legend': return 'from-yellow-400 to-orange-600';
      case 'Master': return 'from-purple-400 to-purple-600';
      case 'Achiever': return 'from-blue-400 to-blue-600';
      case 'Explorer': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const filteredAchievements = achievements.filter(a => 
    selectedCategory === 'all' || a.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and earn rewards
            </p>
          </div>
          
          {stats && (
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(stats.rank)} text-white font-semibold`}>
                <Award className="w-5 h-5" />
                {stats.rank}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.achievements_count} achievements earned
              </p>
            </div>
          )}
        </div>

        {/* Level Progress */}
        {stats && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">Level {stats.level}</span>
                <Badge variant="secondary">{stats.total_points} points</Badge>
              </div>
              <span className="text-sm text-gray-600">
                Level {stats.level + 1}
              </span>
            </div>
            <Progress value={getLevelProgress()} className="h-3" />
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-xl font-bold">{stats?.total_points || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Breakthroughs</p>
              <p className="text-xl font-bold">{stats?.total_breakthroughs || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-xl font-bold">{stats?.achievements_count || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-xl font-bold">
                {Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="breakthroughs">Breakthroughs</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement) => {
                const Icon = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy;
                const isLocked = !achievement.earned && achievement.is_secret;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card 
                      className={`p-5 relative overflow-hidden ${
                        achievement.earned 
                          ? `border-2 ${rarityBorderColors[achievement.rarity as keyof typeof rarityBorderColors]}`
                          : 'opacity-75'
                      }`}
                    >
                      {/* Rarity Gradient Background */}
                      {achievement.earned && (
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${
                            rarityColors[achievement.rarity as keyof typeof rarityColors]
                          } opacity-5`}
                        />
                      )}

                      <div className="relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-3 rounded-xl ${
                            achievement.earned 
                              ? `bg-gradient-to-r ${rarityColors[achievement.rarity as keyof typeof rarityColors]} text-white`
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}>
                            {isLocked ? (
                              <Lock className="w-6 h-6" />
                            ) : (
                              <Icon className="w-6 h-6" />
                            )}
                          </div>
                          <Badge variant={achievement.earned ? 'default' : 'secondary'}>
                            {achievement.points} pts
                          </Badge>
                        </div>

                        <h3 className="font-semibold mb-1">
                          {isLocked ? '???' : achievement.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {isLocked ? 'Secret achievement - keep exploring!' : achievement.description}
                        </p>

                        {/* Progress Bar for Unearned */}
                        {!achievement.earned && !isLocked && achievement.progress_percentage !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{achievement.progress} / {achievement.requirement_value}</span>
                            </div>
                            <Progress value={achievement.progress_percentage} className="h-2" />
                          </div>
                        )}

                        {/* Earned Date */}
                        {achievement.earned && (
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <Badge 
                              variant="outline" 
                              className={rarityBorderColors[achievement.rarity as keyof typeof rarityBorderColors]}
                            >
                              {achievement.rarity}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(achievement.earned_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}