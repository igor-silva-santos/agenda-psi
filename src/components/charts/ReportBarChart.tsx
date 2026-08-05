'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts';

/**
 * Gráfico de barras reutilizável para os relatórios (mensal e anual) —
 * usado tanto para "Faturamento" (recebido/pendente) quanto para
 * "Consultas" (realizadas/faltas/canceladas), com um total no topo de
 * cada barra.
 */
export interface ReportBarSeries {
  key: string;
  name: string;
  color: string;
  highlightColor?: string;
  formatValue?: (v: number) => string;
}

interface ReportBarChartProps {
  data: Record<string, any>[];
  xKey: string;
  compareKey?: string;
  series: ReportBarSeries[];
  highlightKey?: string;
  height?: number;
  formatTotal?: (v: number) => string;
}

function SegmentLabel({ formatter }: { formatter?: (v: number) => string }) {
  return (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 14) return null;
    return (
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={700} fill="#ffffff">
        {formatter ? formatter(value) : value}
      </text>
    );
  };
}

function TotalLabel({ formatter }: { formatter?: (v: number) => string }) {
  return (props: any) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">
        {formatter ? formatter(value) : value}
      </text>
    );
  };
}

function CustomTick({ data, highlightKey, compareKey }: { data: Record<string, any>[]; highlightKey?: string; compareKey: string }) {
  return (props: any) => {
    const { x, y, payload } = props;
    const row = data[payload?.index];
    const isCur = !!highlightKey && !!row && row[compareKey] === highlightKey;
    return (
      <text x={x} y={y + 12} textAnchor="middle" fontSize={10} fontWeight={600} fill={isCur ? '#2563eb' : '#6b7280'}>
        {payload?.value}
      </text>
    );
  };
}

function CustomTooltip({ active, payload, label, series }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (Number(p.value) || 0), 0);
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1 capitalize">{label}</p>
      {payload.map((p: any) => {
        const s = series.find((se: ReportBarSeries) => se.key === p.dataKey);
        if (!s || p.dataKey === '__total') return null;
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
            <span className="font-semibold text-gray-800">
              {s.formatValue ? s.formatValue(p.value) : p.value}
            </span>
          </div>
        );
      })}
      {series.length > 1 && (
        <div className="flex items-center justify-between gap-3 mt-1 pt-1 border-t border-gray-100">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-gray-800">{total}</span>
        </div>
      )}
    </div>
  );
}

export default function ReportBarChart({
  data, xKey, compareKey, series, highlightKey, height = 240, formatTotal,
}: ReportBarChartProps) {
  const cmpKey = compareKey ?? xKey;
  const dataComTotal: (Record<string, any> & { __total: number })[] = data.map(d => ({
    ...d,
    __total: series.reduce((s, ser) => s + (Number(d[ser.key]) || 0), 0),
  }));
  const multi = series.length > 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={dataComTotal} margin={{ top: 22, right: 6, left: 6, bottom: 4 }} maxBarSize={56}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          interval={0}
          tick={CustomTick({ data: dataComTotal, highlightKey, compareKey: cmpKey }) as any}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip content={(p: any) => <CustomTooltip {...p} series={series} />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        {series.map((s, i) => {
          const isLast = i === series.length - 1;
          return (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} radius={isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]} isAnimationActive={false}>
              {s.highlightColor && dataComTotal.map((row, idx) => (
                <Cell key={idx} fill={highlightKey && row[cmpKey] === highlightKey ? s.highlightColor : s.color} />
              ))}
              {multi && <LabelList dataKey={s.key} content={SegmentLabel({ formatter: s.formatValue }) as any} />}
            </Bar>
          );
        })}
        <Bar dataKey="__total" stackId="a" fill="transparent" isAnimationActive={false}>
          <LabelList dataKey="__total" content={TotalLabel({ formatter: formatTotal }) as any} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
