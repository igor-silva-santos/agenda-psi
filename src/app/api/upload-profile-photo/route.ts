import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service_role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // --- DEBUG LOGS ---
    console.log('--- DEBUG: UPLOAD API CALLED ---');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY (first 5 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 5));
    // --- END DEBUG LOGS ---

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

    const { error: uploadError } = await supabaseAdmin.storage
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

    const { data } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl });

  } catch (error: any) {
    console.error('API upload error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}