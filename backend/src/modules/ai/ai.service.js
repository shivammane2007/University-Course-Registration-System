const prisma = require('../../config/db');


// ─── Exact DB Schema Context for the AI ─────────────────────────
// Table names from schema.prisma @@map values
const SCHEMA_CONTEXT = `
You are a MySQL expert for a University Course Registration System (UCRS).
Generate ONLY valid MySQL SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, or any destructive SQL.

Database schema (MySQL table names):

Table: students
Columns: student_id (INT PK), user_id (VARCHAR, PRN number), first_name (VARCHAR), last_name (VARCHAR),
         dob (DATE), gender (ENUM: Male/Female/Other), phone_no (VARCHAR), city, state, pincode,
         address, guardian_name, alt_phone, emergency_contact, blood_group,
         year_enrolled (YEAR), dept_id (INT FK->departments), created_at (DATETIME)

Table: faculties
Columns: faculty_id (INT PK), user_id (VARCHAR), first_name (VARCHAR), last_name (VARCHAR),
         dob (DATE), gender (ENUM: Male/Female/Other), address (TEXT), domain (VARCHAR),
         designation (VARCHAR), contact_no (VARCHAR), dept_id (INT FK->departments), created_at (DATETIME)

Table: departments
Columns: dept_id (INT PK), dept_name (VARCHAR)

Table: courses
Columns: course_id (INT PK), course_name (VARCHAR), dept_id (INT FK->departments),
         duration (VARCHAR), mode (ENUM: Online/Offline), platform (VARCHAR), college_name (VARCHAR),
         timing (VARCHAR), created_by (INT FK->administrators), created_by_faculty (INT FK->faculties),
         created_by_role (VARCHAR: ADMIN/FACULTY), created_at (DATETIME), isActive (BOOLEAN)

Table: enrolments
Columns: enrolment_id (INT PK), student_id (INT FK->students), course_id (INT FK->courses),
         status (ENUM: Pending/Approved/Dropped), enrolled_at (DATETIME)

Table: course_faculty
Columns: id (INT PK), course_id (INT FK->courses), faculty_id (INT FK->faculties)

Table: holidays
Columns: id (INT PK), title (VARCHAR), date (DATE), type (VARCHAR), description (TEXT), status (VARCHAR)

Table: library_resources
Columns: id (INT PK), title (VARCHAR), subject (VARCHAR), author (VARCHAR), category (VARCHAR),
         description (TEXT), fileUrl (VARCHAR), status (VARCHAR), uploaded_by_faculty_id (INT FK->faculties),
         uploaded_by_name (VARCHAR), created_at (DATETIME), updated_at (DATETIME)

Table: exam_schedules
Columns: id (INT PK), subjectCode (VARCHAR), subjectName (VARCHAR), semester (VARCHAR),
         examDate (DATE), startTime (VARCHAR), duration (VARCHAR), hall (VARCHAR), status (VARCHAR)

Table: attendances
Columns: id (INT PK), student_id (INT FK->students), course_id (INT FK->courses),
         faculty_id (INT FK->faculties), attendance_date (DATE), marked_at (DATETIME),
         status (ENUM: Present/Absent/Late), source (VARCHAR)

Table: schedules
Columns: id (INT PK), faculty_id (INT FK->faculties), course_id (INT FK->courses),
         days (VARCHAR), start_time (VARCHAR), end_time (VARCHAR), mode (ENUM: Online/Offline),
         venue (VARCHAR), note (TEXT), updated_at (DATETIME)

CRITICAL RULES:
1. Output ONLY the raw SQL query — no markdown, no explanation, no backticks, no code blocks.
2. Always use exact table names as listed above (e.g., "enrolments" NOT "enrollments").
3. Always add LIMIT 50 at the end unless the query uses COUNT(*) or aggregate-only.
4. Use MySQL syntax only (CURDATE(), NOW(), DATE(), MONTH(), YEAR() etc).
5. For "today" use DATE(enrolled_at) = CURDATE() or DATE(created_at) = CURDATE().
6. For student enrolment queries, JOIN enrolments with students using student_id.
7. Never use table names that are not in the schema above.
`;

// ─── Security Validator ──────────────────────────────────────────
const BLOCKED_KEYWORDS = ['delete', 'update', 'insert', 'drop', 'alter', 'truncate', 'create', 'replace', 'merge', 'exec', 'execute', 'grant', 'revoke'];

function validateSQL(sql) {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, reason: 'Empty or invalid query.' };
  }

  const trimmed = sql.trim();
  const lower = trimmed.toLowerCase();

  if (!lower.startsWith('select')) {
    return { valid: false, reason: 'Only SELECT queries are allowed.' };
  }

  for (const keyword of BLOCKED_KEYWORDS) {
    // Match as whole word to avoid false positives (e.g. "selected")
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(trimmed)) {
      return { valid: false, reason: `Forbidden keyword detected: ${keyword.toUpperCase()}. Only read-only SELECT queries are allowed.` };
    }
  }

  return { valid: true };
}

// ─── Ensure LIMIT 50 ────────────────────────────────────────────
function ensureLimit(sql) {
  const lower = sql.toLowerCase();
  // If already has LIMIT, don't add another
  if (lower.includes('limit')) return sql;
  // If pure aggregate (COUNT/SUM/AVG with no GROUP BY), skip limit
  const isAggregate = /^\s*select\s+(count|sum|avg|min|max)\s*\(/i.test(sql) && !lower.includes('group by');
  if (isAggregate) return sql;
  // Remove trailing semicolon, add LIMIT, re-add semicolon
  const withoutSemicolon = sql.trim().replace(/;+$/, '');
  return `${withoutSemicolon} LIMIT 50`;
}

// ─── Generate SQL via Gemini REST API (v1 — no SDK version issues) ──────────
async function generateSQL(naturalQuery) {
  if (!naturalQuery || !naturalQuery.trim()) {
    throw new Error('Natural language query is required.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in .env');

  const prompt = `${SCHEMA_CONTEXT}\n\nUser Question: "${naturalQuery.trim()}"\n\nSQL Query:`;

  // Use v1beta REST API — required for Gemini 2.x models
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let friendly = `Gemini API error (${response.status}).`;
    if (response.status === 429) friendly = 'Gemini API rate limit reached. Please wait a moment and try again.';
    if (response.status === 401 || response.status === 403) friendly = 'Invalid Gemini API key. Please update GEMINI_API_KEY in backend/.env';
    if (response.status === 404) friendly = 'Gemini model not available. Check your API key has Generative AI access.';
    throw new Error(`${friendly} Details: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  let sql = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

  if (!sql) throw new Error('AI returned an empty response. Try rephrasing your question.');

  // Strip markdown code fences if Gemini returns them
  sql = sql
    .replace(/^```sql\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const validation = validateSQL(sql);
  if (!validation.valid) {
    throw new Error(`AI generated an unsafe query. ${validation.reason}`);
  }

  return ensureLimit(sql);
}

// ─── Execute Raw Query via Prisma ────────────────────────────────
async function runQuery(sql) {
  const validation = validateSQL(sql);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const safeSql = ensureLimit(sql.trim());

  // Execute using Prisma raw query (read-only SELECT guaranteed by validation)
  const results = await prisma.$queryRawUnsafe(safeSql);

  // Prisma returns BigInt for COUNT — convert to Number for JSON serialization
  const serialized = results.map((row) => {
    const clean = {};
    for (const [key, value] of Object.entries(row)) {
      clean[key] = typeof value === 'bigint' ? Number(value) : value;
    }
    return clean;
  });

  return serialized;
}

module.exports = { generateSQL, runQuery, validateSQL };
