import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new NextResponse('E-mail é obrigatório', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.email) {
      // Para segurança, não informamos se o e-mail não foi encontrado.
      // Apenas enviamos uma mensagem genérica de sucesso.
      return new NextResponse('Se um e-mail cadastrado for encontrado, um link para redefinição de senha será enviado.', { status: 200 });
    }

    // Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 3600000); // Token válido por 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        // passwordResetExpires: passwordResetExpires, // Removido pois não existe no schema
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - Dra. Jandira Frederick',
      html: `
        <p>Olá ${user.name || ''},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para redefinir:</p>
        <p><a href="${resetUrl}">Redefinir Senha</a></p>
        <p>Este link é válido por 1 hora.</p>
        <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,</p>
        <p>Dra. Jandira Frederick</p>
      `,
    });

    return new NextResponse('Se um e-mail cadastrado for encontrado, um link para redefinição de senha será enviado.', { status: 200 });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return new NextResponse('Ocorreu um erro no servidor. Tente novamente mais tarde.', { status: 500 });
  }
}
