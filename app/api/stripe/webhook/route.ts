import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
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
        
        // Update user subscription in database
        if (session.customer_email) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.customer_email)
            .single()
          
          if (user) {
            // Determine subscription tier based on price
            let tier = 'free'
            if (session.amount_total) {
              if (session.amount_total >= 7900) tier = 'transform'
              else if (session.amount_total >= 3900) tier = 'explore'
            }
            
            await supabase
              .from('users')
              .update({ 
                subscription_tier: tier,
                stripe_customer_id: session.customer as string
              })
              .eq('id', user.id)
          }
        }
        break
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()
        
        if (user) {
          const tier = subscription.status === 'active' 
            ? 'explore' // You'd determine this from the price
            : 'free'
          
          await supabase
            .from('users')
            .update({ subscription_tier: tier })
            .eq('id', user.id)
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