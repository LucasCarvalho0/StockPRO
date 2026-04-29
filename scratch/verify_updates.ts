import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const codes = ["BRPRT 70262", "MOV10", "SESE01"];
  for (const code of codes) {
    const p = await prisma.product.findUnique({ where: { codigo: code } });
    console.log(`${code}: ${p?.quantidade}`);
  }
}
main().finally(() => prisma.$disconnect());
