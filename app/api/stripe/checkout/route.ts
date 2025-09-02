import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { rateLimiters, getIdentifier, rateLimitResponse } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const identifier = getIdentifier(request)
  const { success, limit, reset, remaining } = await rateLimiters.api.limit(identifier)
  
  if (!success) {
    return rateLimitResponse(limit, remaining, reset)
  }
  
  try {
    const supabase = await createUntypedServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { priceId, planName } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = null
    
    // Check if user already has a Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      })
      
      customerId = customer.id
      
      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success&plan=${planName}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan_name: planName
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: planName
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// Cancel subscription endpoint
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createUntypedServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's subscription ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      userData.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    // Update user record
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'cancelling',
        subscription_cancel_at: new Date(subscription.cancel_at! * 1000).toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    })
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// Reactivate subscription endpoint
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createUntypedServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's subscription ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(
      userData.stripe_subscription_id,
      { cancel_at_period_end: false }
    )

    // Update user record
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'active',
        subscription_cancel_at: null
      })
      .eq('id', user.id)

    return NextResponse.json({ 
      success: true,
      message: 'Subscription reactivated successfully'
    })
  } catch (error) {
    console.error('Subscription reactivation error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}