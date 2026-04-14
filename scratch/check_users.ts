import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { matricula: '116221' }
  });
  
  if (user) {
    console.log('User found:');
    console.log(JSON.stringify({ ...user, senha: '[HASHED]' }, null, 2));
  } else {
    console.log('User 116221 NOT found in database.');
    
    // List all users to see what we have
    const allUsers = await prisma.user.findMany({
      select: { matricula: true, nome: true, role: true, ativo: true }
    });
    console.log('\nAll users in DB:');
    console.log(JSON.stringify(allUsers, null, 2));
  }
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
