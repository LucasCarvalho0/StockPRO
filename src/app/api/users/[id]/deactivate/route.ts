import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized, serverError, hasRole } from '@/lib/auth';
import { registrarLog } from '@/lib/helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    
    // RESTRIÇÃO: Apenas o Responsável Geral (Lucas Carvalho - 116221) pode desativar usuários
    if (user.matricula !== '116221') {
      return Response.json({ message: 'Acesso negado: Apenas o responsável geral pode gerenciar funcionários' }, { status: 403 });
    }

    const updated = await prisma.user.update({ where: { id: params.id }, data: { ativo: false } });
    await registrarLog({ action: 'USUARIO_EDITADO', descricao: `Usuário ${updated.nome} desativado`, entidade: 'User', entidadeId: params.id, userId: user.id });

    return Response.json({ message: 'Usuário desativado' });
  } catch (e) {
    return serverError();
  }
}

export const dynamic = 'force-dynamic';
