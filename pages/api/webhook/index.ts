import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(stripeSecret, { apiVersion: '2020-08-27' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    let event: Stripe.Event;

    try {
      const rawBody = await buffer(req);
      const signature = req.headers['stripe-signature'];

      if (typeof signature !== 'string' || !webhookSecret) {
        throw new Error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
      }

      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        signature,
        webhookSecret
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.log(`❌ Error message: ${message}`);
      res.status(400).send(`Webhook Error: ${message}`);
      return;
    }

    console.log('✅ Success:', event.id);

    if (event.type === 'checkout.session.completed') {
      console.log('💰  Payment received!');
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
