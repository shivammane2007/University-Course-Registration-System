const prisma = require('../src/config/db');
const { getIo } = require('../socket/index');

// Mark Attendance (Student)
const markAttendance = async (req, res) => {
  try {
    const { course_id } = req.body;
    const student_id = req.user.entity_id;

    // Fetch the student
    const student = await prisma.student.findUnique({
      where: { student_id }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if enrolled
    const enrolment = await prisma.enrolment.findUnique({
      where: {
        student_id_course_id: { student_id, course_id: parseInt(course_id) }
      }
    });

    if (!enrolment || enrolment.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Check if course has a scheduled faculty
    const courseFaculty = await prisma.courseFaculty.findFirst({
      where: { course_id: parseInt(course_id) },
      include: { course: true, faculty: true }
    });

    if (!courseFaculty) {
      return res.status(404).json({ success: false, message: 'Course has no assigned faculty' });
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    // Check if today is a holiday
    const holiday = await prisma.holiday.findFirst({
      where: {
        date: today,
        status: 'Active'
      }
    });

    if (holiday) {
      return res.status(400).json({ success: false, message: 'Attendance cannot be marked on holidays' });
    }

    // Check if already marked today
    const existing = await prisma.attendance.findUnique({
      where: {
        student_id_course_id_attendance_date: {
          student_id,
          course_id: parseInt(course_id),
          attendance_date: today
        }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already marked attendance today' });
    }

    // Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        student_id,
        course_id: parseInt(course_id),
        faculty_id: courseFaculty.faculty_id,
        attendance_date: today,
        status: 'Present',
        source: 'Student Self Marked'
      }
    });

    // Emit socket event to faculty
    try {
      const io = getIo();
      io.to(`faculty_${courseFaculty.faculty_id}`).emit('attendance_marked', {
        studentName: `${student.first_name} ${student.last_name}`,
        courseName: courseFaculty.course.course_name,
        facultyId: courseFaculty.faculty_id,
        time: attendance.marked_at,
        status: 'Present'
      });
    } catch (socketErr) {
      console.error('Socket error (non-fatal):', socketErr.message);
    }

    return res.status(201).json({ success: true, message: 'Attendance Marked Successfully', data: attendance });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Student Attendance History
const getStudentHistory = async (req, res) => {
  try {
    const student_id = req.user.entity_id;
    const history = await prisma.attendance.findMany({
      where: { student_id },
      include: { course: true, faculty: true },
      orderBy: { marked_at: 'desc' }
    });
    
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Course Attendance for Faculty
const getFacultyCourseAttendance = async (req, res) => {
  try {
    const faculty_id = req.user.entity_id;
    const { courseId } = req.params;
    const { date } = req.query;

    const whereClause = {
      faculty_id,
      course_id: parseInt(courseId)
    };

    if (date) {
       const [year, month, day] = date.split('-');
       const queryDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
       whereClause.attendance_date = queryDate;
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: { student: true, course: true },
      orderBy: { marked_at: 'desc' }
    });

    const enrolledStudents = await prisma.enrolment.findMany({
      where: {
        course_id: parseInt(courseId),
        status: 'Approved'
      },
      include: { student: true }
    });

    const presentStudentIds = attendance.map(a => a.student_id);
    const absent = enrolledStudents
      .filter(e => !presentStudentIds.includes(e.student_id))
      .map(e => ({
        id: `absent_${e.student_id}`,
        student: e.student,
        status: 'Absent',
        source: '-'
      }));

    res.status(200).json({ success: true, data: { present: attendance, absent } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Summary for Faculty
const getFacultySummary = async (req, res) => {
  try {
     const faculty_id = req.user.entity_id;
     const now = new Date();
     const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

     const records = await prisma.attendance.findMany({
       where: {
         faculty_id,
         attendance_date: today
       },
       include: { course: true, student: true },
       orderBy: { marked_at: 'desc' }
     });

     res.status(200).json({ success: true, data: records });
  } catch (error) {
     res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update attendance manually
const updateAttendance = async (req, res) => {
  try {
     const { id } = req.params;
     const { status } = req.body;
     const faculty_id = req.user.entity_id;

     const record = await prisma.attendance.update({
       where: { id: parseInt(id), faculty_id },
       data: { status }
     });
     
     res.status(200).json({ success: true, data: record });
  } catch (error) {
     res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  markAttendance,
  getStudentHistory,
  getFacultyCourseAttendance,
  getFacultySummary,
  updateAttendance
};
