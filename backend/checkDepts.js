const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = await prisma.department.findMany();
  console.log('Departments:', depts);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
