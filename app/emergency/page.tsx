'use client'

import { motion } from 'framer-motion'
import { AuthProvider } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Phone,
  MessageSquare,
  Globe,
  AlertTriangle,
  Heart,
  Shield,
  Users,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface EmergencyResource {
  name: string
  number?: string
  text?: string
  website?: string
  description: string
  availability: string
  category: string
  priority: 'critical' | 'high' | 'standard'
}

function EmergencyContent() {
  const emergencyResources: EmergencyResource[] = [
    {
      name: '988 Suicide & Crisis Lifeline',
      number: '988',
      text: 'Text "HELLO" to 988',
      website: 'https://988lifeline.org',
      description: 'Free, confidential 24/7 support for people in distress and crisis prevention',
      availability: '24/7',
      category: 'Crisis Support',
      priority: 'critical'
    },
    {
      name: 'Crisis Text Line',
      number: null,
      text: 'Text "HOME" to 741741',
      website: 'https://www.crisistextline.org',
      description: 'Free 24/7 support via text message for any crisis',
      availability: '24/7',
      category: 'Crisis Support',
      priority: 'critical'
    },
    {
      name: 'Emergency Services',
      number: '911',
      text: null,
      website: null,
      description: 'For immediate life-threatening emergencies',
      availability: '24/7',
      category: 'Emergency',
      priority: 'critical'
    },
    {
      name: 'SAMHSA National Helpline',
      number: '1-800-662-4357',
      text: null,
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      description: 'Treatment referral and information service for substance abuse and mental health',
      availability: '24/7',
      category: 'Substance Abuse',
      priority: 'high'
    },
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      text: 'Text "START" to 88788',
      website: 'https://www.thehotline.org',
      description: 'Confidential support for victims of domestic violence',
      availability: '24/7',
      category: 'Domestic Violence',
      priority: 'high'
    },
    {
      name: 'RAINN National Sexual Assault Hotline',
      number: '1-800-656-4673',
      text: null,
      website: 'https://www.rainn.org',
      description: 'Confidential support for survivors of sexual assault',
      availability: '24/7',
      category: 'Sexual Assault',
      priority: 'high'
    },
    {
      name: 'Veterans Crisis Line',
      number: '1-800-273-8255',
      text: 'Text 838255',
      website: 'https://www.veteranscrisisline.net',
      description: 'Support for Veterans and their loved ones',
      availability: '24/7',
      category: 'Veterans',
      priority: 'high'
    },
    {
      name: 'Trevor Lifeline (LGBTQ+)',
      number: '1-866-488-7386',
      text: 'Text "START" to 678-678',
      website: 'https://www.thetrevorproject.org',
      description: 'Crisis intervention and suicide prevention for LGBTQ+ youth',
      availability: '24/7',
      category: 'LGBTQ+',
      priority: 'high'
    },
    {
      name: 'NAMI HelpLine',
      number: '1-800-950-6264',
      text: 'Text "NAMI" to 741741',
      website: 'https://www.nami.org/help',
      description: 'Information, resources, and support for mental health',
      availability: 'M-F 10am-10pm ET',
      category: 'Mental Health Info',
      priority: 'standard'
    },
    {
      name: 'Postpartum Support International',
      number: '1-800-944-4773',
      text: 'Text 503-894-9453',
      website: 'https://www.postpartum.net',
      description: 'Support for postpartum depression and anxiety',
      availability: 'Leave message 24/7',
      category: 'Postpartum',
      priority: 'standard'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const criticalResources = emergencyResources.filter(r => r.priority === 'critical')
  const highPriorityResources = emergencyResources.filter(r => r.priority === 'high')
  const standardResources = emergencyResources.filter(r => r.priority === 'standard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Critical Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-red-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 animate-pulse" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Are you in immediate danger?</h2>
                  <p className="text-red-100 mb-4">
                    If you or someone you know is in immediate danger or having thoughts of self-harm, 
                    please reach out for help immediately.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      size="lg" 
                      className="bg-white text-red-600 hover:bg-red-50"
                      onClick={() => window.location.href = 'tel:988'}
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Call 988 Now
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/20"
                      onClick={() => window.location.href = 'sms:741741?body=HOME'}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Text Crisis Line
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/20"
                      onClick={() => window.location.href = 'tel:911'}
                    >
                      Call 911
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-red-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            24/7 Support Available
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Emergency <span className="text-red-600">Resources</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You're not alone. These resources are available to provide immediate support 
            when you need it most.
          </p>
        </motion.div>

        {/* Critical Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Immediate Crisis Support
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {criticalResources.map((resource, index) => (
              <motion.div
                key={resource.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`h-full border-2 ${getPriorityColor(resource.priority)} hover:shadow-lg transition-all`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <Badge className="w-fit" variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {resource.availability}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{resource.description}</p>
                    <div className="space-y-2">
                      {resource.number && (
                        <Button 
                          className="w-full"
                          onClick={() => window.location.href = `tel:${resource.number}`}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call {resource.number}
                        </Button>
                      )}
                      {resource.text && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const [action, number] = resource.text.split(' to ')
                            window.location.href = `sms:${number}?body=${action.replace('Text "', '').replace('"', '')}`
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {resource.text}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Specialized Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-orange-600" />
            Specialized Support Lines
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {highPriorityResources.map((resource, index) => (
              <motion.div
                key={resource.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {resource.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {resource.number && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `tel:${resource.number}`}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {resource.number}
                        </Button>
                      )}
                      {resource.text && (
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Text
                        </Button>
                      )}
                      {resource.website && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(resource.website, '_blank')}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </Button>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Available: {resource.availability}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Information Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Information & Support Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {standardResources.map((resource, index) => (
              <Card key={resource.name} className="hover:shadow-sm transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {resource.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">{resource.availability}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {resource.number && (
                      <Button size="sm" variant="ghost">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                    {resource.website && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(resource.website, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Safety Planning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Create a Safety Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                A safety plan is a personalized, practical plan to help you stay safe during difficult moments. 
                Consider working with a mental health professional to create one.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Include in your plan:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Warning signs that a crisis may be developing</li>
                    <li>• Coping strategies you can use on your own</li>
                    <li>• People and places that provide distraction</li>
                    <li>• Friends and family who can help</li>
                    <li>• Professional contacts and crisis lines</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Keep your plan:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Easily accessible (phone, wallet, etc.)</li>
                    <li>• Updated with current contact information</li>
                    <li>• Shared with trusted friends or family</li>
                    <li>• Reviewed and practiced regularly</li>
                    <li>• Simple and easy to follow when distressed</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start AI-Guided Safety Planning
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Location-Based Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Find Local Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Many communities have local crisis centers, support groups, and mental health services. 
                Use these tools to find help near you:
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://www.samhsa.gov/find-treatment', '_blank')}
                >
                  SAMHSA Treatment Locator
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://www.psychologytoday.com/us', '_blank')}
                >
                  Psychology Today Directory
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://findtreatment.gov', '_blank')}
                >
                  FindTreatment.gov
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function EmergencyPage() {
  return (
    <AuthProvider>
      <EmergencyContent />
    </AuthProvider>
  )
}