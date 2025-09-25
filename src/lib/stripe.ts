import { loadStripe } from '@stripe/stripe-js';

// Client-side Stripe only
export const getStripe = () => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );
  return stripePromise;
};
