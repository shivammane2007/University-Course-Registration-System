const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (facultyId) => {
  return prisma.faculty.findUnique({
    where: { faculty_id: Number(facultyId) },
    select: {
      faculty_id: true, user_id: true, first_name: true, last_name: true,
      phone_no: true, city: true, state: true, pincode: true, dob: true,
      gender: true, dept_id: true, designation: true, created_at: true,
      department: { select: { dept_name: true } },
    },
  });
};

const updateProfile = async (facultyId, data) => {
  const updateData = { ...data };
  if (data.dob) updateData.dob = new Date(data.dob);
  if (data.dept_id) updateData.dept_id = Number(data.dept_id);
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  else delete updateData.password;

  return prisma.faculty.update({
    where: { faculty_id: Number(facultyId) },
    data: updateData,
    select: {
      faculty_id: true, user_id: true, first_name: true, last_name: true,
      phone_no: true, city: true, state: true, pincode: true, dob: true,
      gender: true, dept_id: true, designation: true, created_at: true,
      department: { select: { dept_name: true } },
    },
  });
};

const getMyCourses = async (facultyId) => {
  const assignments = await prisma.courseFaculty.findMany({
    where: { faculty_id: Number(facultyId) },
    include: {
      course: {
        include: {
          department: { select: { dept_name: true } },
          _count: { select: { enrolments: { where: { status: 'Approved' } } } },
        },
      },
    },
  });
  return assignments.map((a) => a.course);
};

const getCourseStudents = async (facultyId, courseId) => {
  // Verify faculty is assigned to this course
  const assignment = await prisma.courseFaculty.findFirst({
    where: { faculty_id: Number(facultyId), course_id: Number(courseId) },
  });
  if (!assignment) throw Object.assign(new Error('Access denied to this course'), { statusCode: 403 });

  return prisma.enrolment.findMany({
    where: { course_id: Number(courseId) },
    include: {
      student: {
        select: { student_id: true, first_name: true, last_name: true, user_id: true, year_enrolled: true },
      },
    },
    orderBy: { enrolled_at: 'desc' },
  });
};

const updateCourse = async (facultyId, courseId, data) => {
  const assignment = await prisma.courseFaculty.findFirst({
    where: { faculty_id: Number(facultyId), course_id: Number(courseId) },
  });
  if (!assignment) throw Object.assign(new Error('Access denied to this course'), { statusCode: 403 });

  return prisma.course.update({
    where: { course_id: Number(courseId) },
    data: { course_name: data.course_name, timing: data.timing, duration: data.duration },
  });
};

const getSchedule = async (facultyId) => {
  const assignments = await prisma.courseFaculty.findMany({
    where: { faculty_id: Number(facultyId) },
    include: { course: { include: { department: { select: { dept_name: true } } } } },
  });
  return assignments.map((a) => ({
    course_id: a.course.course_id,
    course_name: a.course.course_name,
    mode: a.course.mode,
    timing: a.course.timing,
    platform: a.course.platform,
    college_name: a.course.college_name,
    dept_name: a.course.department.dept_name,
  }));
};

const createCourse = async (facultyId, data) => {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        course_name: data.course_name,
        dept_id: Number(data.dept_id),
        duration: data.duration,
        mode: data.mode,
        timing: data.timing,
        platform: data.platform,
        college_name: data.college_name,
        created_by_faculty: Number(facultyId),
        created_by_role: 'FACULTY',
        description: data.description,
      },
    });

    await tx.courseFaculty.create({
      data: {
        course_id: course.course_id,
        faculty_id: Number(facultyId),
      },
    });

    return course;
  });
};

const deleteCourse = async (facultyId, courseId) => {
  const course = await prisma.course.findUnique({
    where: { course_id: Number(courseId) },
    include: { courseFaculty: true },
  });

  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

  // Check if faculty is creator or assigned
  const isCreator = course.created_by_faculty === Number(facultyId);
  const isAssigned = course.courseFaculty.some((cf) => cf.faculty_id === Number(facultyId));

  if (!isCreator && !isAssigned) {
    throw Object.assign(new Error('Access denied to delete this course'), { statusCode: 403 });
  }

  return prisma.$transaction([
    prisma.enrolment.deleteMany({ where: { course_id: Number(courseId) } }),
    prisma.courseFaculty.deleteMany({ where: { course_id: Number(courseId) } }),
    prisma.course.delete({ where: { course_id: Number(courseId) } }),
  ]);
};

module.exports = { getProfile, updateProfile, getMyCourses, getCourseStudents, updateCourse, getSchedule, createCourse, deleteCourse };
