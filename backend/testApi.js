const prisma = require('./src/config/db');

async function run() {
  const records = await prisma.attendance.findMany();
  console.log(records.map(r => r.attendance_date.toISOString()));
}
run();
