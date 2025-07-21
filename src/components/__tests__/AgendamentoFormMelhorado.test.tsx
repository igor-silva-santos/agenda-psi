import { vi } from 'vitest';
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
import { render, screen, fireEvent } from '@testing-library/react';
import AgendamentoFormMelhorado from '../AgendamentoFormMelhorado';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { addDays, nextMonday, format } from 'date-fns';

// Mock global para evitar erro de allSlots.map
beforeAll(() => {
  global.fetch = vi.fn((url) => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => null },
      redirected: false,
      type: 'basic',
      url: '',
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(''),
      clone: function () { return this; },
      json: () => Promise.resolve([]),
    };
    if (typeof url === 'string' && url.startsWith('/api/bookable-slots')) {
      return Promise.resolve({ ...response, json: () => Promise.resolve([]) }) as any;
    }
    return Promise.resolve({ ...response, json: () => Promise.resolve({}) }) as any;
  });
});
afterAll(() => {
  (global.fetch as any).mockRestore && (global.fetch as any).mockRestore();
});


describe('AgendamentoFormMelhorado', () => {
  it('renderiza o formulário corretamente', () => {
    render(<AgendamentoFormMelhorado />);
    expect(screen.getByText(/Agendar Consulta/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione a Data e Hora/i)).toBeInTheDocument();
  });

  it('valida campos obrigatórios', async () => {
    render(<AgendamentoFormMelhorado />);
    fireEvent.click(screen.getByText(/Próximo/i));
    expect(await screen.findByText(/Por favor, selecione um horário/i)).toBeInTheDocument();
  });

  it('exibe erro ao tentar submeter com campos vazios', async () => {
    render(<AgendamentoFormMelhorado />);
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.click(screen.getByText(/Confirmar Agendamento/i));
    expect(await screen.findByText(/Nome completo é obrigatório/i)).toBeInTheDocument();
  });

  it('submete o formulário com sucesso', async () => {
    render(<AgendamentoFormMelhorado />);
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '(11) 99999-9999' } });
    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '123.456.789-09' } });
    fireEvent.change(screen.getByLabelText(/Motivo da Consulta/i), { target: { value: 'Consulta de teste para agendamento.' } });
    fireEvent.click(screen.getByText(/Confirmar Agendamento/i));
    expect(await screen.findByText(/Agendamento realizado com sucesso/i)).toBeInTheDocument();
  });

  it('permite selecionar próxima segunda-feira, escolher o primeiro horário e clicar em próximo', async () => {
    render(<AgendamentoFormMelhorado />);
    // Espera o calendário aparecer
    expect(screen.getByText(/Selecione a Data e Hora/i)).toBeInTheDocument();

    // Simula selecionar a próxima segunda-feira
    const today = new Date();
    const segunda = nextMonday(today);
    const labelSegunda = format(segunda, 'd', { locale: undefined });
    // Clica no dia da próxima segunda-feira
    const dayButton = screen.getAllByRole('button', { name: labelSegunda })[0];
    await act(async () => {
      fireEvent.click(dayButton);
    });

    // Aguarda os horários aparecerem
    const horarios = await screen.findAllByRole('button', { name: /\d{2}:\d{2}/ });
    expect(horarios.length).toBeGreaterThan(0);

    // O botão Próximo deve estar desabilitado antes de selecionar um horário
    const botaoProximo = screen.getByText(/Próximo/i).closest('button');
    expect(botaoProximo).toBeDisabled();

    // Seleciona o primeiro horário disponível
    await act(async () => {
      fireEvent.click(horarios[0]);
    });

    // Agora o botão Próximo deve estar habilitado
    expect(botaoProximo).not.toBeDisabled();

    // Clica em Próximo
    await act(async () => {
      fireEvent.click(botaoProximo!);
    });

    // Espera o próximo passo aparecer (Nome Completo)
    expect(await screen.findByLabelText(/Nome Completo/i)).toBeInTheDocument();
  });
});

