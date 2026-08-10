import React from 'react';
import { Shield, Server, Key } from 'lucide-react';
import { SavedAccount } from '../types';

interface ConfigViewProps {
  accounts: SavedAccount[];
  onClearAccounts: () => void;
  tunnelUrl?: string;
  setTunnelUrl?: (url: string) => void;
  pingStatus?: 'idle' | 'pinging' | 'success' | 'failed';
  runPing?: (isSilent: boolean) => void;
  pingResponse?: any;
  latency?: number | null;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  accounts,
  onClearAccounts,
  tunnelUrl,
  setTunnelUrl,
  pingStatus,
  runPing,
  latency
}) => {
  const [inputUrl, setInputUrl] = React.useState(tunnelUrl || '');
  const [inputTokenCode, setInputTokenCode] = React.useState(() => localStorage.getItem('shuziro_token_code') || '');

  React.useEffect(() => {
    if (tunnelUrl) setInputUrl(tunnelUrl);
  }, [tunnelUrl]);

  const handleSaveUrl = () => {
    if (setTunnelUrl && inputUrl) {
      const formatted = inputUrl.trim().replace(/\/$/, '');
      setTunnelUrl(formatted);
      localStorage.setItem('shuziro_backend_url', formatted);
      localStorage.setItem('shuziro_termux_tunnel', formatted);
      if (runPing) runPing(false);
    }
  };

  const handleSaveTokenCode = () => {
    const formatted = inputTokenCode.trim().toUpperCase();
    setInputTokenCode(formatted);
    localStorage.setItem('shuziro_token_code', formatted);
    alert('Código de Acesso salvo com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Title section */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" /> Configurações Gerais
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gerencie suas credenciais salvas e configure a URL do servidor backend ou do túnel Termux/Cloudflare.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Saved Accounts config */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" /> Contas Salvas Localmente
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold">
                {accounts.length}
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              As contas adicionadas ao painel ficam armazenadas de forma 100% segura e privada diretamente no armazenamento local do seu próprio navegador (<code className="text-zinc-300 font-mono">localStorage</code>). Nenhum dado é transmitido a terceiros.
            </p>
          </div>

          {accounts.length > 0 ? (
            <button
              id="btn-clear-accounts"
              onClick={onClearAccounts}
              className="w-full text-center text-xs text-red-400 hover:text-red-300 font-bold py-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 rounded-xl transition-all cursor-pointer mt-4"
            >
              Excluir Todas as Contas Salvas
            </button>
          ) : (
            <div className="text-center py-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs text-zinc-500 italic mt-4">
              Nenhuma conta armazenada neste navegador
            </div>
          )}
        </div>

        {/* System status details */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-400" /> Servidor de Redundância Backend
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                pingStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                pingStatus === 'pinging' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                <span>{pingStatus === 'success' ? `ONLINE (${latency || 0}ms)` : pingStatus === 'pinging' ? 'TESTANDO...' : 'OFFLINE'}</span>
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O backend redundante inteligente do ShuziroAstral está integrado ao código e opera com criptografia de ponta a ponta para gerenciar a proxy de requisições e a autenticação das plataformas.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs font-bold mt-4">
            <span className="flex items-center gap-2 text-zinc-300 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full shrink-0 ${pingStatus === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              API Roteadora Integrada
            </span>
            <button
              onClick={() => runPing && runPing(false)}
              className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
            >
              Testar Conexão
            </button>
          </div>
        </div>

      </div>

      {/* Bypass de Captcha */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4 shadow-md">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-zinc-400" /> Token de Acesso da Web (Bypass de Captcha)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            Se você estiver enfrentando erros <strong className="text-red-400">403 (Missing CAPTCHA token / CAPTCHA token)</strong> ao realizar ou iniciar tarefas, configure abaixo o seu Código de Acesso da Web. Para obtê-lo, acesse o aplicativo oficial do CMSP no celular, vá em <strong className="text-zinc-200">Perfil</strong> e copie o <strong className="text-zinc-200">Código de acesso web</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={inputTokenCode}
            onChange={(e) => setInputTokenCode(e.target.value.trim())}
            placeholder="Ex.: F8J3D2"
            className="flex-1 px-4 py-3 bg-[#18181b] border border-[#27272a] focus:border-zinc-500 rounded-xl text-white text-sm focus:outline-none uppercase"
          />
          <button
            onClick={handleSaveTokenCode}
            className="px-5 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Salvar Código
          </button>
        </div>
      </div>

    </div>
  );
};
