import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { Search, Filter, Plus, Loader2, Database, MoreHorizontal, X, Save, CheckCircle2, Trash2, Package } from 'lucide-react';

type TabType = 'dados' | 'fatores' | 'estufagem' | 'documentos';

const emptyForm = {
  unidade: '01 - Indaiá Logística Internacional Ltda',
  produto: '02 - Exportação',
  cliente: '',
  cliente_codigo: '',
  importador: '',
  servico: '2 - Exportação Marítima',
  qtd_processos: 1,
  area: '',
  celula: '',
  instrucao_desembaraco: '',
  n_conhecimento: '',
  n_conhec_master: '',
  entreposto: 'NÃO',
  analista_resp: '',
  representante: '',
  local_desembarque: '',
  tipo_estufagem: '',
  conteiner: '',
  tipo_conteiner: '',
  lacre: '',
  temp_conteiner: '',
  lacre_sif: '',
  tara_conteiner: '',
  // Fatores
  moeda: 'USD',
  taxa_cambio: 0,
  peso_bruto: 0,
  peso_liquido: 0,
  valor_total: 0,
  volumes: 0,
  tipo_volume: 'Pallets',
  // Estufagem
  nr_pres_carga: '',
  dt_pres_carga: '',
  transportador_cntr_vazio: '',
  estufagem_itens: [] as EstufagemItem[],
  conteiner_itens: [] as ConteinerItem[],
};

interface ConteinerItem {
  id: string;
  tipo_estufagem: string;
  conteiner: string;
  tipo_conteiner: string;
  lacre: string;
  temp_conteiner: string;
  lacre_sif: string;
  tara_conteiner: string;
}

interface EstufagemItem {
  id: string;
  qtde: string;
  cubagem: string;
  especie: string;
  especie_siscomex: string;
  dt_ent_armazem: string;
  dt_saida_armazem: string;
  avaria: string;
  peso: string;
  saldo: string;
}

