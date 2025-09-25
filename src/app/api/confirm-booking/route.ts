import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createClient } from '@/lib/utils/supabase.server';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingData }: {
      paymentIntentId: string;
      bookingData: {
        userId?: string;
        clientName: string;
        userEmail?: string;
        subServiceId: string;
        staffId: string;
        date: string;
        time: string;
      };
    } = await request.json();
    
    // Validate required fields
    if (!paymentIntentId || !bookingData) {
      return NextResponse.json(
        { error: 'Missing payment intent ID or booking data' },
        { status: 400 }
      );
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Use authenticated user's ID directly or find/create client
    let clientId: string;
    
    if (bookingData.userId) {
      // Use the authenticated user's ID
      clientId = bookingData.userId;
      
      // Ensure client record exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .single();
      
      if (!existingClient) {
        const { error: clientError } = await supabase
          .from('clients')
          .insert({ 
            id: clientId,
            full_name: bookingData.clientName,
            email: bookingData.userEmail || null
          });
        
        if (clientError) {
          console.error('Failed to create client record:', clientError);
          // Continue anyway, as the user is authenticated
        }
      }
    } else {
      // Fallback for legacy bookings
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('full_name', bookingData.clientName)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({ full_name: bookingData.clientName })
          .select('id')
          .single();

        if (clientError || !newClient) {
          throw new Error(clientError?.message || 'Failed to create client');
        }
        clientId = newClient.id;
      }
    }

    // Step 2: Get sub-service details for end time calculation and service_id
    const { data: subService, error: subServiceError } = await supabase
      .from('sub_services')
      .select('duration_minutes, service_id')
      .eq('id', bookingData.subServiceId)
      .single();

    if (subServiceError || !subService) {
      throw new Error('Sub-service not found');
    }

    // Step 3: Calculate appointment times
    const startTime = new Date(`${bookingData.date}T${bookingData.time}`);
    const endTime = new Date(startTime.getTime() + subService.duration_minutes * 60000);

    // Step 4: Create the appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        service_id: subService.service_id, // Use the parent service_id from sub_service
        staff_id: bookingData.staffId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed', // Since payment is completed
        notes: `Sub-service: ${bookingData.subServiceId}, Payment ID: ${paymentIntentId}`,
      })
      .select()
      .single();

    if (appointmentError) {
      throw new Error(appointmentError.message);
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Booking confirmed successfully',
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error details:', {
      message: errorMessage,
      error
    });
    return NextResponse.json(
      { error: `Failed to confirm booking: ${errorMessage}` },
      { status: 500 }
    );
  }
}