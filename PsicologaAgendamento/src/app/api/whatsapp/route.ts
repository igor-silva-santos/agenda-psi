import { NextResponse, NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: { reason: 'Token ausente' }
    }, { status: 401 });
  }
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', Number(token.id))
    .single();
  if (!user || user.currentSessionId !== token.sessionId) {
    return NextResponse.json({ 
      error: 'Sessão concorrente detectada',
      details: { userId: token.id, sessionId: token.sessionId }
    }, { status: 401 });
  }
  try {
    // --- LÓGICA DA API COMENTADA ---
    // A lógica para enviar uma mensagem via Twilio estaria aqui.
    // Como esta funcionalidade não está implementada e requer chaves de API,
    // o código foi comentado para garantir que o build na Vercel seja bem-sucedido.
    // Quando decidir implementar, pode remover os comentários e adicionar o seu código.
    
    console.log("Rota de WhatsApp chamada, mas a lógica está desativada.");

    return NextResponse.json({ success: true, message: 'Rota de WhatsApp contactada (lógica não implementada).' });
  } catch (error) {
    console.error("Erro na rota de WhatsApp:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a rota de WhatsApp',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
