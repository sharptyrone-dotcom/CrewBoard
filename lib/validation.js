/**
 * Input validation and sanitisation helpers.
 *
 * These functions validate and sanitise user input before it reaches the
 * database. They return { valid: true, data } on success or
 * { valid: false, error } on failure.
 */

// ── Sanitisation ────────────────────────────────────────────────────────────

const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|link|style|meta|base|applet)[^>]*>/gi;
const EVENT_ATTRS = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const DATA_URLS = /\bdata\s*:\s*[^,]*;base64/gi;

/**
 * Strip dangerous HTML tags and event handler attributes from text input.
 * Does NOT strip all HTML — only tags/attributes commonly used in XSS.
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(DANGEROUS_TAGS, '')
    .replace(EVENT_ATTRS, '')
    .replace(DATA_URLS, '')
    .trim();
}

/**
 * Strip all HTML tags from text input.
 */
export function stripTags(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

// ── Validators ──────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return EMAIL_RE.test(trimmed) && trimmed.length <= 254;
}

const ALLOWED_PRIORITIES = ['critical', 'important', 'routine'];

/**
 * Validate a notice payload.
 */
export function validateNotice({ title, body, category, priority }) {
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.trim().length > 200) {
    errors.push('Title must be 200 characters or fewer');
  }

  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    errors.push('Body is required');
  } else if (body.trim().length > 10000) {
    errors.push('Body must be 10,000 characters or fewer');
  }

  if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('. ') };
  }

  return {
    valid: true,
    data: {
      title: sanitizeHtml(title.trim()),
      body: sanitizeHtml(body.trim()),
      category: category ? sanitizeHtml(String(category).trim()) : undefined,
      priority: priority || 'routine',
    },
  };
}

/**
 * Validate a document payload.
 */
export function validateDocument({ title, department, type }) {
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.trim().length > 200) {
    errors.push('Title must be 200 characters or fewer');
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('. ') };
  }

  return {
    valid: true,
    data: {
      title: sanitizeHtml(title.trim()),
      department: department ? sanitizeHtml(String(department).trim()) : undefined,
      type: type ? sanitizeHtml(String(type).trim()) : undefined,
    },
  };
}

/**
 * Validate a training module payload.
 */
export function validateTraining({ title, pass_mark, questions }) {
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.trim().length > 200) {
    errors.push('Title must be 200 characters or fewer');
  }

  if (pass_mark !== undefined && pass_mark !== null) {
    const mark = Number(pass_mark);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      errors.push('Pass mark must be a number between 0 and 100');
    }
  }

  if (questions !== undefined) {
    if (!Array.isArray(questions)) {
      errors.push('Questions must be an array');
    } else {
      questions.forEach((q, i) => {
        if (!q.question_text || typeof q.question_text !== 'string') {
          errors.push(`Question ${i + 1} is missing question text`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question ${i + 1} must have at least 2 options`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('. ') };
  }

  return {
    valid: true,
    data: {
      title: sanitizeHtml(title.trim()),
      pass_mark: pass_mark !== undefined ? Number(pass_mark) : undefined,
      questions,
    },
  };
}

// ── File validation ─────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg',
]);
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.sh', '.bat', '.cmd', '.js', '.html', '.php', '.py', '.rb',
  '.msi', '.com', '.vbs', '.ps1', '.jar', '.war',
]);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Validate a file upload.
 */
export function validateFile(file) {
  if (!file || !file.name) {
    return { valid: false, error: 'No file provided' };
  }

  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type ${ext} is not allowed` };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type ${ext} is not supported. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}` };
  }

  if (file.size && file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }

  // Sanitise filename — strip path traversal and special characters
  const safeName = file.name
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  return { valid: true, data: { ...file, name: safeName } };
}
