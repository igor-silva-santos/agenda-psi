import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateInvoicePdf } from '@/lib/invoice-generator';

// GET /api/faturas/[id]/pdf — gera o PDF de uma fatura (admin ou o próprio paciente)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const { data: fatura, error } = await supabase
      .from('Fatura')
      .select('*, user:User(name, email, cpf)')
      .eq('id', params.id)
      .single();
    if (error || !fatura) {
      return NextResponse.json({ error: 'Fatura não encontrada.' }, { status: 404 });
    }

    const isOwner = fatura.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const itens = (Array.isArray(fatura.itens) ? fatura.itens : []).map((i: any) => ({
      data: i.data,
      status: i.status,
      valor: i.valor,
    }));

    const pdfBuffer = await generateInvoicePdf({
      patientName: fatura.user?.name || 'Paciente',
      patientCpf: fatura.user?.cpf,
      patientEmail: fatura.user?.email,
      itens,
      invoiceNumber: fatura.id.substring(0, 8),
      issueDate: new Date(fatura.createdAt).toLocaleDateString('pt-BR'),
      dueDate: new Date(fatura.dataVencimento).toLocaleDateString('pt-BR'),
      valorTotal: fatura.valorTotal,
      observacao: fatura.observacao,
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="fatura_${fatura.id.substring(0, 8)}.pdf"`);
    return new Response(new Uint8Array(pdfBuffer), { status: 200, headers });
  } catch (err: any) {
    console.error('[FATURA][PDF] Erro:', err);
    return NextResponse.json({ error: 'Erro ao gerar PDF.', details: err?.message }, { status: 500 });
  }
}
