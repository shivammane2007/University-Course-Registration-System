const { Router } = require('express');
const ctrl = require('../controllers/attendanceController');
const verifyToken = require('../src/middleware/auth');
const requireRole = require('../src/middleware/role');

const router = Router();

// Student Routes
router.post('/student/attendance/mark', verifyToken, requireRole('student'), ctrl.markAttendance);
router.get('/student/attendance/history', verifyToken, requireRole('student'), ctrl.getStudentHistory);

// Faculty Routes
router.get('/faculty/attendance/course/:courseId', verifyToken, requireRole('faculty'), ctrl.getFacultyCourseAttendance);
router.get('/faculty/attendance/summary', verifyToken, requireRole('faculty'), ctrl.getFacultySummary);
router.patch('/faculty/attendance/:id', verifyToken, requireRole('faculty'), ctrl.updateAttendance);

module.exports = router;
