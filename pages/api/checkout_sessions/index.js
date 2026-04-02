import Stripe from 'stripe';
import products from 'products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getBaseUrl = req => {
  const origin = req.headers.origin;
  if (origin?.startsWith('http://') || origin?.startsWith('https://')) {
    return origin;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto =
    req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

const createLineItems = items => {
  const productsById = new Map(products.map(product => [product.id, product]));

  return (items ?? [])
    .map(item => {
      const product = productsById.get(item?.price);
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
    .filter(Boolean);
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const baseUrl = getBaseUrl(req);
      const lineItems = createLineItems(req?.body?.items);

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
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
