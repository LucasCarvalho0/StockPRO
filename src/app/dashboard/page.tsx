'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardHeader, CardTitle, Badge, PageLoading, Button } from '@/components/ui';
import { 
  useProductStats, useAlertsResumo, useResumoHoje, 
  useMovements, useAlerts, useInventoryHistorico, 
  useSuppliers, useDashboardStats, useInventoryAtivo, useLogs
} from '@/hooks';
import { reportsService } from '@/services';
import { formatDateTime, cn } from '@/lib/utils';
import { MovementsDetailModal } from '@/components/modals';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  Package, AlertTriangle, Activity, Calendar, Truck, 
  TrendingUp, History, FileText, FileSpreadsheet, 
  Users, ChevronRight, CheckCircle2, Clock, ShieldCheck, DatabaseBackup
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#06b6d4'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useProductStats();
  const { data: dashStats, isLoading: dashLoading } = useDashboardStats();
  const { data: alertsResumo } = useAlertsResumo();
  const { data: resumoHoje } = useResumoHoje();
  const { data: movements = [] } = useMovements();
  const { data: alertsAtivos = [] } = useAlerts('ATIVO');
  const { data: historico = [] } = useInventoryHistorico();
  const { data: suppliers = [] } = useSuppliers();
  const { data: invAtivo } = useInventoryAtivo();
  const { data: logs = [] } = useLogs();

  const getDuration = (start: string | Date, end: string | Date | null) => {
    if (!end) return '-';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.floor((e - s) / 60000); 
    if (diff < 60) return `${diff} min`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  };

  const ultimoInv = historico[0];
  const isLoading = statsLoading || dashLoading;

  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);

  if (isLoading) return <DashboardLayout><div className="p-8"><PageLoading /></div></DashboardLayout>;

  return (
    <>
    <DashboardLayout>
      <div className="p-4 md:p-8 flex flex-col gap-6 md:gap-10 fade-in max-w-[1700px] mx-auto min-h-screen bg-slate-50/20">
        
        {/* Header Ultra Premium */}
        <div className="relative group overflow-hidden bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all duration-500 hover:shadow-indigo-100/40">
           <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                   <Activity size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter font-display">Hub de Comando</h1>
                  <Badge variant="glass" className="mt-1 font-black">Status: Operação em Tempo Real</Badge>
                </div>
              </div>
              <p className="text-slate-400 font-bold text-sm ml-1 flex items-center gap-2">
                <Calendar size={14} className="text-indigo-500" />
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
           </div>
           
           <div className="flex flex-wrap items-center gap-3 md:gap-4 relative z-10">
              <Button 
                variant="secondary" 
                size="md"
                className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 md:gap-3 border-dashed border-slate-200 hover:border-indigo-300 flex-1 md:flex-none"
                onClick={async () => {
                  try {
                    toast.loading('Gerando backup...');
                    const res = await fetch('/api/backup');
                    if (!res.ok) throw new Error('Sem permissão ou erro no servidor');
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `stockpro-backup-${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.dismiss();
                    toast.success('Backup gerado e baixado com sucesso!');
                  } catch (e: any) {
                    toast.dismiss();
                    toast.error(e.message ?? 'Erro ao gerar backup');
                  }
                }}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <DatabaseBackup size={14} />
                </div>
                Backup
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 md:gap-3 flex-1 md:flex-none"
                onClick={() => reportsService.excelEstoque().then(b => reportsService.download(b, `estoque-${new Date().toISOString().slice(0,10)}.xlsx`))}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet size={14} />
                </div>
                Inventário Full
              </Button>
              <Button 
                variant="premium"
                size="md"
                className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 md:gap-3 w-full md:w-auto"
                onClick={() => ultimoInv && reportsService.pdfInventario(ultimoInv.id).then(b => reportsService.download(b, `inventario-${ultimoInv.responsavel}.pdf`))}
                disabled={!ultimoInv}
              >
                <FileText size={16} />
                Gerar Relatório Final
              </Button>
           </div>
        </div>

        {/* Grade de Métricas Premium: 5 Colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <StatCard 
            label="Volume em Estoque" 
            value={stats?.total ?? 0} 
            sub={`${dashStats?.health.ok ?? 0} SKUs Ativos`} 
            accent="#6366f1" 
            icon={Package}
          />
          <StatCard 
            label="Atenção Imediata" 
            value={alertsResumo?.ativos ?? 0} 
            sub="Ruptura ou Estoque Baixo" 
            accent="#f43f5e" 
            icon={AlertTriangle}
            valueClass="text-3xl md:text-4xl font-black text-rose-600"
          />
          <StatCard 
            label="Movimento/Dia" 
            value={resumoHoje?.total ?? 0} 
            sub={`${resumoHoje?.entradas ?? 0} IN / ${resumoHoje?.saidas ?? 0} OUT`} 
            accent="#f59e0b" 
            icon={TrendingUp}
            valueClass="text-3xl md:text-4xl font-black text-amber-600" 
          />
          <StatCard 
            label="Time em Campo" 
            value={invAtivo ? 1 : 0} 
            sub={invAtivo ? `Agente: ${invAtivo.responsavel.split(' ')[0]}` : 'Posto vago'} 
            accent="#10b981" 
            icon={CheckCircle2}
            valueClass="text-3xl md:text-4xl font-black text-emerald-600"
            footer={invAtivo ? (
              <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-black bg-emerald-100/50 px-3 py-1 rounded-full w-fit animate-pulse border border-emerald-200">
                <Clock size={12} strokeWidth={3} /> SESSÃO ATIVA
              </div>
            ) : undefined}
          />
          <StatCard 
            label="Ciclo de Auditoria" 
            value={ultimoInv ? new Date(ultimoInv.finalizadoEm!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'} 
            sub={ultimoInv ? `Ref: ${ultimoInv.responsavel.split(' ')[0]}` : 'Sem histórico'} 
            accent="#8b5cf6" 
            icon={ShieldCheck}
            valueClass="text-2xl md:text-3xl font-black text-indigo-700" 
          />
        </div>

        {/* Centro Analítico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <Card className="xl:col-span-2 group">
            <CardHeader className="flex flex-row items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                   <TrendingUp size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                   <CardTitle>Performance de Giro Diário</CardTitle>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Janela Móvel: 7 Dias</p>
                 </div>
               </div>
               <Badge variant="blue" className="rounded-xl border-indigo-200 text-indigo-600">Sync Live</Badge>
            </CardHeader>
            <div className="p-8">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dashStats?.weeklyData} barGap={12}>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={15}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 12 }} 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '13px', padding: '16px', fontWeight: 700 }}
                  />
                  <Bar dataKey="entradas" name="Entradas" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={24} />
                  <Bar dataKey="saidas" name="Saídas" fill="#f43f5e" radius={[8, 8, 8, 8]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-10 mt-8 justify-center items-center">
                <div className="flex items-center gap-3 bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" />
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Entradas</span>
                </div>
                <div className="flex items-center gap-3 bg-rose-50/50 px-4 py-2 rounded-full border border-rose-100">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Saídas</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-[1rem] bg-amber-50 flex items-center justify-center text-amber-600">
                   <Users size={20} />
                 </div>
                 <div>
                   <CardTitle>Ocupação Lógica</CardTitle>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mix por Cliente</p>
                 </div>
               </div>
            </CardHeader>
            <div className="p-8 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={dashStats?.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {dashStats?.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.8)" strokeWidth={4} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-3 w-full mt-8">
                {dashStats?.distribution.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-lg shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] font-black text-slate-700 uppercase truncate max-w-[120px]">{d.name}</span>
                    </div>
                    <Badge variant="glass" className="font-bold">{d.value} un</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Atividades e Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <History size={20} />
                  </div>
                  <div>
                    <CardTitle>Últimas Movimentações</CardTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fluxo Logístico Recente</p>
                  </div>
               </div>
               <Button variant="ghost" size="sm" className="text-indigo-600 font-black gap-2 hover:bg-indigo-50 px-4" onClick={() => setIsMovementsModalOpen(true)}>
                 EXPLORAR <ChevronRight size={16} />
               </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Material','Operação','Qtd','Data/Hora'].map((h) => (
                    <th key={h} className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.slice(0, 6).map((m) => (
                    <tr key={m.id} className="hover:bg-indigo-50/10 transition-colors group">
                      <td className="px-8 py-5">
                         <p className="text-[14px] font-black text-slate-800">{m.product.nome}</p>
                         <p className="text-[10px] text-indigo-500 font-bold tracking-widest mt-0.5 font-mono-custom">{m.product.codigo}</p>
                      </td>
                      <td className="px-8 py-5">
                         <Badge variant={m.type === 'ENTRADA' ? 'green' : 'red'} className="rounded-xl px-4 py-1.5 shadow-sm">
                            {m.type}
                         </Badge>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                            <span className={cn("text-lg font-black font-mono-custom tracking-tighter", m.type === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600')}>
                               {m.type === 'ENTRADA' ? '+' : '-'}{m.quantidade}
                            </span>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{m.product.unidade}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-[12px] font-bold text-slate-500">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-white to-rose-50/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-[1rem] bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm shadow-rose-200">
                   <AlertTriangle size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                   <CardTitle>Painel de Ruptura</CardTitle>
                   <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">Estoque Crítico</p>
                 </div>
              </div>
            </CardHeader>
            <div className="p-2 space-y-2">
              {alertsAtivos.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-rose-100 hover:shadow-lg hover:shadow-rose-200/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-rose-200">
                    {Math.round((a.quantidadeAtual / a.quantidadeMinima) * 100)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-slate-800 truncate group-hover:text-rose-600 transition-colors uppercase tracking-tight">{a.product.nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-100">ATUAL: {a.quantidadeAtual}</span>
                       <span className="text-[10px] font-bold text-slate-400">MÍN: {a.quantidadeMinima}</span>
                    </div>
                  </div>
                </div>
              ))}
              {alertsAtivos.length === 0 && (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100 rotate-12">
                      <ShieldCheck size={40} />
                   </div>
                   <p className="text-lg font-black text-slate-800 tracking-tight">Cinto de Segurança OK</p>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Operação dentro das métricas</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Feed de Logs Premium */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
          <CardHeader className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                 <ShieldCheck size={28} />
               </div>
               <div>
                 <CardTitle className="text-xl md:text-2xl">Pátio de Operações</CardTitle>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Sincronização Ativa de Logística</p>
               </div>
             </div>
             <Button 
               variant="outline" 
               className="rounded-2xl font-black uppercase text-[10px] tracking-widest px-6"
               onClick={() => window.location.href = '/auditoria'}
             >
               Relatório Histórico
             </Button>
          </CardHeader>
          <div className="p-6 md:p-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {logs.slice(0, 12).map((log: any) => (
                <div key={log.id} className="flex flex-col gap-3 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group scale-100 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                     <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Clock size={14} />
                     </div>
                     <Badge variant="glass" className="text-[8px] tracking-tighter">{log.action.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-800 leading-tight mb-1">
                       {log.user?.nome.split(' ')[0]} <span className="font-bold text-indigo-500">{log.descricao}</span>
                    </p>
                    <span className="text-[10px] font-black text-slate-400 font-mono-custom tracking-widest">{new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabela de Histórico Premium */}
        <Card className="mb-10">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <History size={20} />
               </div>
               <div>
                  <CardTitle>Histórico de Auditorias Consolidadas</CardTitle>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Visão Executiva de Fechamentos</p>
               </div>
             </div>
          </CardHeader>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead><tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Auditor','Sessão de Conferência','Duração Real','Total Itens'].map(h => (
                    <th key={h} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {historico.slice(0, 6).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs border-2 border-white shadow-sm">
                              {inv.responsavel.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[14px] font-black text-slate-800 tracking-tight">{inv.responsavel}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">REG: {inv.matricula}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-[13px] font-bold text-slate-700">{new Date(inv.iniciadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                         {inv.finalizadoEm && <p className="text-[10px] text-emerald-600 font-black tracking-widest uppercase mt-0.5">FECHADO às {new Date(inv.finalizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>}
                      </td>
                      <td className="px-8 py-6">
                         <Badge variant="blue" className="rounded-xl px-4 py-1.5 shadow-sm text-[10px] font-black">{getDuration(inv.iniciadoEm, inv.finalizadoEm)}</Badge>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                           <span className="text-xl font-black text-slate-900 font-mono-custom tabular-nums">{inv._count?.items ?? 0}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditados</span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>

    <MovementsDetailModal
      open={isMovementsModalOpen}
      onClose={() => setIsMovementsModalOpen(false)}
      movements={movements}
    />
    </>
  );
}