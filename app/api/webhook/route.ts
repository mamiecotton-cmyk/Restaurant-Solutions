import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Retrieve line items from Stripe
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const items = lineItems.data.map((item: any) => ({
      name: item.description,
      quantity: item.quantity,
      amount: item.amount_total,
    }))

    // Insert order into Supabase
    const { error } = await supabase.from('orders').insert({
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email ?? null,
      customer_name: session.customer_details?.name ?? null,
      items,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: 'new',
    })

    if (error) {
      console.error('Failed to insert order:', error)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }

    console.log(`✅ Order saved: ${session.id}`)
  }

  return NextResponse.json({ received: true })
}
