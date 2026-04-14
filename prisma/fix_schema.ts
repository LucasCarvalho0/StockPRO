import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Adicionando coluna "tipo" à tabela "alerts"...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE alerts 
      ADD COLUMN IF NOT EXISTS tipo "AlertType" NOT NULL DEFAULT 'ESTOQUE_BAIXO'
    `);

    console.log('Sucesso: Coluna "tipo" adicionada.');
  } catch (error) {
    console.error('Erro ao adicionar coluna:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
