import { NextRequest, NextResponse } from 'next/server';
import {
  buildRelatorioAnual,
  buildRelatorioMensal,
  demoAgendamentos,
  demoAuditLogs,
  demoBookableSlots,
  demoDocumentos,
  demoFaturas,
  demoNotificacoes,
  demoUsers_db,
} from '@/lib/demo-data';
import {
  DEMO_ROLE_COOKIE,
  buildDemoSession,
  isDemoRole,
  type DemoRole,
} from '@/lib/demo-auth';
import { isDemoMode } from '@/lib/demo-mode';

type ApiActor = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function getActorFromDemoCookie(req: NextRequest): ApiActor | null {
  const demoRole = req.cookies.get(DEMO_ROLE_COOKIE)?.value;
  if (!isDemoRole(demoRole)) return null;
  return buildDemoSession(demoRole as DemoRole).user as ApiActor;
}

function isAdmin(actor: ApiActor | null): boolean {
  return actor?.role === 'ADMIN';
}

function isPatientOrAdmin(actor: ApiActor | null): boolean {
  return actor?.role === 'PACIENTE' || actor?.role === 'ADMIN';
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function unauthorized() {
  return json({ error: 'Não autorizado' }, 401);
}

function forbidden() {
  return json({ error: 'Acesso não autorizado.' }, 403);
}

/** Retorna resposta mock ou null se a rota deve seguir para handler real. */
export async function demoApiResponse(
  req: NextRequest,
): Promise<NextResponse | null> {
  if (!isDemoMode()) return null;

  const { pathname, searchParams } = req.nextUrl;
  const method = req.method;
  const actor = getActorFromDemoCookie(req);

  // Rotas públicas / auth
  if (pathname === '/api/demo-login') return null;
  if (pathname.startsWith('/api/auth/')) return null;

  // Portal — paciente
  if (pathname === '/api/portal/agendamentos' && method === 'GET') {
    if (!isPatientOrAdmin(actor)) return unauthorized();
    const list =
      actor!.role === 'ADMIN'
        ? demoAgendamentos
        : demoAgendamentos.filter((a) => a.patientId === actor!.id);
    return json(list);
  }

  if (pathname === '/api/portal/faturas' && method === 'GET') {
    if (!isPatientOrAdmin(actor)) return unauthorized();
    const list = demoFaturas.filter((f) => f.userId === actor!.id);
    return json(list);
  }

  if (pathname === '/api/portal/meus-documentos' && method === 'GET') {
    if (!isPatientOrAdmin(actor)) return unauthorized();
    return json(demoDocumentos.filter((d) => d.userId === actor!.id));
  }

  if (pathname === '/api/portal/perfil' && method === 'GET') {
    if (!isPatientOrAdmin(actor)) return unauthorized();
    const user = demoUsers_db.find((u) => u.id === actor!.id) ?? demoUsers_db[0];
    return json(user);
  }

  if (pathname === '/api/portal/activity' && method === 'GET') {
    if (!isPatientOrAdmin(actor)) return unauthorized();
    return json([
      { id: 'act1', tipo: 'AGENDAMENTO', descricao: 'Consulta confirmada (demo)', data: new Date().toISOString() },
    ]);
  }

  if (pathname === '/api/notificacoes' && method === 'GET') {
    if (!actor) return unauthorized();
    return json(demoNotificacoes.filter((n) => n.userId === actor.id));
  }

  if (pathname.match(/^\/api\/notificacoes\/[^/]+\/ler$/) && method === 'POST') {
    return json({ ok: true });
  }

  if (pathname === '/api/notificacoes/ler-todas' && method === 'POST') {
    return json({ ok: true });
  }

  // Admin
  if (pathname === '/api/admin/agendamentos' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    const range = searchParams.get('range');
    let list = demoAgendamentos.map((a) => ({
      ...a,
      paciente: demoUsers_db.find((u) => u.id === a.patientId),
      user: demoUsers_db.find((u) => u.id === a.patientId),
    }));
    if (range === 'day') {
      const today = new Date();
      list = list.filter((a) => {
        const d = new Date(a.dataHora);
        return d.toDateString() === today.toDateString() || d > today;
      });
    }
    return json(list);
  }

  if (pathname === '/api/admin/faturas' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    const status = searchParams.get('status');
    let list = demoFaturas;
    if (status) list = list.filter((f) => f.status === status);
    return json(list);
  }

  if (pathname.match(/^\/api\/admin\/faturas\/[^/]+\/status$/) && method === 'PUT') {
    if (!isAdmin(actor)) return forbidden();
    return json({ ok: true });
  }

  if (pathname === '/api/admin/faturas/gerar' && method === 'POST') {
    if (!isAdmin(actor)) return forbidden();
    return json({ id: 'f-new', status: 'PENDENTE', valorTotal: 250 }, 201);
  }

  if (pathname === '/api/admin/agendamentos/pendentes-faturamento' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    return json(
      demoAgendamentos
        .filter((a) => a.status === 'REALIZADO' && !a.faturaId)
        .map((a) => ({
          ...a,
          paciente: demoUsers_db.find((u) => u.id === a.patientId),
        })),
    );
  }

  if (pathname === '/api/admin/relatorios/mensal' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    const mes = searchParams.get('mes');
    let ref = new Date();
    if (mes && /^\d{4}-\d{2}$/.test(mes)) {
      const [y, m] = mes.split('-').map(Number);
      ref = new Date(y, m - 1, 1);
    }
    return json(buildRelatorioMensal(ref));
  }

  if (pathname === '/api/admin/relatorios/anual' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()), 10);
    return json(buildRelatorioAnual(ano));
  }

  if (pathname === '/api/admin/auditoria' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = parseInt(searchParams.get('limit') ?? '30', 10);
    const q = (searchParams.get('q') ?? '').toLowerCase();
    let logs = [...demoAuditLogs];
    if (q) logs = logs.filter((l) => l.descricao.toLowerCase().includes(q));
    const total = logs.length;
    const from = (page - 1) * limit;
    return json({
      logs: logs.slice(from, from + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }

  if (pathname === '/api/admin/pacientes' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    return json(demoUsers_db.filter((u) => u.role === 'PACIENTE'));
  }

  if (pathname.match(/^\/api\/admin\/pacientes\/[^/]+$/) && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    const id = pathname.split('/').pop();
    const user = demoUsers_db.find((u) => u.id === id);
    if (!user) return json({ error: 'Não encontrado' }, 404);
    return json({
      ...user,
      agendamentos: demoAgendamentos.filter((a) => a.patientId === id),
    });
  }

  if (pathname === '/api/admin/users' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    return json(demoUsers_db);
  }

  if (pathname === '/api/bookable-slots' && method === 'GET') {
    return json(demoBookableSlots);
  }

  if (pathname === '/api/availability' && method === 'GET') {
    return json({ slots: demoBookableSlots });
  }

  if (pathname === '/api/pacientes' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    return json(demoUsers_db.filter((u) => u.role === 'PACIENTE'));
  }

  if (pathname === '/api/agendamentos' && method === 'GET') {
    if (!isAdmin(actor)) return forbidden();
    return json(demoAgendamentos);
  }

  if (pathname === '/api/agendamentos-salvos' && method === 'GET') {
    return json([]);
  }

  if (pathname.match(/^\/api\/portal\/agendamentos\/[^/]+\/confirmar$/) && method === 'POST') {
    return json({ ok: true, status: 'CONFIRMADO' });
  }

  if (pathname.match(/^\/api\/portal\/agendamentos\/[^/]+\/cancelar$/) && method === 'POST') {
    return json({ ok: true, status: 'CANCELADO' });
  }

  if (pathname.match(/^\/api\/agendamentos\/[^/]+\/recomendacoes$/) && method === 'GET') {
    return json([
      { id: 'r1', titulo: 'Respiração diafragmática', conteudo: 'Pratique 5 minutos ao acordar (demo).' },
      { id: 'r2', titulo: 'Diário de gratidão', conteudo: 'Anote 3 coisas positivas do dia (demo).' },
    ]);
  }

  if (pathname.match(/^\/api\/documento\/[^/]+$/) && method === 'GET') {
    const token = pathname.split('/').pop();
    const doc = demoDocumentos.find((d) => d.token === token) ?? demoDocumentos[0];
    return json(doc);
  }

  if (pathname.match(/^\/api\/documento\/[^/]+\/assinar$/) && method === 'POST') {
    return json({ ok: true, assinado: true });
  }

  if (
    (pathname === '/api/admin/disponibilidade-diaria' ||
      pathname.startsWith('/api/admin/disponibilidade-diaria/')) &&
    method === 'GET'
  ) {
    if (!isAdmin(actor)) return forbidden();
    return json({
      slots: demoBookableSlots,
      disponibilidade: {
        horarios: JSON.stringify([
          { start: '08:00', end: '12:00' },
          { start: '14:00', end: '18:00' },
        ]),
        almocoInicio: '12:00',
        almocoFim: '14:00',
      },
    });
  }

  if (pathname === '/api/admin/horarios-atuacao' && method === 'GET') {
    return json([
      { id: 'h1', diaSemana: 1, horaInicio: '08:00', horaFim: '18:00' },
    ]);
  }

  if (pathname === '/api/admin/horarios-bloqueados' && method === 'GET') {
    return json([]);
  }

  // POST genéricos em demo — aceita sem persistir
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    if (pathname.startsWith('/api/admin') && !isAdmin(actor)) return forbidden();
    if (pathname.startsWith('/api/portal') && !isPatientOrAdmin(actor)) return unauthorized();
    return json({ ok: true, demo: true });
  }

  // GET não mapeado — retorna array vazio em vez de 500
  if (method === 'GET' && pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/admin') && !isAdmin(actor)) return forbidden();
    if (pathname.startsWith('/api/portal') && !isPatientOrAdmin(actor)) return unauthorized();
    return json([]);
  }

  return null;
}
