const prisma = require('./src/config/db');

async function test() {
  try {
    const student_id = 1; // Assuming student 1 exists
    const course_id = 1; // Assuming course 1 exists
    const faculty_id = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const att = await prisma.attendance.create({
      data: {
        student_id,
        course_id,
        faculty_id,
        attendance_date: today,
        status: 'Present',
        source: 'Test'
      }
    });
    console.log("create works:", att);
    
    await prisma.attendance.delete({ where: { id: att.id } });
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