describe('Fluxos completos e validações do Agendamento', () => {
  beforeEach(() => {
    // Mock para slots: um passado, um agendado, dois livres futuros
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.startsWith('/api/bookable-slots')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            // Slot passado
            { id: 1, startDateTime: new Date(Date.now() - 3600 * 1000).toISOString(), isBooked: false },
            // Slot agendado futuro
            { id: 2, startDateTime: new Date(Date.now() + 3600 * 1000).toISOString(), isBooked: true },
            // Slot livre futuro 1
            { id: 3, startDateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), isBooked: false },
            // Slot livre futuro 2
            { id: 4, startDateTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), isBooked: false },
          ]),
        });
      }
      if (url.startsWith('/api/pacientes/12345678901')) {
        // CPF já cadastrado
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ nomeCompleto: 'Paciente Existente', email: 'existente@teste.com', dataNascimento: '2000-01-01', cpf: '12345678901', role: 'PACIENTE' }) });
      }
      if (url.startsWith('/api/pacientes/')) {
        // CPF não cadastrado
        return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
      }
      if (url.startsWith('/api/pacientes')) {
        // Cadastro de novo paciente
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 99 }) });
      }
      if (url.startsWith('/api/agendamentos')) {
        // Agendamento
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 123 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('não permite selecionar horário passado ou agendado', async () => {
    render(<AgendamentoFormMelhorado />);
    // Espera slots carregarem
    const horarios = await screen.findAllByRole('button', { name: /\d{2}:\d{2}/ });
    // Slot passado e agendado devem estar desabilitados
    expect(horarios[0]).toBeDisabled();
    expect(horarios[1]).toBeDisabled();
    // Slots futuros livres devem estar habilitados
    expect(horarios[2]).not.toBeDisabled();
    expect(horarios[3]).not.toBeDisabled();
  });

  it('permite selecionar datas e horários em diferentes dias', async () => {
    render(<AgendamentoFormMelhorado />);
    // Simula seleção do terceiro slot (futuro livre)
    const horarios = await screen.findAllByRole('button', { name: /\d{2}:\d{2}/ });
    fireEvent.click(horarios[2]);
    const botaoProximo = screen.getByText(/Próximo/i).closest('button');
    expect(botaoProximo).not.toBeDisabled();
    fireEvent.click(botaoProximo!);
    expect(await screen.findByLabelText(/CPF/i)).toBeInTheDocument();
  });

  it('preenche dados para CPF inexistente e agenda', async () => {
    render(<AgendamentoFormMelhorado />);
    const horarios = await screen.findAllByRole('button', { name: /\d{2}:\d{2}/ });
    fireEvent.click(horarios[2]);
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '00000000000' } });
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Novo Paciente' } });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'novo@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'Senha@123' } });
    fireEvent.click(screen.getByText(/Agendar Consulta/i));
    expect(await screen.findByText(/Cadastro e agendamento realizados/i)).toBeInTheDocument();
  });

  it('preenche dados para CPF existente e agenda', async () => {
    render(<AgendamentoFormMelhorado />);
    const horarios = await screen.findAllByRole('button', { name: /\d{2}:\d{2}/ });
    fireEvent.click(horarios[3]);
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '12345678901' } });
    // Nome, email e data de nascimento devem ser preenchidos automaticamente
    expect(await screen.findByDisplayValue('Paciente Existente')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('existente@teste.com')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('2000-01-01')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Agendar Consulta/i));
    expect(await screen.findByText(/Agendamento realizado com sucesso/i)).toBeInTheDocument();
  });

  it('ao agendar corretamente, redireciona e reserva horário', async () => {
    // Mock local para garantir horários disponíveis no próximo mês, dia 15 às 18:00
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15, 18, 0, 0, 0);
    (global.fetch as any).mockImplementation((url: string) => {
      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => null },
        redirected: false,
        type: 'basic',
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(''),
        clone: function () { return this; },
        json: () => Promise.resolve([]),
      };
      if (typeof url === 'string' && url.startsWith('/api/bookable-slots')) {
        return Promise.resolve({
          ...response,
          json: () => Promise.resolve([
            { id: 200, startDateTime: nextMonth.toISOString(), isBooked: false },
          ]),
        }) as any;
      }
      if (url.startsWith('/api/pacientes/12345678901')) {
        // CPF já cadastrado
        return Promise.resolve({ ...response, json: () => Promise.resolve({ nomeCompleto: 'Paciente Existente', email: 'existente@teste.com', dataNascimento: '2000-01-01', cpf: '12345678901', role: 'PACIENTE' }) }) as any;
      }
      if (url.startsWith('/api/pacientes/')) {
        // CPF não cadastrado
        return Promise.resolve({ ...response, ok: false, json: () => Promise.resolve({}) }) as any;
      }
      if (url.startsWith('/api/pacientes')) {
        // Cadastro de novo paciente
        return Promise.resolve({ ...response, json: () => Promise.resolve({ id: 99 }) }) as any;
      }
      if (url.startsWith('/api/agendamentos')) {
        // Agendamento
        return Promise.resolve({ ...response, json: () => Promise.resolve({ id: 123 }) }) as any;
      }
      return Promise.resolve({ ...response, json: () => Promise.resolve({}) }) as any;
    });
    pushMock.mockClear();
    render(<AgendamentoFormMelhorado />);
    // Navega para o próximo mês
    const nextBtn = await screen.findByRole('button', { name: /next month/i });
    fireEvent.click(nextBtn);
    // Seleciona o primeiro dia disponível para agendamento
    const diasDisponiveis = await screen.findAllByRole('button', { name: /\d+/ });
    let diaDisponivel: HTMLButtonElement | undefined;
    for (const btn of diasDisponiveis) {
      if ((btn as HTMLButtonElement).disabled === false) {
        diaDisponivel = btn as HTMLButtonElement;
        break;
      }
    }
    expect(diaDisponivel).toBeDefined();
    fireEvent.click(diaDisponivel!);
    // Seleciona o primeiro horário disponível (18:00)
    const horario = await screen.findByRole('button', { name: '18:00' });
    fireEvent.click(horario);
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '00000000000' } });
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Novo Paciente' } });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'novo@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'Senha@123' } });
    fireEvent.click(screen.getByText(/Agendar Consulta/i));
    expect(await screen.findByText(/Cadastro e agendamento realizados/i)).toBeInTheDocument();
    // Simula tempo de redirecionamento
    await act(async () => { await new Promise(r => setTimeout(r, 2100)); });
    expect(pushMock).toHaveBeenCalledWith('/portal/paciente');
  });

  it('exibe erro ao tentar agendar com horário passado', async () => {
    render(<AgendamentoFormMelhorado />);
    const horarios = await screen.findAllByRole('button', { name: /\d{2}:\d{2}/ });
    // Tenta clicar no slot passado (deve estar desabilitado)
    expect(horarios[0]).toBeDisabled();
    fireEvent.click(horarios[0]);
    // Não deve avançar para próxima etapa
    expect(screen.queryByLabelText(/CPF/i)).not.toBeInTheDocument();
  });
}); 