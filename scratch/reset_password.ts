import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const matricula = '116221';
  const novaSenha = 'Mudar@1162';
  
  const hash = await bcrypt.hash(novaSenha, 10);
  
  const updatedUser = await prisma.user.update({
    where: { matricula },
    data: { senha: hash }
  });
  
  console.log(`✅ Senha resetada com sucesso para: ${updatedUser.nome} (Matrícula: ${updatedUser.matricula})`);
  console.log(`🔑 Nova senha configurada: ${novaSenha}`);
}

resetPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
