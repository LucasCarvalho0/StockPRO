const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAlerts() {
  try {
    console.log('--- Iniciando limpeza de alertas ---');
    const deleted = await prisma.alert.deleteMany({});
    console.log(`Sucesso: ${deleted.count} alertas removidos.`);
  } catch (error) {
    console.error('Erro ao limpar alertas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAlerts();
