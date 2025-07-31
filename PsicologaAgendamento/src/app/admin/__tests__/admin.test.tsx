import { render, screen, fireEvent, waitFor, act } from '@/../src/__tests__/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from '../page';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { useRouter } from 'next/navigation';

// Helper object to control pathname state
const pathnameState = {
  currentPathname: '/',
};

// Create a mock for the router object
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: vi.fn(() => pathnameState.currentPathname),
}));

// Mock do next-auth/react para useSession
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock do next-auth para getServerSession
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock do prisma para evitar erros de importação em testes de UI
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    agendamento: {
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    bookableSlot: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock para fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockBookableSlot = {
  id: 'slot-id',
  date: new Date().toISOString(),
  startTime: '09:00',
  endTime: '10:00',
};

describe('Admin Panel', () => {
  const mockAdminSession = {
    user: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  const mockUser = {
    id: 2,
    name: 'User Teste',
    email: 'user@example.com',
    cpf: '123.456.789-00',
    telefone: '11999999999',
    prontuario: ''
  };

  // --- Usuários Tab Tests ---
  it('should navigate to Usuários tab and display link to all users', async () => {
    const usersTab = screen.getByRole('button', { name: /Usuários/i });
      fireEvent.click(usersTab);
      expect(screen.getByText('Gerenciar Usuários')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Ver Todos os Usuários/i })).toBeInTheDocument();
  });

  // --- Disponibilidade Tab Tests ---
  it('should navigate to Disponibilidade tab and display slot manager', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(useSession).mockReturnValue({ data: mockAdminSession, status: 'authenticated', update: vi.fn() });
    await act(async () => {
      render(<AdminPage />);
    });
    const disponibilidadeTab = screen.getByRole('button', { name: /Disponibilidade/i });
    await act(async () => {
      fireEvent.click(disponibilidadeTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Gerenciar Horários do Dia')).toBeInTheDocument();
      expect(screen.getByText('Selecione um dia no calendário para gerenciar os horários.')).toBeInTheDocument();
    });
  });

  it('should generate new bookable slots', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(useSession).mockReturnValue({ data: mockAdminSession, status: 'authenticated', update: vi.fn() });
    await act(async () => {
      render(<AdminPage />);
    });
    const disponibilidadeTab = screen.getByRole('button', { name: /Disponibilidade/i });
    await act(async () => {
      fireEvent.click(disponibilidadeTab);
    });

    await waitFor(() => screen.getByText('Gerenciar Horários do Dia'));

    // Select a day in the calendar (mocking the onSelect behavior)
    const dayPicker = screen.getByRole('grid'); // Assuming DayPicker renders a grid
    await act(async () => {
      fireEvent.click(screen.getByText(new Date().getDate().toString())); // Click today's date
    });

    const startTimeInput = screen.getByLabelText('Início:');
    const endTimeInput = screen.getByLabelText('Fim:');
    const generateButton = screen.getByRole('button', { name: /Gerar Horários/i });

    await act(async () => {
      fireEvent.change(startTimeInput, { target: { value: '09:00' } });
      fireEvent.change(endTimeInput, { target: { value: '10:00' } });
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/generate-bookable-slots',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            date: expect.any(String),
            startTime: '09:00',
            endTime: '10:00',
          }),
        })
      );
    });
  });

  it('should delete a bookable slot', async () => {
    window.confirm = vi.fn(() => true); // Mock confirm dialog
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(useSession).mockReturnValue({ data: mockAdminSession, status: 'authenticated', update: vi.fn() });
    await act(async () => {
      render(<AdminPage />);
    });
    const disponibilidadeTab = screen.getByRole('button', { name: /Disponibilidade/i });
    await act(async () => {
      fireEvent.click(disponibilidadeTab);
    });

    await waitFor(() => screen.getByText('Gerenciar Horários do Dia'));

    // Ensure a slot is displayed (mocked by beforeEach)
    expect(screen.getByText(/\d{2}:\d{2} - \d{2}:\d{2}/)).toBeInTheDocument();

    const deleteSlotButton = screen.getByRole('button', { name: /Trash2/i });
    await act(async () => {
      fireEvent.click(deleteSlotButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/bookable-slots/${mockBookableSlot.id}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    
    });
  });
});