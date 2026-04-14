'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardHeader, CardTitle, Badge, PageLoading, Button } from '@/components/ui';
import { 
  useProductStats, useAlertsResumo, useResumoHoje, 
  useMovements, useAlerts, useInventoryHistorico, 
  useSuppliers, useDashboardStats, useInventoryAtivo, useLogs
} from '@/hooks';
import { reportsService } from '@/services';
import { formatDateTime, cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  Package, AlertTriangle, Activity, Calendar, Truck, 
  TrendingUp, History, FileText, FileSpreadsheet, 
  Users, ChevronRight, CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

  if (isLoading) return <DashboardLayout><div className="p-6"><PageLoading /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col gap-8 fade-in max-w-[1600px] mx-auto">
        {/* Header Profissional com Ações */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                   <Activity size={20} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Executivo</h1>
              </div>
              <p className="text-slate-500 font-medium text-sm ml-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="secondary" 
                className="rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold gap-2 py-6 px-6"
                onClick={() => reportsService.excelEstoque().then(b => reportsService.download(b, `estoque-${new Date().toISOString().slice(0,10)}.xlsx`))}
              >
                <FileSpreadsheet size={18} className="text-emerald-600" />
                Planilha Geral
              </Button>
              <Button 
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 py-6 px-6 shadow-lg shadow-indigo-100"
                onClick={() => ultimoInv && reportsService.pdfInventario(ultimoInv.id).then(b => reportsService.download(b, `inventario-${ultimoInv.responsavel}.pdf`))}
                disabled={!ultimoInv}
              >
                <FileText size={18} />
                Último Relatório (PDF)
              </Button>
           </div>
        </div>

        {/* Grade de Métricas Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <StatCard 
            label="Estoque Total" 
            value={stats?.total ?? 0} 
            sub={`${dashStats?.health.ok ?? 0} itens estáveis`} 
            accent="#4f46e5" 
            icon={Package}
          />
          <StatCard 
            label="Alertas Críticos" 
            value={alertsResumo?.ativos ?? 0} 
            sub="Itens abaixo do mínimo" 
            accent="#ef4444" 
            icon={AlertTriangle}
            valueClass="text-3xl font-bold text-red-600"
          />
          <StatCard 
            label="Fluxo Hoje" 
            value={resumoHoje?.total ?? 0} 
            sub={`${resumoHoje?.entradas ?? 0} entradas / ${resumoHoje?.saidas ?? 0} saídas`} 
            accent="#f59e0b" 
            icon={TrendingUp}
            valueClass="text-3xl font-bold text-amber-600" 
          />
          <StatCard 
            label="Auditores Ativos" 
            value={invAtivo ? 1 : 0} 
            sub={invAtivo ? `Resp: ${invAtivo.responsavel}` : 'Aguardando início'} 
            accent="#10b981" 
            icon={CheckCircle2}
            valueClass="text-3xl font-bold text-emerald-600"
            footer={invAtivo ? (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                <Clock size={10} /> Em andamento
              </div>
            ) : undefined}
          />
          <StatCard 
            label="Último Ciclo" 
            value={ultimoInv ? new Date(ultimoInv.finalizadoEm!).toLocaleDateString('pt-BR') : '—'} 
            sub={ultimoInv ? `Auditado por ${ultimoInv.responsavel.split(' ')[0]}` : 'Nenhum registro'} 
            accent="#6366f1" 
            icon={Calendar}
            valueClass="text-[17px] font-bold text-indigo-700 mt-2 mb-1" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-6 px-8 flex flex-row items-center justify-between border-b border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                   <TrendingUp size={16} />
                 </div>
                 <CardTitle className="text-lg font-bold text-slate-800">Volume de Movimentação Semanal</CardTitle>
               </div>
               <Badge className="bg-blue-600 text-white rounded-lg border-none">Análise Dinâmica</Badge>
            </CardHeader>
            <div className="p-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashStats?.weeklyData} barGap={8}>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px', padding: '12px' }}
                  />
                  <Bar dataKey="entradas" name="Entradas" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-8 mt-6 justify-center text-[11px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-indigo-600 shadow-sm" /> Entradas (Volume)</span>
                <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" /> Saídas (Volume)</span>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-6 px-8 border-b border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                   <Users size={16} />
                 </div>
                 <CardTitle className="text-lg font-bold text-slate-800">Ocupação por Cliente</CardTitle>
               </div>
            </CardHeader>
            <div className="p-8 flex flex-col items-center justify-center min-h-[350px]">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={dashStats?.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashStats?.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                {dashStats?.distribution.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-slate-600 truncate">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-6 px-8 flex flex-row items-center justify-between border-b border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <History size={16} />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800">Tráfego de Mercadorias</CardTitle>
               </div>
               <Button variant="ghost" className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl gap-2">
                 Ver Tudo <ChevronRight size={14} />
               </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-50 bg-slate-50/30">
                  {['Produto','Operação','Volume','TimeStamp'].map((h) => (
                    <th key={h} className="text-left px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.slice(0, 6).map((m) => (
                    <tr key={m.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-8 py-5">
                         <p className="text-[13px] font-bold text-slate-800">{m.product.nome}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{m.product.codigo}</p>
                      </td>
                      <td className="px-8 py-5">
                         <Badge variant={m.type === 'ENTRADA' ? 'green' : 'red'} className="rounded-xl px-4 py-1.5 text-[10px] font-bold uppercase border-none">
                            {m.type}
                         </Badge>
                      </td>
                      <td className="px-8 py-5">
                         <span className={cn("text-[14px] font-bold font-mono-custom", m.type === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600')}>
                            {m.type === 'ENTRADA' ? '+' : '-'}{m.quantidade}
                         </span>
                         <span className="ml-1 text-[11px] text-slate-400 font-bold">{m.product.unidade}</span>
                      </td>
                      <td className="px-8 py-5 text-[11px] text-slate-400 font-bold">{formatDateTime(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-6 px-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                   <AlertTriangle size={16} />
                 </div>
                 <CardTitle className="text-lg font-bold text-slate-800">Atenção Crítica</CardTitle>
              </div>
            </CardHeader>
            <div className="divide-y divide-slate-50">
              {alertsAtivos.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-8 py-5 hover:bg-rose-50/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-black text-xs border border-rose-100">
                    {Math.round((a.quantidadeAtual / a.quantidadeMinima) * 100)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{a.product.nome}</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Qtd: <span className="text-red-500">{a.quantidadeAtual}</span> / Mín: {a.quantidadeMinima}</p>
                  </div>
                </div>
              ))}
              {alertsAtivos.length === 0 && (
                <div className="px-8 py-24 text-center">
                   <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <TrendingUp size={28} />
                   </div>
                   <p className="text-sm font-bold text-slate-600">Operação Segura</p>
                   <p className="text-xs text-slate-400 mt-1">Nenhum item abaixo do mínimo.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Linha do Tempo de Atividades Recentes (Auditoria Integrada) */}
        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 py-6 px-8 flex flex-row items-center justify-between border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                 <ShieldCheck size={20} />
               </div>
               <div>
                 <CardTitle className="text-lg font-bold text-slate-800">Pátio de Atividades em Tempo Real</CardTitle>
                 <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Registros de Auditoria e Operações</p>
               </div>
             </div>
             <Button 
               variant="outline" 
               className="rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
               onClick={() => window.location.href = '/auditoria'}
             >
               Ver Histórico Completo
             </Button>
          </CardHeader>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {logs.slice(0, 12).map((log: any) => (
                <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-slate-400 font-mono-custom uppercase">{new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <Badge variant="blue" className="text-[8px] px-2 py-0 border-none rounded-md opacity-60 uppercase">{log.action.replace(/_/g, ' ')}</Badge>
                     </div>
                     <p className="text-[12px] font-bold text-slate-700 leading-tight">
                        {log.user?.nome.split(' ')[0]} <span className="font-normal text-slate-500">{log.descricao}</span>
                     </p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">Aguardando novas atividades...</div>
              )}
            </div>
          </div>
        </Card>

        {/* Histórico Consolidado de Auditorias (Auditoria Integrada) */}
        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white mb-8">
          <CardHeader className="bg-slate-50/50 py-6 px-8 flex flex-row items-center justify-between border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                 <Calendar size={20} />
               </div>
               <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Relatórios de Auditoria Consolidados</CardTitle>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Histórico de fechamentos e duração</p>
               </div>
             </div>
          </CardHeader>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead><tr className="bg-slate-50/30 border-b border-slate-50">
                  {['Responsável','Início / Fim','Duração','Volume'].map(h => (
                    <th key={h} className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {historico.slice(0, 5).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                         <p className="text-[13px] font-bold text-slate-800">{inv.responsavel}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Mat: {inv.matricula}</p>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-[12px] font-bold text-slate-600">{new Date(inv.iniciadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                         {inv.finalizadoEm && <p className="text-[10px] text-emerald-600 font-bold tracking-tight">Fim: {new Date(inv.finalizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>}
                      </td>
                      <td className="px-8 py-5">
                         <Badge variant="blue" className="rounded-lg px-3 py-1 text-[10px] font-bold">{getDuration(inv.iniciadoEm, inv.finalizadoEm)}</Badge>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-[13px] font-black text-slate-400 font-mono-custom">{inv._count?.items ?? 0} Itens</span>
                      </td>
                    </tr>
                  ))}
                  {historico.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-medium">Nenhum inventário finalizado recentemente.</td></tr>
                  )}
                </tbody>
             </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}