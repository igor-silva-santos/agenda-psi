import Link from 'next/link';

interface KpiCardProps {
  title: string;
  value: string;
  sub?: React.ReactNode;
  icon: React.ElementType;
  /** Classes pastel do badge do ícone, ex: "bg-blue-100 text-blue-600" */
  color: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

/** Card de KPI padrão do painel admin (usado em /admin/relatorios e /admin/faturas). */
export default function KpiCard({ title, value, sub, icon: Icon, color, href, onClick, active }: KpiCardProps) {
  const isInteractive = !!href || !!onClick;

  const inner = (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border transition-all h-full flex flex-col justify-between text-left w-full ${
        active ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
      } ${isInteractive ? 'hover:shadow-md cursor-pointer group' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1 leading-none break-words">{value}</p>
        </div>
        <div className={`p-2 rounded-xl flex-shrink-0 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-1.5">
        {sub && <div className="text-xs text-gray-400 leading-snug">{sub}</div>}
        {href && (
          <p className="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver agendamentos →
          </p>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href} className="h-full block">{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="h-full block">{inner}</button>;
  return inner;
}
