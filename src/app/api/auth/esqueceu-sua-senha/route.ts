import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import { sendEmail } from '@/lib/email'; // Importar o utilitário de e-mail
import { siteConfig } from '@/config/site';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    // 1. Verificar se o usuário existe
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Não informar se o e-mail não existe por segurança
      console.warn('Tentativa de recuperação de senha para e-mail não encontrado:', email);
      return NextResponse.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.' }, { status: 200 });
    }

    // 2. Gerar token de recuperação
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 3600 * 1000); // Token válido por 1 hora

    // 3. Salvar token no banco de dados
    const { error: tokenError } = await supabase
      .from('PasswordResetTokens')
      .insert([
        {
          user_id: user.id,
          token: token,
          expires_at: expiresAt.toISOString(),
        },
      ]);

    if (tokenError && tokenError.message) {
      console.error('Erro ao salvar token de recuperação:', tokenError);
      return NextResponse.json({ error: 'Erro interno ao gerar link de recuperação.' }, { status: 500 });
    }

    // 4. Enviar e-mail com o link de recuperação
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/recuperar-senha?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Recuperação de Senha - {siteConfig.professionalName}',
      html: `<p>Olá,</p><p>Você solicitou a recuperação de senha para sua conta.</p><p>Clique no link abaixo para redefinir sua senha:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Este link é válido por 1 hora.</p><p>Se você não solicitou esta recuperação, por favor, ignore este e-mail.</p>`,
    });

    return NextResponse.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.' }, { status: 200 });
  } catch (error) {
    console.error('Erro na rota /api/auth/esqueceu-sua-senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
