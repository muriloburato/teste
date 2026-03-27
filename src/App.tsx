import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Briefcase, 
  FolderOpen,
  Settings, 
  LogOut,
  Globe,
  Bell,
  Search as SearchIcon,
  Menu,
  X,
  Shield,
  Loader2
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
      <div className="min-h-screen flex items-center justify-center bg-indaia-navy">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center mb-2 animate-pulse">
            <h1 className="text-4xl font-light tracking-tighter text-indaia-blue leading-none">indaia</h1>
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && profile && !requiredRole.includes(profile.role)) {
    return <div className="text-center py-20 text-slate-500 font-medium">Você não tem permissão para acessar esta página.</div>;
  }

  return <>{children}</>;
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { settings } = useSettings();
  const { profile, signOut } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Processos', path: '/processos' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Briefcase, label: 'Serviços', path: '/servicos' },
    { icon: FolderOpen, label: 'Documentos', path: '/documentos' },
  ];

  if (profile?.role === 'admin' || profile?.role === 'gestor') {
    navItems.push({ icon: Shield, label: 'Usuários', path: '/usuarios' });
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "w-64 flex flex-col h-screen fixed left-0 top-0 border-r z-30 transition-all duration-300 ease-in-out shadow-sm",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        settings.isDarkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-indaia-navy border-white/5 text-white/70"
      )}>
        <div className={cn(
          "h-20 flex items-center justify-between px-6 border-b transition-colors duration-300",
          settings.isDarkMode ? "bg-slate-900 border-slate-800" : "bg-indaia-navy border-white/5"
        )}>
          <div className="flex flex-col">
            <h1 className="text-3xl font-light tracking-tighter text-indaia-blue leading-none">indaia</h1>
            <p className="text-[7px] uppercase tracking-[0.2em] text-white/40 font-light mt-1">logística internacional</p>
          </div>
          <button className="md:hidden text-white/40 hover:text-white transition-colors" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4 px-2">Menu Principal</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indaia-blue text-indaia-navy font-bold shadow-lg shadow-indaia-blue/10" 
                      : settings.isDarkMode 
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white" 
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-indaia-navy" : "text-white/30 group-hover:text-white/60")} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className={cn(
          "p-4 border-t space-y-1 transition-colors duration-300",
          settings.isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white/5 border-white/5"
        )}>
          <Link 
            to="/configuracoes" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors group",
              location.pathname === '/configuracoes'
                ? "bg-indaia-blue text-indaia-navy font-bold shadow-lg shadow-indaia-blue/10"
                : settings.isDarkMode
                  ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className={cn("w-4 h-4", location.pathname === '/configuracoes' ? "text-indaia-navy" : "text-white/30 group-hover:text-white/60")} />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
          <button 
            onClick={signOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors group",
              settings.isDarkMode ? "text-slate-400 hover:bg-red-900/20 hover:text-red-400" : "text-white/40 hover:bg-red-500/10 hover:text-red-400"
            )}
          >
            <LogOut className="w-4 h-4 text-white/20 group-hover:text-red-400" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indaia-navy">
        <Loader2 className="w-8 h-8 animate-spin text-indaia-blue" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const displayName = profile?.full_name || settings.userName;

  return (
    <div className={cn(
      "min-h-screen flex font-sans transition-colors duration-300",
      settings.isDarkMode ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
    )}>
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm transition-colors duration-300",
          settings.isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <button 
              className={cn(
                "p-2 -ml-2 rounded-lg md:hidden transition-colors",
                settings.isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
              )}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-[200px] sm:max-w-xs hidden sm:block">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar no sistema..." 
                className={cn(
                  "w-full pl-9 pr-4 py-2 text-sm border rounded-lg transition-all outline-none placeholder:text-slate-400",
                  settings.isDarkMode 
                    ? "bg-slate-800 border-slate-700 focus:bg-slate-700 focus:border-indaia-blue text-slate-100" 
                    : "bg-slate-50 border-slate-200 focus:bg-white focus:border-indaia-blue focus:ring-2 focus:ring-indaia-blue/20 text-slate-900"
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button className={cn(
              "relative p-2 transition-colors rounded-full",
              settings.isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className={cn("h-8 w-px hidden sm:block", settings.isDarkMode ? "bg-slate-800" : "bg-slate-200")}></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indaia-blue/10 border border-indaia-blue/20 flex items-center justify-center text-indaia-blue font-bold text-xs">
                {displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-sm text-left">
                <p className={cn("font-semibold leading-none", settings.isDarkMode ? "text-slate-200" : "text-slate-700")}>{displayName}</p>
                <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">{profile?.role || 'Usuário'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
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
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/processos" element={
              <ProtectedRoute>
                <Layout>
                  <Processos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/servicos" element={
              <ProtectedRoute>
                <Layout>
                  <Servicos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/documentos" element={
              <ProtectedRoute>
                <Layout>
                  <Documentos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute requiredRole={['admin', 'gestor']}>
                <Layout>
                  <Usuarios />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Layout>
                  <Configuracoes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-20 text-slate-500">Página em construção</div>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
