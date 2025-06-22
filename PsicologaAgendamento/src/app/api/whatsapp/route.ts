import { NextResponse } from 'next/server';

// Rota de API de exemplo, não implementada.
// CORREÇÃO: A variável 'request' não era usada, então foi prefixada com _.
export async function POST(_request: Request) {
  try {
    // A lógica para enviar uma mensagem via Twilio estaria aqui.
    return NextResponse.json({ success: true, message: 'Mensagem enviada' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}