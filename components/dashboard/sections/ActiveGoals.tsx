import { motion } from 'framer-motion'
import { Target, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ActiveGoalsProps {
  goals: any[]
}

export function ActiveGoals({ goals }: ActiveGoalsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Active Goals</h2>
        </div>
        <Button variant="outline" size="sm">
          Set New Goal
        </Button>
      </div>

      <div className="space-y-4">
        {goals?.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-100 rounded-lg p-4 hover:border-teal-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{goal.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {goal.deadline}
                  </span>
                  <span className="text-xs text-gray-500">
                    {goal.progress}/{goal.target} completed
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round((goal.progress / goal.target) * 100)}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link href="/goals">
          <span className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
            View all goals →
          </span>
        </Link>
      </div>
    </Card>
  )
}