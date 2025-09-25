import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const { amount, serviceId, serviceName } = await request.json();

    // Validate required fields
    if (!amount || !serviceId || !serviceName) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, serviceId, serviceName' },
        { status: 400 }
      );
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'zar', // South African Rand
      description: `Salon service booking: ${serviceName}`,
      metadata: {
        serviceId: serviceId,
        serviceName: serviceName,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}