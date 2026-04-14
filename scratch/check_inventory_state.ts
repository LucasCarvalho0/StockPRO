import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkState() {
  const invCont = await prisma.inventory.count();
  const itemCont = await prisma.inventoryItem.count();
  const prodCont = await prisma.product.count({ where: { quantidade: { gt: 0 } } });
  const totalStock = await prisma.product.aggregate({ _sum: { quantidade: true } });

  console.log(`Inventários: ${invCont}`);
  console.log(`Itens de Inventário: ${itemCont}`);
  console.log(`Produtos com estoque > 0: ${prodCont}`);
  console.log(`Soma total do estoque: ${totalStock._sum.quantidade || 0}`);
}

checkState()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
