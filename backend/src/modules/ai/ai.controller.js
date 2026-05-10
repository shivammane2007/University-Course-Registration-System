const { generateSQL, runQuery } = require('./ai.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// POST /api/ai/generate-sql
const handleGenerateSQL = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return sendError(res, 'Query is required.', [], 400);
    }
    const sql = await generateSQL(query.trim());
    return sendSuccess(res, { sql });
  } catch (error) {
    console.error('[AI] generateSQL error:', error.message);
    
    let userMessage = error.message;
    if (error.message.includes('429') || error.message.includes('Quota exceeded')) {
      userMessage = 'Gemini API quota exceeded (429). Please wait a few seconds or check your API key limits in Google AI Studio.';
    }
    
    return sendError(res, userMessage || 'Failed to generate SQL.', [], 500);
  }
};

// POST /api/ai/run-query
const handleRunQuery = async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || !sql.trim()) {
      return sendError(res, 'SQL query is required.', [], 400);
    }
    const results = await runQuery(sql.trim());
    return sendSuccess(res, { results, count: results.length });
  } catch (error) {
    console.error('[AI] runQuery error:', error.message);
    return sendError(res, error.message || 'Query execution failed.', [], 400);
  }
};

module.exports = { handleGenerateSQL, handleRunQuery };
