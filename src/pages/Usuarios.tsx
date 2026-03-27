import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Lock, 
  Unlock, 
  MoreVertical, 
  Search, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: 'auxiliar' | 'assistente' | 'analista' | 'gestor' | 'admin';
  status: 'active' | 'blocked';
  operacao?: 'importacao' | 'exportacao' | 'ambos';
  created_at: string;
}

export default function Usuarios() {
  const { profile: currentUserProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    username: '',
    password: '',
    role: 'auxiliar' as Profile['role'],
    operacao: 'ambos' as Profile['operacao']
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Tenta singular
        const { data: retryData, error: retryError } = await supabase
          .from('profile')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!retryError) {
          data = retryData;
          error = null;
        }
      }

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const sanitizedUsername = newUser.username
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_.-]/g, '');

      if (!sanitizedUsername) {
        throw new Error('Nome de usuário inválido.');
      }

      const email = `${sanitizedUsername}@myindaia.local`;
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            username: sanitizedUsername,
            role: newUser.role,
            operacao: newUser.operacao,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile
        let { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            full_name: newUser.full_name,
            username: sanitizedUsername,
            role: newUser.role,
            operacao: newUser.operacao,
            status: 'active'
          }]);

        if (profileError) {
          // Tenta singular
          const { error: retryError } = await supabase
            .from('profile')
            .insert([{
              id: authData.user.id,
              full_name: newUser.full_name,
              username: sanitizedUsername,
              role: newUser.role,
              operacao: newUser.operacao,
              status: 'active'
            }]);
          
          if (!retryError) {
            profileError = null;
          }
        }

        if (profileError) throw profileError;

        setIsModalOpen(false);
        setNewUser({ full_name: '', username: '', password: '', role: 'auxiliar', operacao: 'ambos' });
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUnlock = async (userId: string) => {
    try {
      let { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) {
        // Tenta singular
        const { error: retryError } = await supabase
          .from('profile')
          .update({ status: 'active' })
          .eq('id', userId);
        
        if (!retryError) {
          error = null;
        }
      }

      if (error) throw error;
      fetchUsers();
    } catch (err) {
      console.error('Error unlocking user:', err);
      setError('Erro ao desbloquear usuário.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateRole = (role: Profile['role']) => {
    if (currentUserProfile?.role === 'admin') return true;
    if (currentUserProfile?.role === 'gestor') {
      return ['auxiliar', 'assistente', 'analista'].includes(role);
    }
    return false;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indaia-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Gerencie acessos e permissões do sistema.</p>
        </div>
        {(currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'gestor') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indaia-blue text-white font-bold rounded-xl hover:bg-indaia-blue/90 transition-all shadow-lg shadow-indaia-blue/20"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou usuário..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indaia-blue text-slate-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nível</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Operação</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {user.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indaia-blue" />
                      <span className="text-sm font-medium text-slate-700 capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600 capitalize">
                      {user.operacao === 'ambos' ? 'Importação & Exportação' : user.operacao || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                      user.status === 'active' 
                        ? "bg-green-50 text-green-700" 
                        : "bg-red-50 text-red-700"
                    )}>
                      {user.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.status === 'blocked' && (currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'gestor') && (
                      <button 
                        onClick={() => handleUnlock(user.id)}
                        className="p-2 text-indaia-blue hover:bg-indaia-blue/5 rounded-lg transition-colors"
                        title="Desbloquear Usuário"
                      >
                        <Unlock className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Usuário */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">Novo Usuário</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indaia-blue text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Usuário</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                    placeholder="ex: pedrinho"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indaia-blue text-slate-900 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-500">Apenas letras minúsculas e sem espaços.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Senha Inicial</label>
                  <input 
                    type="password" 
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indaia-blue text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nível de Acesso</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as Profile['role']})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-indaia-blue text-slate-900 outline-none transition-all appearance-none"
                  >
                    <option value="auxiliar" className="text-slate-900 bg-white">Auxiliar</option>
                    <option value="assistente" className="text-slate-900 bg-white">Assistente</option>
                    <option value="analista" className="text-slate-900 bg-white">Analista</option>
                    {currentUserProfile?.role === 'admin' && (
                      <>
                        <option value="gestor" className="text-slate-900 bg-white">Gestor</option>
                        <option value="admin" className="text-slate-900 bg-white">Administrador</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de Operação</label>
                  <select 
                    value={newUser.operacao}
                    onChange={(e) => setNewUser({...newUser, operacao: e.target.value as Profile['operacao']})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-indaia-blue text-slate-900 outline-none transition-all appearance-none"
                  >
                    <option value="importacao" className="text-slate-900 bg-white">Importação</option>
                    <option value="exportacao" className="text-slate-900 bg-white">Exportação</option>
                    <option value="ambos" className="text-slate-900 bg-white">Ambos (Imp & Exp)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-2.5 bg-indaia-blue text-white font-bold rounded-xl hover:bg-indaia-blue/90 transition-all shadow-lg shadow-indaia-blue/20 flex items-center justify-center gap-2"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
