import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Plus, AlertCircle, Loader2, Database, MoreHorizontal } from 'lucide-react';

interface DynamicTableProps {
  tableName: string;
  title: string;
  description: string;
}

export default function DynamicTable({ tableName, title, description }: DynamicTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .limit(50);
        
        if (fetchError) throw fetchError;
        setData(fetchedData || []);
      } catch (err: any) {
        console.error(`Erro ao buscar ${tableName}:`, err);
        setError(err.message || `Erro ao buscar dados da tabela ${tableName}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tableName]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
          <p className="text-zinc-500 mt-1 text-sm">{description}</p>
        </div>
        <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-200 text-sm">
          <Plus className="w-4 h-4" />
          Novo Registro
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/60 overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 items-center bg-zinc-50/30">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-400"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 font-medium text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
            <p className="text-sm">Conectando ao Supabase e carregando dados de <strong>{tableName}</strong>...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-red-500 p-6 text-center py-20">
            <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
            <p className="font-medium text-lg">Erro de Conexão com o Banco de Dados</p>
            <p className="text-sm mt-2 max-w-md text-red-400">{error}</p>
            <div className="mt-6 text-sm text-zinc-600 bg-zinc-50 p-4 rounded-xl text-left max-w-lg border border-zinc-200">
              <p className="font-semibold mb-2 text-zinc-900">Como resolver:</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Verifique se a tabela <strong className="text-zinc-900">"{tableName}"</strong> existe no seu Supabase.</li>
                <li>Verifique se a <strong className="text-zinc-900">Anon Key</strong> foi adicionada nos Secrets do AI Studio (variável <code className="bg-zinc-200 px-1.5 py-0.5 rounded text-xs font-mono">VITE_SUPABASE_ANON_KEY</code>).</li>
                <li>Verifique as políticas de segurança (RLS) da tabela no Supabase. Elas precisam permitir leitura (SELECT).</li>
              </ol>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 py-20">
            <Database className="w-12 h-12 mb-4 text-zinc-300" />
            <p className="font-medium text-lg text-zinc-900">Nenhum registro encontrado</p>
            <p className="text-sm mt-1">A tabela <strong className="text-zinc-900">"{tableName}"</strong> está vazia ou bloqueada por RLS.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider">
                  {columns.map(col => (
                    <th key={col} className="px-6 py-4 font-medium whitespace-nowrap">{col.replace(/_/g, ' ')}</th>
                  ))}
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50/80 transition-colors group">
                    {columns.map(col => {
                      const value = row[col];
                      let displayValue = value;
                      
                      if (value === null || value === undefined) {
                        displayValue = '-';
                      } else if (typeof value === 'boolean') {
                        displayValue = value ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Sim</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/20">Não</span>
                        );
                      } else if (typeof value === 'object') {
                        displayValue = JSON.stringify(value);
                      } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                        displayValue = new Date(value).toLocaleDateString('pt-BR');
                      }

                      return (
                        <td key={col} className="px-6 py-4 text-sm text-zinc-600 whitespace-nowrap">
                          {displayValue}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
