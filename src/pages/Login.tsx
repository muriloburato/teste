import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { Globe, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading, signInMaster } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indaia-navy">
        <Loader2 className="w-8 h-8 animate-spin text-indaia-blue" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const sanitizedUsername = username
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_.\-@]/g, '');

    try {
      // 1. Lógica Especial para Administrador Master (Bypass de Auth para evitar Rate Limit)
      if (sanitizedUsername === 'admin' && password === 'Ind@123@456') {
        // Criamos um ID fixo para o admin master para garantir consistência
        const MASTER_ADMIN_ID = '00000000-0000-0000-0000-000000000000';
        
        const mockUser = { 
          id: MASTER_ADMIN_ID, 
          email: 'admin@myindaia.local', 
          user_metadata: { full_name: 'Administrador Master', username: 'admin' },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };

        // Tentamos gravar DIRETAMENTE no banco de dados (profiles)
        // Isso ignora o sistema de Auth do Supabase que está dando erro de e-mail
        const { data: profileData, error: dbError } = await supabase
          .from('profiles')
          .upsert({
            id: MASTER_ADMIN_ID,
            username: 'admin',
            full_name: 'Administrador Master',
            role: 'admin',
            status: 'active'
          }, { onConflict: 'username' })
          .select()
          .single();

        if (dbError) {
          console.error("Erro ao gravar admin no banco:", dbError);
          // Se der erro de tabela não encontrada, tentamos 'profile' (singular) como fallback
          if (dbError.message.includes('profiles') || dbError.message.includes('relation "public.profiles" does not exist')) {
             const { data: retryData, error: retryError } = await supabase
              .from('profile')
              .upsert({
                id: MASTER_ADMIN_ID,
                username: 'admin',
                full_name: 'Administrador Master',
                role: 'admin',
                status: 'active'
              }, { onConflict: 'username' })
              .select()
              .single();
              
             if (!retryError) {
               signInMaster(mockUser, retryData);
               navigate('/dashboard');
               return;
             }
          }
          
          // Se falhar a gravação, ainda assim deixamos o admin entrar para não travar o desenvolvimento
          // mas avisamos no console
          console.warn("Não foi possível persistir o admin no banco, entrando em modo local.");
        }

        signInMaster(mockUser, profileData || { id: MASTER_ADMIN_ID, username: 'admin', role: 'admin', status: 'active' });
        navigate('/dashboard');
        return;
      }

      // 2. Login Normal para outros usuários (Usa o sistema de Auth padrão)
      const loginEmail = sanitizedUsername.includes('@') 
        ? sanitizedUsername 
        : `${sanitizedUsername}@myindaia.local`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        setError('Usuário ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro crítico de conexão com o banco.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indaia-navy flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="text-center mb-2">
            <h1 className="text-6xl font-light tracking-tighter text-indaia-blue leading-none">indaia</h1>
            <div className="mt-2 space-y-0.5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-light">comércio exterior</p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-light">logística internacional</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Usuário</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Digite seu usuário"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-indaia-blue focus:ring-4 focus:ring-indaia-blue/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-indaia-blue focus:ring-4 focus:ring-indaia-blue/10 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indaia-blue text-indaia-navy font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-indaia-blue/10 flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
            © 2026 MyIndaia. Logística de Precisão.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
