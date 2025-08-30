import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'

/**
 * Set a user as admin by email
 * @param email - The email address of the user to make admin
 * @returns Success status and message
 */
export async function setUserAsAdmin(email: string) {
  const supabase = createClient()
  
  try {
    // First, get the user from auth.users
    const { data: authUser, error: authError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .single()

    if (authError || !authUser) {
      // User doesn't exist in profiles, try to find in auth.users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        return {
          success: false,
          message: 'Unable to find user. Make sure they have signed up first.',
          error: usersError
        }
      }

      const user = users?.find(u => u.email === email)
      
      if (!user) {
        return {
          success: false,
          message: `No user found with email: ${email}`
        }
      }

      // Create profile with admin role
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Admin User',
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)

      if (insertError) {
        return {
          success: false,
          message: 'Error creating admin profile',
          error: insertError
        }
      }

      return {
        success: true,
        message: `Successfully created admin profile for ${email}`
      }
    }

    // User exists, update their role
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ 
        role: 'admin' as const,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        message: 'Failed to update user role',
        error
      }
    }

    return {
      success: true,
      message: `Successfully set ${email} as admin`,
      data
    }
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    }
  }
}

/**
 * Check if a user is an admin
 * @param userId - The ID of the user to check
 * @returns Boolean indicating admin status
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return (data as any).role === 'admin'
}

/**
 * Get all admin users
 * @returns List of admin users
 */
export async function getAdminUsers() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }

  return data || []
}

/**
 * Quick setup for Ismael Mvula as admin
 * Run this function once to set up the admin user
 */
export async function setupIsmaelAsAdmin() {
  const result = await setUserAsAdmin('ismaelmvula@gmail.com')
  
  if (result.success) {
    console.log('✅', result.message)
  } else {
    console.error('❌', result.message, result.error)
  }
  
  return result
}