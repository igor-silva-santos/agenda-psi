import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  supabaseAdmin = createClient(url, key);
  return supabaseAdmin;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string; // Assuming userId is also sent

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await getSupabaseAdmin().storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Allow updating existing files
      });
    if (uploadError) {
      // --- DEBUG LOGS ---
      console.error('--- DEBUG: SUPABASE UPLOAD ERROR ---');
      console.error(uploadError);
      // --- END DEBUG LOGS ---
      throw uploadError; // Re-throw to be caught by the outer catch block
    }

    const { data } = getSupabaseAdmin().storage
      .from('avatars')
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl });

  } catch (error: any) {
    console.error('API upload error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}