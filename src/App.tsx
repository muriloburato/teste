import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  FolderOpen,
  Settings,
  LogOut,
  Bell,
  Search as SearchIcon,
  Menu,
  X,
  Shield,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { cn } from './lib/utils';
import { SettingsProvider, useSettings } from './lib/SettingsContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import Clientes from './pages/Clientes';
import Servicos from './pages/Servicos';
import Documentos from './pages/Documentos';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string[] }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-5">
          <img src="/logo.png" alt="indaia" className="h-10 opacity-80" style={{ mixBlendMode: 'multiply' }} />
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indaia-blue pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (requiredRole && profile && !requiredRole.includes(profile.role)) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 font-medium text-sm">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return <>{children}</>;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Processos', path: '/processos' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Briefcase, label: 'Serviços', path: '/servicos' },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const items = [...navItems];
  if (profile?.role === 'admin' || profile?.role === 'gestor') {
    items.push({ icon: Shield, label: 'Usuários', path: '/usuarios' });
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/30 z-20 md:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "w-64 flex flex-col h-screen fixed left-0 top-0 z-30 transition-transform duration-300 ease-out",
        "bg-white border-r border-slate-100",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>

        {/* Logo */}
        <div className="h-[72px] flex items-center justify-between px-5 border-b border-slate-100">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="indaia"
              className="h-8"
              style={{ mixBlendMode: 'multiply', filter: 'contrast(1.05)' }}
            />
          </Link>
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="text-[10px] font-600 text-slate-400 uppercase tracking-widest mb-3 px-3">Menu</p>
          <nav className="space-y-0.5">
            {items.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-indaia-blue/8 text-indaia-navy font-500"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indaia-blue rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isActive ? "text-indaia-blue" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 ml-auto text-indaia-blue/50" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            to="/configuracoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors group",
              location.pathname === '/configuracoes'
                ? "bg-indaia-blue/8 text-indaia-navy font-500"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-sm">Configurações</span>
          </Link>

          <div className="px-3 py-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indaia-blue/10 flex items-center justify-center text-indaia-blue font-600 text-xs flex-shrink-0">
              {(profile?.full_name || 'US').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-500 text-slate-700 truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{profile?.role || 'operador'}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { profile, user, loading } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-indaia-blue/60" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const displayName = profile?.full_name || 'Usuário';

  // Page title mapping
  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/processos': 'Processos',
    '/clientes': 'Clientes',
    '/servicos': 'Serviços',
    '/documentos': 'Documentos',
    '/usuarios': 'Usuários',
    '/configuracoes': 'Configurações',
  };
  const currentTitle = pageTitles[location.pathname] || '';

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] text-slate-900">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-[72px] border-b border-slate-100 bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1">
            <button
              className="p-2 -ml-1 rounded-lg md:hidden text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-500 text-slate-800">{currentTitle}</span>
            </div>

            {/* Search */}
            <div className="relative ml-4 hidden md:block">
              <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white w-52 placeholder:text-slate-400 text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>

            <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block" />

            {/* User */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-indaia-blue/10 flex items-center justify-center text-indaia-blue font-600 text-xs">
                {displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-500 text-slate-700 leading-none">{displayName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{profile?.role || 'usuário'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with page transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/processos" element={<ProtectedRoute><Layout><Processos /></Layout></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><Layout><Servicos /></Layout></ProtectedRoute>} />
            <Route path="/documentos" element={<ProtectedRoute><Layout><Documentos /></Layout></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute requiredRole={['admin','gestor']}><Layout><Usuarios /></Layout></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Layout><Configuracoes /></Layout></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute><Layout><div className="text-center py-20 text-slate-400 text-sm">Página em construção</div></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
