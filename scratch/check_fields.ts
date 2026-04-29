import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("Fields exists?", !!(prisma.product as any).fields);
  process.exit(0);
}
main();
