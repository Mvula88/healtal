'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  DollarSign,
  Shield,
  Award,
  Clock,
  Filter,
  Search,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Heart,
  Brain,
  Users,
  TrendingUp,
  Sparkles,
  Video,
  MessageSquare,
  Globe
} from 'lucide-react'

interface Professional {
  id: string
  name: string
  title: string
  specialties: string[]
  approach: string
  location: string
  availability: string
  rate: string
  insurance: string[]
  languages: string[]
  modalities: string[]
  experience: string
  rating: number
  reviews: number
  verified: boolean
  online: boolean
  inPerson: boolean
  image?: string
  bio: string
  nextAvailable: string
}

function ReferralsContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [location, setLocation] = useState('all')
  const [sessionType, setSessionType] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [userNeeds, setUserNeeds] = useState('')
  const [urgency, setUrgency] = useState('standard')
  
  const supabase = createClient()

  // Sample professionals data (would come from database)
  const professionals: Professional[] = [
    {
      id: '1',
      name: 'Dr. Sarah Martinez',
      title: 'Clinical Psychologist',
      specialties: ['Trauma', 'PTSD', 'Anxiety', 'Depression'],
      approach: 'Cognitive Behavioral Therapy (CBT), EMDR',
      location: 'Los Angeles, CA',
      availability: 'Accepting new clients',
      rate: '$150-200/session',
      insurance: ['Blue Cross', 'Aetna', 'United Healthcare'],
      languages: ['English', 'Spanish'],
      modalities: ['Individual', 'Couples', 'Group'],
      experience: '15 years',
      rating: 4.9,
      reviews: 127,
      verified: true,
      online: true,
      inPerson: true,
      bio: 'Specializing in trauma recovery with a compassionate, evidence-based approach.',
      nextAvailable: 'This week'
    },
    {
      id: '2',
      name: 'Michael Chen, LMFT',
      title: 'Marriage & Family Therapist',
      specialties: ['Relationships', 'Family Dynamics', 'Communication', 'Infidelity'],
      approach: 'Emotionally Focused Therapy (EFT), Gottman Method',
      location: 'San Francisco, CA',
      availability: 'Waitlist (2-3 weeks)',
      rate: '$180-250/session',
      insurance: ['Kaiser', 'Cigna', 'Self-pay'],
      languages: ['English', 'Mandarin'],
      modalities: ['Couples', 'Family', 'Individual'],
      experience: '12 years',
      rating: 4.8,
      reviews: 89,
      verified: true,
      online: true,
      inPerson: false,
      bio: 'Helping couples and families build stronger, healthier relationships.',
      nextAvailable: '2-3 weeks'
    },
    {
      id: '3',
      name: 'Dr. James Wilson',
      title: 'Psychiatrist',
      specialties: ['Medication Management', 'Bipolar', 'Schizophrenia', 'ADHD'],
      approach: 'Psychopharmacology, Integrative Psychiatry',
      location: 'New York, NY',
      availability: 'Limited availability',
      rate: '$300-400/session',
      insurance: ['Most major insurance accepted'],
      languages: ['English'],
      modalities: ['Individual', 'Medication Management'],
      experience: '20 years',
      rating: 4.7,
      reviews: 203,
      verified: true,
      online: true,
      inPerson: true,
      bio: 'Board-certified psychiatrist specializing in complex mental health conditions.',
      nextAvailable: '1 month'
    },
    {
      id: '4',
      name: 'Lisa Thompson, LCSW',
      title: 'Clinical Social Worker',
      specialties: ['Addiction', 'Recovery', 'Dual Diagnosis', 'Relapse Prevention'],
      approach: 'Motivational Interviewing, DBT, 12-Step Integration',
      location: 'Chicago, IL',
      availability: 'Accepting new clients',
      rate: '$100-150/session',
      insurance: ['Medicaid', 'Medicare', 'Sliding scale available'],
      languages: ['English'],
      modalities: ['Individual', 'Group', 'Intensive Outpatient'],
      experience: '10 years',
      rating: 4.9,
      reviews: 156,
      verified: true,
      online: true,
      inPerson: true,
      bio: 'Dedicated to supporting individuals in recovery with evidence-based treatment.',
      nextAvailable: 'This week'
    }
  ]

  const specialties = [
    'All Specialties',
    'Trauma & PTSD',
    'Anxiety & Panic',
    'Depression',
    'Relationships',
    'Addiction & Recovery',
    'Family Issues',
    'Grief & Loss',
    'ADHD',
    'Bipolar Disorder',
    'Eating Disorders',
    'OCD'
  ]

  const handleRequestReferral = (professional: Professional) => {
    setSelectedProfessional(professional)
    setShowReferralForm(true)
  }

  const submitReferralRequest = async () => {
    if (!user || !selectedProfessional) return
    
    try {
      // In production, this would save to database and send notifications
      const referralData = {
        user_id: user.id,
        professional_id: selectedProfessional.id,
        user_needs: userNeeds,
        urgency: urgency,
        requested_at: new Date().toISOString(),
        status: 'pending'
      }
      
      // Simulate API call
      console.log('Referral request:', referralData)
      
      // Show success message
      alert(`Referral request sent to ${selectedProfessional.name}. They will contact you within 48 hours.`)
      setShowReferralForm(false)
      setSelectedProfessional(null)
      setUserNeeds('')
      setUrgency('standard')
    } catch (error) {
      console.error('Error submitting referral:', error)
    }
  }

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prof.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecialty = specialty === 'all' || prof.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
    const matchesLocation = location === 'all' || prof.location.toLowerCase().includes(location.toLowerCase())
    const matchesType = sessionType === 'all' || 
                       (sessionType === 'online' && prof.online) ||
                       (sessionType === 'inperson' && prof.inPerson)
    
    return matchesSearch && matchesSpecialty && matchesLocation && matchesType
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Verified Professionals
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Professional <span className="gradient-text">Referral Network</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            When you need more specialized help, we connect you with verified mental health professionals 
            who align with your specific needs and preferences.
          </p>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <UserCheck className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-gray-600">Verified Professionals</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">48hr</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-gray-600">Licensed & Insured</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Emergency Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Need Immediate Help?</h3>
                  <p className="text-red-800 text-sm mb-2">
                    If you're experiencing a mental health crisis or emergency, please contact:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-semibold">988</span> - Suicide & Crisis Lifeline
                    </div>
                    <div>
                      <span className="font-semibold">911</span> - Emergency Services
                    </div>
                    <div>
                      <span className="font-semibold">741741</span> - Crisis Text Line (Text "HOME")
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search by name, specialty, or condition..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.slice(1).map(s => (
                        <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="los angeles">Los Angeles</SelectItem>
                      <SelectItem value="san francisco">San Francisco</SelectItem>
                      <SelectItem value="new york">New York</SelectItem>
                      <SelectItem value="chicago">Chicago</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Session Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="inperson">In-Person Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="low">Under $150</SelectItem>
                      <SelectItem value="medium">$150-$250</SelectItem>
                      <SelectItem value="high">$250+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professionals Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredProfessionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{professional.name}</CardTitle>
                        {professional.verified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{professional.title}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{professional.rating}</span>
                        <span className="text-gray-500">({professional.reviews})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{professional.bio}</p>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{professional.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>{professional.rate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{professional.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Next: {professional.nextAvailable}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {professional.online && (
                      <Badge variant="outline" className="text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
                    {professional.inPerson && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        In-Person
                      </Badge>
                    )}
                  </div>

                  {professional.insurance.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Insurance: </span>
                      <span className="font-medium">{professional.insurance.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleRequestReferral(professional)}
                    >
                      Request Referral
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button variant="outline">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How Professional Referrals Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-teal-600" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Search & Filter</h4>
                  <p className="text-sm text-gray-600">Find professionals that match your needs</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-teal-600" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Request Referral</h4>
                  <p className="text-sm text-gray-600">Tell us about your needs and preferences</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="h-6 w-6 text-teal-600" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Get Matched</h4>
                  <p className="text-sm text-gray-600">Professional contacts you within 48 hours</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-teal-600" />
                  </div>
                  <h4 className="font-semibold mb-1">4. Begin Healing</h4>
                  <p className="text-sm text-gray-600">Start your professional therapy journey</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                Verified & Licensed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                All professionals are verified, licensed, and undergo background checks 
                to ensure you receive quality care.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Powered Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our AI analyzes your needs and preferences to suggest the most compatible 
                professionals for your situation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Seamless Transition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your Beneathy journey insights can be shared with your chosen professional 
                for continuity of care.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Referral Request Modal */}
      {showReferralForm && selectedProfessional && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-lg w-full p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Request Referral</h3>
            <p className="text-gray-600 mb-4">
              Requesting referral to <strong>{selectedProfessional.name}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="needs">What brings you to therapy? (Optional)</Label>
                <Textarea
                  id="needs"
                  placeholder="Share what you're hoping to work on..."
                  value={userNeeds}
                  onChange={(e) => setUserNeeds(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="urgency">How urgent is your need?</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Within a week)</SelectItem>
                    <SelectItem value="urgent">Urgent (Within 48 hours)</SelectItem>
                    <SelectItem value="flexible">Flexible (When available)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    The professional will contact you directly using the email and phone number 
                    in your Beneathy profile.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReferralForm(false)
                    setSelectedProfessional(null)
                    setUserNeeds('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReferralRequest}
                  className="flex-1"
                >
                  Send Request
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function ReferralsPage() {
  return (
    <AuthProvider>
      <ReferralsContent />
    </AuthProvider>
  )
}