export default function Processos() {
  const { profile } = useAuth();
  const [processos, setProcessos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dados');

  const [formData, setFormData] = useState({ ...emptyForm });

  // ── Estufagem helpers ────────────────────────────────────────────────────
  const addEstufagemRow = () => {
    const newRow: EstufagemItem = {
      id: crypto.randomUUID(),
      qtde: '', cubagem: '', especie: '', especie_siscomex: '',
      dt_ent_armazem: '', dt_saida_armazem: '', avaria: '', peso: '', saldo: ''
    };
    setFormData(f => ({ ...f, estufagem_itens: [...f.estufagem_itens, newRow] }));
  };

  const updateEstufagemRow = (id: string, field: keyof EstufagemItem, value: string) => {
    setFormData(f => ({
      ...f,
      estufagem_itens: f.estufagem_itens.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const removeEstufagemRow = (id: string) => {
    setFormData(f => ({ ...f, estufagem_itens: f.estufagem_itens.filter(r => r.id !== id) }));
  };

  // ── Contêiner helpers ────────────────────────────────────────────────────
  const addConteinerRow = () => {
    const newRow: ConteinerItem = {
      id: crypto.randomUUID(),
      tipo_estufagem: '', conteiner: '', tipo_conteiner: '',
      lacre: '', temp_conteiner: '', lacre_sif: '', tara_conteiner: ''
    };
    setFormData(f => ({ ...f, conteiner_itens: [...f.conteiner_itens, newRow] }));
  };

  const updateConteinerRow = (id: string, field: keyof ConteinerItem, value: string) => {
    setFormData(f => ({
      ...f,
      conteiner_itens: f.conteiner_itens.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const removeConteinerRow = (id: string) => {
    setFormData(f => ({ ...f, conteiner_itens: f.conteiner_itens.filter(r => r.id !== id) }));
  };

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchProcessos = async () => {
    setLoading(true);
    try {
      let query = supabase.from('processos').select('*');
      if (profile?.operacao === 'importacao') query = query.ilike('produto', '%importação%');
      else if (profile?.operacao === 'exportacao') query = query.ilike('produto', '%exportação%');
      const { data, error: fetchError } = await query.order('created_at', { ascending: false }).limit(50);
      if (fetchError) throw fetchError;
      setProcessos(data || []);
    } catch {
      setProcessos([
        { id: 1, numero_processo: 'ER-001136-26', cliente: 'PRIMARY PRODUCTS INGREDIENTS', importador: 'ACME CORP USA', servico: 'Exportação Marítima', status: 'Aberto', created_at: new Date().toISOString() },
        { id: 2, numero_processo: 'ER-001137-26', cliente: 'VALE S.A.', importador: 'VALE EUROPE LTD', servico: 'Exportação Aérea', status: 'Em Andamento', created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally { setLoading(false); }
  };

  const fetchClientes = async () => {
    try {
      const { data } = await supabase.from('clientes').select('id, razao_social, apelido, codigo').order('razao_social');
      setClientes(data || []);
    } catch {}
  };

  useEffect(() => {
    fetchProcessos();
    fetchClientes();
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.client-search-container')) setShowClientSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profile]);

  const handleClientSearch = (value: string) => {
    setFormData(f => ({ ...f, cliente: value }));
    if (value.length > 1) {
      setFilteredClientes(clientes.filter(c =>
        c.razao_social?.toLowerCase().includes(value.toLowerCase()) ||
        c.apelido?.toLowerCase().includes(value.toLowerCase()) ||
        c.codigo?.toLowerCase().includes(value.toLowerCase())
      ));
      setShowClientSuggestions(true);
    } else setShowClientSuggestions(false);
  };

  const selectClient = (client: any) => {
    setFormData(f => ({ ...f, cliente: client.razao_social, cliente_codigo: client.codigo || '' }));
    setShowClientSuggestions(false);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, estufagem_itens: [] });
    setActiveTab('dados');
    setIsModalOpen(true);
  };

  const openEdit = (proc: any) => {
    setEditingId(proc.id);
    setFormData({
      ...emptyForm,
      cliente: proc.cliente || '',
      cliente_codigo: proc.cliente_codigo || '',
      importador: proc.importador || '',
      servico: proc.servico || emptyForm.servico,
      moeda: proc.moeda || 'USD',
      taxa_cambio: proc.taxa_cambio || 0,
      peso_bruto: proc.peso_bruto || 0,
      peso_liquido: proc.peso_liquido || 0,
      valor_total: proc.valor_total || 0,
      volumes: proc.volumes || 0,
      tipo_volume: proc.tipo_volume || 'Pallets',
      estufagem_itens: proc.estufagem_itens || [],
      conteiner_itens: proc.conteiner_itens || [],
      tipo_estufagem: proc.tipo_estufagem || '',
      conteiner: proc.conteiner || '',
      tipo_conteiner: proc.tipo_conteiner || '',
      lacre: proc.lacre || '',
      temp_conteiner: proc.temp_conteiner || '',
      lacre_sif: proc.lacre_sif || '',
      tara_conteiner: proc.tara_conteiner || '',
    });
    setActiveTab('dados');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const payload = {
        cliente: formData.cliente || 'Cliente Não Informado',
        cliente_codigo: formData.cliente_codigo,
        importador: formData.importador,
        servico: formData.servico,
        unidade: formData.unidade,
        produto: formData.produto,
        qtd_processos: formData.qtd_processos,
        area: formData.area, celula: formData.celula,
        instrucao_desembaraco: formData.instrucao_desembaraco,
        n_conhecimento: formData.n_conhecimento,
        n_conhec_master: formData.n_conhec_master,
        entreposto: formData.entreposto,
        analista_resp: formData.analista_resp,
        representante: formData.representante,
        local_desembarque: formData.local_desembarque,
        tipo_estufagem: formData.tipo_estufagem,
        conteiner: formData.conteiner,
        conteiner_itens: formData.conteiner_itens,
        moeda: formData.moeda,
        taxa_cambio: formData.taxa_cambio,
        peso_bruto: formData.peso_bruto,
        peso_liquido: formData.peso_liquido,
        valor_total: formData.valor_total,
        volumes: formData.volumes,
        tipo_volume: formData.tipo_volume,
      };
      if (editingId) {
        const { error: e } = await supabase.from('processos').update(payload).eq('id', editingId);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('processos').insert([{
          ...payload,
          numero_processo: `ER-${String(Math.floor(Math.random() * 99999)).padStart(6,'0')}-${new Date().getFullYear().toString().slice(2)}`,
          status: 'Aberto',
        }]);
        if (e) throw e;
      }
      setSuccessMsg(editingId ? 'Processo atualizado!' : 'Processo aberto com sucesso!');
      setTimeout(() => { setIsModalOpen(false); setSuccessMsg(''); setEditingId(null); fetchProcessos(); }, 1400);
    } catch {
      // local fallback
      if (editingId) {
        setProcessos(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
      } else {
        setProcessos(prev => [{
          id: Math.random(),
          numero_processo: `ER-${String(Math.floor(Math.random() * 99999)).padStart(6,'0')}-26`,
          ...formData,
          status: 'Aberto',
          created_at: new Date().toISOString()
        }, ...prev]);
      }
      setSuccessMsg('Salvo localmente (demonstração).');
      setTimeout(() => { setIsModalOpen(false); setSuccessMsg(''); setEditingId(null); }, 1400);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este processo?')) return;
    try {
      const { error: e } = await supabase.from('processos').delete().eq('id', id);
      if (e) throw e;
      fetchProcessos();
    } catch { setProcessos(prev => prev.filter(p => p.id !== id)); }
  };

  const statusColor = (s: string) => {
    if (!s) return 'bg-slate-100 text-slate-500';
    const l = s.toLowerCase();
    if (l.includes('aberto')) return 'bg-blue-50 text-blue-600';
    if (l.includes('andamento')) return 'bg-amber-50 text-amber-600';
    if (l.includes('conclu') || l.includes('encerr')) return 'bg-emerald-50 text-emerald-600';
    return 'bg-slate-100 text-slate-500';
  };

  const fieldCls = "w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-indaia-blue focus:border-indaia-blue outline-none transition-all placeholder:text-slate-300";
  const labelCls = "block text-[10px] font-600 text-slate-500 uppercase tracking-wider mb-1";

  const tabs: { key: TabType; label: string }[] = [
    { key: 'dados', label: 'Dados' },
    { key: 'fatores', label: 'Fatores' },
    { key: 'estufagem', label: 'Estufagem' },
    { key: 'documentos', label: 'Documentos' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-500 text-slate-800">Processos</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gerenciamento de processos de comércio exterior.</p>
        </div>
        <button onClick={openNew} className="w-full sm:w-auto bg-indaia-navy hover:bg-indaia-purple text-white px-4 py-2 rounded-xl font-500 flex items-center justify-center gap-2 transition-all text-sm">
          <Plus className="w-4 h-4" />Novo Processo
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[420px]">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar processos..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 placeholder:text-slate-300 text-slate-700 outline-none focus:border-indaia-blue" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm transition-colors">
            <Filter className="w-3.5 h-3.5" />Filtros
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indaia-blue/50" />
            <p className="text-sm text-slate-400">Carregando...</p>
          </div>
        ) : processos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Database className="w-10 h-10 text-slate-200" />
            <p className="text-sm text-slate-400">Nenhum processo encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Nº Processo</th>
                  <th className="px-5 py-3 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Exportador</th>
                  <th className="px-5 py-3 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Importador</th>
                  <th className="px-5 py-3 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Serviço</th>
                  <th className="px-5 py-3 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3 text-right text-[10px] font-600 text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {processos.map((proc, i) => (
                  <tr key={proc.id || i} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5 text-xs font-600 text-indaia-navy">{proc.numero_processo || `PRC-${proc.id}`}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{proc.cliente || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{proc.importador || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{proc.servico || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("status-badge text-[10px] font-600 uppercase tracking-wide", statusColor(proc.status || 'Aberto'))}>
                        {proc.status || 'Aberto'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{proc.created_at ? new Date(proc.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(proc)} className="p-1.5 rounded-lg text-slate-400 hover:text-indaia-blue hover:bg-indaia-blue/8 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(proc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[98vw] h-[95vh] overflow-hidden flex flex-col animate-scale-in">

            {/* Modal header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indaia-blue/10 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-indaia-blue" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-500 uppercase tracking-wider leading-none">Manutenção Geral</p>
                  <p className="text-sm font-600 text-slate-800 leading-tight">
                    {editingId ? 'Editar Processo' : 'Novo Processo'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-indaia-navy hover:bg-indaia-purple text-white text-xs font-600 rounded-lg transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salvar
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-4">

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-emerald-700 text-xs font-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {successMsg}
                </div>
              )}

              {/* Top fields */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-5">
                  <label className={labelCls}>Unidade</label>
                  <div className="flex gap-2">
                    <input value="01" readOnly className={cn(fieldCls, "w-12 bg-slate-50 text-slate-400")} />
                    <input value="Indaiá Logística Internacional Ltda" readOnly className={cn(fieldCls, "flex-1 bg-slate-50 text-slate-400")} />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className={labelCls}>Produto</label>
                  <div className="flex gap-2">
                    <input value="02" readOnly className={cn(fieldCls, "w-12 bg-slate-50 text-slate-400")} />
                    <select value={formData.produto} onChange={e => setFormData(f => ({ ...f, produto: e.target.value }))} className={cn(fieldCls, "flex-1")}>
                      <option>Exportação</option>
                      <option>Importação</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className={labelCls}>Nº Processo</label>
                  <input disabled className={cn(fieldCls, "bg-slate-50 text-slate-400")} placeholder="Gerado ao salvar" />
                </div>

                {/* Exportador (Cliente) */}
                <div className="col-span-12 md:col-span-6">
                  <label className={labelCls}>Exportador (Cliente)</label>
                  <div className="flex gap-2 relative client-search-container">
                    <input type="text" placeholder="Cód" className={cn(fieldCls, "w-16")} value={formData.cliente_codigo}
                      onChange={e => setFormData(f => ({ ...f, cliente_codigo: e.target.value }))} />
                    <div className="flex-1 relative">
                      <input type="text" placeholder="Nome do exportador..." className={cn(fieldCls, "w-full")}
                        value={formData.cliente} onChange={e => handleClientSearch(e.target.value)}
                        onFocus={() => formData.cliente.length > 1 && setShowClientSuggestions(true)} />
                      {showClientSuggestions && filteredClientes.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] max-h-48 overflow-y-auto">
                          {filteredClientes.map(c => (
                            <button key={c.id} type="button" onClick={() => selectClient(c)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                              <div className="text-xs font-600 text-slate-800">{c.razao_social}</div>
                              <div className="text-[10px] text-slate-400 flex justify-between mt-0.5">
                                <span>{c.apelido || '—'}</span>
                                <span className="font-mono">{c.codigo || '—'}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Importador */}
                <div className="col-span-12 md:col-span-6">
                  <label className={labelCls}>Importador</label>
                  <input type="text" placeholder="Nome do importador no exterior..."
                    value={formData.importador}
                    onChange={e => setFormData(f => ({ ...f, importador: e.target.value }))}
                    className={fieldCls} />
                </div>

                <div className="col-span-12 md:col-span-8">
                  <label className={labelCls}>Serviço</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Cód" className={cn(fieldCls, "w-12")} />
                    <select value={formData.servico} onChange={e => setFormData(f => ({ ...f, servico: e.target.value }))} className={cn(fieldCls, "flex-1")}>
                      <option>Exportação Marítima</option>
                      <option>Exportação Aérea</option>
                      <option>Exportação Rodoviária</option>
                      <option>Faturamento</option>
                      <option>Processo Administrativo</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className={labelCls}>Qtd. Processos a abrir</label>
                  <input type="number" value={formData.qtd_processos} min={1}
                    onChange={e => setFormData(f => ({ ...f, qtd_processos: parseInt(e.target.value) }))}
                    className={cn(fieldCls, "text-center font-600")} />
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                  {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={cn(
                        "px-5 py-3 text-xs font-600 transition-all border-b-2 -mb-px",
                        activeTab === t.key
                          ? "border-indaia-blue text-indaia-blue bg-indaia-blue/3"
                          : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* ── ABA DADOS ── */}
                  {activeTab === 'dados' && (
                    <div className="grid grid-cols-12 gap-5 animate-fade-in">
                      <div className="col-span-12 md:col-span-7 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelCls}>Área</label><input value={formData.area} onChange={e => setFormData(f=>({...f,area:e.target.value}))} className={fieldCls} /></div>
                          <div><label className={labelCls}>Célula</label><input value={formData.celula} onChange={e => setFormData(f=>({...f,celula:e.target.value}))} className={fieldCls} /></div>
                        </div>
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-5"><label className={labelCls}>Nº Conhecimento</label><input value={formData.n_conhecimento} onChange={e => setFormData(f=>({...f,n_conhecimento:e.target.value}))} className={fieldCls} /></div>
                          <div className="col-span-5"><label className={labelCls}>Nº Conhec. Master</label><input value={formData.n_conhec_master} onChange={e => setFormData(f=>({...f,n_conhec_master:e.target.value}))} className={fieldCls} /></div>
                          <div className="col-span-2"><label className={labelCls}>Entreposto</label>
                            <select value={formData.entreposto} onChange={e => setFormData(f=>({...f,entreposto:e.target.value}))} className={fieldCls}>
                              <option>NÃO</option><option>SIM</option>
                            </select>
                          </div>
                        </div>
                        <div><label className={labelCls}>Analista Resp. Comissária</label><input value={formData.analista_resp} onChange={e => setFormData(f=>({...f,analista_resp:e.target.value}))} className={fieldCls} /></div>
                        <div><label className={labelCls}>Representante</label><input value={formData.representante} onChange={e => setFormData(f=>({...f,representante:e.target.value}))} className={fieldCls} /></div>
                        <div><label className={labelCls}>Local de Desembarque</label><input value={formData.local_desembarque} onChange={e => setFormData(f=>({...f,local_desembarque:e.target.value}))} className={fieldCls} /></div>
                      </div>
                      <div className="col-span-12 md:col-span-5 space-y-3">
                        <div><label className={labelCls}>Instrução de Desembaraço</label><input value={formData.instrucao_desembaraco} onChange={e => setFormData(f=>({...f,instrucao_desembaraco:e.target.value}))} className={fieldCls} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-slate-200 rounded-lg overflow-hidden h-28 bg-white flex flex-col">
                            <div className="bg-slate-700 text-white text-[9px] font-700 px-2 py-1 flex justify-between uppercase tracking-wider"><span>Pedido</span><span>Item</span></div>
                            <div className="p-1.5 flex-1"><div className="bg-indaia-blue/20 h-3.5 w-full rounded" /></div>
                          </div>
                          <div className="border border-slate-200 rounded-lg overflow-hidden h-28 bg-white flex flex-col">
                            <div className="bg-slate-700 text-white text-[9px] font-700 px-2 py-1 uppercase tracking-wider">Nº LI</div>
                            <div className="p-1.5 flex-1"><div className="bg-indaia-blue/20 h-3.5 w-full rounded" /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── ABA FATORES ── */}
                  {activeTab === 'fatores' && (
                    <div className="grid grid-cols-12 gap-5 animate-fade-in">
                      <div className="col-span-12 md:col-span-6 space-y-4">
                        <div>
                          <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Informações Financeiras</p>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className={labelCls}>Moeda</label>
                                <select value={formData.moeda} onChange={e=>setFormData(f=>({...f,moeda:e.target.value}))} className={fieldCls}>
                                  <option value="USD">USD - Dólar</option>
                                  <option value="EUR">EUR - Euro</option>
                                  <option value="BRL">BRL - Real</option>
                                  <option value="GBP">GBP - Libra</option>
                                </select>
                              </div>
                              <div><label className={labelCls}>Taxa de Câmbio</label><input type="number" step="0.0001" value={formData.taxa_cambio} onChange={e=>setFormData(f=>({...f,taxa_cambio:parseFloat(e.target.value)}))} className={fieldCls} /></div>
                            </div>
                            <div><label className={labelCls}>Valor Total da Fatura</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-700">{formData.moeda}</span>
                                <input type="number" step="0.01" value={formData.valor_total} onChange={e=>setFormData(f=>({...f,valor_total:parseFloat(e.target.value)}))} className={cn(fieldCls,"pl-12 font-600")} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6 space-y-4">
                        <div>
                          <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Pesos e Volumes</p>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className={labelCls}>Peso Bruto (KG)</label><input type="number" step="0.001" value={formData.peso_bruto} onChange={e=>setFormData(f=>({...f,peso_bruto:parseFloat(e.target.value)}))} className={fieldCls} /></div>
                              <div><label className={labelCls}>Peso Líquido (KG)</label><input type="number" step="0.001" value={formData.peso_liquido} onChange={e=>setFormData(f=>({...f,peso_liquido:parseFloat(e.target.value)}))} className={fieldCls} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className={labelCls}>Qtd. Volumes</label><input type="number" value={formData.volumes} onChange={e=>setFormData(f=>({...f,volumes:parseInt(e.target.value)}))} className={fieldCls} /></div>
                              <div><label className={labelCls}>Tipo de Volume</label>
                                <select value={formData.tipo_volume} onChange={e=>setFormData(f=>({...f,tipo_volume:e.target.value}))} className={fieldCls}>
                                  <option>Pallets</option><option>Caixas</option><option>Tambores</option><option>Unidades</option><option>Containers</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── ABA ESTUFAGEM ── */}
                  {activeTab === 'estufagem' && (
                    <div className="space-y-4 animate-fade-in">

                      {/* Header do bloco */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider">Estufagem &amp; Dados dos Contêineres</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Adicione um registro por contêiner</p>
                        </div>
                        <button type="button" onClick={addConteinerRow}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-indaia-blue bg-indaia-blue/8 hover:bg-indaia-blue/15 rounded-lg transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          Adicionar Contêiner
                        </button>
                      </div>

                      {/* Lista de contêineres */}
                      {formData.conteiner_itens.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <Package className="w-8 h-8 text-slate-200 mb-2" />
                          <p className="text-xs text-slate-400">Nenhum contêiner adicionado.</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Clique em "Adicionar Contêiner" para começar.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.conteiner_itens.map((row, idx) => (
                            <div key={row.id} className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 relative">
                              {/* Número do contêiner */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-700 text-slate-400 uppercase tracking-wider">
                                  Contêiner #{idx + 1}
                                </span>
                                {formData.conteiner_itens.length > 1 && (
                                  <button type="button" onClick={() => removeConteinerRow(row.id)}
                                    className="p-1 rounded text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              {/* Linha 1: Tipo Estufagem · Contêiner · Tipo · Lacre */}
                              <div className="grid grid-cols-6 gap-3">
                                <div className="col-span-1">
                                  <label className={labelCls}>Tipo Estufagem</label>
                                  <select value={row.tipo_estufagem} onChange={e => updateConteinerRow(row.id, 'tipo_estufagem', e.target.value)} className={fieldCls}>
                                    <option value="">—</option><option>FCL</option><option>LCL</option>
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <label className={labelCls}>Contêiner</label>
                                  <input value={row.conteiner} onChange={e => updateConteinerRow(row.id, 'conteiner', e.target.value)} placeholder="TCKU-000-000-0" className={fieldCls} />
                                </div>
                                <div className="col-span-1">
                                  <label className={labelCls}>Tipo</label>
                                  <select value={row.tipo_conteiner} onChange={e => updateConteinerRow(row.id, 'tipo_conteiner', e.target.value)} className={fieldCls}>
                                    <option value="">—</option>
                                    <option>20GP</option><option>40GP</option><option>40HC</option>
                                    <option>20RF</option><option>40RF</option><option>45HC</option>
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <label className={labelCls}>Lacre</label>
                                  <input value={row.lacre} onChange={e => updateConteinerRow(row.id, 'lacre', e.target.value)} placeholder="S0000000" className={fieldCls} />
                                </div>
                              </div>
                              {/* Linha 2: Temp · Lacre SIF · Tara */}
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className={labelCls}>Temp.</label>
                                  <input value={row.temp_conteiner} onChange={e => updateConteinerRow(row.id, 'temp_conteiner', e.target.value)} placeholder="ex: -18°C" className={fieldCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Lacre SIF</label>
                                  <input value={row.lacre_sif} onChange={e => updateConteinerRow(row.id, 'lacre_sif', e.target.value)} placeholder="Lacre SIF" className={fieldCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>Tara do Contêiner</label>
                                  <input value={row.tara_conteiner} onChange={e => updateConteinerRow(row.id, 'tara_conteiner', e.target.value)} placeholder="ex: 3800" className={fieldCls} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ABA DOCUMENTOS ── */}
                  {activeTab === 'documentos' && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider">Documentos do Processo</p>
                            <p className="text-[10px] text-slate-300 mt-0.5">Anexe os documentos relacionados a este processo</p>
                          </div>
                          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-indaia-blue bg-indaia-blue/8 hover:bg-indaia-blue/15 rounded-lg transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                            Anexar Documento
                            <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
                          </label>
                        </div>

                        {/* Categorias de documentos */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {[
                            { label: 'Invoice / Fatura Comercial' },
                            { label: 'Packing List' },
                            { label: 'Conhecimento de Embarque (BL/AWB)' },
                            { label: 'Certificado de Origem' },
                            { label: 'DUE / DI' },
                            { label: 'Licença de Importação (LI)' },
                            { label: 'Certificado Sanitário / SIF' },
                            { label: 'Outros' },
                          ].map(cat => (
                            <div key={cat.label} className="border border-dashed border-slate-200 rounded-lg p-3 flex items-center justify-between group hover:border-indaia-blue/40 hover:bg-indaia-blue/5 transition-all cursor-pointer">
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded bg-slate-100 group-hover:bg-indaia-blue/10 flex items-center justify-center transition-colors flex-shrink-0">
                                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indaia-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="text-[11px] text-slate-500 font-500">{cat.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-300 group-hover:text-indaia-blue transition-colors">+ Anexar</span>
                            </div>
                          ))}
                        </div>

                        {/* Lista vazia */}
                        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-slate-400">Nenhum documento anexado ainda.</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Clique em uma categoria ou em "Anexar Documento" para começar.</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 text-xs font-600 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
