// src/app/api/appointments/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase.server';

export async function GET() {
  const supabase = await createClient();
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*, clients(*), services(*), staff(*)')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }

  return NextResponse.json(appointments);
}