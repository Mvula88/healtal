import { motion } from 'framer-motion'
import { Calendar, Users, Video, Clock, MapPin, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface UpcomingEventsProps {
  events?: any[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  // Mock events if none provided
  const defaultEvents = [
    {
      id: '1',
      type: 'circle',
      title: 'Anxiety Recovery Circle',
      host: 'Sarah Martinez',
      hostRating: 4.9,
      participants: 8,
      maxParticipants: 12,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: '7:00 PM',
      duration: '90 min',
      format: 'video',
      price: 25,
      joined: true,
      tags: ['anxiety', 'peer-support']
    },
    {
      id: '2',
      type: 'workshop',
      title: 'Breaking Negative Patterns Workshop',
      host: 'Dr. James Chen',
      hostRating: 5.0,
      participants: 24,
      maxParticipants: 30,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      duration: '2 hours',
      format: 'video',
      price: 45,
      premium: true,
      tags: ['patterns', 'breakthrough']
    },
    {
      id: '3',
      type: 'coaching',
      title: '1-on-1 AI Coaching Session',
      host: 'Beneathy AI Coach',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      duration: '45 min',
      format: 'chat',
      scheduled: true,
      tags: ['personal', 'deep-dive']
    }
  ]

  const eventsList = events || defaultEvents

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
        </div>
        <Button variant="outline" size="sm">
          Browse All
        </Button>
      </div>

      <div className="space-y-4">
        {eventsList.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-100 rounded-lg p-4 hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  {event.premium && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-medium">
                      PREMIUM
                    </span>
                  )}
                  {event.joined && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      JOINED
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(event.date, 'MMM d')}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.time} • {event.duration}
                  </span>
                  {event.format === 'video' && (
                    <span className="flex items-center">
                      <Video className="h-3 w-3 mr-1" />
                      Online
                    </span>
                  )}
                </div>

                {event.host && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="h-6 w-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {event.host.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{event.host}</span>
                    {event.hostRating && (
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600 ml-0.5">{event.hostRating}</span>
                      </div>
                    )}
                  </div>
                )}

                {event.participants && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {event.participants}/{event.maxParticipants} participants
                    </span>
                    <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-teal-500 h-1.5 rounded-full"
                        style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {event.tags && (
                  <div className="flex items-center space-x-2 mt-2">
                    {event.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right ml-4">
                {event.price && (
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    ${event.price}
                  </div>
                )}
                {event.joined ? (
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                    View Details
                  </Button>
                ) : event.scheduled ? (
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                ) : (
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    Join Now
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">3 events this week</span>
        <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          Sync with calendar →
        </button>
      </div>
    </Card>
  )
}