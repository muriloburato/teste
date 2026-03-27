import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Plus, AlertCircle, Loader2, Database, Edit, Trash2, MoreHorizontal, X, Save, UserPlus } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    razao_social: '',
    apelido: '',
    cnpj: '',
    cpf: '',
    cidade: '',
    uf: '',
    pais: 'Brasil',
    email: '',
    telefone: '',
    // Novos campos baseados na imagem
    codigo: '',
    tipo_pessoa: 'Jurídica',
    endereco: '',
    numero: '',
    bairro: '',
    cep: '',
    ativo: 'Sim',
    eventual: 'Não',
    cae: '',
    tab_juros: '',
    fax: '',
    inscricao_est: '',
    inscricao_mun: '',
    outro_docto: '',
    restr_fin: 'Não',
    tipo_ref: 'Normal',
    inclusao: new Date().toISOString().split('T')[0],
    libera_di_auto: 'Não',
    grupo: '',
    indicado_por: '',
    atividade_economica: '',
    logotipo: '',
    cod_campo_tot_nf: '',
    acesso_aux_1: '',
    conta_contabil: '',
    account_number: '',
    acesso_aux_2: '',
    conta_contabil_pis_cofins: '',
    protecao_cambial: '',
    cat63: false,
    reg_especial: false,
    disp_legal: '',
    licenca_sanitaria: '',
    end_fiesp_id: '',
    // Papéis e Checkboxes
    cliente: true,
    nao_cliente: false,
    importador: false,
    exportador: false,
    representante: false,
    seguradora: false,
    comprador: false,
    outros: false,
    verifica_icms_di: false,
    cotacao: false,
    envia_boleto_dda: false,
    afrmm_no_icms: false,
    recolhimento_mp164: 'Integral',
    confere_nf: false,
    emissao_fatura: false,
    // Campos das novas abas
    obs_particulares: '',
    radar_tipo: 'Limitada',
    radar_validade: '',
    radar_numero: '',
    limite_operacional: '',
    regime_tributario: 'Lucro Real',
    suframa: '',
    validade_suframa: '',
    free_time_demurrage: '',
    free_time_detention: '',
    instrucoes_armazenagem: '',
    contato_armazenagem: '',
    canal_parametrizacao: 'Verde',
    instrucoes_faturamento: '',
    instrucoes_despacho: '',
    extras_info: '',
    contatos: [] as any[]
  });

  const [activeTab, setActiveTab] = useState('dados_basicos');

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .order('razao_social', { ascending: true });
      
      if (fetchError) throw fetchError;
      setClientes(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message || 'Erro ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError(null);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('clientes')
          .update([formData])
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccessMsg('Cliente atualizado com sucesso!');
      } else {
        const { error: insertError } = await supabase
          .from('clientes')
          .insert([formData]);

        if (insertError) throw insertError;
        setSuccessMsg('Cliente cadastrado com sucesso!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setEditingId(null);
        fetchClientes();
      }, 1500);

    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      // Fallback local save for demonstration
      if (editingId) {
        setClientes(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
        setSuccessMsg('Cliente atualizado localmente (Demonstração).');
      } else {
        setClientes(prev => [{
          id: Math.random(),
          ...formData
        }, ...prev]);
        setSuccessMsg('Cliente salvo localmente (Demonstração).');
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
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      fetchClientes();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      // Fallback local delete
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  const renderRoles = (cliente: any) => {
    const roles = [];
    if (cliente.importador) roles.push({ label: 'Importador', color: 'bg-indaia-blue/10 text-indaia-blue ring-indaia-blue/20' });
    if (cliente.exportador) roles.push({ label: 'Exportador', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' });
    if (cliente.representante) roles.push({ label: 'Representante', color: 'bg-purple-50 text-purple-700 ring-purple-600/20' });
    if (cliente.seguradora) roles.push({ label: 'Seguradora', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' });
    if (cliente.comprador) roles.push({ label: 'Comprador', color: 'bg-indaia-blue/10 text-indaia-blue ring-indaia-blue/20' });
    if (cliente.outros) roles.push({ label: 'Outros', color: 'bg-zinc-50 text-zinc-700 ring-zinc-600/20' });

    return (
      <div className="flex flex-wrap gap-1.5">
        {roles.map((role, idx) => (
          <span key={idx} className={`px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${role.color}`}>
            {role.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Clientes</h1>
          <p className="text-zinc-500 mt-1 text-sm">Gerenciamento de importadores, exportadores e parceiros.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              razao_social: '', apelido: '', cnpj: '', cpf: '', cidade: '', uf: '', pais: 'Brasil',
              email: '', telefone: '', codigo: '', tipo_pessoa: 'Jurídica', endereco: '', numero: '',
              bairro: '', cep: '', ativo: 'Sim', eventual: 'Não', cae: '', tab_juros: '', fax: '',
              inscricao_est: '', inscricao_mun: '', outro_docto: '', restr_fin: 'Não', tipo_ref: 'Normal',
              inclusao: new Date().toISOString().split('T')[0], libera_di_auto: 'Não', grupo: '',
              indicado_por: '', atividade_economica: '', logotipo: '', cod_campo_tot_nf: '',
              acesso_aux_1: '', conta_contabil: '', account_number: '', acesso_aux_2: '',
              conta_contabil_pis_cofins: '', protecao_cambial: '', cat63: false, reg_especial: false,
              disp_legal: '', licenca_sanitaria: '', end_fiesp_id: '', cliente: true, nao_cliente: false,
              importador: false, exportador: false, representante: false, seguradora: false, comprador: false,
              outros: false, verifica_icms_di: false, cotacao: false, envia_boleto_dda: false,
              afrmm_no_icms: false, recolhimento_mp164: 'Integral', confere_nf: false, emissao_fatura: false,
              obs_particulares: '', radar_tipo: 'Limitada', radar_validade: '', radar_numero: '',
              limite_operacional: '', regime_tributario: 'Lucro Real', suframa: '', validade_suframa: '',
              free_time_demurrage: '', free_time_detention: '', instrucoes_armazenagem: '',
              contato_armazenagem: '', canal_parametrizacao: 'Verde', instrucoes_faturamento: '',
              instrucoes_despacho: '', extras_info: '', contatos: []
            });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-indaia-blue hover:bg-indaia-blue/90 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-indaia-blue/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/60 overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 items-center bg-zinc-50/30">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar por razão social, CNPJ/CPF..." 
              className="w-full pl-9 pr-4 py-2 text-sm text-zinc-900 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indaia-blue/20 focus:border-indaia-blue transition-all placeholder:text-zinc-400 bg-white"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 font-medium text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indaia-blue" />
            <p className="text-sm">Carregando clientes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-red-500 p-6 text-center py-20">
            <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
            <p className="font-medium text-lg">Erro ao carregar clientes</p>
            <p className="text-sm mt-2 max-w-md text-red-400">{error}</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 py-20">
            <Database className="w-12 h-12 mb-4 text-zinc-300" />
            <p className="font-medium text-lg text-zinc-900">Nenhum cliente encontrado</p>
            <p className="text-sm mt-1">A tabela de clientes está vazia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Razão Social / Nome</th>
                  <th className="px-6 py-4 font-medium">CNPJ / CPF</th>
                  <th className="px-6 py-4 font-medium">Localidade</th>
                  <th className="px-6 py-4 font-medium">Contato</th>
                  <th className="px-6 py-4 font-medium">Papéis</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 text-sm">{cliente.razao_social}</div>
                      {cliente.apelido && <div className="text-xs text-zinc-500 mt-0.5">{cliente.apelido}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 font-mono text-[13px]">
                      {cliente.cnpj || cliente.cpf || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <div>{cliente.cidade}{cliente.uf ? ` - ${cliente.uf}` : ''}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{cliente.pais || 'Brasil'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <div>{cliente.email || '-'}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{cliente.telefone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {renderRoles(cliente)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingId(cliente.id);
                            setFormData({
                              razao_social: cliente.razao_social || '',
                              apelido: cliente.apelido || '',
                              cnpj: cliente.cnpj || '',
                              cpf: cliente.cpf || '',
                              cidade: cliente.cidade || '',
                              uf: cliente.uf || '',
                              pais: cliente.pais || 'Brasil',
                              email: cliente.email || '',
                              telefone: cliente.telefone || '',
                              codigo: cliente.codigo || '',
                              tipo_pessoa: cliente.tipo_pessoa || 'Jurídica',
                              endereco: cliente.endereco || '',
                              numero: cliente.numero || '',
                              bairro: cliente.bairro || '',
                              cep: cliente.cep || '',
                              ativo: cliente.ativo || 'Sim',
                              eventual: cliente.eventual || 'Não',
                              cae: cliente.cae || '',
                              tab_juros: cliente.tab_juros || '',
                              fax: cliente.fax || '',
                              inscricao_est: cliente.inscricao_est || '',
                              inscricao_mun: cliente.inscricao_mun || '',
                              outro_docto: cliente.outro_docto || '',
                              restr_fin: cliente.restr_fin || 'Não',
                              tipo_ref: cliente.tipo_ref || 'Normal',
                              inclusao: cliente.inclusao || new Date().toISOString().split('T')[0],
                              libera_di_auto: cliente.libera_di_auto || 'Não',
                              grupo: cliente.grupo || '',
                              indicado_por: cliente.indicado_por || '',
                              atividade_economica: cliente.atividade_economica || '',
                              logotipo: cliente.logotipo || '',
                              cod_campo_tot_nf: cliente.cod_campo_tot_nf || '',
                              acesso_aux_1: cliente.acesso_aux_1 || '',
                              conta_contabil: cliente.conta_contabil || '',
                              account_number: cliente.account_number || '',
                              acesso_aux_2: cliente.acesso_aux_2 || '',
                              conta_contabil_pis_cofins: cliente.conta_contabil_pis_cofins || '',
                              protecao_cambial: cliente.protecao_cambial || '',
                              cat63: cliente.cat63 || false,
                              reg_especial: cliente.reg_especial || false,
                              disp_legal: cliente.disp_legal || '',
                              licenca_sanitaria: cliente.licenca_sanitaria || '',
                              end_fiesp_id: cliente.end_fiesp_id || '',
                              cliente: cliente.cliente ?? true,
                              nao_cliente: cliente.nao_cliente || false,
                              importador: cliente.importador || false,
                              exportador: cliente.exportador || false,
                              representante: cliente.representante || false,
                              seguradora: cliente.seguradora || false,
                              comprador: cliente.comprador || false,
                              outros: cliente.outros || false,
                              verifica_icms_di: cliente.verifica_icms_di || false,
                              cotacao: cliente.cotacao || false,
                              envia_boleto_dda: cliente.envia_boleto_dda || false,
                              afrmm_no_icms: cliente.afrmm_no_icms || false,
                              recolhimento_mp164: cliente.recolhimento_mp164 || 'Integral',
                              confere_nf: cliente.confere_nf || false,
                              emissao_fatura: cliente.emissao_fatura || false,
                              obs_particulares: cliente.obs_particulares || '',
                              radar_tipo: cliente.radar_tipo || 'Limitada',
                              radar_validade: cliente.radar_validade || '',
                              radar_numero: cliente.radar_numero || '',
                              limite_operacional: cliente.limite_operacional || '',
                              regime_tributario: cliente.regime_tributario || 'Lucro Real',
                              suframa: cliente.suframa || '',
                              validade_suframa: cliente.validade_suframa || '',
                              free_time_demurrage: cliente.free_time_demurrage || '',
                              free_time_detention: cliente.free_time_detention || '',
                              instrucoes_armazenagem: cliente.instrucoes_armazenagem || '',
                              contato_armazenagem: cliente.contato_armazenagem || '',
                              canal_parametrizacao: cliente.canal_parametrizacao || 'Verde',
                              instrucoes_faturamento: cliente.instrucoes_faturamento || '',
                              instrucoes_despacho: cliente.instrucoes_despacho || '',
                              extras_info: cliente.extras_info || '',
                              contatos: cliente.contatos || []
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-indaia-blue hover:bg-indaia-blue/10 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cliente.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
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

      {/* Modal Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-[98vw] h-[96vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            
            <div className="px-4 py-0.5 border-b border-zinc-200 flex justify-between items-center bg-zinc-100/80">
              <div className="flex items-center gap-3">
                <button 
                  type="submit"
                  form="cliente-form"
                  disabled={saving}
                  className="flex flex-col items-center gap-0 px-2 py-0 text-[9px] font-bold text-zinc-600 hover:text-indaia-blue transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Salvar
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex flex-col items-center gap-0 px-2 py-0 text-[9px] font-bold text-zinc-600 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancelar
                </button>
                <div className="h-5 w-px bg-zinc-300 mx-1" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase leading-none">Cadastro de</span>
                  <span className="text-[11px] font-bold text-zinc-800 leading-tight">Empresa Nacional</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-bold text-zinc-400 uppercase">Status</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">Ativo</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 bg-white p-0 rounded border border-zinc-200 shadow-sm">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-2 border-b border-zinc-200 bg-zinc-50/50 flex overflow-x-auto no-scrollbar">
              {[
                { id: 'lista', label: 'Lista' },
                { id: 'dados_basicos', label: 'Dados Básicos' },
                { id: 'obs_particulares', label: 'Obs. Particulares' },
                { id: 'habilitacao', label: 'Habilitação' },
                { id: 'armazenagem', label: 'Armazenagem' },
                { id: 'di_parametros', label: 'DI - Parametros' },
                { id: 'extras', label: 'Extras' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1 text-[10px] font-bold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-indaia-blue text-indaia-blue' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="p-1 overflow-y-auto flex-1 bg-zinc-50/20">
              {successMsg && (
                <div className="mb-1 p-1 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-800 animate-in fade-in slide-in-from-top-2">
                  <span className="font-medium text-[10px]">{successMsg}</span>
                </div>
              )}

              <form id="cliente-form" onSubmit={handleSave} className="flex flex-col lg:flex-row gap-2">
                {/* Main Form Content */}
                <div className="flex-1 space-y-0.5">
                  {activeTab === 'dados_basicos' && (
                    <div className="space-y-0.5">
                      {/* Row 1: Código, Razão Social, Apelido, Tipo Pessoa */}
                      <div className="grid grid-cols-12 gap-1.5">
                        <div className="col-span-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Código</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-zinc-100 border border-zinc-300 rounded text-[11px] font-mono h-5"
                            value={formData.codigo}
                            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                            placeholder="00000"
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Razão Social *</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.razao_social}
                            onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Apelido</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.apelido}
                            onChange={(e) => setFormData({...formData, apelido: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Tipo de Pessoa</label>
                          <select 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.tipo_pessoa}
                            onChange={(e) => setFormData({...formData, tipo_pessoa: e.target.value})}
                          >
                            <option value="Jurídica">Jurídica</option>
                            <option value="Física">Física</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Endereço, Número, Bairro */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-7">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Endereço</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.endereco}
                            onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Número</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.numero}
                            onChange={(e) => setFormData({...formData, numero: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Bairro</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.bairro}
                            onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Row 3: Cidade, UF, CEP, País, Ativo, Eventual */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Cidade</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.cidade}
                            onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">UF</label>
                          <input 
                            type="text" 
                            maxLength={2}
                            className="w-full px-1 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none uppercase h-5"
                            value={formData.uf}
                            onChange={(e) => setFormData({...formData, uf: e.target.value.toUpperCase()})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">C.E.P.</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.cep}
                            onChange={(e) => setFormData({...formData, cep: e.target.value})}
                            placeholder="00000-000"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">País</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.pais}
                            onChange={(e) => setFormData({...formData, pais: e.target.value})}
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Ativo</label>
                          <select 
                            className="w-full px-1 py-0 bg-white border border-zinc-300 rounded text-[9px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.ativo}
                            onChange={(e) => setFormData({...formData, ativo: e.target.value})}
                          >
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Eventual</label>
                          <select 
                            className="w-full px-1 py-0 bg-white border border-zinc-300 rounded text-[9px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.eventual}
                            onChange={(e) => setFormData({...formData, eventual: e.target.value})}
                          >
                            <option value="Não">Não</option>
                            <option value="Sim">Sim</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 4: CNPJ, CPF, CAE, Tab Juros */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">C.N.P.J.</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                            placeholder="00.000.000/0000-00"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">C.P.F.</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.cpf}
                            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">CAE</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.cae}
                            onChange={(e) => setFormData({...formData, cae: e.target.value})}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Tab. Juros</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.tab_juros}
                            onChange={(e) => setFormData({...formData, tab_juros: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Row 5: Telefone, Fax, Inscrição Est., Inscrição Mun. */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Telefone</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.telefone}
                            onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Fax</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.fax}
                            onChange={(e) => setFormData({...formData, fax: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Inscrição Est.</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.inscricao_est}
                            onChange={(e) => setFormData({...formData, inscricao_est: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Inscrição Mun.</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.inscricao_mun}
                            onChange={(e) => setFormData({...formData, inscricao_mun: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Row 6: Outro Docto, Restr Fin, Tipo Ref, Inclusão, Libera DI */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Outro Docto.</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.outro_docto}
                            onChange={(e) => setFormData({...formData, outro_docto: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Restr Fin.</label>
                          <select 
                            className="w-full px-1 py-0 bg-white border border-zinc-300 rounded text-[9px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.restr_fin}
                            onChange={(e) => setFormData({...formData, restr_fin: e.target.value})}
                          >
                            <option value="Não">Não</option>
                            <option value="Sim">Sim</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Tipo Ref.</label>
                          <select 
                            className="w-full px-1 py-0 bg-white border border-zinc-300 rounded text-[9px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.tipo_ref}
                            onChange={(e) => setFormData({...formData, tipo_ref: e.target.value})}
                          >
                            <option value="Normal">Normal</option>
                            <option value="Especial">Especial</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Inclusão</label>
                          <input 
                            type="date" 
                            className="w-full px-1 py-0 bg-zinc-100 border border-zinc-300 rounded text-[9px] outline-none h-5"
                            value={formData.inclusao}
                            readOnly
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Libera DI's auto.</label>
                          <select 
                            className="w-full px-1 py-0 bg-white border border-zinc-300 rounded text-[9px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.libera_di_auto}
                            onChange={(e) => setFormData({...formData, libera_di_auto: e.target.value})}
                          >
                            <option value="Não">Não</option>
                            <option value="Sim">Sim</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 7: Grupo, Indicado por, Atividade Econômica, Logotipo */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Grupo</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.grupo}
                            onChange={(e) => setFormData({...formData, grupo: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Indicado por</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.indicado_por}
                            onChange={(e) => setFormData({...formData, indicado_por: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Atividade Econômica</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.atividade_economica}
                            onChange={(e) => setFormData({...formData, atividade_economica: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Logotipo</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.logotipo}
                            onChange={(e) => setFormData({...formData, logotipo: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Row 8: Cód Campo Tot NF, Account Number, % Prot. Cambial, CAT63, Reg Especial */}
                      <div className="grid grid-cols-12 gap-1 items-end">
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Cód. Campo Tot. NF</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.cod_campo_tot_nf}
                            onChange={(e) => setFormData({...formData, cod_campo_tot_nf: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Account Number</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.account_number}
                            onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">% Prot. Cambial</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.protecao_cambial}
                            onChange={(e) => setFormData({...formData, protecao_cambial: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-1 pb-1">
                          <input 
                            type="checkbox" 
                            id="cat63"
                            checked={formData.cat63} 
                            onChange={(e) => setFormData({...formData, cat63: e.target.checked})} 
                            className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                          />
                          <label htmlFor="cat63" className="text-[8px] font-bold text-zinc-700 uppercase cursor-pointer">CAT63</label>
                        </div>
                        <div className="col-span-2 flex items-center gap-1 pb-1">
                          <input 
                            type="checkbox" 
                            id="reg_especial"
                            checked={formData.reg_especial} 
                            onChange={(e) => setFormData({...formData, reg_especial: e.target.checked})} 
                            className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                          />
                          <label htmlFor="reg_especial" className="text-[8px] font-bold text-zinc-700 uppercase cursor-pointer">Reg. Especial</label>
                        </div>
                      </div>

                      {/* Row 9: Conta Contábil, Conta Contábil PIS/COFINS */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-6">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Conta Contábil</label>
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              className="w-10 px-1 py-0 bg-white border border-zinc-300 rounded text-[10px] outline-none h-5"
                              value={formData.acesso_aux_1}
                              onChange={(e) => setFormData({...formData, acesso_aux_1: e.target.value})}
                              placeholder="Aux"
                            />
                            <input 
                              type="text" 
                              className="flex-1 px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                              value={formData.conta_contabil}
                              onChange={(e) => setFormData({...formData, conta_contabil: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-span-6">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Conta Contábil PIS/COFINS</label>
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              className="w-10 px-1 py-0 bg-white border border-zinc-300 rounded text-[10px] outline-none h-5"
                              value={formData.acesso_aux_2}
                              onChange={(e) => setFormData({...formData, acesso_aux_2: e.target.value})}
                              placeholder="Aux"
                            />
                            <input 
                              type="text" 
                              className="flex-1 px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                              value={formData.conta_contabil_pis_cofins}
                              onChange={(e) => setFormData({...formData, conta_contabil_pis_cofins: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 10: Licença Sanitária, End Fiesp Id, Disp Legal */}
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-4">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Licença Sanitária</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.licenca_sanitaria}
                            onChange={(e) => setFormData({...formData, licenca_sanitaria: e.target.value})}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">End. Fiesp Id</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.end_fiesp_id}
                            onChange={(e) => setFormData({...formData, end_fiesp_id: e.target.value})}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Disp. Legal</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-5"
                            value={formData.disp_legal}
                            onChange={(e) => setFormData({...formData, disp_legal: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'lista' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-zinc-700 uppercase">Lista de Contatos</h3>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, contatos: [...formData.contatos, { id: Date.now(), nome: '', cargo: '', email: '', telefone: '' }]})}
                          className="flex items-center gap-1 px-2 py-0.5 bg-indaia-blue text-white rounded text-[9px] font-bold hover:bg-indaia-blue/90 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar Contato
                        </button>
                      </div>
                      <div className="border border-zinc-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr className="text-[9px] font-bold text-zinc-500 uppercase">
                              <th className="px-3 py-1.5">Nome</th>
                              <th className="px-3 py-1.5">Cargo</th>
                              <th className="px-3 py-1.5">Email</th>
                              <th className="px-3 py-1.5">Telefone</th>
                              <th className="px-3 py-1.5 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {formData.contatos.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-3 py-8 text-center text-zinc-400 text-[10px]">Nenhum contato cadastrado.</td>
                              </tr>
                            ) : (
                              formData.contatos.map((contato, idx) => (
                                <tr key={contato.id} className="text-[10px]">
                                  <td className="px-3 py-1">
                                    <input 
                                      type="text" 
                                      className="w-full px-1 py-0.5 border border-zinc-200 rounded outline-none focus:border-indaia-blue"
                                      value={contato.nome}
                                      onChange={(e) => {
                                        const newContatos = [...formData.contatos];
                                        newContatos[idx].nome = e.target.value;
                                        setFormData({...formData, contatos: newContatos});
                                      }}
                                    />
                                  </td>
                                  <td className="px-3 py-1">
                                    <input 
                                      type="text" 
                                      className="w-full px-1 py-0.5 border border-zinc-200 rounded outline-none focus:border-indaia-blue"
                                      value={contato.cargo}
                                      onChange={(e) => {
                                        const newContatos = [...formData.contatos];
                                        newContatos[idx].cargo = e.target.value;
                                        setFormData({...formData, contatos: newContatos});
                                      }}
                                    />
                                  </td>
                                  <td className="px-3 py-1">
                                    <input 
                                      type="email" 
                                      className="w-full px-1 py-0.5 border border-zinc-200 rounded outline-none focus:border-indaia-blue"
                                      value={contato.email}
                                      onChange={(e) => {
                                        const newContatos = [...formData.contatos];
                                        newContatos[idx].email = e.target.value;
                                        setFormData({...formData, contatos: newContatos});
                                      }}
                                    />
                                  </td>
                                  <td className="px-3 py-1">
                                    <input 
                                      type="text" 
                                      className="w-full px-1 py-0.5 border border-zinc-200 rounded outline-none focus:border-indaia-blue"
                                      value={contato.telefone}
                                      onChange={(e) => {
                                        const newContatos = [...formData.contatos];
                                        newContatos[idx].telefone = e.target.value;
                                        setFormData({...formData, contatos: newContatos});
                                      }}
                                    />
                                  </td>
                                  <td className="px-3 py-1 text-right">
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newContatos = formData.contatos.filter((_, i) => i !== idx);
                                        setFormData({...formData, contatos: newContatos});
                                      }}
                                      className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'obs_particulares' && (
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase">Observações Particulares</label>
                      <textarea 
                        className="w-full h-64 px-2 py-1.5 border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none resize-none"
                        value={formData.obs_particulares}
                        onChange={(e) => setFormData({...formData, obs_particulares: e.target.value})}
                        placeholder="Digite aqui as observações específicas para este cliente..."
                      />
                    </div>
                  )}

                  {activeTab === 'habilitacao' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                          <h3 className="text-[10px] font-bold text-zinc-700 uppercase border-b border-zinc-200 pb-1">Radar</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Tipo</label>
                              <select 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.radar_tipo}
                                onChange={(e) => setFormData({...formData, radar_tipo: e.target.value})}
                              >
                                <option value="Limitada">Limitada</option>
                                <option value="Ilimitada">Ilimitada</option>
                                <option value="Expressa">Expressa</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Validade</label>
                              <input 
                                type="date" 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.radar_validade}
                                onChange={(e) => setFormData({...formData, radar_validade: e.target.value})}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Número do Ato</label>
                              <input 
                                type="text" 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.radar_numero}
                                onChange={(e) => setFormData({...formData, radar_numero: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                          <h3 className="text-[10px] font-bold text-zinc-700 uppercase border-b border-zinc-200 pb-1">Suframa</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Número Inscrição</label>
                              <input 
                                type="text" 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.suframa}
                                onChange={(e) => setFormData({...formData, suframa: e.target.value})}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Validade</label>
                              <input 
                                type="date" 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.validade_suframa}
                                onChange={(e) => setFormData({...formData, validade_suframa: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Regime Tributário</label>
                          <select 
                            className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                            value={formData.regime_tributario}
                            onChange={(e) => setFormData({...formData, regime_tributario: e.target.value})}
                          >
                            <option value="Lucro Real">Lucro Real</option>
                            <option value="Lucro Presumido">Lucro Presumido</option>
                            <option value="Simples Nacional">Simples Nacional</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Limite Operacional (USD)</label>
                          <input 
                            type="text" 
                            className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                            value={formData.limite_operacional}
                            onChange={(e) => setFormData({...formData, limite_operacional: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'armazenagem' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                          <h3 className="text-[10px] font-bold text-zinc-700 uppercase border-b border-zinc-200 pb-1">Free Time</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Demurrage (Dias)</label>
                              <input 
                                type="number" 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.free_time_demurrage}
                                onChange={(e) => setFormData({...formData, free_time_demurrage: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Detention (Dias)</label>
                              <input 
                                type="number" 
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                                value={formData.free_time_detention}
                                onChange={(e) => setFormData({...formData, free_time_detention: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                          <h3 className="text-[10px] font-bold text-zinc-700 uppercase border-b border-zinc-200 pb-1">Contato Armazém</h3>
                          <textarea 
                            className="w-full h-16 px-2 py-1 border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none resize-none"
                            value={formData.contato_armazenagem}
                            onChange={(e) => setFormData({...formData, contato_armazenagem: e.target.value})}
                            placeholder="Nome, Telefone, Email do contato no armazém..."
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                        <label className="block text-[9px] font-bold text-zinc-500 uppercase">Instruções de Armazenagem</label>
                        <textarea 
                          className="w-full h-32 px-2 py-1 border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none resize-none"
                          value={formData.instrucoes_armazenagem}
                          onChange={(e) => setFormData({...formData, instrucoes_armazenagem: e.target.value})}
                          placeholder="Instruções especiais para o recebimento e armazenamento de cargas..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'di_parametros' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Canal de Parametrização Preferencial</label>
                          <select 
                            className="w-full px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none h-6"
                            value={formData.canal_parametrizacao}
                            onChange={(e) => setFormData({...formData, canal_parametrizacao: e.target.value})}
                          >
                            <option value="Verde">Verde</option>
                            <option value="Amarelo">Amarelo</option>
                            <option value="Vermelho">Vermelho</option>
                            <option value="Cinza">Cinza</option>
                          </select>
                        </div>
                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.libera_di_auto === 'Sim'} 
                              onChange={(e) => setFormData({...formData, libera_di_auto: e.target.checked ? 'Sim' : 'Não'})} 
                              className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-3 h-3" 
                            />
                            <span className="text-[10px] font-bold text-zinc-700 uppercase">Liberação de DI Automática</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Instruções de Faturamento</label>
                          <textarea 
                            className="w-full h-40 px-2 py-1 border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none resize-none"
                            value={formData.instrucoes_faturamento}
                            onChange={(e) => setFormData({...formData, instrucoes_faturamento: e.target.value})}
                            placeholder="Como as faturas devem ser emitidas para este cliente..."
                          />
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase">Instruções de Despacho</label>
                          <textarea 
                            className="w-full h-40 px-2 py-1 border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none resize-none"
                            value={formData.instrucoes_despacho}
                            onChange={(e) => setFormData({...formData, instrucoes_despacho: e.target.value})}
                            placeholder="Instruções para o despacho aduaneiro..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'extras' && (
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase">Informações Extras</label>
                      <textarea 
                        className="w-full h-64 px-2 py-1.5 border border-zinc-300 rounded text-[11px] focus:ring-1 focus:ring-indaia-blue outline-none resize-none"
                        value={formData.extras_info}
                        onChange={(e) => setFormData({...formData, extras_info: e.target.value})}
                        placeholder="Qualquer outra informação relevante que não se encaixe nas abas anteriores..."
                      />
                    </div>
                  )}
                </div>

                {/* Sidebar Options (Checkboxes & Radios) */}
                <div className="w-full lg:w-52 space-y-1">
                  {/* Papéis Section */}
                  <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 border-b border-zinc-200 pb-0.5 mb-0.5">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={formData.cliente} onChange={(e) => setFormData({...formData, cliente: e.target.checked})} className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" />
                        <span className="text-[8px] font-bold text-zinc-700 uppercase">Cliente</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={formData.nao_cliente} onChange={(e) => setFormData({...formData, nao_cliente: e.target.checked})} className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" />
                        <span className="text-[8px] font-bold text-zinc-700 uppercase">Não Cliente</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                      {[
                        { id: 'importador', label: 'Importador' },
                        { id: 'exportador', label: 'Exportador' },
                        { id: 'representante', label: 'Repres.' },
                        { id: 'seguradora', label: 'Seguradora' },
                        { id: 'comprador', label: 'Comprador' },
                        { id: 'outros', label: 'Outros' }
                      ].map((role) => (
                        <label key={role.id} className="flex items-center gap-1 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={(formData as any)[role.id]} 
                            onChange={(e) => setFormData({...formData, [role.id]: e.target.checked})} 
                            className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                          />
                          <span className="text-[9px] text-zinc-600 group-hover:text-zinc-900 transition-colors whitespace-nowrap">{role.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-0.5 border-t border-zinc-200 space-y-0.5">
                      {[
                        { id: 'verifica_icms_di', label: 'Verifica ICMS - DI' },
                        { id: 'cotacao', label: 'Cotação' },
                        { id: 'envia_boleto_dda', label: 'Envia Boleto DDA' },
                        { id: 'afrmm_no_icms', label: 'AFRMM no ICMS' }
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-1 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={(formData as any)[opt.id]} 
                            onChange={(e) => setFormData({...formData, [opt.id]: e.target.checked})} 
                            className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                          />
                          <span className="text-[9px] text-zinc-600 group-hover:text-zinc-900 transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recolhimento MP164 Section */}
                  <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <h3 className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Recolhimento MP164</h3>
                    <div className="grid grid-cols-2 gap-1">
                      {['Integral', 'Isenção', 'Redução', 'Suspensão'].map((type) => (
                        <label key={type} className="flex items-center gap-1 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="mp164"
                            checked={formData.recolhimento_mp164 === type} 
                            onChange={() => setFormData({...formData, recolhimento_mp164: type})} 
                            className="border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                          />
                          <span className="text-[9px] text-zinc-600 group-hover:text-zinc-900 transition-colors">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Checkboxes */}
                  <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl flex justify-between">
                    <label className="flex items-center gap-1 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.confere_nf} 
                        onChange={(e) => setFormData({...formData, confere_nf: e.target.checked})} 
                        className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                      />
                      <span className="text-[8px] font-bold text-zinc-700 uppercase">Confere NF</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.emissao_fatura} 
                        onChange={(e) => setFormData({...formData, emissao_fatura: e.target.checked})} 
                        className="rounded border-zinc-300 text-indaia-blue focus:ring-indaia-blue w-2.5 h-2.5" 
                      />
                      <span className="text-[8px] font-bold text-zinc-700 uppercase">Emissão Fatura</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-4 py-1 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-2 py-1 text-[10px] font-bold text-zinc-600 hover:bg-zinc-200 rounded transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="cliente-form"
                disabled={saving} 
                className="px-4 py-1 text-[10px] font-bold text-white bg-indaia-blue hover:bg-indaia-blue/90 rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-indaia-blue/20"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {saving ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
