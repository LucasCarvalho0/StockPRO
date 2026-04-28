'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services';
import { Loader2 } from 'lucide-react';

const schema = z.object({ matricula: z.string().min(1, 'Obrigatório'), senha: z.string().min(6, 'Mínimo 6 caracteres') });
type Form = z.infer<typeof schema>;

const features = ['Gestão de entradas e saídas em tempo real','Alertas automáticos de estoque mínimo','Inventário semanal com auditoria completa','Relatórios PDF e Excel automatizados'];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  // Se já estiver autenticado após a hidratação, pula o login
  useState(() => {
    if (typeof window !== 'undefined' && _hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  });

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      const res = await authService.login(data.matricula, data.senha);
      setAuth(res.user, res.access_token);
      router.push('/dashboard');
    } catch (err: any) { setError(err?.response?.data?.message ?? 'Matrícula ou senha inválidos'); }
  };

  const inputStyle = { background: '#1a3460', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#0a1628]">
      {/* Painel lateral - Visível em tablets (iPad Mini) e desktops */}
      <div 
        className="hidden md:flex flex-col justify-between w-full md:w-[380px] lg:w-[480px] flex-shrink-0 p-8 lg:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg, #0f2040 0%, #0a1628 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Efeitos de Fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16 lg:mb-24 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/20 group-hover:rotate-6 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 8H7v-2h4v2zm6 0h-4v-2h4v2zM4 7V5a2 2 0 012-2h12a2 2 0 012 2v2H4z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-2xl tracking-tighter font-display">StockPRO</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-blue-400/60 font-mono-custom leading-none mt-1">
                Estoque Corporativo
              </p>
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight font-display">
            Controle total do seu <span className="text-blue-500">estoque</span> empresarial
          </h2>
          <p className="text-base lg:text-lg text-slate-400 leading-relaxed max-w-sm">
            Sistema profissional com rastreabilidade completa, alertas inteligentes e relatórios automatizados.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4 group/item">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover/item:scale-150 transition-transform" />
              <span className="text-[14px] font-bold text-slate-300 group-hover/item:text-white transition-colors">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header Mobile (Apenas < md) */}
      <div className="md:hidden p-8 flex items-center gap-4 bg-[#0f2040]/30 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 8H7v-2h4v2zm6 0h-4v-2h4v2zM4 7V5a2 2 0 012-2h12a2 2 0 012 2v2H4z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-black text-lg tracking-tight font-display">StockPRO</p>
          <p className="text-[9px] tracking-widest uppercase font-bold text-blue-400/60 font-mono-custom">Estoque Corporativo</p>
        </div>
      </div>

      {/* Área do Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Luzes de fundo para o formulário */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-blue-600/5 blur-[120px] rounded-full" />
        
        <div className="w-full max-w-[360px] relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight font-display">Acesso restrito</h1>
            <p className="text-[14px] font-bold text-slate-500 tracking-tight">Utilize sua matrícula e senha corporativa para entrar.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Matrícula</label>
              <div className="relative group">
                <input 
                  {...register('matricula')} 
                  placeholder="Ex: 116221" 
                  className="w-full h-14 bg-slate-900/50 border-2 border-white/5 rounded-2xl px-6 text-white text-base font-bold outline-none focus:border-blue-600 focus:bg-slate-900 transition-all placeholder:text-slate-700"
                />
              </div>
              {errors.matricula && <p className="text-rose-500 text-[11px] font-bold ml-2">{errors.matricula.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Senha</label>
              <div className="relative group">
                <input 
                  {...register('senha')} 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-14 bg-slate-900/50 border-2 border-white/5 rounded-2xl px-6 text-white text-base font-bold outline-none focus:border-blue-600 focus:bg-slate-900 transition-all placeholder:text-slate-700"
                />
              </div>
              {errors.senha && <p className="text-rose-500 text-[11px] font-bold ml-2">{errors.senha.message}</p>}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px] font-bold animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Processando...</> : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
             <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
               <div className="w-1 h-1 rounded-full bg-slate-700" />
               StockPRO Digital v2.4
               <div className="w-1 h-1 rounded-full bg-slate-700" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
