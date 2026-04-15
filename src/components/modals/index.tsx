'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter, Button, Input, Select, Textarea, InfoBanner } from '@/components/ui';
import { useCreateMovement, useProducts, useCreateProduct, useUpdateProduct, useSuppliers, useIniciarInventario, useCreateSupplier } from '@/hooks';
import { suppliersService, usersService } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import * as Lucide from 'lucide-react';
import type { Product, MovementType, Supplier } from '@/types';

// ─── Movement Modal ────────────────────────────────────────────────────────────
const movSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  quantidade: z.coerce.number().min(1, 'Mínimo 1'),
  notaFiscal: z.string().optional(),
  observacao: z.string().optional(),
});
type MovForm = z.infer<typeof movSchema>;

export function MovementModal({ 
  open, 
  onClose, 
  type, 
  preSelectedProductId,
  preFilledQuantity 
}: { 
  open: boolean; 
  onClose: () => void; 
  type: MovementType; 
  preSelectedProductId?: string;
  preFilledQuantity?: number;
}) {
  const { data: products = [] } = useProducts();
  const createMovement = useCreateMovement();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MovForm>({ 
    resolver: zodResolver(movSchema), 
    defaultValues: { 
      productId: preSelectedProductId ?? '',
      quantidade: preFilledQuantity ?? 0
    } 
  });

  useEffect(() => {
    if (open) {
      reset({ 
        productId: preSelectedProductId ?? '', 
        quantidade: preFilledQuantity ?? 0 
      });
    }
  }, [open, preSelectedProductId, preFilledQuantity, reset]);

  const onSubmit = async (data: MovForm) => {
    try { 
      await createMovement.mutateAsync({ ...data, type }); 
      reset(); 
      onClose(); 
    }
    catch (err: any) { 
      alert(err?.response?.data?.message ?? 'Erro ao registrar movimentação'); 
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={type === 'ENTRADA' ? 'Registrar Entrada (NF)' : 'Registrar Saída'}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="flex flex-col gap-4">
          <Select label="Produto" error={errors.productId?.message} {...register('productId')}>
            <option value="">Selecione...</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome} (Estoque: {p.quantidade} {p.unidade})</option>)}
          </Select>
          <Input label="Quantidade" type="number" min={1} error={errors.quantidade?.message} {...register('quantidade')} />
          {type === 'ENTRADA' && <Input label="Nota Fiscal" placeholder="NF-XXXXX" {...register('notaFiscal')} />}
          <Textarea label="Observações (opcional)" rows={2} {...register('observacao')} />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={createMovement.isPending}>Confirmar {type === 'ENTRADA' ? 'Entrada' : 'Saída'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Product Modal ─────────────────────────────────────────────────────────────
const prodSchema = z.object({
  codigo: z.string().min(1), nome: z.string().min(1), descricao: z.string().optional(),
  unidade: z.string().min(1), quantidade: z.coerce.number().min(0),
  quantidadeMinima: z.coerce.number().min(0), supplierId: z.string().min(1, 'Selecione fornecedor'),
});
type ProdForm = z.infer<typeof prodSchema>;

export function ProductModal({ open, onClose, product }: { open: boolean; onClose: () => void; product?: Product }) {
  const { data: suppliers = [] } = useSuppliers();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEdit = !!product;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProdForm>({ resolver: zodResolver(prodSchema) });

  useEffect(() => {
    if (product) reset({ codigo: product.codigo, nome: product.nome, descricao: product.descricao ?? '', unidade: product.unidade, quantidade: product.quantidade, quantidadeMinima: product.quantidadeMinima, supplierId: product.supplierId });
    else reset({ codigo: '', nome: '', descricao: '', unidade: 'un', quantidade: 0, quantidadeMinima: 0, supplierId: '' });
  }, [product, open]);

  const onSubmit = async (data: ProdForm) => {
    try {
      if (isEdit) await updateProduct.mutateAsync({ id: product!.id, data });
      else await createProduct.mutateAsync(data);
      onClose();
    } catch (err: any) { alert(err?.response?.data?.message ?? 'Erro ao salvar'); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Produto' : 'Novo Produto'} width="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Código" placeholder="EST-001" error={errors.codigo?.message} {...register('codigo')} disabled={isEdit} />
            <Input label="Unidade" placeholder="un / kg / l" error={errors.unidade?.message} {...register('unidade')} />
          </div>
          <Input label="Nome do Produto" error={errors.nome?.message} {...register('nome')} />
          <Textarea label="Descrição (opcional)" rows={2} {...register('descricao')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantidade" type="number" min={0} error={errors.quantidade?.message} {...register('quantidade')} />
            <Input label="Qtd Mínima" type="number" min={0} error={errors.quantidadeMinima?.message} {...register('quantidadeMinima')} />
          </div>
          <Select label="Fornecedor" error={errors.supplierId?.message} {...register('supplierId')}>
            <option value="">Selecione...</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={createProduct.isPending || updateProduct.isPending}>{isEdit ? 'Salvar' : 'Cadastrar'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Inventario Modal ──────────────────────────────────────────────────────────
const invSchema = z.object({ responsavel: z.string().min(2), matricula: z.string().min(1) });
type InvForm = z.infer<typeof invSchema>;

export function InventarioModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const iniciar = useIniciarInventario();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvForm>({ resolver: zodResolver(invSchema) });

  const onSubmit = async (data: InvForm) => {
    try { await iniciar.mutateAsync(data); reset(); onSuccess(); }
    catch (err: any) { alert(err?.response?.data?.message ?? 'Erro ao iniciar inventário'); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Iniciar Inventário Semanal">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="flex flex-col gap-4">
          <InfoBanner type="info">Apenas um inventário pode estar ativo por vez. O registro é permanente e imutável.</InfoBanner>
          <Input label="Nome do Responsável" placeholder="Nome completo" error={errors.responsavel?.message} {...register('responsavel')} />
          <Input label="Matrícula" placeholder="Ex: 4821" error={errors.matricula?.message} {...register('matricula')} />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={iniciar.isPending}>Iniciar Inventário</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Supplier Modal ────────────────────────────────────────────────────────────
const supSchema = z.object({
  nome: z.string().min(1), cnpj: z.string().optional(),
  email: z.string().email('Inválido').optional().or(z.literal('')),
  telefone: z.string().optional(), contato: z.string().optional(),
});
type SupForm = z.infer<typeof supSchema>;

export function SupplierModal({ open, onClose, supplier }: { open: boolean; onClose: () => void; supplier?: Supplier }) {
  const qc = useQueryClient();
  const createSupplier = useCreateSupplier();
  const isEdit = !!supplier;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupForm>({ resolver: zodResolver(supSchema) });

  useEffect(() => {
    if (supplier) reset({ nome: supplier.nome, cnpj: supplier.cnpj ?? '', email: supplier.email ?? '', telefone: supplier.telefone ?? '', contato: supplier.contato ?? '' });
    else reset({ nome: '', cnpj: '', email: '', telefone: '', contato: '' });
  }, [supplier, open]);

  const onSubmit = async (data: SupForm) => {
    try {
      if (isEdit) { await suppliersService.update(supplier!.id, data); qc.invalidateQueries({ queryKey: ['suppliers'] }); }
      else await createSupplier.mutateAsync(data);
      onClose();
    } catch (err: any) { alert(err?.response?.data?.message ?? 'Erro ao salvar fornecedor'); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'} width="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="flex flex-col gap-4">
          <Input label="Razão Social / Nome" error={errors.nome?.message} {...register('nome')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CNPJ" placeholder="00.000.000/0001-00" {...register('cnpj')} />
            <Input label="Telefone" {...register('telefone')} />
          </div>
          <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Nome do Contato" {...register('contato')} />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={createSupplier.isPending}>{isEdit ? 'Salvar' : 'Cadastrar'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── User Modal ────────────────────────────────────────────────────────────────
const userSchema = z.object({
  matricula: z.string().min(1), nome: z.string().min(2),
  email: z.string().email(), senha: z.string().min(6),
  role: z.enum(['ESTOQUISTA', 'LIDER', 'ADMINISTRADOR']),
});
type UserForm = z.infer<typeof userSchema>;

export function UserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserForm>({ resolver: zodResolver(userSchema), defaultValues: { role: 'ESTOQUISTA' } });

  const onSubmit = async (data: UserForm) => {
    try { await usersService.create(data); qc.invalidateQueries({ queryKey: ['users'] }); reset(); onClose(); }
    catch (err: any) { alert(err?.response?.data?.message ?? 'Erro ao criar usuário'); }
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Novo Usuário">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Matrícula" error={errors.matricula?.message} {...register('matricula')} />
            <Select label="Perfil" error={errors.role?.message} {...register('role')}>
              <option value="ESTOQUISTA">Estoquista</option>
              <option value="LIDER">Líder</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </Select>
          </div>
          <Input label="Nome Completo" error={errors.nome?.message} {...register('nome')} />
          <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
          
          <div className="relative">
            <Input 
              label="Senha inicial" 
              type={showPassword ? 'text' : 'password'} 
              error={errors.senha?.message} 
              {...register('senha')} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <Lucide.EyeOff size={16} /> : <Lucide.Eye size={16} />}
            </button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Criar Usuário</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Movements Detail Modal ───────────────────────────────────────────────────
export function MovementsDetailModal({ open, onClose, movements }: { 
  open: boolean; 
  onClose: () => void; 
  movements: any[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="Fluxo Logístico — Detalhamento Completo" width="max-w-5xl">
      <ModalBody className="p-0 overflow-hidden">
        {/* Header de resumo */}
        <div className="px-8 py-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Lucide.History size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-900 tracking-tight">Últimas Movimentações</p>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{movements.length} registros no sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {movements.filter((m: any) => m.type === 'ENTRADA').length} ENTRADAS
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {movements.filter((m: any) => m.type === 'SAIDA').length} SAÍDAS
            </span>
          </div>
        </div>

        {/* Lista de movimentações */}
        <div className="overflow-y-auto max-h-[65vh] divide-y divide-slate-50">
          {movements.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Lucide.PackageOpen size={36} className="text-slate-300" />
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            movements.map((m: any) => (
              <div key={m.id} className="group grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr] hover:bg-indigo-50/30 transition-all duration-200">
                {/* Material */}
                <div className="px-8 py-5 flex items-center gap-4 border-r border-slate-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${m.type === 'ENTRADA' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                    {m.type === 'ENTRADA'
                      ? <Lucide.PackagePlus size={16} strokeWidth={2.5} />
                      : <Lucide.PackageMinus size={16} strokeWidth={2.5} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-black text-slate-900 truncate group-hover:text-indigo-900 transition-colors">{m.product?.nome}</p>
                    <p className="text-[10px] font-black text-indigo-400 tracking-widest font-mono uppercase mt-0.5">{m.product?.codigo}</p>
                    {m.observacao ? (
                      <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <Lucide.MessageSquare size={12} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] font-semibold text-amber-800 leading-tight break-words">{m.observacao}</p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-300 italic mt-1">Sem observação</p>
                    )}
                  </div>
                </div>

                {/* Operação */}
                <div className="px-6 py-5 flex items-center border-r border-slate-50">
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border w-fit ${m.type === 'ENTRADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {m.type === 'ENTRADA' ? <Lucide.ArrowDownLeft size={10} /> : <Lucide.ArrowUpRight size={10} />}
                      {m.type}
                    </span>
                    {m.user && (
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Lucide.User size={10} />
                        {m.user.nome?.split(' ')[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantidade */}
                <div className="px-6 py-5 flex items-center border-r border-slate-50">
                  <div className="flex flex-col">
                    <span className={`text-2xl font-black font-mono tracking-tighter ${m.type === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.type === 'ENTRADA' ? '+' : '-'}{m.quantidade}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.product?.unidade}</span>
                  </div>
                </div>

                {/* Data/Hora */}
                <div className="px-6 py-5 flex items-center">
                  <div className="flex flex-col gap-1">
                    <p className="text-[13px] font-black text-slate-800">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                      <Lucide.Clock size={11} />
                      {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {m.notaFiscal && (
                      <p className="text-[10px] font-black text-indigo-500 tracking-widest flex items-center gap-1 mt-1">
                        <Lucide.FileText size={10} />
                        NF: {m.notaFiscal}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
      </ModalFooter>
    </Modal>
  );
}
