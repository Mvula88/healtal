import { NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET() {
  try {
    const supabase = await createUntypedServerClient()
    
    // Get user count from database
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error fetching user count:', error)
      return NextResponse.json({ count: 0 })
    }
    
    return NextResponse.json({ 
      count: count || 0,
      // You can add more stats here
      satisfaction: 95, // This would come from actual reviews/feedback
      confidential: 100 // Always 100% confidential
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ count: 0 })
  }
}