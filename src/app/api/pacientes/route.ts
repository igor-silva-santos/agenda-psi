import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { nomeCompleto, email, cpf, dataNascimento, senha, telefone } = await request.json();
    if (!nomeCompleto || !email || !cpf || !dataNascimento || !senha || !telefone) {
      return NextResponse.json({ 
        error: 'Todos os campos são obrigatórios.',
        details: {
          missingFields: [
            !nomeCompleto && 'nomeCompleto',
            !email && 'email',
            !cpf && 'cpf',
            !dataNascimento && 'dataNascimento',
            !senha && 'senha',
            !telefone && 'telefone'
          ].filter(Boolean)
        }
      }, { status: 400 });
    }
    console.log('Recebido dataNascimento:', dataNascimento);
    // Verifica se já existe paciente com o mesmo CPF
    const existing = await prisma.user.findUnique({ where: { cpf } });
    if (existing) {
      if (existing.role === 'ADMIN') {
        return NextResponse.json({ 
          error: 'Não é possível agendar consulta para um usuário administrador.',
          details: { userId: existing.id, role: existing.role }
        }, { status: 403 });
      }
      return NextResponse.json({ 
        error: 'Já existe um paciente com este CPF.',
        details: { cpf, existingUserId: existing.id }
      }, { status: 409 });
    }
    const hashed = await bcrypt.hash(senha, 10);
    const paciente = await prisma.user.create({
      data: {
        name: nomeCompleto,
        email,
        cpf,
        dataNascimento: new Date(dataNascimento.split('T')[0]), // Garante hora zero
        password: hashed,
        telefone,
        role: 'PACIENTE',
      } as any,
    });
    // Não retornar a senha
    const { password: _, ...pacienteSemSenha } = paciente;
    // Retornar dataNascimento apenas como 'YYYY-MM-DD'
    return NextResponse.json({ ...pacienteSemSenha, dataNascimento: paciente.dataNascimento ? paciente.dataNascimento.toISOString().split('T')[0] : null }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    // Prisma duplicate error
    const prismaError = error as any;
    if (prismaError.code === 'P2002' && prismaError.meta && prismaError.meta.target && prismaError.meta.target.includes('email')) {
      return NextResponse.json({ 
        error: 'Já existe um paciente com este e-mail.',
        details: { email, constraint: 'email_unique' }
      }, { status: 409 });
    }
    return NextResponse.json({ 
      error: 'Erro interno ao cadastrar paciente.',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
} 