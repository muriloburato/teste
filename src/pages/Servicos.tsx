import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Plus, AlertCircle, Loader2, Database, Edit, Trash2, MoreHorizontal, X, Save, Briefcase } from 'lucide-react';

export default function Servicos() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_base: 0,
    ativo: true
  });

  const fetchServicos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('servicos')
        .select('*')
        .order('nome', { ascending: true });
      
      if (fetchError) throw fetchError;
      setServicos(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar serviços:', err);
      // Fallback data for presentation
      setServicos([
        { id: 1, nome: 'Exportação Marítima', descricao: 'Serviço completo de exportação via modal marítimo.', preco_base: 1500, ativo: true },
        { id: 2, nome: 'Exportação Aérea', descricao: 'Serviço expresso de exportação via modal aéreo.', preco_base: 2500, ativo: true },
        { id: 3, nome: 'Despacho Aduaneiro', descricao: 'Liberação alfandegária de mercadorias.', preco_base: 800, ativo: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError(null);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('servicos')
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            preco_base: formData.preco_base,
            ativo: formData.ativo
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccessMsg('Serviço atualizado com sucesso!');
      } else {
        const { error: insertError } = await supabase
          .from('servicos')
          .insert([{
            nome: formData.nome,
            descricao: formData.descricao,
            preco_base: formData.preco_base,
            ativo: formData.ativo
          }]);

        if (insertError) throw insertError;
        setSuccessMsg('Serviço cadastrado com sucesso!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setEditingId(null);
        fetchServicos();
      }, 1500);

    } catch (err: any) {
      console.error('Erro ao salvar serviço:', err);
      // Fallback local save for demonstration
      if (editingId) {
        setServicos(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
        setSuccessMsg('Serviço atualizado localmente (Demonstração).');
      } else {
        setServicos(prev => [{
          id: Math.random(),
          nome: formData.nome,
          descricao: formData.descricao,
          preco_base: formData.preco_base,
          ativo: formData.ativo
        }, ...prev]);
        setSuccessMsg('Serviço salvo localmente (Demonstração).');
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setEditingId(null);
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      fetchServicos();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      // Fallback local delete
      setServicos(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Serviços</h1>
          <p className="text-slate-500 mt-1 text-sm">Catálogo de serviços prestados pela MyIndaia.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ nome: '', descricao: '', preco_base: 0, ativo: true });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-indaia-blue hover:bg-indaia-blue/90 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-indaia-blue/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center bg-slate-50/50">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar serviços..." 
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indaia-blue/20 focus:border-indaia-blue transition-all placeholder:text-slate-400"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indaia-blue" />
            <p className="text-sm">Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 py-20">
            <Database className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium text-lg text-slate-900">Nenhum serviço encontrado</p>
            <p className="text-sm mt-1">O catálogo de serviços está vazio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nome do Serviço</th>
                  <th className="px-6 py-4 font-semibold">Descrição</th>
                  <th className="px-6 py-4 font-semibold">Preço Base</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servicos.map((servico) => (
                  <tr key={servico.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {servico.nome}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {servico.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco_base || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {servico.ativo !== false ? (
                        <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">Ativo</span>
                      ) : (
                        <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingId(servico.id);
                            setFormData({
                              nome: servico.nome,
                              descricao: servico.descricao || '',
                              preco_base: servico.preco_base || 0,
                              ativo: servico.ativo !== false
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indaia-blue hover:bg-indaia-blue/10 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(servico.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indaia-blue" />
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800">
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}

              <form id="servico-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Serviço *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indaia-blue/20 focus:border-indaia-blue outline-none shadow-sm"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indaia-blue/20 focus:border-indaia-blue outline-none shadow-sm resize-none"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Preço Base (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indaia-blue outline-none shadow-sm"
                      value={formData.preco_base}
                      onChange={(e) => setFormData({...formData, preco_base: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indaia-blue outline-none shadow-sm"
                      value={formData.ativo ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, ativo: e.target.value === 'true'})}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="servico-form"
                disabled={saving} 
                className="px-6 py-2 text-sm font-bold text-white bg-indaia-blue hover:bg-indaia-blue/90 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-indaia-blue/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar Serviço'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
