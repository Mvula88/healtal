import { NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Special check for Ismael Mvula
    const allowedAdminEmails = [
      'ismaelmvula@gmail.com',
      // Add other trusted admin emails here
    ]

    if (!allowedAdminEmails.includes(email)) {
      return NextResponse.json(
        { error: 'Unauthorized: This email is not authorized to be set as admin' },
        { status: 403 }
      )
    }

    const supabase = await createUntypedServerClient()
    const adminSupabase = createAdminClient()

    // First check if user exists in auth.users
    const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers()
    
    if (usersError) {
      // Fallback: Try to update profile directly
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin' as const,
            updated_at: new Date().toISOString()
          } as any)
          .eq('email', email)
          .select()
          .single()

        if (error) {
          return NextResponse.json(
            { error: 'Failed to update user role', details: error },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: `Successfully set ${email} as admin`,
          user: data
        })
      }
    }

    const user = users?.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: `No user found with email: ${email}. Please sign up first.` },
        { status: 404 }
      )
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin' as const,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update user role', details: error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${email} to admin role`,
        user: data
      })
    } else {
      // Create new profile with admin role
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Ismael Mvula',
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create admin profile', details: error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully created admin profile for ${email}`,
        user: data
      })
    }
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}

// GET endpoint to check current admin status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    )
  }

  const supabase = await createUntypedServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('email', email)
    .single()

  if (error || !data) {
    return NextResponse.json({
      isAdmin: false,
      message: 'User not found or not an admin'
    })
  }

  return NextResponse.json({
    isAdmin: (data as any).role === 'admin',
    user: data,
    message: (data as any).role === 'admin' 
      ? `${email} is an admin` 
      : `${email} is not an admin (role: ${(data as any).role})`
  })
}