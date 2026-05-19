import { prisma } from "../src/lib/prisma";

async function verify() {
  try {
    // Run one read
    const user = await prisma.user.findFirst();
    console.log("✅ Connected");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  } finally {
    // Disconnect safely
    await prisma.$disconnect();
  }
}

verify();
