const { Router } = require('express');
const ctrl = require('./resources.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');

const router = Router();

// --- Public / Student Read Routes ---
router.get('/library', ctrl.getLibrary);
router.get('/exams', ctrl.getExams);
router.get('/grading', ctrl.getGrading);
router.get('/holidays', ctrl.getHolidays);

// --- Admin Management Routes (Protected) ---
router.use(verifyToken, requireRole('admin'));

// Library Management
router.post('/admin/library', ctrl.createLibrary);
router.put('/admin/library/:id', ctrl.updateLibrary);
router.delete('/admin/library/:id', ctrl.deleteLibrary);

// Exam Management
router.post('/admin/exams', ctrl.createExam);
router.put('/admin/exams/:id', ctrl.updateExam);
router.delete('/admin/exams/:id', ctrl.deleteExam);

// Grading Management
router.put('/admin/grading/component/:id', ctrl.updateGradingComponent);
router.post('/admin/grading/component', ctrl.updateGradingComponent); // For adding new component
router.delete('/admin/grading/component/:id', ctrl.deleteGradingComponent);

router.post('/admin/grading/scale', ctrl.createGradeScale);
router.put('/admin/grading/scale/:id', ctrl.updateGradeScale);
router.delete('/admin/grading/scale/:id', ctrl.deleteGradeScale);

// Holiday Management
router.post('/admin/holidays', ctrl.createHoliday);
router.put('/admin/holidays/:id', ctrl.updateHoliday);
router.delete('/admin/holidays/:id', ctrl.deleteHoliday);

module.exports = router;
