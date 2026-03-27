import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, FileText, Users, Briefcase, TrendingUp, Activity, Clock, RefreshCw } from 'lucide-react';

const mockLineData = [
  { name: 'Jan', processos: 40, faturamento: 24000 },
  { name: 'Fev', processos: 30, faturamento: 13000 },
  { name: 'Mar', processos: 20, faturamento: 98000 },
  { name: 'Abr', processos: 27, faturamento: 39000 },
  { name: 'Mai', processos: 18, faturamento: 48000 },
  { name: 'Jun', processos: 23, faturamento: 38000 },
];

const mockPieData = [
  { name: 'Exportação Marítima', value: 45 },
  { name: 'Exportação Aérea', value: 25 },
  { name: 'Importação', value: 20 },
  { name: 'Despacho', value: 10 },
];

const COLORS = ['#6fa8dc', '#2d3a6e', '#10b981', '#f59e0b'];

// Animated counter hook
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      started.current = true;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return value;
}

function KPICard({ title, target, suffix = '', change, icon: Icon, trend, loading, subtitle, delay = 0 }: any) {
  const count = useCountUp(loading ? 0 : target, 1000, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl p-5 border border-slate-100 card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-500 text-slate-400 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="skeleton h-9 w-24 mt-3 mb-1" />
          ) : (
            <h3 className="text-[2rem] font-300 text-slate-800 mt-2 mb-1 tracking-tight leading-none">
              {suffix === 'R$' ? `R$ ${count.toLocaleString('pt-BR')}k` : `${count}${suffix}`}
            </h3>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-indaia-blue/8 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-indaia-blue" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-flex items-center gap-1 text-xs font-500 px-2 py-0.5 rounded-lg ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
        <span className="text-xs text-slate-400">{subtitle || 'vs mês anterior'}</span>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg shadow-slate-100/80 text-xs">
        <p className="font-500 text-slate-600 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-slate-500">
            <span className="font-500" style={{ color: p.color }}>{p.name}:</span>{' '}
            {typeof p.value === 'number' && p.value > 1000 ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState({ processos: 0, clientes: 0, documentos: 0, servicos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [proc, cli, doc, serv] = await Promise.all([
          supabase.from('processos').select('*', { count: 'exact', head: true }),
          supabase.from('clientes').select('*', { count: 'exact', head: true }),
          supabase.from('documentos').select('*', { count: 'exact', head: true }),
          supabase.from('servicos').select('*', { count: 'exact', head: true })
        ]);
        setStats({
          processos: proc.count || 158,
          clientes: cli.count || 42,
          documentos: doc.count || 312,
          servicos: serv.count || 9
        });
      } catch {
        setStats({ processos: 158, clientes: 42, documentos: 312, servicos: 9 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-xl font-500 text-slate-800">Painel de Controle</h1>
          <p className="text-sm text-slate-400 mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-slate-200 rounded-xl text-slate-600 bg-white py-2 px-3 outline-none hover:border-slate-300 transition-colors">
            <option>Todas as Unidades</option>
            <option>01 - Indaiá Logística</option>
          </select>
          <select className="text-sm border border-slate-200 rounded-xl text-slate-600 bg-white py-2 px-3 outline-none hover:border-slate-300 transition-colors">
            <option>Este Mês</option>
            <option>Último Mês</option>
            <option>Este Ano</option>
          </select>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-500 bg-white px-3 py-2 rounded-xl border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            {timeStr}
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Processos Ativos" target={stats.processos} change="+12.5%" icon={FileText} trend="up" loading={loading} delay={0} />
        <KPICard title="Faturamento (Mês)" target={142} suffix="R$" change="+8.2%" icon={TrendingUp} trend="up" loading={loading} subtitle="vs meta mensal" delay={80} />
        <KPICard title="Clientes Ativos" target={stats.clientes} change="+2" icon={Users} trend="up" loading={loading} delay={160} />
        <KPICard title="SLA Médio (Dias)" target={4} suffix=".2d" change="-1.1" icon={Clock} trend="up" loading={loading} subtitle="melhoria no prazo" delay={240} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-slate-100 p-5 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-500 text-slate-700">Processos vs Faturamento</h3>
              <p className="text-xs text-slate-400 mt-0.5">Evolução dos últimos 6 meses</p>
            </div>
            <select className="text-xs border border-slate-200 rounded-lg text-slate-500 bg-white py-1.5 px-2.5 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockLineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6fa8dc" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6fa8dc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#94a3b8' }} />
                <Area yAxisId="left" type="monotone" dataKey="processos" name="Processos" stroke="#6fa8dc" strokeWidth={2} fill="url(#grad1)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#6fa8dc' }} />
                <Area yAxisId="right" type="monotone" dataKey="faturamento" name="Faturamento (R$)" stroke="#10b981" strokeWidth={2} fill="url(#grad2)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-slate-100 p-5"
        >
          <div className="mb-4">
            <h3 className="text-sm font-500 text-slate-700">Por Tipo de Operação</h3>
            <p className="text-xs text-slate-400 mt-0.5">Volume de processos</p>
          </div>
          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={72} paddingAngle={3} dataKey="value">
                  {mockPieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-300 text-slate-800">100%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">total</span>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {mockPieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[index] }} />
                <span className="text-xs text-slate-500 truncate flex-1">{item.name}</span>
                <span className="text-xs font-500 text-slate-700">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom info row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="flex items-center justify-between py-3 border-t border-slate-100"
      >
        <p className="text-xs text-slate-300">MyIndaia · Sistema de Controle de Exportação</p>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <RefreshCw className="w-3 h-3" />
          Atualizar dados
        </button>
      </motion.div>
    </div>
  );
}
