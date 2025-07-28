import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken } from 'next-auth/jwt';

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ 
      error: "Unauthorized",
      details: { reason: 'Usuário não é admin', userRole: session?.user?.role }
    }, { status: 401 });
  }

  try {
    const { error: deleteError } = await supabase
      .from('BookableSlot')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Erro ao deletar bookable slot',
        details: { bookableSlotId: params.id, message: deleteError.message }
      }, { status: 500 });
    }

    return NextResponse.json({ message: "Bookable slot deletado com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting bookable slot:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}