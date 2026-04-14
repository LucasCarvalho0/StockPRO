'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, Badge, Button, PageLoading, InfoBanner } from '@/components/ui';
import { MovementModal } from '@/components/modals';
import { useAlerts, useAlertsResumo } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import { AlertCircle, CheckCircle2, History, PackageSearch, ArrowRightCircle } from 'lucide-react';

export default function AlertasPage() {
  const { data: alertsAtivos = [], isLoading } = useAlerts('ATIVO');
  const { data: alertsResolvidos = [] } = useAlerts('RESOLVIDO');
  const { data: resumen } = useAlertsResumo();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movModal, setMovModal] = useState<{ 
    open: boolean; 
    productId?: string; 
    type: 'ENTRADA' | 'SAIDA';
    quantity?: number;
  }>({ open: false, type: 'ENTRADA' });
  const [tab, setTab] = useState<'ativos' | 'resolvidos'>('ativos');

  const lista = tab === 'ativos' ? alertsAtivos : alertsResolvidos;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Monitor de Alertas</h1>
            <p className="text-slate-500 mt-1">Status crítico de estoque e divergências de inventário</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="red" className="px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-red-200">
               {resumo?.ativos ?? 0} Ativos
            </Badge>
          </div>
        </div>

        <InfoBanner type="info" className="border-indigo-100 bg-indigo-50/50 text-indigo-800">
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
            <AlertCircle size={16} />
            <span>Clique em "Ver Detalhes" para analisar a divergência e realizar o ajuste corretivo.</span>
          </div>
        </InfoBanner>

        <div className="flex gap-1 p-1 bg-slate-200/50 rounded-2xl w-fit border border-slate-200/40">
          <button
            onClick={() => setTab('ativos')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === 'ativos' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertCircle size={16} /> Ativos
          </button>
          <button
            onClick={() => setTab('resolvidos')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === 'resolvidos' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CheckCircle2 size={16} /> Resolvidos
          </button>
        </div>

        {isLoading ? (
          <PageLoading />
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {lista.map((alert) => {
               const isDivergencia = (alert as any).tipo === 'DIVERGENCIA_INVENTARIO';
               const isZerado = alert.quantidadeAtual === 0;
               const isExpanded = expandedId === alert.id;
               
               // No Alerta de Divergência:
               // quantidadeAtual = O que foi contado
               // quantidadeMinima = O que deveria ter no sistema
               const diff = alert.quantidadeMinima - alert.quantidadeAtual;
               
               return (
                <div
                  key={alert.id}
                  className={`group bg-white border ${isExpanded ? 'border-indigo-400 shadow-xl shadow-indigo-50' : 'border-slate-200/70 shadow-sm'} rounded-2xl transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    tab === 'resolvidos' ? 'bg-emerald-400' :
                    isDivergencia ? 'bg-indigo-500' :
                    isZerado ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />

                  {/* Header do Card (Sempre Visível) */}
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                          tab === 'resolvidos' ? 'bg-emerald-50 text-emerald-600' :
                          isDivergencia ? 'bg-indigo-50 text-indigo-600' :
                          isZerado ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isDivergencia ? <PackageSearch size={24} /> : <AlertCircle size={24} />}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                             <h3 className="text-lg font-bold text-slate-900 leading-none">{alert.product.nome}</h3>
                             <Badge variant={isDivergencia ? 'blue' : isZerado ? 'red' : 'amber'} className="text-[9px] uppercase font-bold tracking-tighter">
                               {isDivergencia ? 'Divergência Inventário' : 'Estoque Baixo'}
                             </Badge>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono-custom">
                            COD: {alert.product.codigo} · {alert.product.modelo}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] md:text-xs">
                             <div className="flex items-center gap-1.5 text-slate-500">
                                <History size={12} className="opacity-50" />
                                <span>Detectado em {formatDateTime(alert.createdAt)}</span>
                             </div>
                             {alert.resolvidoEm && (
                               <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                 <CheckCircle2 size={12} />
                                 <span>Resolvido</span>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 md:gap-8">
                         <div className="flex flex-col items-end">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Status Atual</p>
                            <p className={`text-xl font-bold font-mono-custom ${
                              tab === 'resolvidos' ? 'text-emerald-600' :
                              isZerado ? 'text-rose-600' : 'text-slate-800'
                            }`}>
                              {alert.quantidadeAtual} <span className="text-[10px] text-slate-400">{alert.product.unidade}</span>
                            </p>
                         </div>

                         <div className="flex items-center gap-2">
                            <Button 
                              variant="secondary"
                              size="sm"
                              className="text-[10px] font-bold uppercase h-9"
                              onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                            >
                              {isExpanded ? 'Recolher' : 'Ver Detalhes'}
                            </Button>
                            
                            {tab === 'ativos' && !isExpanded && (
                              <Button 
                                size="sm"
                                onClick={() => setMovModal({ 
                                  open: true, 
                                  productId: alert.productId, 
                                  type: isDivergencia ? 'ENTRADA' : 'ENTRADA',
                                  quantity: isDivergencia ? Math.abs(diff) : undefined
                                })} 
                                className={`h-9 px-4 rounded-lg flex items-center gap-2 font-bold text-[10px] uppercase text-white ${
                                  isDivergencia ? 'bg-indigo-600 hover:bg-indigo-700' : 
                                  isZerado ? 'bg-rose-600 hover:bg-rose-700' : 
                                  'bg-amber-600 hover:bg-amber-700'
                                }`}
                              >
                                Resolver
                              </Button>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Relatório Detalhado (Apenas se Expandido) */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                        {/* Box 1: Dados do Sistema */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">No Sistema</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-black text-slate-700">{alert.quantidadeMinima}</span>
                             <span className="text-xs text-slate-400 font-medium">{alert.product.unidade}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 italic">Visto no sistema antes da contagem</p>
                        </div>

                        {/* Box 2: Dados Contados */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contado no Inventário</p>
                          <div className="flex items-baseline gap-2 text-indigo-600">
                             <span className="text-2xl font-black">{alert.quantidadeAtual}</span>
                             <span className="text-xs font-medium">{alert.product.unidade}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 italic">Registrado fisicamente pelo operador</p>
                        </div>

                        {/* Box 3: Resultado / Diferença */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-center ${
                          diff > 0 ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">
                            {diff > 0 ? 'Quantidade Faltante' : 'Excesso de Estoque'}
                          </p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-black font-mono-custom">{Math.abs(diff)}</span>
                             <span className="text-sm font-bold uppercase">{alert.product.unidade}</span>
                          </div>
                          <p className="text-[10px] font-medium opacity-80">
                            {diff > 0 ? 'Requer ENTRADA para ajuste' : 'Requer SAÍDA para ajuste'}
                          </p>
                        </div>
                      </div>

                      {/* Botões de Ação do Relatório */}
                      {tab === 'ativos' && (
                        <div className="mt-6 flex flex-wrap gap-3">
                           <Button 
                             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-indigo-100 flex items-center gap-3"
                             onClick={() => setMovModal({ 
                               open: true, 
                               productId: alert.productId, 
                               type: diff > 0 ? 'ENTRADA' : 'SAIDA',
                               quantity: Math.abs(diff)
                             })}
                           >
                              <ArrowRightCircle size={20} />
                              Confirmar Ajuste Corretivo de {Math.abs(diff)} {alert.product.unidade}
                           </Button>
                           <Button variant="secondary" onClick={() => setExpandedId(null)} className="h-12 rounded-xl">
                             Fechar Relatório
                           </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
               );
             })}


             {lista.length === 0 && (
                <Card className="py-24 text-center flex flex-col items-center gap-4 bg-slate-50/50 border-dashed">
                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                      <CheckCircle2 size={40} />
                   </div>
                   <div>
                     <p className="text-xl font-bold text-slate-900">
                        {tab === 'ativos' ? 'Céu Limpo! Nenhum alerta ativo.' : 'Histórico de alertas vazio.'}
                     </p>
                     <p className="text-slate-500 mt-1 max-w-[320px] mx-auto text-sm">
                        {tab === 'ativos' ? 'Todos os produtos estão com níveis saudáveis e processados corretamente.' : 'Nenhum alerta foi resolvido no sistema ainda.'}
                     </p>
                   </div>
                </Card>
             )}
          </div>
        )}
      </div>

      <MovementModal
        open={movModal.open}
        onClose={() => setMovModal({ ...movModal, open: false })}
        type={movModal.type}
        preSelectedProductId={movModal.productId}
        preFilledQuantity={movModal.quantity}
      />
    </DashboardLayout>
  );
}
