import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAlerts() {
  try {
    console.log('--- Iniciando limpeza de alertas ---');
    
    // Deletar todos os alertas
    const deleted = await prisma.alert.deleteMany({});
    
    console.log(`Sucesso: ${deleted.count} alertas removidos.`);
    console.log('O monitor de alertas agora está limpo para o novo inventário.');
    
  } catch (error) {
    console.error('Erro ao limpar alertas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAlerts();
