'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { CRISIS_RESOURCES } from '@/lib/config'
import { 
  Shield,
  Phone,
  Heart,
  AlertTriangle,
  Users,
  Home,
  Sparkles,
  Plus,
  X,
  Edit,
  Save,
  CheckCircle,
  MessageCircle,
  Zap,
  SOS,
  PhoneCall,
  MapPin,
  User,
  Clock,
  FileText,
  Download,
  Share2
} from 'lucide-react'

interface SafetyContact {
  id: string
  name: string
  phone: string
  relationship: string
  isEmergency: boolean
}

interface SafetyPlan {
  warning_signs: string[]
  coping_strategies: string[]
  support_contacts: SafetyContact[]
  safe_environments: string[]
  professional_contacts: SafetyContact[]
  emergency_services: SafetyContact[]
  personal_strengths: string[]
  reasons_for_living: string[]
}

function SafetyContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
    warning_signs: [],
    coping_strategies: [],
    support_contacts: [],
    safe_environments: [],
    professional_contacts: [],
    emergency_services: [
      { id: '1', name: '988 Crisis Lifeline', phone: '988', relationship: 'Crisis Support', isEmergency: true },
      { id: '2', name: 'Emergency Services', phone: '911', relationship: 'Emergency', isEmergency: true },
      { id: '3', name: 'Crisis Text Line', phone: 'Text HOME to 741741', relationship: 'Text Support', isEmergency: true }
    ],
    personal_strengths: [],
    reasons_for_living: []
  })
  
  const [editMode, setEditMode] = useState(false)
  const [newWarningSign, setNewWarningSign] = useState('')
  const [newCopingStrategy, setNewCopingStrategy] = useState('')
  const [newSafePlace, setNewSafePlace] = useState('')
  const [newStrength, setNewStrength] = useState('')
  const [newReason, setNewReason] = useState('')
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' })
  const [showCrisisMode, setShowCrisisMode] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchSafetyPlan()
    }
  }, [user])

  const fetchSafetyPlan = async () => {
    try {
      const { data } = await supabase
        .from('crisis_safety_plans')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single()
      
      if (data) {
        setSafetyPlan({
          warning_signs: data.warning_signs || [],
          coping_strategies: data.coping_strategies || [],
          support_contacts: data.support_contacts || [],
          safe_environments: data.safe_environments || [],
          professional_contacts: data.professional_contacts || [],
          emergency_services: data.emergency_services || safetyPlan.emergency_services,
          personal_strengths: data.personal_strengths || [],
          reasons_for_living: data.reasons_for_living || []
        })
      }
    } catch (error) {
      console.error('Error fetching safety plan:', error)
    }
  }

  const saveSafetyPlan = async () => {
    if (!user) return
    
    try {
      await supabase
        .from('crisis_safety_plans')
        .upsert({
          user_id: user.id,
          ...safetyPlan,
          is_active: true,
          updated_at: new Date().toISOString()
        })
      
      setEditMode(false)
      alert('Safety plan saved successfully!')
    } catch (error) {
      console.error('Error saving safety plan:', error)
    }
  }

  const addWarningSign = () => {
    if (newWarningSign.trim()) {
      setSafetyPlan({
        ...safetyPlan,
        warning_signs: [...safetyPlan.warning_signs, newWarningSign]
      })
      setNewWarningSign('')
    }
  }

  const addCopingStrategy = () => {
    if (newCopingStrategy.trim()) {
      setSafetyPlan({
        ...safetyPlan,
        coping_strategies: [...safetyPlan.coping_strategies, newCopingStrategy]
      })
      setNewCopingStrategy('')
    }
  }

  const addContact = (type: 'support' | 'professional') => {
    if (newContact.name && newContact.phone) {
      const contact: SafetyContact = {
        id: crypto.randomUUID(),
        ...newContact,
        isEmergency: false
      }
      
      if (type === 'support') {
        setSafetyPlan({
          ...safetyPlan,
          support_contacts: [...safetyPlan.support_contacts, contact]
        })
      } else {
        setSafetyPlan({
          ...safetyPlan,
          professional_contacts: [...safetyPlan.professional_contacts, contact]
        })
      }
      
      setNewContact({ name: '', phone: '', relationship: '' })
    }
  }

  const removeItem = (category: keyof SafetyPlan, index: number) => {
    const updated = { ...safetyPlan }
    if (Array.isArray(updated[category])) {
      ;(updated[category] as any[]).splice(index, 1)
      setSafetyPlan(updated)
    }
  }

  const exportPlan = () => {
    const planText = `
SAFETY PLAN
Created: ${new Date().toLocaleDateString()}

WARNING SIGNS:
${safetyPlan.warning_signs.map(s => `• ${s}`).join('\n')}

COPING STRATEGIES:
${safetyPlan.coping_strategies.map(s => `• ${s}`).join('\n')}

SUPPORT CONTACTS:
${safetyPlan.support_contacts.map(c => `• ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}

