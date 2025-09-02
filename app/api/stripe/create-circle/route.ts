import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia' as any
})

export async function POST(request: Request) {
  try {
    const { circleId, userId } = await request.json()
    
    // Get user and circle details
    const supabase = await createUntypedServerClient()
    
    // Check if user can join circles
    const { data: userTier } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()
    
    const { data: tierLimits } = await supabase
      .from('tier_limits')
      .select('can_join_circles, circle_discount_percent')
      .eq('tier', userTier.subscription_tier)
      .single()
    
    if (!tierLimits?.can_join_circles) {
      return NextResponse.json(
        { error: 'Your subscription tier does not allow joining healing circles. Please upgrade to Growth or Premium.' },
        { status: 403 }
      )
    }
    
    // Get circle details
    const { data: circle } = await supabase
      .from('healing_circles')
      .select(`
        *,
        guide:circle_guides(
          user_id,
          stripe_account_id
        )
      `)
      .eq('id', circleId)
      .single()
    
    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }
    
    // Calculate price with tier discount
    const discount = tierLimits.circle_discount_percent || 0
    const finalPrice = circle.price * (1 - discount / 100)
    
    // Get or create Stripe customer
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', userId)
      .single()
    
    let customerId = user.stripe_customer_id
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          supabase_user_id: userId
        }
      })
      
      customerId = customer.id
      
      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }
    
    // Create Stripe product if not exists
    let productId = circle.stripe_product_id
    
    if (!productId) {
      const product = await stripe.products.create({
        name: circle.title,
        description: circle.description,
        metadata: {
          circle_id: circleId,
          guide_id: circle.guide_id,
          duration_weeks: circle.duration_weeks.toString()
        }
      })
      
      productId = product.id
      
      // Save product ID
      await supabase
        .from('healing_circles')
        .update({ stripe_product_id: productId })
        .eq('id', circleId)
    }
    
    // Create price for this specific user (with discount)
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(finalPrice * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'week',
        interval_count: 1
      },
      metadata: {
        circle_id: circleId,
        user_id: userId,
        discount_applied: discount.toString(),
        original_price: circle.price.toString()
      }
    })
    
    // Create checkout session with Connect for guide payouts
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/healing-circles/${circleId}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/healing-circles/${circleId}`,
      metadata: {
        circle_id: circleId,
        user_id: userId,
        guide_id: circle.guide_id
      },
      subscription_data: {
        metadata: {
          circle_id: circleId,
          user_id: userId,
          guide_id: circle.guide_id
        },
        // Set up application fee for platform (20%)
        application_fee_percent: 20
      },
      // If guide has Stripe Connect account, set up direct payment
      ...(circle.guide?.stripe_account_id && {
        payment_intent_data: {
          application_fee_amount: Math.round(finalPrice * 100 * 0.2), // 20% platform fee
          on_behalf_of: circle.guide.stripe_account_id,
          transfer_data: {
            destination: circle.guide.stripe_account_id
          }
        }
      })
    })
    
    // Create pending membership
    await supabase
      .from('circle_members')
      .insert({
        circle_id: circleId,
        user_id: userId,
        status: 'pending',
        payment_status: 'pending'
      })
    
    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    })
    
  } catch (error) {
    console.error('Error creating circle checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}