import { NextRequest, NextResponse } from 'next/server';

// API desativada conforme solicitado
// WhatsApp notifications foram removidas temporariamente

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      message: 'WhatsApp notifications are currently disabled' 
    },
    { status: 503 }
  );
}

