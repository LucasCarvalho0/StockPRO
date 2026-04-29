import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  try {
    const p = await prisma.product.findFirst({
        where: { ativo: true },
        select: { quantidade: true, quantidadeMinima: true }
    });
    console.log("Sample product:", p);

    const criticalProducts = await prisma.product.count({
      where: { 
        ativo: true,
        OR: [
          { quantidade: 0 },
          { quantidade: { lte: (prisma.product as any).fields?.quantidadeMinima } }
        ]
      }
    });
    console.log("Critical products count:", criticalProducts);
    
    // Test without field reference
    const all = await prisma.product.count({ where: { ativo: true } });
    console.log("Total products:", all);

  } catch (e: any) {
    console.error("Error detected:", e.message);
  }
}
main().finally(() => prisma.$disconnect());
