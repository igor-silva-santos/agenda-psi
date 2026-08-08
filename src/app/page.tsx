'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Shield,
  FileText,
  BarChart3,
  PenLine,
  Bell,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import AgendamentoFormMelhorado from '@/components/AgendamentoFormMelhorado';
import PsicologaInfo from '@/components/PsicologaInfo';
import LoginModal from '@/components/LoginModal';
import SignUpModal from '@/components/SignUpModal';
import Faq from '@/components/Faq';
import { useToast } from '@/context/ToastContext';
import { siteConfig } from '@/config/site';

const featureIcons = [Calendar, Users, FileText, PenLine, BarChart3, Bell];

export default function Home() {
  const { addToast } = useToast();
  const [showAgendamento, setShowAgendamento] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleOpenSignUp = () => {
    setShowLoginModal(false);
    setShowSignUpModal(true);
  };

  const handleOpenLogin = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  const handleCloseSignUp = () => {
    setShowSignUpModal(false);
  };

  const handleAgendamentoSuccess = (message: string) => {
    addToast(message, 'info');
    setShowAgendamento(false);
  };

  useEffect(() => {
    if (showAgendamento || showLoginModal || showSignUpModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAgendamento, showLoginModal, showSignUpModal]);

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F0FDFA]">
      <header className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              onClick={handleScrollToTop}
              className="flex items-center space-x-3 cursor-pointer min-w-0"
            >
              <img
                src={siteConfig.assets.logo}
                alt={`${siteConfig.productName} logo`}
                className="h-12 w-12 object-contain"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-teal-900 truncate">
                  {siteConfig.productName}
                </h1>
                <p className="hidden sm:block text-xs text-teal-700/80 truncate">
                  {siteConfig.clinicName}
                </p>
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-teal-900 hover:text-teal-700 transition-colors font-medium text-sm sm:text-base"
              >
                Entrar
              </button>
              <button
                onClick={() => setShowAgendamento(true)}
                className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl hover:from-teal-800 hover:to-teal-700 transition-all flex items-center space-x-2 shadow-md text-sm sm:text-base"
              >
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Agendar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero produto */}
        <section className="relative overflow-hidden py-16 sm:py-20 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#99F6E4_0%,_transparent_55%)] opacity-70 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-900/5 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-800 mb-5">
              <Shield className="h-3.5 w-3.5" />
              Demonstração de portfólio · dados fictícios
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-teal-950 mb-5 max-w-3xl leading-tight">
              {siteConfig.tagline}
            </h2>
            <p className="text-base sm:text-xl text-teal-900/70 mb-8 max-w-2xl">
              Do pré-agendamento ao faturamento com PDF e assinatura digital: um
              consultório digital pensado para o dia a dia de psicólogas — com
              portal do paciente, relatórios e auditoria.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => setShowAgendamento(true)}
                className="bg-teal-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-800 transition shadow-lg shadow-teal-900/10"
              >
                Provar o fluxo de agendamento
              </button>
              <a
                href="#recursos"
                className="bg-white text-teal-800 px-6 py-3 rounded-xl font-medium border border-teal-200 hover:bg-teal-50 transition"
              >
                Ver recursos
              </a>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-teal-900/80">
              {['Agenda + disponibilidade', 'Portal do paciente', 'PDF + assinatura', 'Cypress E2E'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="recursos" className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-teal-950 mb-3 text-center">
              O que um sistema desse porte entrega
            </h3>
            <p className="text-center text-teal-900/65 mb-12 max-w-2xl mx-auto">
              Recursos reais usados em consultório — generalizados aqui como
              produto {siteConfig.productName}.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteConfig.productFeatures.map((feature, index) => {
                const Icon = featureIcons[index] ?? CheckCircle;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-teal-100 bg-[#F0FDFA]/60 p-6 hover:border-teal-300 transition"
                  >
                    <div className="h-10 w-10 rounded-xl bg-teal-700 text-white flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-teal-950 mb-2">{feature.title}</h4>
                    <p className="text-sm text-teal-900/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Consultório demo */}
        <PsicologaInfo />

        {/* Contato demo */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-teal-950 mb-4">
              Contato da demonstração
            </h3>
            <p className="text-center text-teal-900/60 mb-12 text-sm">
              Dados fictícios — apenas para ilustrar o produto.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Phone className="h-10 w-10 text-teal-700 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-teal-950 mb-2">Telefone</h4>
                <p className="text-teal-900/70">{siteConfig.contact.phone}</p>
              </div>
              <div className="text-center">
                <Mail className="h-10 w-10 text-teal-700 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-teal-950 mb-2">E-mail</h4>
                <p className="text-teal-900/70">{siteConfig.contact.email}</p>
              </div>
              <div className="text-center">
                <MapPin className="h-10 w-10 text-teal-700 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-teal-950 mb-2">Endereço</h4>
                <p
                  className="text-teal-900/70"
                  dangerouslySetInnerHTML={{ __html: siteConfig.contact.addressHtml }}
                />
              </div>
            </div>
          </div>
        </section>

        <Faq />
      </main>

      <footer className="bg-teal-950 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-teal-100/90">
            © {new Date().getFullYear()} {siteConfig.productName} · Demo com{' '}
            {siteConfig.professionalName} (CRP {siteConfig.crp})
          </p>
          <p className="text-teal-200/60 text-sm mt-2">
            Showcase de portfólio. Em conformidade com boas práticas de LGPD —
            não use dados reais de pacientes nesta demo.
          </p>
        </div>
      </footer>

      {showAgendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[6px]">
          <div
            data-cy="agendamento-modal"
            className="agendamento-modal relative w-full h-full sm:h-auto sm:max-h-[98vh] sm:max-w-[900px] bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-y-auto p-0"
          >
            <div className="w-full flex flex-col justify-center items-center p-4 sm:p-8">
              <AgendamentoFormMelhorado
                onClose={() => setShowAgendamento(false)}
                onSuccess={handleAgendamentoSuccess}
              />
            </div>
          </div>
        </div>
      )}

      <LoginModal
        showModal={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenSignUp={handleOpenSignUp}
      />
      <SignUpModal
        showModal={showSignUpModal}
        onClose={handleCloseSignUp}
        onOpenLogin={handleOpenLogin}
      />
    </div>
  );
}