SAFE PLACES:
${safetyPlan.safe_environments.map(s => `• ${s}`).join('\n')}

PROFESSIONAL HELP:
${safetyPlan.professional_contacts.map(c => `• ${c.name}: ${c.phone}`).join('\n')}

EMERGENCY CONTACTS:
${safetyPlan.emergency_services.map(c => `• ${c.name}: ${c.phone}`).join('\n')}

PERSONAL STRENGTHS:
${safetyPlan.personal_strengths.map(s => `• ${s}`).join('\n')}

REASONS FOR LIVING:
${safetyPlan.reasons_for_living.map(s => `• ${s}`).join('\n')}
    `
    
    const blob = new Blob([planText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'safety-plan.txt'
    a.click()
  }

  if (showCrisisMode) {
    return (
      <div className="min-h-screen bg-red-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6 border-red-500 bg-red-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-lg font-medium">
              If you're in immediate danger, call 911 or go to your nearest emergency room.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {safetyPlan.emergency_services.map(contact => (
              <Card key={contact.id} className="border-2 border-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{contact.name}</h3>
                      <p className="text-2xl font-bold text-red-600">{contact.phone}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                    </div>
                    <PhoneCall className="h-8 w-8 text-red-500" />
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {safetyPlan.coping_strategies.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Try These Coping Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {safetyPlan.coping_strategies.slice(0, 5).map((strategy, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{strategy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {safetyPlan.support_contacts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Support Network</CardTitle>
                <CardDescription>People who care about you and can help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safetyPlan.support_contacts.map(contact => (
                    <div key={contact.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <Button variant="outline" className="w-full mt-2">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowCrisisMode(false)}
          >
            Exit Crisis Mode
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Planning</h1>
            <p className="text-gray-600">
              Create a personalized safety plan for difficult moments
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive"
              onClick={() => setShowCrisisMode(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Crisis Mode
            </Button>
            <Button variant="outline" onClick={exportPlan}>
              <Download className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
            {editMode ? (
              <Button onClick={saveSafetyPlan}>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
            )}
          </div>
        </div>

        {/* Warning Signs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Warning Signs
            </CardTitle>
            <CardDescription>
              Thoughts, feelings, or behaviors that signal you need to use your safety plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {safetyPlan.warning_signs.map((sign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span>{sign}</span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('warning_signs', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a warning sign..."
                  value={newWarningSign}
                  onChange={(e) => setNewWarningSign(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWarningSign()}
                />
                <Button onClick={addWarningSign}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coping Strategies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Coping Strategies
            </CardTitle>
            <CardDescription>
              Things you can do on your own to feel better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {safetyPlan.coping_strategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>{strategy}</span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('coping_strategies', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a coping strategy..."
                  value={newCopingStrategy}
                  onChange={(e) => setNewCopingStrategy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCopingStrategy()}
                />
                <Button onClick={addCopingStrategy}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Support Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Support Contacts
              </CardTitle>
              <CardDescription>
                Friends and family who can help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {safetyPlan.support_contacts.map((contact, index) => (
                  <div key={contact.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                      {editMode && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const contacts = [...safetyPlan.support_contacts]
                            contacts.splice(index, 1)
                            setSafetyPlan({ ...safetyPlan, support_contacts: contacts })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="space-y-2">
                  <Input
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  />
                  <Button className="w-full" onClick={() => addContact('support')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safe Places */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Safe Places
              </CardTitle>
              <CardDescription>
                Places where you feel calm and safe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {safetyPlan.safe_environments.map((place, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span>{place}</span>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem('safe_environments', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a safe place..."
                    value={newSafePlace}
                    onChange={(e) => setNewSafePlace(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSafePlace.trim()) {
                        setSafetyPlan({
                          ...safetyPlan,
                          safe_environments: [...safetyPlan.safe_environments, newSafePlace]
                        })
                        setNewSafePlace('')
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (newSafePlace.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        safe_environments: [...safetyPlan.safe_environments, newSafePlace]
                      })
                      setNewSafePlace('')
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reasons for Living */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Reasons for Living
            </CardTitle>
            <CardDescription>
              Things that are important to you and worth living for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {safetyPlan.reasons_for_living.map((reason, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    {reason}
                  </span>
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('reasons_for_living', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a reason for living..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newReason.trim()) {
                      setSafetyPlan({
                        ...safetyPlan,
                        reasons_for_living: [...safetyPlan.reasons_for_living, newReason]
                      })
                      setNewReason('')
                    }
                  }}
                />
                <Button onClick={() => {
                  if (newReason.trim()) {
                    setSafetyPlan({
                      ...safetyPlan,
                      reasons_for_living: [...safetyPlan.reasons_for_living, newReason]
                    })
                    setNewReason('')
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SafetyPage() {
  return (
    <AuthProvider>
      <SafetyContent />
    </AuthProvider>
  )
}