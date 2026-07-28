const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@plancraft.ai' }
  });

  if (!user) {
    console.log('User not found!');
    return;
  }
  console.log('User found:', user.email);
  console.log('User hashed password:', user.password);

  const isValid = await bcrypt.compare('demo123', user.password);
  console.log('Password valid:', isValid);
}

main().catch(console.error).finally(() => prisma.$disconnect());
