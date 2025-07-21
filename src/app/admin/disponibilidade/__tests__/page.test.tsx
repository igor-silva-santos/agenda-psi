import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDisponibilidadePage from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('AdminDisponibilidadePage', () => {
  it('renderiza a página e componentes principais', () => {
    render(<AdminDisponibilidadePage />);
    expect(screen.getByText(/Gerenciar Disponibilidade/i)).toBeInTheDocument();
    expect(screen.getByText(/Horários de Atuação/i)).toBeInTheDocument();
    expect(screen.getByText(/Horários Bloqueados/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione uma Data/i)).toBeInTheDocument();
  });
}); 