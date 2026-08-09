'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '@/config/site';

const faqData = [
  {
    question: 'O que é o AgendaPsi?',
    answer:
      'É um SaaS de agenda, portal do paciente, faturamento com PDF e assinatura digital feito para consultórios de psicologia. Esta página é uma demonstração de portfólio.',
  },
  {
    question: 'Como entro no portal do paciente ou no admin?',
    answer:
      'Na página Conta / Login use os botões “Entrar como Paciente” ou “Entrar como Admin”. A auth é mock — não precisa de Supabase nem senha real.',
  },
  {
    question: 'Os dados da profissional são reais?',
    answer: `Não. “${siteConfig.professionalName}” e o CRP ${siteConfig.crp} são persona fictícia para a demo. Nenhum cliente real é exibido.`,
  },
  {
    question: 'Posso agendar uma consulta de verdade?',
    answer:
      'O formulário de pré-agendamento funciona no fluxo da demo. Em produção conecta-se a banco, e-mail e calendário; aqui o foco é a UX do produto.',
  },
  {
    question: 'O atendimento pode ser presencial e online?',
    answer:
      'Sim — o produto modela ambos. Na demo, os horários e canais são exemplos.',
  },
  {
    question: 'Há faturamento e documentos?',
    answer:
      'Sim: geração de faturas em PDF, portal financeiro do paciente e assinatura digital com token — tudo navegável nos botões Paciente/Admin.',
  },
  {
    question: 'Preciso configurar variáveis de ambiente?',
    answer:
      'Não para a vitrine mock. Supabase e NextAuth só são necessários se quiser APIs reais.',
  },
  {
    question: 'Onde fica o consultório da demo?',
    answer: `${siteConfig.contact.addressPlain}.`,
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-[#F0FDFA]">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-teal-950 mb-12">
          Perguntas Frequentes
        </h3>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white p-5 sm:p-6 rounded-xl border border-teal-100"
            >
              <button
                className="w-full flex justify-between items-center text-left gap-3"
                onClick={() => toggleFaq(index)}
              >
                <h4 className="text-lg font-semibold text-teal-950">
                  {item.question}
                </h4>
                <ChevronDown
                  className={`h-6 w-6 text-teal-700 shrink-0 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-4">
                  <p className="text-teal-900/70">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}