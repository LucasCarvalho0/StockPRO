import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupHistory() {
  console.log('🧹 Iniciando limpeza do histórico de inventários (Saldos de estoque serão preservados)...');

  // 1. Limpar Itens de Inventário
  const deletedItems = await prisma.inventoryItem.deleteMany({});
  console.log(`✅ ${deletedItems.count} itens de sessões de inventário removidos.`);

  // 2. Limpar sessões de Inventário
  const deletedInventories = await prisma.inventory.deleteMany({});
  console.log(`✅ ${deletedInventories.count} sessões de inventário removidas.`);

  // 3. Registrar Log da Limpeza
  await prisma.log.create({
    data: {
      action: 'INVENTARIO_FINALIZADO',
      descricao: 'LIMPEZA HISTÓRICO: Histórico de inventário limpo para nova contagem. Saldos preservados.',
    }
  });

  // 4. Verificação de Saldo
  const totalStock = await prisma.product.aggregate({ _sum: { quantidade: true } });
  console.log(`📊 Saldo total de estoque preservado: ${totalStock._sum.quantidade}`);
  
  console.log('\n✨ Tudo limpo! A tela de inventário está pronta para amanhã.');
}

cleanupHistory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
