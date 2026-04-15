import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized, serverError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();
    if (user.role !== 'ADMINISTRADOR') {
      return Response.json({ message: 'Acesso negado. Apenas administradores podem realizar backup.' }, { status: 403 });
    }

    // Exportar todos os dados essenciais
    const [products, movements, suppliers, clientes, inventory, inventoryItems, alerts, users] = await Promise.all([
      prisma.product.findMany({ include: { supplier: true, cliente: true } }),
      prisma.movement.findMany({ include: { product: { select: { codigo: true, nome: true } }, user: { select: { nome: true, matricula: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.supplier.findMany(),
      prisma.cliente.findMany(),
      prisma.inventory.findMany({ orderBy: { iniciadoEm: 'desc' } }),
      prisma.inventoryItem.findMany({ include: { product: { select: { codigo: true, nome: true } } } }),
      prisma.alert.findMany({ include: { product: { select: { codigo: true, nome: true } } } }),
      prisma.user.findMany({ select: { matricula: true, nome: true, email: true, role: true, ativo: true, createdAt: true } }),
    ]);

    const backup = {
      metadata: {
        sistema: 'StockPRO',
        versao: '1.0',
        geradoEm: new Date().toISOString(),
        geradoPor: user.nome,
        totalRegistros: {
          produtos: products.length,
          movimentacoes: movements.length,
          fornecedores: suppliers.length,
          clientes: clientes.length,
          inventarios: inventory.length,
          itensInventario: inventoryItems.length,
          alertas: alerts.length,
          usuarios: users.length,
        },
      },
      dados: {
        products,
        movements,
        suppliers,
        clientes,
        inventory,
        inventoryItems,
        alerts,
        users,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const filename = `stockpro-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return serverError('Erro ao gerar backup', e);
  }
}

export const dynamic = 'force-dynamic';
