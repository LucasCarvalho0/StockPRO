'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, Badge, Button, PageHeader, PageLoading, Modal, ModalBody, ModalFooter, Input, Select } from '@/components/ui';
import { useUsers } from '@/hooks';
import { usersService } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import * as Lucide from 'lucide-react';
import type { User } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { UserModal } from '@/components/modals';

const schema = z.object({
  matricula: z.string().min(1, 'Obrigatório'),
  nome: z.string().min(2, 'Obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ESTOQUISTA', 'LIDER', 'ADMINISTRADOR']),
});

type FormData = z.infer<typeof schema>;

const roleLabels: Record<string, string> = {
  ESTOQUISTA: 'Estoquista',
  LIDER: 'Líder',
  ADMINISTRADOR: 'Administrador',
};

const roleBadge: Record<string, 'gray' | 'blue' | 'red'> = {
  ESTOQUISTA: 'gray',
  LIDER: 'blue',
  ADMINISTRADOR: 'red',
};

export default function UsuariosPage() {
  const { user: currentUser } = useAuthStore();
  const isMaster = currentUser?.matricula === '116221';

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: users = [], isLoading } = useUsers();
  const qc = useQueryClient();

  const handleNovoUsuario = () => {
    if (!isMaster) {
      alert('🚫 Ação restrita: Apenas o responsável geral (Lucas Carvalho) pode cadastrar novos usuários.');
      return;
    }
    setCreateModalOpen(true);
  };

  const [showEditPassword, setShowEditPassword] = useState(false);
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit, formState: { isSubmitting: isEditing } } = useForm<{ email: string; senha?: string }>();

  const onEditSubmit = async (data: { email: string; senha?: string }) => {
    if (!selectedUser) return;
    try {
      const payload = { ...data };
      if (!payload.senha) delete payload.senha;
      
      await usersService.update(selectedUser.id, payload);
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditModalOpen(false);
      resetEdit();
      setShowEditPassword(false);
    } catch {
      alert('Erro ao atualizar usuário');
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    resetEdit({ email: user.email, senha: '' });
    setShowEditPassword(false);
    setEditModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col gap-5">
        <PageHeader
          title="Usuários do Sistema"
          subtitle="Equipe Administrativa e Operacional"
          actions={
            isMaster && (
              <Button variant="primary" onClick={handleNovoUsuario}>
                <Lucide.Plus size={14} /> Novo Usuário
              </Button>
            )
          }
        />

        {!isMaster && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 shadow-sm">
            <Lucide.ShieldAlert size={20} className="text-amber-500 shrink-0" />
            <p className="text-sm font-medium">
              Apenas o responsável geral (**Lucas Carvalho**) tem permissão para cadastrar ou editar membros da equipe.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Usuários autorizados</CardTitle>
            <Badge variant="gray">{users.length} ativos</Badge>
          </CardHeader>

          {isLoading ? <PageLoading /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Matrícula', 'Nome', 'E-mail', 'Perfil', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono-custom">{h}</th>
                    ))}
                    {isMaster && <th className="text-left px-5 py-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono-custom">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-[12px] text-slate-500 font-mono-custom">{u.matricula}</td>
                      <td className="px-5 py-3 text-[13px] font-bold text-slate-800">{u.nome}</td>
                      <td className="px-5 py-3 text-[12px] text-slate-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <Badge variant={roleBadge[u.role]}>{roleLabels[u.role]}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.ativo ? 'green' : 'gray'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>
                      </td>
                      {isMaster && (
                        <td className="px-5 py-3 flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEdit(u)} className="text-[11px] font-bold">
                            Editar Dados
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Edição de E-mail */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Usuário / Resetar Senha">
        <form onSubmit={handleEdit(onEditSubmit)}>
          <ModalBody className="flex flex-col gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-2">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-1">Usuário selecionado</p>
              <p className="text-[14px] font-bold text-slate-800">{selectedUser?.nome}</p>
              <p className="text-[11px] text-slate-500 font-mono-custom">Matrícula: {selectedUser?.matricula} · Perfil: {selectedUser && roleLabels[selectedUser.role]}</p>
            </div>
            
            <Input label="E-mail" type="email" placeholder="email@exemplo.com" {...regEdit('email', { required: true })} />
            
            <div className="relative">
              <Input 
                label="Definir Nova Senha (deixe vazio para manter)" 
                type={showEditPassword ? 'text' : 'password'} 
                placeholder="Mínimo 6 caracteres"
                {...regEdit('senha')} 
              />
              <button
                type="button"
                onClick={() => setShowEditPassword(!showEditPassword)}
                className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600 transition-colors"
                title={showEditPassword ? 'Ocultar Senha' : 'Ver Senha'}
              >
                {showEditPassword ? <Lucide.EyeOff size={16} /> : <Lucide.Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 italic">* Se você não digitar nada no campo de senha, a senha atual do funcionário continuará a mesma.</p>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={isEditing}>Salvar Alterações</Button>
          </ModalFooter>
        </form>
      </Modal>
      <UserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </DashboardLayout>
  );
}
