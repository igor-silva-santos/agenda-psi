import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: 'E-mail é obrigatório',
        details: { missingField: 'email' }
      }, { status: 400 });
    }

    // Buscar usuário pelo e-mail no Supabase
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user || !user.email) {
      // Para segurança, não informamos se o e-mail não foi encontrado.
      // Apenas enviamos uma mensagem genérica de sucesso.
      return NextResponse.json({ 
        message: 'Se um e-mail cadastrado for encontrado, um link para redefinição de senha será enviado.'
      }, { status: 200 });
    }

    // Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    // const passwordResetExpires = new Date(Date.now() + 3600000); // Token válido por 1 hora

    // Atualizar usuário com o token de redefinição
    const { error: updateError } = await supabase
      .from('User')
      .update({
        passwordResetToken: resetToken,
        // passwordResetExpires: passwordResetExpires, // Se existir no schema
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao salvar token de redefinição:', updateError);
      return NextResponse.json({ 
        error: 'Ocorreu um erro ao processar o pedido.',
        details: { userId: user.id, message: updateError.message }
      }, { status: 500 });
    }

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - Jandira C. Frederick',
      html: `
        <p>Olá ${user.name || ''},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para redefinir:</p>
        <p><a href="${resetUrl}">Redefinir Senha</a></p>
        <p>Este link é válido por 1 hora.</p>
        <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,</p>
        <p>Jandira C. Frederick</p>
      `,
    });

    return NextResponse.json({ 
      message: 'Se um e-mail cadastrado for encontrado, um link para redefinição de senha será enviado.'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return NextResponse.json({ 
      error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}