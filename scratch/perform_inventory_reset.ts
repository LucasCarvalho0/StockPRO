import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧨 Iniciando RESET TOTAL do inventário...");

  // 1. Limpar Movimentações
  const movements = await prisma.movement.deleteMany({});
  console.log(`✓ ${movements.count} movimentações removidas`);

  // 2. Limpar Itens de Nota Fiscal e Notas Fiscais
  const nfItems = await prisma.nfItem.deleteMany({});
  const nfs = await prisma.notaFiscalCliente.deleteMany({});
  console.log(`✓ ${nfItems.count} itens de NF e ${nfs.count} notas fiscais removidas`);

  // 3. Limpar Inventários e Itens de Inventário
  const invItems = await prisma.inventoryItem.deleteMany({});
  const invs = await prisma.inventory.deleteMany({});
  console.log(`✓ ${invItems.count} itens de inventário e ${invs.count} inventários removidos`);

  // 4. Limpar Alertas
  const alerts = await prisma.alert.deleteMany({});
  console.log(`✓ ${alerts.count} alertas removidos`);

  // 5. Zerar quantidades de todos os produtos
  const products = await prisma.product.updateMany({
    data: {
      quantidade: 0,
      quantidadeNG: 0
    }
  });
  console.log(`✓ ${products.count} produtos zerados (Estoque e NG)`);

  // 6. Registrar o log de reset
  await prisma.log.create({
    data: {
      action: "PRODUTO_EDITADO",
      descricao: "RESET TOTAL de inventário realizado para novo inventário físico",
      entidade: "SYSTEM"
    }
  });

  console.log("\n✅ RESET CONCLUÍDO! O sistema está pronto para um novo inventário físico.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
