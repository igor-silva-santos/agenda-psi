import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { token, password } = validation.data;

    // Buscar usuário pelo token no Supabase
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('passwordResetToken', token)
      .single();

    if (findError || !user) {
      return NextResponse.json({ 
        error: 'Token inválido ou expirado.',
        details: { token: token.substring(0, 8) + '...' }
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha e limpar token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        password: hashedPassword,
        passwordResetToken: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return NextResponse.json({ 
        error: 'Ocorreu um erro ao atualizar a senha.',
        details: { userId: user.id, message: updateError.message }
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ 
      error: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
