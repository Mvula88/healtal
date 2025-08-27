'use client'

import { AlertTriangle, Phone, MessageCircle, ExternalLink } from 'lucide-react'
import { CRISIS_RESOURCES, LEGAL_DISCLAIMER } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CrisisResources() {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-900">Need Immediate Help?</CardTitle>
        </div>
        <CardDescription className="text-orange-800">
          If you're in crisis or need immediate support, please reach out to these resources:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {CRISIS_RESOURCES.map((resource) => (
          <div key={resource.name} className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm">{resource.name}</p>
              <p className="text-sm text-gray-600">{resource.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-orange-600">{resource.number}</span>
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-orange-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function LegalDisclaimer() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5" />
        <div className="flex-1 text-sm text-gray-600">
          <p className="whitespace-pre-line">{LEGAL_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  )
}

export function MiniCrisisBar() {
  return (
    <div className="bg-orange-50 border-t border-orange-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <span className="text-orange-800">
          Need immediate help? Call 988 for crisis support
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-orange-600 hover:text-orange-700"
          onClick={() => window.open('https://988lifeline.org/', '_blank')}
        >
          <Phone className="h-3 w-3 mr-1" />
          Crisis Resources
        </Button>
      </div>
    </div>
  )
}