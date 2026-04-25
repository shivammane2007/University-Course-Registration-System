const service = require('./resources.service');

const wrap = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Library
const getLibrary = wrap((req) => service.getAllLibrary(req.query));
const createLibrary = wrap((req) => service.createLibrary(req.body));
const updateLibrary = wrap((req) => service.updateLibrary(req.params.id, req.body));
const deleteLibrary = wrap((req) => service.deleteLibrary(req.params.id));

// Exams
const getExams = wrap((req) => service.getAllExams(req.query));
const createExam = wrap((req) => service.createExam(req.body));
const updateExam = wrap((req) => service.updateExam(req.params.id, req.body));
const deleteExam = wrap((req) => service.deleteExam(req.params.id));

// Grading
const getGrading = wrap(async () => {
  const components = await service.getGradingRubric();
  const scales = await service.getGradeScales();
  return { components, scales };
});

const updateGradingComponent = wrap((req) => service.updateGradingRubric(req.params.id, req.body));
const deleteGradingComponent = wrap((req) => service.deleteGradingRubric(req.params.id));

const createGradeScale = wrap((req) => service.createGradeScale(req.body));
const updateGradeScale = wrap((req) => service.updateGradeScale(req.params.id, req.body));
const deleteGradeScale = wrap((req) => service.deleteGradeScale(req.params.id));

// Holidays
const getHolidays = wrap((req) => service.getAllHolidays(req.query));
const createHoliday = wrap((req) => service.createHoliday(req.body));
const updateHoliday = wrap((req) => service.updateHoliday(req.params.id, req.body));
const deleteHoliday = wrap((req) => service.deleteHoliday(req.params.id));

module.exports = {
  getLibrary, createLibrary, updateLibrary, deleteLibrary,
  getExams, createExam, updateExam, deleteExam,
  getGrading, updateGradingComponent, deleteGradingComponent,
  createGradeScale, updateGradeScale, deleteGradeScale,
  getHolidays, createHoliday, updateHoliday, deleteHoliday
};
