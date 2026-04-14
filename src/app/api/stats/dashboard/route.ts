import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized, serverError } from '@/lib/auth';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  headers();
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    // 1. Gráfico de Movimentação (Últimos 7 Dias)
    const now = new Date();
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const start = startOfDay(d);
      const end = endOfDay(d);
      
      const movements = await prisma.movement.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: start, lte: end }
        },
        _sum: { quantidade: true }
      });

      const entradas = movements.find(m => m.type === 'ENTRADA')?._sum.quantidade || 0;
      const saidas = movements.find(m => m.type === 'SAIDA')?._sum.quantidade || 0;

      weeklyData.push({
        day: i,
        entradas,
        saidas,
        label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
          .replace(/^\w/, (c) => c.toUpperCase())
      });
    }

    // 2. Distribuição por Cliente
    const clientDistribution = await prisma.product.groupBy({
      by: ['clienteId'],
      where: { ativo: true },
      _sum: { quantidade: true }
    });

    const clients = await prisma.cliente.findMany({
      where: { id: { in: clientDistribution.map(c => c.clienteId!).filter(Boolean) } },
      select: { id: true, nome: true }
    });

    const distribution = clientDistribution.map(cd => {
      const client = clients.find(c => c.id === cd.clienteId);
      return {
        name: client?.nome || 'Sem Cliente',
        value: cd._sum.quantidade || 0
      };
    }).filter(d => d.value > 0);

    // 3. Saúde do Estoque
    const totalProducts = await prisma.product.count({ where: { ativo: true } });
    const criticalProducts = await prisma.product.count({
      where: { 
        ativo: true,
        OR: [
          { quantidade: 0 },
          { quantidade: { lte: prisma.product.fields.quantidadeMinima } }
        ]
      }
    });

    return Response.json({
      weeklyData,
      distribution,
      health: {
        total: totalProducts,
        critical: criticalProducts,
        ok: totalProducts - criticalProducts
      }
    });

  } catch (e) {
    return serverError('Erro ao gerar estatísticas do dashboard', e);
  }
}

export const dynamic = 'force-dynamic';
