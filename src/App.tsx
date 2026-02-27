import React, { useState, useEffect } from 'react';
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
  Edit2,
  RefreshCw,
  Moon,
  Sun,
  Camera,
  Phone,
  ChevronLeft
} from 'lucide-react';
import { User, Visit, DashboardStats, VisitType, VisitResult, ClientType, Role, Notification } from './types';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logo from './logo-3d.png';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const STATE_MAPPING: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
  'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
  'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
  'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
  'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
  'Sergipe': 'SE', 'Tocantins': 'TO'
};

// --- Supabase Config ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Components ---

const Home = ({ profile, onNewVisit, onSelectVisit }: { profile: User | null, onNewVisit: () => void, onSelectVisit: (v: Visit) => void }) => {
  const [stats, setStats] = useState({ today: 0, month: 0, pending: 0 });
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!profile) return;
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      let query = supabase.from('visitas').select('*');
      if (profile.role === 'VENDEDOR') {
        query = query.eq('vendedor_id', profile.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        const todayCount = data.filter(v => v.data_visita === today).length;
        const monthCount = data.filter(v => v.data_visita >= monthStart).length;
        const pendingCount = data.filter(v => v.objetivo_resultado === 'parcial').length;

        setStats({ today: todayCount, month: monthCount, pending: pendingCount });

        const mapped: Visit[] = data
          .sort((a, b) => new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime())
          .slice(0, 3)
          .map(v => ({
            id: v.id,
            user_id: v.vendedor_id,
            user_name: v.vendedor_nome,
            client_name: v.cliente_nome,
            client_type: v.tipo_cliente?.toUpperCase() === 'TRR' ? 'TRR_CONSUMIDOR' :
              v.tipo_cliente?.toUpperCase() === 'TRANSPORTE' ? 'FROTA' :
                v.tipo_cliente?.toUpperCase() as any || 'POSTO',
            date: v.data_visita,
            type: v.tipo_visita?.toUpperCase() as any || 'PROSPECCAO',
            result: v.objetivo_resultado?.toUpperCase() as any || 'ALCANCADO',
            summary: v.resumo,
            details: v.details || {},
            region: v.cidade,
            cnpj: v.cnpj,
            latitude: v.latitude,
            longitude: v.longitude
          }));
        setRecentVisits(mapped);
      }
      setLoading(false);
    };

    fetchHomeData();
  }, [profile?.id]);

  return (
    <div className="p-4 space-y-8 pb-24 lg:pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Olá, {profile?.name.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500 font-medium">Aqui está o resumo das suas atividades.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Hoje', value: stats.today, icon: CalendarDays, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Este Mês', value: stats.month, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-border-dark shadow-sm flex items-center gap-4">
            <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-primary" /> Atividades Recentes
          </h2>
          <button onClick={onNewVisit} className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-all">
            Ver Todas
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400 font-medium">Carregando atividades...</div>
          ) : recentVisits.length === 0 ? (
            <div className="bg-slate-50 dark:bg-background-dark/50 border-2 border-dashed border-slate-200 dark:border-border-dark p-10 rounded-3xl text-center space-y-4">
              <Plus size={48} className="mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium">Nenhuma visita registrada ainda.</p>
              <button onClick={onNewVisit} className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Iniciar Primeira Visita
              </button>
            </div>
          ) : (
            recentVisits.map(visit => (
              <div
                key={visit.id}
                onClick={() => onSelectVisit(visit)}
                className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-xs ${visit.result === 'ALCANCADO' ? 'bg-emerald-500/10 text-emerald-600' :
                    visit.result === 'PARCIAL' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                    {visit.result === 'ALCANCADO' ? <CheckCircle2 size={18} /> :
                      visit.result === 'PARCIAL' ? <Clock size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{visit.client_name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} /> {visit.region} • {new Date(visit.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary to-indigo-600 p-8 rounded-[40px] text-white space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black leading-tight">Pronto para<br />mais uma visita?</h3>
          <p className="text-primary-foreground/80 mt-2 text-sm font-medium">Registre seus atendimentos e mantenha seu histórico atualizado.</p>
          <button
            onClick={onNewVisit}
            className="mt-6 bg-white text-primary px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-white/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} /> NOVO RELATÓRIO
          </button>
        </div>
      </div>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab, role }: { activeTab: string, setActiveTab: (t: string) => void, role?: Role }) => {
  const allItems = [
    { id: 'home', label: 'Início', icon: LayoutDashboard },
    { id: 'bi', label: 'BI', icon: TrendingUp },
    { id: 'visits', label: 'Visitas', icon: CalendarDays },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  const filteredItems = role === 'VENDEDOR'
    ? allItems.filter(item => ['home', 'visits', 'profile'].includes(item.id))
    : allItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-border-dark px-4 py-3 flex items-center justify-around z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-500">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-100'}`}
          >
            {isActive && (
              <motion.div
                layoutId="bubble"
                className="absolute -top-1 size-1 rounded-full bg-primary"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

const Sidebar = ({ activeTab, setActiveTab, onLogout, profile, theme, onToggleTheme }: { activeTab: string, setActiveTab: (t: string) => void, onLogout: () => void, profile: User | null, theme: 'light' | 'dark', onToggleTheme: () => void }) => {
  const allItems = [
    { id: 'home', label: 'Início', icon: LayoutDashboard },
    { id: 'bi', label: 'Business Intelligence', icon: TrendingUp },
    { id: 'visits', label: 'Gestão de Visitas', icon: CalendarDays },
    { id: 'users', label: 'Gestão de Usuários', icon: Users },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon },
  ];

  const filteredItems = profile?.role === 'VENDEDOR'
    ? allItems.filter(item => ['home', 'visits', 'profile'].includes(item.id))
    : allItems;

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-col z-[60] transition-colors duration-500">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-white dark:bg-background-dark rounded-xl flex items-center justify-center shadow-lg shadow-black/5 p-1 border border-slate-100 dark:border-border-dark">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Small</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Checklist</p>
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark transition-colors"
        >
          {theme === 'light' ? <Moon size={18} className="text-slate-400" /> : <Sun size={18} className="text-amber-400" />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 no-scrollbar overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-border-dark">
        <div className="bg-slate-50 dark:bg-background-dark rounded-2xl p-4 flex items-center gap-3 border border-transparent hover:border-primary/20 transition-all group/user">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="size-full object-cover" />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{profile?.name || 'Visitante'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{profile?.role || 'Acesso'}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Sair do Sistema"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          const newPassword = prompt('Por favor, insira sua nova senha:');
          if (newPassword) {
            const { error: updateError } = await supabase.auth.updateUser({
              password: newPassword,
            });
            if (updateError) {
              setError(updateError.message);
            } else {
              alert('Sua senha foi atualizada com sucesso! Você já pode fazer login.');
              setMode('login');
            }
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.setItem('rememberMe', 'false');
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : authError.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white mb-6 shadow-2xl shadow-black/10 p-3">
            <img src={logo} alt="Logo" className="w-full h-full object-contain animate-float" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Checklist</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {mode === 'login' ? 'Gestão de Visitas Externas • Small' : 'Recuperação de Acesso'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleForgotPassword} className="glass-card p-8 rounded-2xl space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                {message}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all text-sm"
                />
              </div>
            </div>
            {mode === 'login' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Users size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {mode === 'login' ? (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 ${rememberMe ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${rememberMe ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    Manter conectado
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Esqueci a senha
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setMessage(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Voltar para o Login
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {loading ? 'Processando...' : (
              mode === 'login' ? (
                <>
                  Entrar <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Enviar Link <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )
            )}
          </button>


        </form>

        <footer className="text-center space-y-4">

          <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium">
            <button type="button" className="hover:text-slate-600 dark:hover:text-slate-100 transition-colors">Termos</button>
            <button type="button" className="hover:text-slate-600 dark:hover:text-slate-100 transition-colors">Privacidade</button>
            <button type="button" className="hover:text-slate-600 dark:hover:text-slate-100 transition-colors">Suporte</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

const Dashboard = ({ profile }: { profile: User | null }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    let query = supabase.from('visitas').select('*')
      .gte('data_visita', thirtyDaysAgoStr);

    if (profile?.role === 'VENDEDOR') {
      query = query.eq('vendedor_id', profile.id);
    }

    const { data: visits, error } = await query;

    if (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      return;
    }

    // Calculate stats
    const totalVisits = visits.length;
    const uniqueClients = new Set(visits.map(v => v.cliente_nome)).size;
    const opportunities = visits.filter(v => v.details?.opportunity === 'Sim' || v.details?.biz_opportunity === 'Sim' || v.posto_oportunidade === 'sim' || v.trr_oportunidade === 'sim').length;

    // Group by Assessor
    const assessorMap: Record<string, number> = {};
    visits.forEach(v => {
      const name = v.vendedor_nome || 'Desconhecido';
      assessorMap[name] = (assessorMap[name] || 0) + 1;
    });
    const topAssessores = Object.entries(assessorMap)
      .map(([name, visits]) => ({
        name,
        visits,
        percent: Math.min(100, (visits / (totalVisits || 1)) * 200) // Rough scaling
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 3);

    // Group by Region
    const regionMap: Record<string, number> = {};
    visits.forEach(v => {
      const city = v.cidade || 'Não informada';
      regionMap[city] = (regionMap[city] || 0) + 1;
    });
    const topRegions = Object.entries(regionMap)
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.min(100, (value / (totalVisits || 1)) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    // Group by Date (Last 7 Days)
    const last7Days: { date: string, label: string, count: number, isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      last7Days.push({ date: dateStr, label, count: 0, isToday: i === 0 });
    }

    visits.forEach(v => {
      try {
        if (!v.data_visita) return;
        const vDate = v.data_visita.substring(0, 10);
        const dayMatch = last7Days.find(d => d.date === vDate);
        if (dayMatch) dayMatch.count++;
      } catch (e) {
        console.error('Error parsing date for chart:', v.data_visita);
      }
    });

    const maxCount = Math.max(...last7Days.map(d => d.count), 1);
    const visitsByPeriod = last7Days.map(d => ({
      label: d.label,
      value: (d.count / maxCount) * 100,
      isToday: d.isToday,
      count: d.count
    }));

    setStats({
      totalVisits,
      uniqueClients,
      opportunities,
      visitsByPeriod,
      topAssessores,
      topRegions
    });
    setLoading(false);
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [profile?.id]);

  if (initialLoading && !stats) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard BI</h1>
          <p className="text-slate-500 text-xs">Visão geral de desempenho</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            fetchStats();
          }}
          className="p-2 hover:bg-slate-200 dark:hover:bg-border-dark rounded-lg transition-colors text-slate-900 dark:text-white"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total de Visitas</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp size={12} className="mr-1" /> +12%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight">{stats.totalVisits}</div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Clientes Únicos</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp size={12} className="mr-1" /> +5%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight">{stats.uniqueClients}</div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
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
        <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold">Visitas por Período (Últimos 30 dias)</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fetchStats();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-background-dark rounded transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw size={16} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex h-40 items-end justify-between gap-2 px-2">
            {stats.visitsByPeriod.map((p, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                  {p.count} visitas
                </div>
                <div
                  className={`w-full rounded-t transition-all ${(p as any).isToday ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'}`}
                  style={{ height: `${Math.max(8, p.value)}%` }}
                />
                <span className={`text-[10px] ${(p as any).isToday ? 'font-bold text-primary' : 'text-slate-400 font-medium'}`}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
            <h3 className="mb-6 text-sm font-bold">Tipos de Clientes</h3>
            <div className="flex items-center justify-around">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-slate-100 dark:stroke-border-dark" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
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
          <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold">Top Assessores</h3>
            <div className="flex flex-col gap-4">
              {stats.topAssessores.map((a, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{a.name}</span>
                    <span className="font-bold">{a.visits} visitas</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-background-dark">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${a.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Region Volume */}
        <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
          <h3 className="mb-5 text-sm font-bold">Volume por Região</h3>
          <div className="space-y-4">
            {stats.topRegions.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{r.name}</span>
                <div className="h-6 flex-1 rounded bg-slate-100 dark:bg-background-dark overflow-hidden">
                  <div className="h-full bg-primary/80" style={{ width: `${r.percent}%` }}></div>
                </div>
                <span className="w-8 text-right text-xs font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm">
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

const VisitsList = ({ profile, onNewVisit, onSelectVisit }: { profile: User | null, onNewVisit: () => void, onSelectVisit: (v: Visit) => void }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAssessor, setActiveAssessor] = useState('Todos');
  const [activeCity, setActiveCity] = useState('Todas');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);

  const fetchVisits = async () => {
    setLoading(true);
    let query = supabase.from('visitas').select('*');

    if (profile?.role === 'VENDEDOR') {
      query = query.eq('vendedor_id', profile.id);
    }

    const { data, error } = await query
      .order('data_visita', { ascending: !sortByDateDesc });

    if (error) {
      console.error('Error fetching visits:', error);
      setLoading(false);
      return;
    }

    const mappedVisits: Visit[] = data.map(v => ({
      id: v.id,
      user_id: v.vendedor_id,
      user_name: v.vendedor_nome,
      client_name: v.cliente_nome,
      client_type: v.tipo_cliente?.toUpperCase() === 'TRR' ? 'TRR_CONSUMIDOR' :
        v.tipo_cliente?.toUpperCase() === 'TRANSPORTE' ? 'FROTA' :
          v.tipo_cliente?.toUpperCase() as any || 'POSTO',
      date: v.data_visita,
      type: v.tipo_visita?.toUpperCase() as any || 'PROSPECCAO',
      result: v.objetivo_resultado?.toUpperCase() as any || 'ALCANCADO',
      summary: v.resumo,
      details: v.details || {},
      region: v.cidade,
      cnpj: v.cnpj,
      latitude: v.latitude,
      longitude: v.longitude
    }));

    setVisits(mappedVisits);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, [sortByDateDesc, profile?.id]);

  const uniqueAssessores = ['Todos', ...Array.from(new Set(visits.map(v => v.user_name)))];
  const uniqueCities = ['Todas', ...Array.from(new Set(visits.map(v => v.region)))];

  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssessor = activeAssessor === 'Todos' || v.user_name === activeAssessor;
    const matchesCity = activeCity === 'Todas' || v.region === activeCity;

    let matchesDate = true;
    if (dateRange) {
      const vDate = new Date(v.date);
      const sDate = new Date(dateRange.start);
      const eDate = new Date(dateRange.end);
      matchesDate = vDate >= sDate && vDate <= eDate;
    }

    return matchesSearch && matchesAssessor && matchesCity && matchesDate;
  });

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          placeholder="Pesquisar visitas por cliente, assessor ou cidade..."
          className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Filter size={16} /> Filtros
          </h3>
          <button
            onClick={() => setSortByDateDesc(!sortByDateDesc)}
            className={`text-sm font-medium flex items-center gap-1 transition-colors ${sortByDateDesc ? 'text-primary' : 'text-slate-500'}`}
          >
            <TrendingUp size={16} className={sortByDateDesc ? '' : 'rotate-180'} />
            {sortByDateDesc ? 'Mais recentes' : 'Mais antigas'}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {/* Assessor Filter Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-full px-2 py-1">
            <UserIcon size={14} className="ml-1 text-slate-400" />
            <select
              value={activeAssessor}
              onChange={(e) => setActiveAssessor(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none pr-1"
            >
              {uniqueAssessores.map(a => <option key={a} value={a} className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white">{a}</option>)}
            </select>
          </div>

          {/* City Filter Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-full px-2 py-1">
            <MapPin size={14} className="ml-1 text-slate-400" />
            <select
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none pr-1"
            >
              {uniqueCities.map(c => <option key={c} value={c} className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white">{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Início</span>
            <input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) => setDateRange(prev => ({ start: e.target.value, end: prev?.end || '' }))}
              className="bg-transparent text-xs font-medium outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Fim</span>
            <input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) => setDateRange(prev => ({ start: prev?.start || '', end: e.target.value }))}
              className="bg-transparent text-xs font-medium outline-none text-slate-900 dark:text-white"
            />
            {dateRange && (
              <button onClick={() => setDateRange(null)} className="ml-1 text-rose-500">
                <XCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visits List */}
      <div className={loading || filteredVisits.length === 0 ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"}>
        {loading ? (
          <div className="text-center py-10 text-slate-500 col-span-full">Carregando visitas...</div>
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-10 text-slate-500 col-span-full">Nenhuma visita encontrada.</div>
        ) : filteredVisits.map(visit => (
          <div
            key={visit.id}
            onClick={() => onSelectVisit(visit)}
            className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                  {visit.user_name?.substring(0, 2)}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Assessor Técnico</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{visit.user_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Data</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{new Date(visit.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">{visit.client_name}</h4>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin size={14} className="text-primary" /> {visit.region}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-border-dark">
              <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-border-dark text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-border-dark">
                {visit.type}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${visit.result === 'ALCANCADO' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                visit.result === 'PARCIAL' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                {visit.result === 'ALCANCADO' ? <CheckCircle2 size={12} /> : visit.result === 'PARCIAL' ? <Clock size={12} /> : <XCircle size={12} />}
                {visit.result === 'ALCANCADO' ? 'Concluída' : visit.result === 'PARCIAL' ? 'Agendada' : 'Sem Interesse'}
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

const VisitForm = ({ onBack, onSuccess, profile }: { onBack: () => void, onSuccess: () => void, profile: User | null }) => {
  const [clientType, setClientType] = useState<ClientType>('POSTO');
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    cnpj: '',
    region: 'Detectando localização...',
    date: new Date().toISOString().split('T')[0],
    type: 'PROSPECCAO' as VisitType,
    result: 'PARCIAL' as VisitResult,
    volume: 0,
    competitor: '',
    summary: '',
    details: {} as any,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || 'Desconhecida';
            const state = data.address.state || '';
            const stateAbbr = STATE_MAPPING[state] || state;
            setFormData(prev => ({
              ...prev,
              region: `${city}${stateAbbr ? `-${stateAbbr}` : ''}`,
              latitude,
              longitude
            }));
          } catch (error) {
            setFormData(prev => ({ ...prev, region: 'Localização indisponível' }));
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          setFormData(prev => ({ ...prev, region: 'Permissão negada' }));
          setIsLocating(false);
        }
      );
    } else {
      setFormData(prev => ({ ...prev, region: 'GPS não suportado' }));
    }
  }, []);

  const updateDetails = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [key]: value }
    }));
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const insertData = {
      vendedor_id: user.id,
      vendedor_nome: profile?.full_name || user.email,
      cliente_nome: formData.client_name,
      cnpj: formData.cnpj,
      cidade: formData.region,
      data_visita: formData.date,
      tipo_cliente: clientType === 'TRR_CONSUMIDOR' ? 'trr' :
        clientType === 'FROTA' ? 'transporte' :
          clientType.toLowerCase(),
      tipo_visita: formData.type.toLowerCase(),
      objetivo_resultado: formData.result.toLowerCase(),
      resumo: formData.summary,
      details: formData.details,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    const { error } = await supabase
      .from('visitas')
      .insert([insertData]);

    if (!error) onSuccess();
    else console.error('Error saving visit:', error);
  };

  const renderConditionalBlocks = () => {
    switch (clientType) {
      case 'POSTO':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Bandeira</label>
                <select
                  className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                  onChange={e => updateDetails('flag', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="BANDEIRADO">Bandeirado</option>
                  <option value="BRANCA">Bandeira Branca</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Situação Atual</label>
                <select
                  className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                  onChange={e => updateDetails('status', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="NEGOCIACAO">Em negociação</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="SEM_VIABILIDADE">Sem viabilidade</option>
                </select>
              </div>
            </div>

            {formData.details.status && formData.details.status !== 'ATIVO' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Motivo Principal</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Preço', 'Contrato vigente', 'Estratégia da rede', 'Outro'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateDetails('reason', m)}
                      className={`px-3 py-2 rounded-lg text-xs border transition-colors ${formData.details.reason === m ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Produtos Trabalhados</label>
              <div className="flex flex-wrap gap-2">
                {['Diesel S10', 'Diesel S500', 'Gasolina', 'Etanol'].map(p => {
                  const products = formData.details.products || [];
                  const isSelected = products.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        const next = isSelected ? products.filter((i: string) => i !== p) : [...products, p];
                        updateDetails('products', next);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs border transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400'}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-border-dark">
              <label className="text-xs font-bold text-slate-600 uppercase">Oportunidade Real de Avanço?</label>
              <div className="flex gap-2">
                {['Sim', 'Não', 'Em avaliação'].map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => updateDetails('opportunity', o)}
                    className={`flex-1 py-2 rounded-lg text-xs border font-bold transition-all ${formData.details.opportunity === o ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-100'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {formData.details.opportunity === 'Sim' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-primary uppercase">Volume Estimado</label>
                    <input type="number" className="w-full bg-white dark:bg-surface-dark border border-primary/20 dark:border-border-dark rounded px-2 py-1.5 text-sm outline-none focus:border-primary" onChange={e => updateDetails('est_volume', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-primary uppercase">Prazo Fechamento</label>
                    <input type="date" className="w-full bg-white dark:bg-surface-dark border border-primary/20 dark:border-border-dark rounded px-2 py-1.5 text-sm outline-none focus:border-primary" onChange={e => updateDetails('deadline', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">Próximo Passo *</label>
                  <input className="w-full bg-white dark:bg-surface-dark border border-primary/20 dark:border-border-dark rounded px-2 py-1.5 text-sm outline-none focus:border-primary" placeholder="O que foi combinado?" onChange={e => updateDetails('next_step', e.target.value)} />
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'TRR_CONSUMIDOR':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-border-dark">
              <label className="text-xs font-bold text-slate-600 uppercase">Possui tanque próprio?</label>
              <div className="flex gap-2">
                {['Sim', 'Não'].map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => updateDetails('has_tank', o)}
                    className={`flex-1 py-2 rounded-lg text-xs border font-bold transition-all ${formData.details.has_tank === o ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-100'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {formData.details.has_tank === 'Sim' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Capacidade</label>
                    <input className="w-full bg-white dark:bg-surface-dark border border-emerald-200 dark:border-emerald-800/50 rounded px-2 py-1.5 text-sm outline-none focus:border-emerald-500" placeholder="ex: 15.000L" onChange={e => updateDetails('tank_capacity', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Produtos</label>
                    <input className="w-full bg-white dark:bg-surface-dark border border-emerald-200 dark:border-emerald-800/50 rounded px-2 py-1.5 text-sm outline-none focus:border-emerald-500" placeholder="ex: S10, S500" onChange={e => updateDetails('stored_products', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase">Origem Atual</label>
                  <div className="flex gap-2">
                    {['Distribuidora', 'TRR', 'Posto'].map(orig => (
                      <button key={orig} type="button" onClick={() => updateDetails('origin', orig)} className={`flex-1 py-1.5 rounded-lg text-[10px] border font-bold transition-all ${formData.details.origin === orig ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-surface-dark border-emerald-200 dark:border-emerald-800/50 text-emerald-600'}`}>{orig}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {formData.details.has_tank === 'Não' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                <label className="text-xs font-bold text-amber-600 uppercase">Forma de Abastecimento</label>
                <div className="flex flex-wrap gap-2">
                  {['Posto', 'Terceiro', 'Não compra'].map(f => (
                    <button key={f} type="button" onClick={() => updateDetails('supply_mode', f)} className={`px-3 py-1.5 rounded-lg text-[10px] border font-bold transition-all ${formData.details.supply_mode === f ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-surface-dark border-amber-200 dark:border-amber-800/50 text-amber-600'}`}>{f}</button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Consumo Médio Mensal (estimado)</label>
              <input className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="m³ / mês" onChange={e => updateDetails('avg_consumption', e.target.value)} />
            </div>

            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Oportunidade Real de Negócio?</label>
              <div className="flex gap-2">
                {['Sim', 'Não', 'Em avaliação'].map(o => (
                  <button key={o} type="button" onClick={() => updateDetails('biz_opportunity', o)} className={`flex-1 py-2 rounded-lg text-xs border font-bold transition-all ${formData.details.biz_opportunity === o ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-100'}`}>{o}</button>
                ))}
              </div>
            </div>

            {formData.details.biz_opportunity === 'Sim' && (
              <div className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full bg-white dark:bg-surface-dark border border-primary/20 dark:border-border-dark rounded px-2 py-1.5 text-sm outline-none focus:border-primary" placeholder="Volume Est." onChange={e => updateDetails('est_volume', e.target.value)} />
                  <input type="date" className="w-full bg-white dark:bg-surface-dark border border-primary/20 dark:border-border-dark rounded px-2 py-1.5 text-sm outline-none focus:border-primary" onChange={e => updateDetails('deadline', e.target.value)} />
                </div>
                <input className="w-full bg-white dark:bg-surface-dark border border-primary/20 dark:border-border-dark rounded px-2 py-1.5 text-sm outline-none focus:border-primary" placeholder="Próximo Passo (Obrigatório) *" onChange={e => updateDetails('next_step', e.target.value)} />
              </div>
            )}
          </div>
        );

      case 'FROTA':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Qtd Veículos</label>
                <input type="number" className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" onChange={e => updateDetails('vehicle_qty', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Abastecimento</label>
                <select className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" onChange={e => updateDetails('supply_type', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="POSTO" className="dark:bg-surface-dark">Posto</option>
                  <option value="TANQUE" className="dark:bg-surface-dark">Tanque Próprio</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Produto Principal</label>
                <input className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" onChange={e => updateDetails('main_product', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Consumo Mensal</label>
                <input className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="m³" onChange={e => updateDetails('avg_consumption', e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Próximo Passo</label>
              <textarea className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" rows={2} onChange={e => updateDetails('next_step', e.target.value)} />
            </div>
          </div>
        );

      case 'OUTRO':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Descrição do Tipo de Cliente</label>
              <input className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Especifique..." onChange={e => updateDetails('description', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-background-dark/50 rounded-xl border border-slate-200 dark:border-border-dark">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Possível Enquadramento Futuro</label>
              <div className="flex gap-2">
                {['Posto', 'TRR', 'Sem perfil'].map(f => (
                  <button key={f} type="button" onClick={() => updateDetails('future_fit', f)} className={`flex-1 py-2 rounded-lg text-xs border ${formData.details.future_fit === f ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32 relative text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg bg-primary/10 text-primary">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">Nova Visita</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Registre os detalhes da sua visita</p>
            </div>
          </div>
          <button className="p-2 text-slate-500">
            <MoreVertical size={20} />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Progresso do Formulário</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {clientType ? '50%' : '25%'} Completo
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-border-dark rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: clientType ? '50%' : '25%' }}></div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary text-[10px] font-bold text-white">1</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Identificação</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Data</label>
              <div className="bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-sm text-slate-400 cursor-not-allowed flex items-center gap-2">
                <CalendarDays size={14} /> {formData.date}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Assessor</label>
              <div className="bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-sm text-slate-500 dark:text-slate-100 font-bold truncate flex items-center gap-2">
                <UserIcon size={14} className="text-primary" /> {profile?.name || 'Ricardo Oliveira'}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Cidade / Região (GPS)</label>
            <div className="relative">
              {isLocating ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              )}
              <input
                readOnly
                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg pl-11 pr-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-medium outline-none cursor-not-allowed"
                placeholder="Aguardando GPS..."
                value={formData.region}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Nome do Cliente</label>
            <input
              className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="Razão Social ou Nome Fantasia"
              value={formData.client_name}
              onChange={e => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">CNPJ</label>
            <input
              className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-xs font-medium text-slate-500 ml-1">Tipo de Cliente (Obrigatório)</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'POSTO', label: 'Posto' },
                { id: 'TRR_CONSUMIDOR', label: 'TRR / Consumidor' },
                { id: 'FROTA', label: 'Frota' },
                { id: 'OUTRO', label: 'Outro' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setClientType(t.id as ClientType);
                    setFormData(prev => ({ ...prev, details: {} })); // Clear details on type change
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${clientType === t.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-100 border-slate-200 dark:border-border-dark hover:border-primary'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-border-dark" />

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-border-dark text-[10px] font-bold text-slate-500">2</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Detalhes Específicos</h2>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={clientType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderConditionalBlocks()}
            </motion.div>
          </AnimatePresence>
        </section>

        <hr className="border-slate-200 dark:border-border-dark" />

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-border-dark text-[10px] font-bold text-slate-500">3</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Resultado da Visita</h2>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-slate-500 ml-1">Tipo de Visita</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'PROSPECCAO', label: 'Prospecção', icon: <Search size={14} /> },
                { id: 'RELACIONAMENTO', label: 'Relacionamento', icon: <Users size={14} /> },
                { id: 'NEGOCIACAO', label: 'Negociação', icon: <TrendingUp size={14} /> },
                { id: 'POS_VENDA', label: 'Pós-venda', icon: <Settings size={14} /> }
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: v.id as VisitType })}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${formData.type === v.id ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border-slate-200 dark:border-border-dark'
                    }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-xs font-medium text-slate-500 ml-1">Objetivo da Visita</label>
            <div className="flex flex-col gap-2">
              {[
                { id: 'ALCANCADO', label: 'Alcançado', icon: <CheckCircle2 size={18} className="text-green-500" /> },
                { id: 'PARCIAL', label: 'Parcial', icon: <Clock size={18} className="text-amber-500" /> },
                { id: 'NAO_ALCANCADO', label: 'Não alcançado', icon: <XCircle size={18} className="text-red-500" /> }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, result: r.id as VisitResult })}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${formData.result === r.id ? 'border-2 border-primary bg-primary/5' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {r.icon}
                    <span className={`text-sm ${formData.result === r.id ? 'font-semibold' : ''}`}>{r.label}</span>
                  </div>
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center ${formData.result === r.id ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                    {formData.result === r.id && <div className="size-2 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-border-dark" />

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-border-dark text-[10px] font-bold text-slate-500">4</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Observações</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-medium text-slate-500">Resumo Objetivo *</label>
              <span className="text-[10px] font-mono text-slate-400">{formData.summary.length}/300</span>
            </div>
            <textarea
              className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none"
              placeholder="Descreva os principais pontos..."
              rows={4}
              maxLength={300}
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto z-40 p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent">
        <button
          onClick={handleSubmit}
          disabled={!formData.summary || !formData.client_name}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Send size={18} /> Enviar Relatório
        </button>
      </footer>
    </div>
  );
};

const UserEditModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (updatedUser: Partial<User>) => void }) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [active, setActive] = useState(!!user.active);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-border-dark"
      >
        <div className="p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-background-dark/50 text-slate-900 dark:text-white">
          <h2 className="text-xl font-bold">Editar Usuário</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-border-dark rounded-full transition-colors">
            <XCircle size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome Completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">E-mail</label>
            <input
              value={user.email}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl outline-none transition-all opacity-70 text-slate-900 dark:text-white cursor-not-allowed"
              disabled
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Perfil / Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="GESTOR">GESTOR</option>
              <option value="VENDEDOR">VENDEDOR</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-background-dark/30 rounded-xl border border-slate-200 dark:border-border-dark">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Usuário Ativo</span>
            <button
              onClick={() => setActive(!active)}
              className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-background-dark/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-border-dark rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave({ name, role, active })}
            className="flex-1 py-3 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AddUserModal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (name: string, email: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name || !email) {
      alert('Preencha nome e e-mail');
      return;
    }
    setLoading(true);
    await onAdd(name, email);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-border-dark"
      >
        <div className="p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-background-dark/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Usuário</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-border-dark rounded-full transition-colors">
            <XCircle size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome Completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">E-mail de Trabalho</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@empresa.com.br"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
            />
            <p className="text-[10px] text-slate-400 mt-2">Um e-mail de confirmação será enviado para este endereço.</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-background-dark/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-border-dark rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Criar Usuário'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      return;
    }

    const mappedUsers: User[] = data.map(u => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.role?.toUpperCase() as any || 'VENDEDOR',
      active: u.active
    }));

    setUsers(mappedUsers);
    setLoading(false);
  };

  const handleAddUser = async (name: string, email: string) => {
    try {
      // We use a temporary client with persistSession: false to avoid logging out the current admin
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

      const { data, error: authError } = await tempSupabase.auth.signUp({
        email,
        password: randomPassword,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (authError) throw authError;

      // Note: Supabase triggers a profile creation via DB Trigger usually, 
      // but we can manually ensure the full_name is set if needed or just wait for the user to log in.
      // The user will receive an email to confirm their account.

      setIsAddingUser(false);
      fetchUsers();
      alert(`Usuário ${name} adicionado! Um e-mail de confirmação foi enviado para ${email}.`);
    } catch (error: any) {
      alert('Erro ao adicionar usuário: ' + error.message);
      console.error('Error adding user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .update({ active: !user.active })
      .eq('id', user.id);

    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
      // In a real scenario with Supabase Auth, deleting from 'profiles' is easy, 
      // but deleting from 'auth.users' requires an Edge Function or admin API.
      // We'll stick to inactivate + removing from profile for now as a "soft delete"
      // or just alert that admin action is needed.
      const { error } = await supabase.from('profiles').delete().eq('id', user.id);
      if (error) alert('Erro ao excluir: ' + error.message);
      else fetchUsers();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'Todos' || user.role === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Gestão de Usuários</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchUsers()}
            className="p-2 hover:bg-slate-200 dark:hover:bg-border-dark rounded-lg transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Admin', 'Gestor', 'Vendedor'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveTab(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === f ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-border-dark text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-border-dark/80'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className={loading || filteredUsers.length === 0 ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"}>
        {loading ? (
          <div className="text-center py-10 text-slate-500 col-span-full font-medium">Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-slate-500 col-span-full font-medium">Nenhum usuário encontrado.</div>
        ) : filteredUsers.map(user => (
          <div
            key={user.id}
            className={`bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col justify-between group hover:border-primary/50 hover:shadow-xl transition-all h-full ${user.active ? '' : 'grayscale opacity-60'}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20 shadow-inner">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className={`font-black text-lg text-slate-900 dark:text-white truncate ${user.active ? '' : 'line-through opacity-50'}`}>{user.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{user.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-slate-100 dark:bg-border-dark text-slate-500 dark:text-slate-400 border-slate-200 dark:border-border-dark'
                }`}>
                {user.role}
              </span>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`size-2.5 rounded-full shadow-sm ${user.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className={`text-xs font-black uppercase tracking-widest ${user.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  title="Configurar Perfil"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  onDoubleClick={() => handleDeleteUser(user)}
                  className={`p-2.5 rounded-xl transition-all ${user.active ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10' : 'text-primary hover:bg-primary/10'}`}
                  title={user.active ? "Bloquear Acesso" : "Liberar Acesso"}
                >
                  {user.active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={async (updates) => {
            const { error } = await supabase
              .from('profiles')
              .update({
                full_name: updates.name,
                role: updates.role?.toLowerCase(),
                active: updates.active
              })
              .eq('id', editingUser.id);

            if (error) alert('Erro ao salvar: ' + error.message);
            else {
              setEditingUser(null);
              fetchUsers();
            }
          }}
        />
      )}

      {isAddingUser && (
        <AddUserModal
          onClose={() => setIsAddingUser(false)}
          onAdd={handleAddUser}
        />
      )}

      {/* FAB */}
      <div className="fixed bottom-24 right-6 sm:right-10 z-20">
        <button
          onClick={() => setIsAddingUser(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-all group"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Adicionar Usuário</span>
        </button>
      </div>
    </div>
  );
};

const VisitDetails = ({ visit, onBack }: { visit: Visit, onBack: () => void }) => {
  const handleExportPDF = () => {
    // Basic print triggering. The styling will be 
    // handled by CSS @media print
    window.print();
  };

  const renderDetails = () => {
    if (!visit.details || Object.keys(visit.details).length === 0) return null;

    return (
      <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-border-dark flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Informações Avançadas ({visit.client_type})</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(visit.details).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{key.replace(/_/g, ' ')}</label>
              <p className="text-sm font-medium">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32 transition-colors duration-500">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-background-dark transition-colors">
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Detalhes da Visita</h1>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center w-10 h-10 rounded-full text-primary hover:bg-primary/10 transition-colors no-print"
            title="Exportar PDF/Imprimir"
          >
            <FileText size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header Info Card */}
        <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-4 overflow-hidden relative">
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
        <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-border-dark flex items-center gap-2">
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
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tipo de Cliente</label>
                <p className="text-sm font-semibold">{visit.client_type}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">CNPJ</label>
                <p className="text-sm font-semibold">{visit.cnpj || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Localização</label>
                <p className="text-sm font-semibold">{visit.region}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Details Block */}
        {renderDetails()}

        {/* Visit Specifics Card */}
        <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-border-dark flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Resultado da Visita</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-border-dark">
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Tipo de Visita</span>
              <span className="text-sm font-semibold bg-slate-100 dark:bg-background-dark px-2 py-1 rounded">{visit.type}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Objetivo</span>
              <span className={`text-sm font-bold px-2 py-1 rounded ${visit.result === 'ALCANCADO' ? 'text-emerald-500 bg-emerald-500/10' :
                visit.result === 'PARCIAL' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'
                }`}>
                {visit.result}
              </span>
            </div>
          </div>
        </section>

        {/* GPS Location Map Card */}
        {visit.latitude && visit.longitude && (
          <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden shadow-sm no-print">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Localização GPS</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {visit.latitude.toFixed(6)}, {visit.longitude.toFixed(6)}
              </span>
            </div>
            <div className="h-64 w-full relative z-0">
              <MapContainer
                center={[visit.latitude, visit.longitude]}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[visit.latitude, visit.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-xs">{visit.client_name}</p>
                      <p className="text-[10px] text-slate-500">{visit.region}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </section>
        )}

        {/* Summary Card */}
        <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-border-dark flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Observações</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Resumo da Visita</label>
              <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-background-dark/30 p-3 rounded-lg border border-slate-100 dark:border-border-dark">
                {visit.summary}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-border-dark p-4 z-40 transition-colors duration-500">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <button onClick={onBack} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            Voltar para Lista
          </button>
        </div>
      </footer>
    </div>
  );
};

const UserProfile = ({ profile, onUpdate, theme, onToggleTheme }: { profile: User, onUpdate: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) => {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [avatar, setAvatar] = useState(profile.avatar_url || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [interactionsCount, setInteractionsCount] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const fetchInteractions = async () => {
    const startOfMonth = `${selectedMonth}-01`;
    const endOfMonth = `${selectedMonth}-31`;

    const { count, error } = await supabase
      .from('visitas')
      .select('*', { count: 'exact', head: true })
      .eq('vendedor_id', profile.id)
      .gte('data_visita', startOfMonth)
      .lte('data_visita', endOfMonth);

    if (!error) setInteractionsCount(count || 0);
  };

  useEffect(() => {
    fetchInteractions();
  }, [selectedMonth, profile.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) {
      alert('Erro ao fazer upload: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    setAvatar(publicUrl);
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        phone: cleanPhone,
        avatar_url: avatar
      })
      .eq('id', profile.id);

    if (error) alert('Erro ao atualizar: ' + error.message);
    else {
      alert('Perfil atualizado!');
      setIsEditingName(false);
      onUpdate();
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('Erro ao mudar senha: ' + error.message);
    else {
      alert('Senha alterada com sucesso!');
      setNewPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24 lg:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Meu Perfil</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          <div className="size-28 rounded-full border-4 border-white dark:border-background-dark shadow-xl overflow-hidden bg-slate-100 dark:bg-surface-dark flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="size-full object-cover" />
            ) : (
              <UserIcon size={48} className="text-slate-400" />
            )}
          </div>
          <label className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-full shadow-lg hover:scale-110 cursor-pointer transition-transform border-4 border-white dark:border-background-dark">
            <Camera size={18} />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div className="text-center">
          <h2 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">{profile.name}</h2>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            {profile.role}
          </span>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-center justify-between shadow-inner">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Interações Enviadas</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-4xl font-black text-primary">{interactionsCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">neste período</span>
          </div>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2 text-xs font-black outline-none shadow-sm text-slate-900 dark:text-white"
        />
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase px-1 tracking-widest">Nome Completo</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <UserIcon size={18} />
            </div>
            <input
              value={name}
              onFocus={() => setIsEditingName(true)}
              onBlur={() => setIsEditingName(false)}
              onChange={(e) => setName(e.target.value)}
              className={`block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-bold ${isEditingName ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                }`}
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase px-1 tracking-widest">Celular / WhatsApp</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Phone size={18} />
            </div>
            <input
              value={formatPhone(phone)}
              onChange={handlePhoneChange}
              className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-bold text-slate-900 dark:text-white"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="lg:col-span-2 w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Password Change */}
      <div className="pt-6 border-t border-slate-200 dark:border-border-dark space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-rose-500 uppercase px-1">Alterar Senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full px-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            placeholder="Nova senha (mín. 6 dígitos)"
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          disabled={loading || !newPassword}
          className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Confirmar Nova Senha
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              const mappedProfile = { ...data, name: data.full_name };
              setUserProfile(mappedProfile);
              // If new user (no phone), send to profile
              if (!data.phone) {
                setActiveTab('profile');
              }
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              const mappedProfile = { ...data, name: data.full_name };
              setUserProfile(mappedProfile);
              // If recovery or new user (no phone), send to profile to set password/data
              if (event === 'PASSWORD_RECOVERY' || !data.phone) {
                setActiveTab('profile');
              }
            }
          });
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time notifications for New Visits (Admin/Gestor only)
  useEffect(() => {
    if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'gestor')) return;

    const channel = supabase
      .channel('new-visits-notifs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'visitas' },
        (payload) => {
          const newVisit = payload.new;
          const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            message: `Nova visita: ${newVisit.vendedor_nome} em ${newVisit.cliente_nome}`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'visit'
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  if (!session) {
    return <Login />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileUpdate = async () => {
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setUserProfile({ ...data, name: data.full_name });
      }
    }
  };

  const renderContent = () => {
    if (activeTab === 'home') return (
      <Home
        profile={userProfile}
        onNewVisit={() => {
          setActiveTab('visits');
          setView('form');
        }}
        onSelectVisit={(v) => {
          setSelectedVisit(v);
          setActiveTab('visits');
          setView('details');
        }}
      />
    );
    if (activeTab === 'bi') return <Dashboard profile={userProfile} />;
    if (activeTab === 'users') return <UserManagement />;
    if (activeTab === 'profile') {
      if (!userProfile) return <div className="p-10 text-center">Carregando perfil...</div>;
      return (
        <UserProfile
          profile={userProfile}
          onUpdate={handleProfileUpdate}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      );
    }

    // Visits Tab
    if (view === 'form') return <VisitForm profile={userProfile} onBack={() => setView('list')} onSuccess={() => setView('list')} />;
    if (view === 'details' && selectedVisit) return <VisitDetails visit={selectedVisit} onBack={() => setView('list')} />;

    return (
      <VisitsList
        profile={userProfile}
        onNewVisit={() => setView('form')}
        onSelectVisit={(v) => {
          setSelectedVisit(v);
          setView('details');
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 lg:pb-0 font-sans selection:bg-primary/10">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setView('list');
        }}
        onLogout={handleLogout}
        profile={userProfile}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      <BottomNav activeTab={activeTab} setActiveTab={(t) => {
        setActiveTab(t);
        setView('list');
      }} role={userProfile?.role} />

      <div className="lg:pl-64 flex flex-col min-h-screen transition-colors duration-500">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark px-4 py-4 no-print transition-colors duration-500">
          <div className="flex items-center justify-between max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3">
              <div className="lg:hidden flex items-center gap-3">
                <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Small</h1>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {activeTab === 'home' ? 'Painel Principal' :
                    activeTab === 'bi' ? 'Análise Estratégica' :
                      activeTab === 'visits' ? 'Lista de Atividades' :
                        activeTab === 'users' ? 'Painel Administrativo' : 'Minhas Configurações'}
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-background-dark transition-colors text-slate-500 dark:text-slate-400"
                title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />}
              </button>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-background-dark transition-colors relative"
              >
                <Bell size={20} className={unreadCount > 0 ? "text-primary animate-pulse" : "text-slate-500"} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-background-dark">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-96 overflow-y-auto bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-100 dark:border-border-dark flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notificações</h3>
                    <button
                      onClick={() => {
                        setNotifications([]);
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-primary font-bold uppercase transition-opacity hover:opacity-70"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-border-dark">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Nenhuma notificação nova.
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors cursor-pointer group">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + view}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Removed duplicate BottomNav from footer to avoid double navigation bars */}
    </div>
  );
}
