import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

// Initialize Stripe only if we have a key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
}) : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.')
    return NextResponse.json(
      { error: 'Payment processing not configured' },
      { status: 503 }
    )
  }

  const body = await req.text()
  const signature = headers().get('stripe-signature') as string

  let event: Stripe.Event

  try {
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = await createUntypedServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get subscription details
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const userId = session.metadata?.user_id
        const planName = session.metadata?.plan_name
        
        if (userId) {
          // Determine subscription tier
          let tier = 'starter'
          if (planName) {
            tier = planName.toLowerCase()
          } else if (session.amount_total) {
            // Fallback to amount-based detection
            if (session.amount_total >= 7900) tier = 'premium'
            else if (session.amount_total >= 3900) tier = 'growth'
            else tier = 'starter'
          }
          
          await supabase
            .from('users')
            .update({ 
              subscription_tier: tier,
              subscription_status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId
            })
            .eq('id', userId)
        }
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id
        
        // Determine tier from price ID
        let tier = 'starter'
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
          tier = 'premium'
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID) {
          tier = 'growth'
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
          tier = 'starter'
        }
        
        // Update subscription in database
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        
        if (user) {
          await supabase
            .from('users')
            .update({ 
              subscription_tier: tier,
              subscription_status: subscription.status,
              stripe_subscription_id: subscription.id,
              subscription_cancel_at: subscription.cancel_at ? 
                new Date(subscription.cancel_at * 1000).toISOString() : null
            })
            .eq('id', user.id)
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Update subscription status to cancelled
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        
        if (user) {
          await supabase
            .from('users')
            .update({ 
              subscription_tier: null,
              subscription_status: 'cancelled',
              stripe_subscription_id: null
            })
            .eq('id', user.id)
        }
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        // You can add additional logic here like sending receipts
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Update subscription status
        const { data: user } = await supabase
          .from('users')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single()
        
        if (user) {
          await supabase
            .from('users')
            .update({ 
              subscription_status: 'past_due'
            })
            .eq('id', user.id)
          
          // You could send an email notification here
          console.log(`Payment failed for user ${user.email}`)
        }
        break
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}