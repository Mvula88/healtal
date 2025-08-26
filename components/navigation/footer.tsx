import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold">InnerRoot</span>
            </div>
            <p className="text-sm text-gray-600">
              Where your story becomes your strength. Personal growth and self-discovery wellness platform.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-gray-600 hover:text-gray-900">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/get-help" className="text-sm text-gray-600 hover:text-gray-900">
                  Crisis Resources
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-gray-600 hover:text-gray-900">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimers" className="text-sm text-gray-600 hover:text-gray-900">
                  Disclaimers
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 InnerRoot. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-500 max-w-2xl text-center md:text-right">
                InnerRoot is a personal growth and wellness platform for educational purposes only. 
                Not intended to diagnose, treat, cure, or prevent any medical or mental health condition. 
                If experiencing a crisis, please call 988 or seek professional help immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}