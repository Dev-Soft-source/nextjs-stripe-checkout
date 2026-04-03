import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import products from 'products';
import type { Product } from 'products';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(stripeSecret, { apiVersion: '2020-08-27' });

const getBaseUrl = (req: NextApiRequest) => {
  const origin = req.headers.origin;
  if (origin?.startsWith('http://') || origin?.startsWith('https://')) {
    return origin;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto =
    req.headers['x-forwarded-proto'] ||
    (typeof host === 'string' && host.includes('localhost')
      ? 'http'
      : 'https');

  if (host && typeof host === 'string') {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

type CheckoutBodyItem = { price?: string; quantity?: number };

const createLineItems = (items: CheckoutBodyItem[] | undefined) => {
  const productsById = new Map<string, Product>(
    products.map(product => [product.id, product])
  );

  return (items ?? [])
    .map(item => {
      const product = item?.price ? productsById.get(item.price) : undefined;
      const quantity = Number(item?.quantity) || 0;

      if (!product || quantity <= 0) {
        return null;
      }

      return {
        quantity,
        price_data: {
          currency: (product.currency || 'USD').toLowerCase(),
          unit_amount: product.price,
          product_data: {
            name: product.name,
          },
        },
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> => item !== null
    );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const baseUrl = getBaseUrl(req);
      const body = req.body as { items?: CheckoutBodyItem[] } | undefined;
      const lineItems = createLineItems(body?.items);

      if (!lineItems.length) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Cart is empty or contains invalid items.',
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cart`,
      });

      res.status(200).json(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ statusCode: 500, message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
