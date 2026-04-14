const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllHistoricalData() {
  try {
    console.log('--- Iniciando limpeza TOTAL de históricos ---');

    // 1. Limpar itens de Notas Fiscais e Movimentações (dependentes)
    const delNfItems = await prisma.nfItem.deleteMany({});
    console.log(`- Itens de NF removidos: ${delNfItems.count}`);

    const delMovements = await prisma.movement.deleteMany({});
    console.log(`- Movimentações (Entradas/Saídas) removidas: ${delMovements.count}`);

    // 2. Limpar Notas Fiscais
    const delNfs = await prisma.notaFiscalCliente.deleteMany({});
    console.log(`- Notas Fiscais removidas: ${delNfs.count}`);

    // 3. Limpar Itens de Inventário e Inventários
    const delInvItems = await prisma.inventoryItem.deleteMany({});
    console.log(`- Itens de Inventário removidos: ${delInvItems.count}`);

    const delInventories = await prisma.inventory.deleteMany({});
    console.log(`- Inventários removidos: ${delInventories.count}`);

    // 4. Limpar Alertas e Logs
    const delAlerts = await prisma.alert.deleteMany({});
    console.log(`- Alertas removidos: ${delAlerts.count}`);

    const delLogs = await prisma.log.deleteMany({});
    console.log(`- Logs de sistema removidos: ${delLogs.count}`);

    console.log('--- Limpeza concluída com sucesso! ---');
    console.log('O sistema está limpo para um novo ciclo operacional.');

  } catch (error) {
    console.error('Erro crítico durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllHistoricalData();
