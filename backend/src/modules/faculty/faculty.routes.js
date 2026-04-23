const { Router } = require('express');
const ctrl = require('./faculty.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');

const router = Router();
router.use(verifyToken, requireRole('faculty'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/courses', ctrl.getMyCourses);
router.get('/courses/:id/students', ctrl.getCourseStudents);
router.put('/courses/:id', ctrl.updateCourse);
router.get('/schedule', ctrl.getSchedule);

module.exports = router;
