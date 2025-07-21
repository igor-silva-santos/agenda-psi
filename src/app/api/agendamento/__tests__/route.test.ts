import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createCalendarEvent } from '@/lib/googleCalendar';
import { getServerSession } from 'next-auth';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    agendamento: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock sendEmail
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}));

// Mock createCalendarEvent
vi.mock('@/lib/googleCalendar', () => ({
  createCalendarEvent: vi.fn(),
}));

// Mock getServerSession
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  cpf: '123.456.789-00',
  telefone: '11999999999',
};

const mockAdminSession = {
  user: {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
};

const mockUserSession = {
  id: 'user-user-id',
  name: 'User User',
  email: 'user@example.com',
  role: 'USER',
};

describe('POST /api/agendamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for getServerSession to return a patient session
    (getServerSession as vi.Mock).mockResolvedValue(mockUserSession);
  });

  it('should create a new patient and appointment for a new email', async () => {
    (prisma.user.upsert as vi.Mock).mockResolvedValue(mockUser);
    (prisma.agendamento.create as vi.Mock).mockResolvedValue({
      id: 'new-appointment-id',
      userId: mockUser.id,
      dataHora: new Date('2025-01-01T10:00:00Z'),
      status: 'PENDENTE',
    });
    (createCalendarEvent as vi.Mock).mockResolvedValue({ id: 'calendar-event-id' });

    const request = new Request('http://localhost/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'New Patient',
        email: 'new@example.com',
        telefone: '11987654321',
        cpf: '987.654.321-00',
        dataHora: '2025-01-01T10:00:00Z',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: 'new@example.com' },
      update: { name: 'New Patient', cpf: '987.654.321-00', telefone: '11987654321' },
      create: { name: 'New Patient', email: 'new@example.com', cpf: '987.654.321-00', telefone: '11987654321', role: 'USER' },
    });
    expect(prisma.agendamento.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(createCalendarEvent).toHaveBeenCalled();
  });

  it('should create an appointment for an existing patient', async () => {
    (prisma.user.upsert as vi.Mock).mockResolvedValue(mockUser);
    (prisma.agendamento.create as vi.Mock).mockResolvedValue({
      id: 'existing-appointment-id',
      userId: mockUser.id,
      dataHora: new Date('2025-01-02T10:00:00Z'),
      status: 'PENDENTE',
    });
    (createCalendarEvent as vi.Mock).mockResolvedValue({ id: 'calendar-event-id' });

    const request = new Request('http://localhost/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Test User',
        email: 'test@example.com',
        telefone: '11999999999',
        cpf: '123.456.789-00',
        dataHora: '2025-01-02T10:00:00Z',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      update: { name: 'Test User', cpf: '123.456.789-00', telefone: '11999999999' },
      create: { name: 'Test User', email: 'test@example.com', cpf: '123.456.789-00', telefone: '11999999999', role: 'USER' },
    });
    expect(prisma.agendamento.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(createCalendarEvent).toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        telefone: '11999999999',
        cpf: '123.456.789-00',
        dataHora: '2025-01-02T10:00:00Z',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe('Missing required fields');
  });

  it('should return 500 for internal server errors', async () => {
    (prisma.user.upsert as vi.Mock).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'New Patient',
        email: 'new@example.com',
        telefone: '11987654321',
        cpf: '987.654.321-00',
        dataHora: '2025-01-01T10:00:00Z',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('should allow admin to pre-schedule an appointment', async () => {
    (getServerSession as vi.Mock).mockResolvedValue(mockAdminSession);
    (prisma.user.findUnique as vi.Mock).mockResolvedValue(mockUser);
    (prisma.agendamento.create as vi.Mock).mockResolvedValue({
      id: 'pre-appointment-id',
      userId: mockUser.id,
      dataHora: new Date('2025-01-03T10:00:00Z'),
      status: 'PRE_AGENDADO',
    });

    const request = new Request('http://localhost/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: mockUser.id,
        dataHora: '2025-01-03T10:00:00Z',
        status: 'PRE_AGENDADO',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('PRE_AGENDADO');
    expect(prisma.agendamento.create).toHaveBeenCalledWith({
      data: {
        userId: mockUser.id,
        dataHora: new Date('2025-01-03T10:00:00Z'),
        status: 'PRE_AGENDADO',
      },
    });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });
});