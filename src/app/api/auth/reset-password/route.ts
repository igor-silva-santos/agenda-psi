import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    console.log('DEBUG API: Received token:', token);
    console.log('DEBUG API: Received password (length):', password ? password.length : 'undefined');

    if (!token || !password) {
      console.log('DEBUG API: Missing token or password');
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    // 1. Encontrar e validar o token
    const { data: resetToken, error: tokenError } = await supabase
      .from('PasswordResetTokens')
      .select('*')
      .eq('token', token)
      .single();

    console.log('DEBUG API: Supabase resetToken:', resetToken);
    console.log('DEBUG API: Supabase tokenError:', tokenError);

    if (tokenError || !resetToken) {
      console.log('DEBUG API: Token not found or Supabase error');
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      console.log('DEBUG API: Token expired');
      // Token expirado, remover e informar
      await supabase.from('PasswordResetTokens').delete().eq('token', token);
      return NextResponse.json({ error: 'Token expirado. Solicite uma nova recuperação de senha.' }, { status: 400 });
    }

    // 2. Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Atualizar a senha do usuário
    const { error: updateError } = await supabase
      .from('User')
      .update({ password: hashedPassword })
      .eq('id', resetToken.user_id);

    if (updateError) {
      console.error('Erro ao atualizar senha do usuário:', updateError);
      return NextResponse.json({ error: 'Erro interno ao redefinir a senha.' }, { status: 500 });
    }

    // 4. Invalidar (deletar) o token usado
    await supabase.from('PasswordResetTokens').delete().eq('token', token);

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro na rota /api/auth/reset-password:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}