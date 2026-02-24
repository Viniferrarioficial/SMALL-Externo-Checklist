import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowLeft,
  Send,
  User as UserIcon,
  LogOut,
  TrendingUp,
  MoreVertical,
  FileText,
  Trash2,
  Edit2
} from 'lucide-react';
import { User, Visit, DashboardStats, VisitType, VisitResult } from './types';

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-around z-50 max-w-2xl mx-auto rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
    {[
      { id: 'home', label: 'Início', icon: LayoutDashboard },
      { id: 'bi', label: 'BI', icon: TrendingUp },
      { id: 'visits', label: 'Visitas', icon: CalendarDays },
      { id: 'users', label: 'Usuários', icon: Users },
      { id: 'settings', label: 'Config', icon: Settings },
    ].map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id)} 
          className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          {isActive && (
            <motion.div 
              layoutId="activeTab"
              className="absolute -top-3 w-8 h-1 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-70'}`}>
            {item.label}
          </span>
        </button>
      );
    })}
  </nav>
);

const Login = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark relative overflow-hidden">
    {/* Background Decoration */}
    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div className="w-full max-w-[420px] space-y-8 relative z-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-white mb-4 shadow-lg shadow-primary/20 p-2">
          <img src="https://picsum.photos/seed/visitlog/200/200" alt="Logo" className="w-full h-full object-contain rounded-lg" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestão de Visitas</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Sistema de gestão de visitas Small</p>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">E-mail</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="email" 
                placeholder="seu@email.com" 
                className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Senha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Users size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={onLogin}
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          Entrar <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="pt-2 flex flex-col items-center gap-4">
          <button className="text-sm text-slate-500 hover:text-primary transition-colors">Esqueci minha senha</button>
          
          <div className="flex items-center gap-2 w-full">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ou continue com</span>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <img src="https://lh3.googleusercontent.com/COxitqS9HL9zY-1_S699m_YpP3S_N_E-3k9S0I9Y-1_S699m_YpP3S_N_E-3k9S0I9Y-1_S699m_YpP3S_N_E-3k9S0I9Y" alt="Google" className="w-4 h-4" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Search size={16} />
              SSO
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center space-y-4">
        <p className="text-sm text-slate-500">
          Não tem uma conta? <button className="text-primary font-semibold hover:underline">Solicite acesso</button>
        </p>
        <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium">
          <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Termos</button>
          <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Privacidade</button>
          <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Suporte</button>
        </div>
      </footer>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total de Visitas</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp size={12} className="mr-1" /> +12%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight">{stats.totalVisits}</div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Clientes Únicos</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp size={12} className="mr-1" /> +5%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight">{stats.uniqueClients}</div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Oportunidades</span>
            <span className="flex items-center text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              Meta 85%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-primary">{stats.opportunities}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Bar Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold">Visitas por Período</h3>
            <MoreVertical size={20} className="text-slate-400" />
          </div>
          <div className="flex h-40 items-end justify-between gap-2 px-2">
            {stats.visitsByPeriod.map((p, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t transition-all ${i === 2 ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'}`} 
                  style={{ height: `${p.value}%` }}
                />
                <span className={`text-[10px] ${i === 2 ? 'font-bold text-primary' : 'text-slate-400'}`}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="mb-6 text-sm font-bold">Tipos de Clientes</h3>
            <div className="flex items-center justify-around">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-slate-100 dark:stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                  <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="70, 100" strokeWidth="3"></circle>
                  <circle className="stroke-emerald-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="25, 100" strokeDashoffset="-70" strokeWidth="3"></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold">{stats.uniqueClients}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-xs text-slate-500 font-medium">Novos (70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-500 font-medium">Base (25%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                  <span className="text-xs text-slate-500 font-medium">Outros (5%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold">Top Assessores</h3>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Ricardo Silva', visits: 342, percent: 85 },
                { name: 'Ana Souza', visits: 289, percent: 70 },
                { name: 'Marcos Lima', visits: 215, percent: 55 }
              ].map((a, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{a.name}</span>
                    <span className="font-bold">{a.visits} visitas</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${a.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Region Volume */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="mb-5 text-sm font-bold">Volume por Região</h3>
          <div className="space-y-4">
            {[
              { name: 'São Paulo', value: 512, percent: 90 },
              { name: 'Rio de Janeiro', value: 328, percent: 65 },
              { name: 'Curitiba', value: 194, percent: 45 }
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{r.name}</span>
                <div className="h-6 flex-1 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-primary/80" style={{ width: `${r.percent}%` }}></div>
                </div>
                <span className="w-8 text-right text-xs font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="mb-5 text-sm font-bold">Resultados de Objetivos</h3>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-6">
            <div className="bg-emerald-500 h-full" style={{ width: "60%" }}></div>
            <div className="bg-primary h-full" style={{ width: "25%" }}></div>
            <div className="bg-amber-500 h-full" style={{ width: "10%" }}></div>
            <div className="bg-slate-400 h-full" style={{ width: "5%" }}></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-[11px] text-slate-500">Venda: 770</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-[11px] text-slate-500">Prospecção: 321</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="text-[11px] text-slate-500">Follow-up: 128</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
              <span className="text-[11px] text-slate-500">Outros: 65</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VisitsList = ({ onNewVisit, onSelectVisit }: { onNewVisit: () => void, onSelectVisit: (v: Visit) => void }) => {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    fetch('/api/visits').then(res => res.json()).then(setVisits);
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          placeholder="Pesquisar visitas..." 
          className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Filter size={16} /> Filtros
          </h3>
          <button className="text-primary text-sm font-medium flex items-center gap-1">
            <TrendingUp size={16} /> Ordenar por data
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium whitespace-nowrap">
            <UserIcon size={16} /> Assessores
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-full text-sm font-medium whitespace-nowrap">
            <CalendarDays size={16} /> Período
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-full text-sm font-medium whitespace-nowrap">
            <MapPin size={16} /> Cidades
          </button>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {visits.map(visit => (
          <div 
            key={visit.id} 
            onClick={() => onSelectVisit(visit)}
            className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  {visit.user_name?.substring(0, 2)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 leading-none">Assessor</p>
                  <p className="font-semibold text-sm">{visit.user_name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{visit.date}</p>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{visit.client_name}</h4>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin size={14} /> {visit.region}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider">
                {visit.type}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                visit.result === 'ALCANCADO' ? 'bg-emerald-500/20 text-emerald-500' : 
                visit.result === 'PARCIAL' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {visit.result === 'ALCANCADO' ? <CheckCircle2 size={12} /> : visit.result === 'PARCIAL' ? <Clock size={12} /> : <XCircle size={12} />}
                {visit.result === 'ALCANCADO' ? 'Venda Concluída' : visit.result === 'PARCIAL' ? 'Agendado Retorno' : 'Sem Interesse'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onNewVisit}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

const VisitForm = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    cnpj: '',
    region: '',
    date: new Date().toISOString().split('T')[0],
    type: 'PROSPECCAO' as VisitType,
    result: 'PARCIAL' as VisitResult,
    volume: 0,
    competitor: '',
    summary: ''
  });

  const handleSubmit = async () => {
    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) onSuccess();
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32 relative">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg bg-primary/10 text-primary">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">Nova Visita</h1>
              <p className="text-xs text-slate-500">Vendedor: Ricardo Oliveira</p>
            </div>
          </div>
          <button className="p-2 text-slate-500">
            <MoreVertical size={20} />
          </button>
        </div>
        {/* Progress Indicator */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Progresso do Formulário</span>
            <span className="text-[10px] font-bold text-slate-500">25% Completo</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/4 rounded-full transition-all duration-500"></div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Block 1: Identificação */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary text-[10px] font-bold text-white">1</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Identificação</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Data</label>
              <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-400 cursor-not-allowed flex items-center gap-2">
                <CalendarDays size={14} /> {formData.date}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Assessor</label>
              <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-400 cursor-not-allowed truncate flex items-center gap-2">
                <UserIcon size={14} /> Ricardo Oliveira
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 ml-1">Cidade / Região</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Ex: São Paulo - SP"
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 ml-1">Nome do Cliente</label>
            <input 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Razão Social ou Nome Fantasia"
              value={formData.client_name}
              onChange={e => setFormData({...formData, client_name: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 ml-1">CNPJ</label>
            <input 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChange={e => setFormData({...formData, cnpj: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-xs font-medium text-slate-500 ml-1">Tipo de Cliente</label>
            <div className="flex flex-wrap gap-2">
              {['Posto / TRR', 'Consumidor Final', 'Frota', 'Outro'].map(t => (
                <button 
                  key={t}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                    t === 'Posto / TRR' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Block 2: Detalhes Dinâmicos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500">2</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Detalhes Específicos</h2>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-primary ml-1">Volume Mensal Estimado (m³)</label>
              <input 
                type="number"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="0.00"
                onChange={e => setFormData({...formData, volume: Number(e.target.value)})}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-primary ml-1">Principal Concorrente</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Nome da distribuidora"
                value={formData.competitor}
                onChange={e => setFormData({...formData, competitor: e.target.value})}
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Block 3: Interação */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500">3</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Interação e Objetivo</h2>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-slate-500 ml-1">Tipo de Visita</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'PROSPECCAO', label: 'Prospecção', icon: <Search size={14} /> },
                { id: 'NEGOCIACAO', label: 'Negociação', icon: <Users size={14} /> },
                { id: 'RELACIONAMENTO', label: 'Relacionamento', icon: <TrendingUp size={14} /> },
                { id: 'POS_VENDA', label: 'Pós-venda', icon: <Settings size={14} /> }
              ].map(v => (
                <button 
                  key={v.id}
                  onClick={() => setFormData({...formData, type: v.id as VisitType})}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 border transition-all ${
                    formData.type === v.id ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-xs font-medium text-slate-500 ml-1">Resultado do Objetivo</label>
            <div className="flex flex-col gap-2">
              {[
                { id: 'ALCANCADO', label: 'Alcançado', icon: <CheckCircle2 size={18} className="text-green-500" /> },
                { id: 'PARCIAL', label: 'Parcial', icon: <Clock size={18} className="text-amber-500" /> },
                { id: 'NAO_ALCANCADO', label: 'Não alcançado', icon: <XCircle size={18} className="text-red-500" /> }
              ].map(r => (
                <button 
                  key={r.id}
                  onClick={() => setFormData({...formData, result: r.id as VisitResult})}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    formData.result === r.id ? 'border-2 border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {r.icon}
                    <span className={`text-sm ${formData.result === r.id ? 'font-semibold' : ''}`}>{r.label}</span>
                  </div>
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                    formData.result === r.id ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {formData.result === r.id && <div className="size-2 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Block 4: Resumo */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500">4</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Notas Adicionais</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-medium text-slate-500">Resumo da Visita</label>
              <span className="text-[10px] font-mono text-slate-400">{formData.summary.length}/300</span>
            </div>
            <textarea 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Descreva os principais pontos tratados, objeções e próximos passos..."
              rows={4}
              maxLength={300}
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
            />
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto z-40 p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent">
        <button 
          onClick={handleSubmit}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Send size={18} /> Enviar Relatório
        </button>
      </footer>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Gestão de Usuários</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Filter size={20} />
          </button>
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
          placeholder="Buscar por nome ou e-mail..." 
        />
      </div>

      {/* Filters Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Admin', 'Gestor', 'Vendedor'].map((f, i) => (
          <button 
            key={f}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="space-y-3">
        {users.map(user => (
          <div 
            key={user.id} 
            className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all ${
              user.active ? '' : 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${user.active ? '' : 'line-through text-slate-400'}`}>{user.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 
                    user.role === 'GESTOR' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="hidden sm:flex items-center gap-2 mr-4">
                <span className={`size-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span className={`text-xs font-medium ${user.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                <Edit2 size={18} />
              </button>
              <button className={`p-2 rounded-lg transition-all ${user.active ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10' : 'text-primary hover:bg-primary/10'}`}>
                {user.active ? <XCircle size={18} /> : <Plus size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div className="fixed bottom-24 right-6 sm:right-10 z-20">
        <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-all group">
          <Plus size={20} />
          <span className="font-bold text-sm">Adicionar Usuário</span>
        </button>
      </div>
    </div>
  );
};

const VisitDetails = ({ visit, onBack }: { visit: Visit, onBack: () => void }) => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32">
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Detalhes da Visita</h1>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full text-primary hover:bg-primary/10 transition-colors" title="Exportar PDF">
          <FileText size={20} />
        </button>
      </div>
    </header>

    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header Info Card */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Assessor Responsável</span>
            <h2 className="text-xl font-bold leading-tight">{visit.user_name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CalendarDays size={14} /> {visit.date}
            </p>
          </div>
          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <UserIcon size={32} className="text-primary" />
          </div>
        </div>
      </section>

      {/* Client Information Card */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Dados do Cliente</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Razão Social</label>
              <p className="text-sm font-semibold">{visit.client_name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">CNPJ</label>
              <p className="text-sm font-semibold">12.345.678/0001-90</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tipo de Contato</label>
              <p className="text-sm font-semibold">Presencial</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Localização</label>
              <p className="text-sm font-semibold">{visit.region}</p>
            </div>
          </div>
          <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <MapPin size={32} className="text-slate-300" />
          </div>
        </div>
      </section>

      {/* Visit Specifics Card */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Especificações da Visita</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">Tipo de Visita</span>
            <span className="text-sm font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{visit.type}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">Checklist Preenchido</span>
            <span className="text-sm font-semibold text-green-500 flex items-center gap-1">
              <CheckCircle2 size={14} /> Completo
            </span>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Campos Dinâmicos</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Infraestrutura OK?</p>
                <p className="text-sm font-medium">Sim, totalmente adequada.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Potencial de Venda</p>
                <p className="text-sm font-medium">Alto (Acima de R$ 50k)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results & Summary Card */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Resultado e Resumo</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            visit.result === 'ALCANCADO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 
            visit.result === 'PARCIAL' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
          }`}>
            <span className="text-sm font-medium">Status do Resultado</span>
            <span className="text-sm font-bold uppercase">{visit.result}</span>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Resumo da Visita</label>
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {visit.summary || "Nenhum resumo informado."}
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-40">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Edit2 size={18} /> Editar Visita
        </button>
        <button className="w-full bg-transparent font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-primary hover:bg-primary/10">
          <Trash2 size={18} /> Excluir Registro
        </button>
      </div>
    </footer>
  </div>
);

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    if (activeTab === 'bi') return <Dashboard />;
    if (activeTab === 'users') return <UserManagement />;
    if (activeTab === 'settings') return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Settings size={48} className="mb-4 opacity-20" />
        <p>Configurações do sistema</p>
        <button onClick={() => setIsLoggedIn(false)} className="mt-8 flex items-center gap-2 text-rose-500 font-bold">
          <LogOut size={20} /> Sair do Sistema
        </button>
      </div>
    );

    // Visits Tab
    if (view === 'form') return <VisitForm onBack={() => setView('list')} onSuccess={() => setView('list')} />;
    if (view === 'details' && selectedVisit) return <VisitDetails visit={selectedVisit} onBack={() => setView('list')} />;
    
    return (
      <VisitsList 
        onNewVisit={() => setView('form')} 
        onSelectVisit={(v) => {
          setSelectedVisit(v);
          setView('details');
        }} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/visitlog/100/100" alt="Logo" className="h-8 w-auto rounded-md" />
            <h1 className="text-xl font-bold tracking-tight">VisitLog</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={(t) => {
        setActiveTab(t);
        setView('list');
      }} />
    </div>
  );
}
