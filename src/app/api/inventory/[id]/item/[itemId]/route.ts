import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized, notFound, badRequest, serverError } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } },
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const inventory = await prisma.inventory.findUnique({ where: { id: params.id } });
    if (!inventory) return notFound('Inventário não encontrado');
    if (inventory.status !== 'EM_ANDAMENTO') return badRequest('Inventário não está em andamento');

    const body = await req.json();
    
    const item = await prisma.inventoryItem.findUnique({ where: { id: params.itemId } });
    if (!item) return notFound('Item não encontrado');

    // Garantir que os valores sejam números válidos e inteiros para o Prisma
    let quantidadeContada = item.quantidadeContada;
    if (body.quantidadeContada !== undefined) {
      const parsed = parseInt(body.quantidadeContada);
      quantidadeContada = isNaN(parsed) ? 0 : parsed;
    }

    const observacao = body.observacao !== undefined ? body.observacao : item.observacao;
    
    // Se o body enviar 'conferido', usamos o valor. Caso contrário, assumimos que se houve PATCH é para marcar como conferido (comportamento legado)
    const conferido = body.conferido !== undefined ? body.conferido : true;
    
    // Divergência só faz sentido se o item foi conferido
    const divergencia = conferido ? (quantidadeContada - item.quantidadeSistema) : 0;

    const updated = await prisma.inventoryItem.update({
      where: { id: params.itemId },
      data: { 
        quantidadeContada, 
        divergencia, 
        conferido, 
        observacao 
      },
    });

    return Response.json(updated);
  } catch (e) {
    return serverError('Erro ao atualizar item do inventário', e);
  }
}

export const dynamic = 'force-dynamic';
