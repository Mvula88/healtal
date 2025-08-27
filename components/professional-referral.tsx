'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  UserCheck, 
  MapPin, 
  Phone, 
  Globe, 
  DollarSign,
  Star,
  ChevronRight,
  Search,
  Filter,
  Heart
} from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'

interface Professional {
  id: string
  name: string
  title: string
  specialties: string[]
  location: string
  virtual: boolean
  inPerson: boolean
  insuranceAccepted: string[]
  priceRange: string
  rating: number
  bio: string
  url?: string
}

// Mock data - in production, this would come from an API
const PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Licensed Clinical Psychologist',
    specialties: ['Trauma', 'Relationships', 'Anxiety'],
    location: 'New York, NY',
    virtual: true,
    inPerson: true,
    insuranceAccepted: ['Aetna', 'BlueCross', 'United'],
    priceRange: '$150-$250',
    rating: 4.9,
    bio: 'Specializes in root cause therapy and trauma-informed care.',
    url: 'https://example.com'
  },
  {
    id: '2',
    name: 'Michael Chen, LMFT',
    title: 'Licensed Marriage & Family Therapist',
    specialties: ['Couples', 'Family Systems', 'Communication'],
    location: 'Los Angeles, CA',
    virtual: true,
    inPerson: false,
    insuranceAccepted: ['Cigna', 'Kaiser'],
    priceRange: '$120-$180',
    rating: 4.8,
    bio: 'Expert in family dynamics and relationship patterns.'
  },
  {
    id: '3',
    name: 'Dr. Amanda Williams',
    title: 'Psychiatrist',
    specialties: ['Medication Management', 'Depression', 'ADHD'],
    location: 'Chicago, IL',
    virtual: true,
    inPerson: true,
    insuranceAccepted: ['Most major insurance'],
    priceRange: '$200-$350',
    rating: 4.7,
    bio: 'Holistic approach combining medication and lifestyle changes.'
  }
]

export function ProfessionalReferral() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [virtualOnly, setVirtualOnly] = useState(false)

  const filteredProfessionals = PROFESSIONALS.filter(prof => {
    if (searchTerm && !prof.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !prof.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedSpecialty && !prof.specialties.includes(selectedSpecialty)) {
      return false
    }
    if (virtualOnly && !prof.virtual) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Professional Support</CardTitle>
          <CardDescription>
            While {APP_CONFIG.name} helps you understand your patterns, sometimes professional therapy is the next step.
            We've partnered with licensed therapists who specialize in root cause work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> {APP_CONFIG.name} is an AI Personal Growth Coach, not therapy. 
              These are independent licensed professionals we recommend for therapeutic support.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="search">Search by name or location</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="specialty">Specialty</Label>
                <select
                  id="specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full mt-1 rounded-md border-gray-300"
                >
                  <option value="">All Specialties</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Depression">Depression</option>
                  <option value="Family Systems">Family Systems</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={virtualOnly}
                    onChange={(e) => setVirtualOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Virtual only</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{professional.name}</h3>
                      <p className="text-sm text-gray-600">{professional.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {professional.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {professional.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{professional.priceRange}</p>
                      <div className="flex gap-2 mt-2">
                        {professional.virtual && (
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                        {professional.inPerson && (
                          <Badge variant="secondary" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            In-Person
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{professional.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {professional.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Insurance: {professional.insuranceAccepted.join(', ')}
                    </p>
                    <Button size="sm" variant="outline">
                      Contact
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProfessionals.length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No professionals found matching your criteria.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function MiniReferralPrompt() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              Ready for Professional Support?
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              {APP_CONFIG.name} has helped you understand your patterns. 
              Now work with a licensed therapist to create lasting change.
            </p>
          </div>
          <UserCheck className="h-8 w-8 text-blue-600" />
        </div>
        <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
          Find a Therapist
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}