# Stripe Payment Setup Guide

## Overview
This guide will help you set up Stripe payment processing for the Beneathy platform.

## Pricing Structure
- **Starter Plan**: $19/month
- **Growth Plan**: $39/month  
- **Premium Plan**: $79/month

## Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in to your account
3. Complete your business profile

## Step 2: Get Your API Keys
1. In Stripe Dashboard, go to **Developers > API Keys**
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 3: Create Products and Prices
1. Go to **Products** in Stripe Dashboard
2. Click **Add Product** for each plan:

### Starter Plan ($19/month)
```
Name: Starter Plan
Description: Essential mental wellness tools
Price: $19.00
Billing: Recurring monthly
```

### Growth Plan ($39/month)
```
Name: Growth Plan  
Description: Complete growth ecosystem
Price: $39.00
Billing: Recurring monthly
```

### Premium Plan ($79/month)
```
Name: Premium Plan
Description: Premium wellness experience  
Price: $79.00
Billing: Recurring monthly
```

3. After creating each product, copy the **Price ID** (starts with `price_`)

## Step 4: Set Up Webhook Endpoint
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 5: Update Environment Variables
Add these to your `.env.local` file:

```env
# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs for Subscription Tiers
# Starter Plan - $19/month
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID
# Growth Plan - $39/month  
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_YOUR_GROWTH_PRICE_ID
# Premium Plan - $79/month
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID
```

## Step 6: Test Your Integration

### Test Cards
Use these test card numbers in test mode:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

### Test Checkout Flow
1. Go to `/billing` page
2. Click "Upgrade" on any plan
3. Complete checkout with test card
4. Verify subscription in Stripe Dashboard

## Step 7: Go Live
When ready for production:
1. Replace test keys with live keys
2. Update webhook endpoint to production URL
3. Test with a real card (you can refund yourself)

## Database Schema Requirements
Ensure your `users` table has these columns:
```sql
stripe_customer_id TEXT
stripe_subscription_id TEXT
subscription_tier TEXT
subscription_status TEXT
subscription_cancel_at TIMESTAMP
```

## Troubleshooting

### Common Issues:
1. **"No such price" error**: Check that price IDs match exactly
2. **Webhook failures**: Verify webhook secret and endpoint URL
3. **Subscription not updating**: Check database column names match

### Support
- Stripe Support: https://support.stripe.com
- Stripe Docs: https://stripe.com/docs

## Security Notes
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Enable webhook signature verification
- Set up proper CORS headers for production