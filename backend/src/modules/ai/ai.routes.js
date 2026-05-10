const { Router } = require('express');
const { handleGenerateSQL, handleRunQuery } = require('./ai.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');

const router = Router();

// Both endpoints require a logged-in admin
router.use(verifyToken, requireRole('admin'));

// POST /api/ai/generate-sql — Natural language → SQL
router.post('/generate-sql', handleGenerateSQL);

// POST /api/ai/run-query — Execute validated SELECT query
router.post('/run-query', handleRunQuery);

module.exports = router;
