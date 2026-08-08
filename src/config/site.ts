/**
 * Branding central do showcase AgendaPsi.
 * Troque estes valores (ou use env NEXT_PUBLIC_*) para white-label de um consultório real.
 */

const env = (key: string, fallback: string) =>
  (typeof process !== 'undefined' && process.env[key]?.trim()) || fallback;

export const siteConfig = {
  productName: env('NEXT_PUBLIC_PRODUCT_NAME', 'AgendaPsi'),
  tagline: env(
    'NEXT_PUBLIC_TAGLINE',
    'Sistema completo de agenda, portal do paciente e gestão para psicólogas'
  ),

  /** Persona fictícia de demonstração (não é cliente real) */
  professionalName: env('NEXT_PUBLIC_PROFESSIONAL_NAME', 'Dra. Ana Ribeiro'),
  professionalTitle: env(
    'NEXT_PUBLIC_PROFESSIONAL_TITLE',
    'Psicóloga Clínica · Terapia Cognitivo-Comportamental'
  ),
  clinicName: env('NEXT_PUBLIC_CLINIC_NAME', 'Consultório AgendaPsi'),
  crp: env('NEXT_PUBLIC_CRP', '06/000000'),

  contact: {
    phone: env('NEXT_PUBLIC_PHONE', '(11) 90000-0000'),
    email: env('NEXT_PUBLIC_EMAIL', 'contato@agendapsi.demo'),
    addressHtml: env(
      'NEXT_PUBLIC_ADDRESS_HTML',
      'São Paulo — SP<br />Atendimento presencial e online'
    ),
    addressPlain: env(
      'NEXT_PUBLIC_ADDRESS_PLAIN',
      'São Paulo — SP (demonstração)'
    ),
    whatsappE164: env('NEXT_PUBLIC_WHATSAPP', '5511900000000'),
  },

  urls: {
    site: env('NEXT_PUBLIC_SITE_URL', 'https://psicologa-agendamento.vercel.app'),
    portfolio: 'https://portifolio-igor-silva-santos.vercel.app',
  },

  assets: {
    logo: '/logo-agendapsi.svg',
    avatar: '/profissional-demo.svg',
  },

  themeColor: '#0F766E',

  seo: {
    title: env('NEXT_PUBLIC_SEO_TITLE', 'AgendaPsi | Agenda e gestão para psicólogas'),
    description: env(
      'NEXT_PUBLIC_SEO_DESCRIPTION',
      'Agenda online, portal do paciente, faturamento com PDF, assinatura digital, relatórios e auditoria — feito para consultórios de psicologia.'
    ),
    keywords:
      'psicóloga, agendamento, consultório, portal do paciente, faturamento, assinatura digital, saúde mental, SaaS',
  },

  formation: [
    'Graduação em Psicologia (demonstração)',
    'Especialização em Terapia Cognitivo-Comportamental',
  ],

  specialties: [
    'Terapia Cognitivo-Comportamental',
    'Ansiedade e depressão',
    'Atendimento adulto e adolescente',
  ],

  services: [
    'Atendimento presencial e online',
    'Pré-agendamento pelo site',
    'Portal do paciente com documentos e faturas',
    'Confirmações e lembretes por e-mail',
  ],

  /** Features do produto (landing de portfólio) */
  productFeatures: [
    {
      title: 'Agenda inteligente',
      description:
        'Horários de atuação, bloqueios, slots e disponibilidade diária — sem planilha.',
    },
    {
      title: 'Portal do paciente',
      description:
        'O paciente confirma, cancela, vê faturas, documentos e recomendações num só lugar.',
    },
    {
      title: 'Faturamento com PDF',
      description:
        'Gere faturas a partir das consultas e disponibilize o PDF no admin e no portal.',
    },
    {
      title: 'Assinatura digital',
      description:
        'Documentos com token, canvas de assinatura, CPF e registro de IP — sem DocuSign.',
    },
    {
      title: 'Relatórios e auditoria',
      description:
        'KPIs mensais/anuais com gráficos e log pesquisável de ações administrativas.',
    },
    {
      title: 'Integrações',
      description:
        'Google Calendar, e-mails com ICS, auth Google/CPF e base pronta para WhatsApp.',
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
