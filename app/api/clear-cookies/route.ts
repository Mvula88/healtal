import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Clear all cookies
  allCookies.forEach(cookie => {
    cookieStore.delete(cookie.name)
  })
  
  return NextResponse.json({ 
    message: 'All cookies cleared',
    clearedCount: allCookies.length 
  })
}