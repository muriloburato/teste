import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Check, Save, Loader2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../lib/SettingsContext';
import { cn } from '../lib/utils';

export default function Configuracoes() {
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tempName, setTempName] = useState(settings.userName);

  const handleSave = () => {
    setIsSaving(true);
    // Simular salvamento e persistir no contexto
    setTimeout(() => {
      updateSettings({ userName: tempName });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const toggleSetting = (key: 'isDarkMode' | 'notifications' | 'backupDaily') => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", settings.isDarkMode ? "text-white" : "text-slate-900")}>Configurações</h1>
          <p className="text-slate-500 mt-1">Gerencie as preferências do seu sistema e conta.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indaia-blue text-white font-bold rounded-xl hover:bg-indaia-blue/90 transition-all shadow-lg shadow-indaia-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid gap-8">
        {/* Perfil Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Perfil do Administrador</h2>
          <div className={cn(
            "p-6 border rounded-2xl transition-colors",
            settings.isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-20 h-20 rounded-2xl bg-indaia-blue/10 border border-indaia-blue/20 flex items-center justify-center text-indaia-blue font-bold text-2xl">
                {tempName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-2">
                  <label className={cn("text-sm font-medium", settings.isDarkMode ? "text-slate-300" : "text-slate-700")}>Nome de Exibição</label>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className={cn(
                      "w-full max-w-md px-4 py-2 rounded-lg border outline-none transition-all",
                      settings.isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-white focus:border-indaia-blue" 
                        : "bg-slate-50 border-slate-200 focus:bg-white focus:border-indaia-blue"
                    )}
                  />
                </div>
                <p className="text-xs text-slate-500 italic">* Este nome será exibido em todo o sistema e relatórios.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferências Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Preferências do Sistema</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => toggleSetting('isDarkMode')}
              className={cn(
                "flex flex-col p-5 border rounded-xl transition-all text-left group relative",
                settings.isDarkMode ? "bg-slate-900 border-slate-800 hover:border-indaia-blue" : "bg-white border-slate-200 hover:border-indaia-blue hover:shadow-md"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors",
                settings.isDarkMode ? "bg-slate-800 group-hover:bg-indaia-blue/30" : "bg-slate-50 group-hover:bg-indaia-blue/10"
              )}>
                {settings.isDarkMode ? <Moon className="w-5 h-5 text-indaia-blue" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <h3 className={cn("font-semibold transition-colors", settings.isDarkMode ? "text-white group-hover:text-indaia-blue" : "text-slate-900 group-hover:text-indaia-blue")}>Modo Escuro</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Alternar entre tema claro e escuro para o sistema.</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <div className={cn("w-12 h-6 rounded-full relative transition-colors", settings.isDarkMode ? "bg-indaia-blue" : "bg-slate-200")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", settings.isDarkMode ? "left-7" : "left-1")} />
                </div>
                <span className={settings.isDarkMode ? "text-indaia-blue" : "text-slate-400"}>{settings.isDarkMode ? 'Ativado' : 'Desativado'}</span>
              </div>
            </button>

            {/* Notifications Toggle */}
            <button 
              onClick={() => toggleSetting('notifications')}
              className={cn(
                "flex flex-col p-5 border rounded-xl transition-all text-left group relative",
                settings.isDarkMode ? "bg-slate-900 border-slate-800 hover:border-indaia-blue" : "bg-white border-slate-200 hover:border-indaia-blue hover:shadow-md"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors",
                settings.isDarkMode ? "bg-slate-800 group-hover:bg-indaia-blue/30" : "bg-slate-50 group-hover:bg-indaia-blue/10"
              )}>
                <Bell className={cn("w-5 h-5", settings.notifications ? "text-indaia-blue" : "text-slate-400")} />
              </div>
              <h3 className={cn("font-semibold transition-colors", settings.isDarkMode ? "text-white group-hover:text-indaia-blue" : "text-slate-900 group-hover:text-indaia-blue")}>Notificações</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Receber alertas do sistema em tempo real.</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <div className={cn("w-12 h-6 rounded-full relative transition-colors", settings.notifications ? "bg-indaia-blue" : "bg-slate-200")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", settings.notifications ? "left-7" : "left-1")} />
                </div>
                <span className={settings.notifications ? "text-indaia-blue" : "text-slate-400"}>{settings.notifications ? 'Ativado' : 'Desativado'}</span>
              </div>
            </button>

            {/* Backup Toggle */}
            <button 
              onClick={() => toggleSetting('backupDaily')}
              className={cn(
                "flex flex-col p-5 border rounded-xl transition-all text-left group relative",
                settings.isDarkMode ? "bg-slate-900 border-slate-800 hover:border-indaia-blue" : "bg-white border-slate-200 hover:border-indaia-blue hover:shadow-md"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors",
                settings.isDarkMode ? "bg-slate-800 group-hover:bg-indaia-blue/30" : "bg-slate-50 group-hover:bg-indaia-blue/10"
              )}>
                <Database className={cn("w-5 h-5", settings.backupDaily ? "text-indaia-blue" : "text-slate-400")} />
              </div>
              <h3 className={cn("font-semibold transition-colors", settings.isDarkMode ? "text-white group-hover:text-indaia-blue" : "text-slate-900 group-hover:text-indaia-blue")}>Backup Automático</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Realizar backup diário dos dados do sistema.</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <div className={cn("w-12 h-6 rounded-full relative transition-colors", settings.backupDaily ? "bg-indaia-blue" : "bg-slate-200")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", settings.backupDaily ? "left-7" : "left-1")} />
                </div>
                <span className={settings.backupDaily ? "text-indaia-blue" : "text-slate-400"}>{settings.backupDaily ? 'Ativado' : 'Desativado'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm">Configurações salvas com sucesso!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
