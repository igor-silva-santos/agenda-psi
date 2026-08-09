'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  FileText,
  BarChart3,
  PenLine,
  Bell,
  Users,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import anime from 'animejs';
import AgendamentoFormMelhorado from '@/components/AgendamentoFormMelhorado';
import PsicologaInfo from '@/components/PsicologaInfo';
import Faq from '@/components/Faq';
import { useToast } from '@/context/ToastContext';
import { siteConfig } from '@/config/site';

const featureIcons = [Calendar, Users, FileText, PenLine, BarChart3, Bell];

export default function Home() {
  const { addToast } = useToast();
  const [showAgendamento, setShowAgendamento] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAgendamento) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showAgendamento]);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const tl = anime.timeline({ easing: 'easeOutCubic' });
    tl.add({
      targets: brandRef.current,
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 700,
    })
      .add(
        {
          targets: '.hero-line',
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 550,
          delay: anime.stagger(90),
        },
        '-=350',
      )
      .add(
        {
          targets: ctaRef.current?.children,
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 450,
          delay: anime.stagger(80),
        },
        '-=280',
      );

    if (orbRef.current) {
      anime({
        targets: orbRef.current,
        translateY: [-12, 12],
        duration: 4200,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
    }

    anime({
      targets: '.feature-item',
      opacity: [0, 1],
      translateY: [16, 0],
      delay: anime.stagger(70, { start: 400 }),
      duration: 500,
      easing: 'easeOutQuad',
    });
  }, []);

  const handleAgendamentoSuccess = (message: string) => {
    addToast(message, 'info');
    setShowAgendamento(false);
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-muted">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="flex items-center gap-3 cursor-pointer min-w-0"
          >
            <img
              src={siteConfig.assets.logo}
              alt={`${siteConfig.productName} logo`}
              className="h-10 w-10 object-contain"
            />
            <span className="font-heading font-bold text-brand text-lg truncate">
              {siteConfig.productName}
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/conta/login"
              className="text-slate-700 hover:text-brand transition-colors font-medium text-sm sm:text-base px-2 py-2 cursor-pointer"
            >
              Entrar
            </Link>
            <button
              onClick={() => setShowAgendamento(true)}
              className="bg-brand text-white px-3 py-2.5 sm:px-5 rounded-xl hover:bg-brand-800 transition-colors flex items-center gap-2 text-sm sm:text-base cursor-pointer min-h-[44px]"
            >
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Agendar</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — brand-first, full-bleed atmosphere, no cards */}
        <section
          ref={heroRef}
          className="hero-atmosphere relative min-h-[88vh] flex items-center overflow-hidden"
        >
          <div
            ref={orbRef}
            className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
            <h1
              ref={brandRef}
              className="font-heading text-5xl sm:text-7xl font-bold text-brand tracking-tight mb-6 opacity-0"
            >
              {siteConfig.productName}
            </h1>
            <p className="hero-line font-heading text-2xl sm:text-3xl text-ink font-semibold max-w-2xl mb-4 opacity-0 leading-snug">
              Agenda e gestão ética para consultórios de psicologia
            </p>
            <p className="hero-line text-base sm:text-lg text-slate-600 max-w-xl mb-10 opacity-0 leading-relaxed">
              Do pré-agendamento ao faturamento com PDF e assinatura digital —
              portal do paciente, relatórios e auditoria em um só produto.
            </p>
            <div ref={ctaRef} className="flex flex-wrap gap-3">
              <Link
                href="/conta/login"
                className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3.5 rounded-xl font-medium hover:bg-brand-800 transition-colors shadow-lg shadow-brand/20 min-h-[44px] cursor-pointer opacity-0"
              >
                Explorar a demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setShowAgendamento(true)}
                className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3.5 rounded-xl font-medium border border-muted hover:border-brand/40 hover:bg-brand-50 transition-colors min-h-[44px] cursor-pointer opacity-0"
              >
                Provar agendamento
              </button>
            </div>
          </div>
        </section>

        <section id="recursos" className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ink mb-3 text-center">
              Tudo que o consultório precisa
            </h2>
            <p className="text-center text-slate-600 mb-14 max-w-2xl mx-auto">
              Recursos de produto pensados para o dia a dia clínico — sem ruído
              visual, com foco em acessibilidade.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
              {siteConfig.productFeatures.map((feature, index) => {
                const Icon = featureIcons[index] ?? CheckCircle;
                return (
                  <div key={feature.title} className="feature-item opacity-0">
                    <div className="h-11 w-11 rounded-xl bg-brand text-white flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-heading font-semibold text-ink text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <PsicologaInfo />

        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center text-ink mb-3">
              Contato da demonstração
            </h2>
            <p className="text-center text-slate-500 mb-12 text-sm">
              Dados fictícios — apenas para ilustrar o produto.
            </p>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <Phone className="h-9 w-9 text-brand mx-auto mb-3" aria-hidden />
                <h3 className="font-heading font-semibold text-ink mb-1">
                  Telefone
                </h3>
                <p className="text-slate-600">{siteConfig.contact.phone}</p>
              </div>
              <div className="text-center">
                <Mail className="h-9 w-9 text-brand mx-auto mb-3" aria-hidden />
                <h3 className="font-heading font-semibold text-ink mb-1">
                  E-mail
                </h3>
                <p className="text-slate-600">{siteConfig.contact.email}</p>
              </div>
              <div className="text-center">
                <MapPin className="h-9 w-9 text-brand mx-auto mb-3" aria-hidden />
                <h3 className="font-heading font-semibold text-ink mb-1">
                  Endereço
                </h3>
                <p
                  className="text-slate-600"
                  dangerouslySetInnerHTML={{
                    __html: siteConfig.contact.addressHtml,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <Faq />
      </main>

      <footer className="bg-brand-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-heading font-semibold text-lg mb-2">
            {siteConfig.productName}
          </p>
          <p className="text-teal-100/90 text-sm">
            © {new Date().getFullYear()} · Demo com {siteConfig.professionalName}{' '}
            (CRP {siteConfig.crp})
          </p>
          <p className="text-teal-200/60 text-sm mt-2">
            Showcase de portfólio. Não use dados reais de pacientes nesta demo.
          </p>
        </div>
      </footer>

      {showAgendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-[6px]">
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
    </div>
  );
}
