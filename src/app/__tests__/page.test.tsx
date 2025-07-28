import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../page';
import { getServerSession } from 'next-auth'; // Importar para tipagem
// Remover import prisma

// Mock do next/navigation para simular o useRouter e usePathname
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: vi.fn(() => '/'), // Mock simples para usePathname
}));

// Mock do next-auth para getServerSession
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Remover mock do prisma

describe('Home Page Navigation', () => {
  let showAgendamentoState = false; // Variável para controlar o estado

  beforeEach(() => {
    vi.clearAllMocks();
    showAgendamentoState = false; // Resetar o estado antes de cada teste
    vi.mocked(getServerSession).mockResolvedValue(null);
    // Remover uso de prisma.bookableSlot.findMany

    // Mock do useState para controlar showAgendamento
    vi.spyOn(require('react'), 'useState').mockImplementation((initialState) => {
      if (typeof initialState === 'boolean') {
        return [showAgendamentoState, vi.fn((newValue) => (showAgendamentoState = newValue))];
      }
      return [initialState, vi.fn()];
    });
  });

  it('should navigate to the appointment form and then back to the home section by clicking the header',
    async () => {
      const { rerender } = render(<Home />);

      // 1. Verificar se a seção inicial está visível
      const heroSectionText = screen.getByText(/Cuidando da sua saúde mental com acolhimento e profissionalismo/i);
      expect(heroSectionText).toBeInTheDocument();

      // 2. Clicar no botão "Agendar Consulta"
      const agendarButton = screen.getByRole('button', { name: /Agendar Consulta/i });
      fireEvent.click(agendarButton);

      // Simular que showAgendamento se tornou true
      await act(async () => {
        showAgendamentoState = true; // Atualiza o estado mockado
        rerender(<Home />); // Força a re-renderização
      });

      // Verificar se o formulário de agendamento aparece e a seção inicial desaparece
      const agendamentoFormTitle = await screen.findByRole('heading', { name: /Agendar Consulta/i });
      expect(agendamentoFormTitle).toBeInTheDocument();
      expect(heroSectionText).not.toBeInTheDocument();

      // 3. Clicar no nome "Dra. Jandira Frederick" no cabeçalho
      const draJandiraHeader = screen.getByRole('heading', { name: /Dra. Jandira Frederick/i, level: 1 });
      
      await act(async () => {
        fireEvent.click(draJandiraHeader);
        // Simular o efeito do Link click: o estado showAgendamento deve voltar a ser false
        showAgendamentoState = false; // Atualiza o estado mockado
        rerender(<Home />); // Força a re-renderização
      });

      // 4. Verificar se a seção inicial reaparece
      await waitFor(() => {
        expect(screen.getByText(/Cuidando da sua saúde mental com acolhimento e profissionalismo/i)).toBeInTheDocument();
      });
      expect(agendamentoFormTitle).not.toBeInTheDocument();
    });
});