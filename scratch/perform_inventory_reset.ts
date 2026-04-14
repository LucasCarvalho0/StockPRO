import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetInventory() {
  console.log('🚀 Iniciando reset geral de inventário...');

  // 1. Backup simples em log (Console)
  const totalItems = await prisma.product.aggregate({ _sum: { quantidade: true } });
  console.log(`📊 Saldo total antes do reset: ${totalItems._sum.quantidade}`);

  // 2. Limpar Itens de Inventário
  const deletedItems = await prisma.inventoryItem.deleteMany({});
  console.log(`✅ ${deletedItems.count} itens de sessões de inventário removidos.`);

  // 3. Limpar sessões de Inventário
  const deletedInventories = await prisma.inventory.deleteMany({});
  console.log(`✅ ${deletedInventories.count} sessões de inventário removidas.`);

  // 4. Limpar Alertas
  const deletedAlerts = await prisma.alert.deleteMany({});
  console.log(`✅ ${deletedAlerts.count} alertas de divergência/estoque baixo removidos.`);

  // 5. Zerar quantidades de produtos
  const updatedProducts = await prisma.product.updateMany({
    data: { quantidade: 0 }
  });
  console.log(`✅ Estoque de ${updatedProducts.count} produtos zerado com sucesso.`);

  // 6. Registrar Log do Reset
  await prisma.log.create({
    data: {
      action: 'INVENTARIO_FINALIZADO',
      descricao: 'RESET GERAL: Estoque zerado e histórico de inventário limpo para nova contagem.',
    }
  });

  console.log('\n✨ O sistema está pronto para o novo inventário de amanhã!');
}

resetInventory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
