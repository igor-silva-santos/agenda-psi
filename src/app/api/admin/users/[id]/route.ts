import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: { id: number } }) {
  try {
    const { id } = params;
    const { name, email, password, role } = await request.json();

    if (!id) {
      return NextResponse.json({ 
        error: 'User ID is required',
        details: { missingField: 'id' }
      }, { status: 400 });
    }

    const updateData: any = {
      name,
      email,
      role,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const { data: updatedUser, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role')
      .single();
    if (error) throw error;

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update user',
      details: { message: error.message || 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ 
        error: 'User ID is required',
        details: { missingField: 'id' }
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete user',
      details: { message: error.message || 'Erro desconhecido' }
    }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: number } }) {
  console.log('[USERS][GET][id] Início da requisição', { params });
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('id, name, email, role')
      .eq('id', params.id)
      .single();
    if (error) throw error;
    if (!user) {
      console.warn('[USERS][GET][id] Usuário não encontrado', { params });
      return NextResponse.json({ 
        error: 'Usuário não encontrado',
        details: { userId: params.id }
      }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('[USERS][GET][id] ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao buscar usuário',
      details: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    }, { status: 500 });
  }
}
