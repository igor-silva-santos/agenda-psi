import { NextResponse, NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: Number(token.id) } });
  if (!user || (user as any).currentSessionId !== token.sessionId) {
    return new Response('Sessão concorrente detectada', { status: 401 });
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
    return NextResponse.json({ success: false, message: 'Erro ao processar a rota de WhatsApp' }, { status: 500 });
  }
}
