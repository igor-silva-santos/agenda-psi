import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name, role, cpf, dataNascimento, telefone } = await request.json();

    if (!email || !password || !name || !role || !cpf || !dataNascimento || !telefone) {
      return NextResponse.json({ 
        error: 'Email, password, name, role, cpf, dataNascimento e telefone são obrigatórios',
        details: {
          missingFields: [
            !email && 'email',
            !password && 'password',
            !name && 'name',
            !role && 'role',
            !cpf && 'cpf',
            !dataNascimento && 'dataNascimento',
            !telefone && 'telefone'
          ].filter(Boolean)
        }
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('User')
      .insert([
        {
          email,
          password: hashedPassword,
          name,
          role,
          cpf,
          dataNascimento: new Date(dataNascimento),
          telefone,
        },
      ])
      .select('id, email, name, role')
      .single();
    if (error) throw error;

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create user',
      details: { message: error.message || 'Erro desconhecido' }
    }, { status: 500 });
  }
}
