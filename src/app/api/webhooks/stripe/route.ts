import dbConnect from '@/db/dbConfig'
import { stripe } from '@/lib/stripe'
import UserModel from '@/models/User'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('Stripe-Signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return new Response(
      `Webhook Error: ${
        err instanceof Error ? err.message : 'Unknown Error'
      }`,
      { status: 400 }
    )
  }

  const session = event.data
    .object as Stripe.Checkout.Session

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    })
  }

  if (event.type === 'checkout.session.completed') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

      await UserModel.updateOne(
        {kindId:session.metadata.userId},
        {$set:{
          stripeCustommerId:subscription.customer as string,
          stripeSubscriptionId:subscription.id,
          stripePriceId:subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        }
      )
    // await db.user.update({
    //   where: {
    //     id: session.metadata.userId,
    //   },
    //   data: {
    //     stripeSubscriptionId: subscription.id,
    //     stripeCustomerId: subscription.customer as string,
    //     stripePriceId: subscription.items.data[0]?.price.id,
    //     stripeCurrentPeriodEnd: new Date(
    //       subscription.current_period_end * 1000
    //     ),
    //   },
    // })
  }

  if (event.type === 'invoice.payment_succeeded') {
    // Retrieve the subscription details from Stripe.
      const subscription =await stripe.subscriptions.retrieve(session.subscription as string)


      await UserModel.updateOne(
        {stripeSubscriptionId:subscription.id},
        {$set:{
          stripePriceId:subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        }
      )
  }

  return new Response(null, { status: 200 })
}
