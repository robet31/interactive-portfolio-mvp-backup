import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 4000;

// Security: Helmet - Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Security: Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGIN 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false, sslmode: 'require' } : false,
});

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

// ==================== UTILITY FUNCTIONS ====================

// Validate and sanitize ID parameter
function validateId(id: string): number | null {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

// Sanitize string input - prevent XSS
function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 10000); // Limit length
}

// Validate array input
function sanitizeArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.slice(0, 500))
    .slice(0, 50); // Max 50 items
}

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== EXPERIENCES ====================

app.get('/api/experiences', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, organization, period, description, type, image, images, start_date, array_to_string(tags, \',\') as tags_str FROM experiences ORDER BY start_date DESC'
    );
    const experiences = result.rows.map(row => {
      let imagesArray = [];
      if (row.images && Array.isArray(row.images)) {
        imagesArray = row.images;
      } else if (typeof row.images === 'string') {
        try {
          imagesArray = JSON.parse(row.images);
        } catch {
          imagesArray = [];
        }
      }
      return {
        id: row.id,
        title: row.title,
        organization: row.organization,
        period: row.period,
        description: row.description,
        type: row.type,
        image: row.image || (imagesArray.length > 0 ? imagesArray[0] : ''),
        images: imagesArray,
        tags: row.tags_str ? row.tags_str.split(',') : [],
        startDate: row.start_date,
      };
    });
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error.message);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// ==================== CERTIFICATIONS ====================

app.get('/api/certifications', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, organization, issue_date, expiry_date, credential_id, credential_url, image, skills FROM certifications'
    );
    const certifications = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      organization: row.organization,
      issueDate: row.issue_date ? String(row.issue_date).slice(0, 7) : '',
      expiryDate: row.expiry_date ? String(row.expiry_date).slice(0, 7) : '',
      credentialId: row.credential_id,
      credentialUrl: row.credential_url,
      image: row.image,
      skills: row.skills || [],
    }));
    res.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// ==================== PROJECTS ====================

app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, image, tags, link, category FROM projects'
    );
    const projects = result.rows.map(row => ({
      ...row,
      tags: row.tags || [],
    }));
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ==================== POSTS ====================

app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    const posts = result.rows.map(row => ({
      ...row,
      cover_image_url: row.cover_image_url,
      reading_time: row.reading_time,
    }));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/published', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching published posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length > 200) {
      return res.status(400).json({ error: 'Invalid slug' });
    }
    const result = await pool.query('SELECT * FROM posts WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ==================== POSTS CRUD ====================

// Create post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, slug, content, excerpt, cover_image_url, category, status, reading_time } = req.body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedSlug = sanitizeString(slug);
    const sanitizedContent = sanitizeString(content);
    const sanitizedExcerpt = sanitizeString(excerpt);
    
    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, excerpt, cover_image_url, category, status, reading_time, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [sanitizedTitle, sanitizedSlug, sanitizedContent, sanitizedExcerpt, cover_image_url, category || 'Jurnal & Catatan', status || 'draft', reading_time || 1]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const { title, slug, content, excerpt, cover_image_url, category, status, reading_time } = req.body;
    
    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedSlug = sanitizeString(slug);
    const sanitizedContent = sanitizeString(content);
    const sanitizedExcerpt = sanitizeString(excerpt);
    
    const result = await pool.query(
      `UPDATE posts SET title = $1, slug = $2, content = $3, excerpt = $4, cover_image_url = $5, category = $6, status = $7, reading_time = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [sanitizedTitle, sanitizedSlug, sanitizedContent, sanitizedExcerpt, cover_image_url, category, status, reading_time, parsedId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating post:', error.message);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await pool.query('DELETE FROM posts WHERE id = $1', [parsedId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ==================== EXPERIENCES CRUD ====================

// Create experience
app.post('/api/experiences', async (req, res) => {
  try {
    const { title, organization, period, description, type, image, images, start_date, tags } = req.body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const imageArray = Array.isArray(images) ? images.slice(0, 10) : (image ? [image] : []);
    const sanitizedTags = sanitizeArray(tags);
    
    const result = await pool.query(
      `INSERT INTO experiences (title, organization, period, description, type, image, images, start_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [sanitizeString(title), sanitizeString(organization), sanitizeString(period), sanitizeString(description), type || 'work', image || null, imageArray, start_date, sanitizedTags]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

// Update experience
app.put('/api/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const { title, organization, period, description, type, image, images, start_date, tags } = req.body;
    const imageArray = Array.isArray(images) ? images.slice(0, 10) : (image ? [image] : []);
    const sanitizedTags = sanitizeArray(tags);
    
    const result = await pool.query(
      `UPDATE experiences SET title = $1, organization = $2, period = $3, description = $4, type = $5, image = $6, images = $7, start_date = $8, tags = $9
       WHERE id = $10 RETURNING *`,
      [sanitizeString(title), sanitizeString(organization), sanitizeString(period), sanitizeString(description), type, image || null, imageArray, start_date, sanitizedTags, parsedId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating experience:', error.message);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// Delete experience
app.delete('/api/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await pool.query('DELETE FROM experiences WHERE id = $1', [parsedId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// ==================== PROJECTS CRUD ====================

// Create project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, image, tags, link, category } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const sanitizedTags = sanitizeArray(tags);
    
    const result = await pool.query(
      `INSERT INTO projects (title, description, image, tags, link, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [sanitizeString(title), sanitizeString(description), image, sanitizedTags, link, category || 'Web Development']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const { title, description, image, tags, link, category } = req.body;
    const sanitizedTags = sanitizeArray(tags);
    
    const result = await pool.query(
      `UPDATE projects SET title = $1, description = $2, image = $3, tags = $4, link = $5, category = $6
       WHERE id = $7 RETURNING *`,
      [sanitizeString(title), sanitizeString(description), image, sanitizedTags, link, category, parsedId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await pool.query('DELETE FROM projects WHERE id = $1', [parsedId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ==================== CERTIFICATIONS CRUD ====================

// Create certification
app.post('/api/certifications', async (req, res) => {
  try {
    let { name, organization, issueDate, expiryDate, credential_id, credential_url, image, skills } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (issueDate && issueDate.length === 7) {
      issueDate = issueDate + '-01';
    }
    if (expiryDate && expiryDate.length === 7) {
      expiryDate = expiryDate + '-01';
    }
    
    const sanitizedSkills = sanitizeArray(skills);
    
    const result = await pool.query(
      `INSERT INTO certifications (name, organization, issue_date, expiry_date, credential_id, credential_url, image, skills)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [sanitizeString(name), sanitizeString(organization), issueDate || null, expiryDate || null, credential_id, credential_url, image, sanitizedSkills]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

// Update certification
app.put('/api/certifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const { name, organization, issueDate, expiryDate, credentialId, credential_id, credentialUrl, credential_url, image, skills } = req.body;
    
    let issue_date = issueDate;
    let expiry_date = expiryDate;
    if (issueDate && issueDate.length === 7) {
      issue_date = issueDate + '-01';
    }
    if (expiryDate && expiryDate.length === 7) {
      expiry_date = expiryDate + '-01';
    }
    
    const credId = credentialId || credential_id;
    const credUrl = credentialUrl || credential_url;
    const sanitizedSkills = sanitizeArray(skills);
    
    const result = await pool.query(
      `UPDATE certifications SET name = $1, organization = $2, issue_date = $3, expiry_date = $4, credential_id = $5, credential_url = $6, image = $7, skills = $8
       WHERE id = $9 RETURNING *`,
      [sanitizeString(name), sanitizeString(organization), issue_date, expiry_date, credId, credUrl, image, sanitizedSkills, parsedId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating certification:', error.message);
    res.status(500).json({ error: 'Failed to update certification' });
  }
});

// Delete certification
app.delete('/api/certifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = validateId(id);
    if (!parsedId) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await pool.query('DELETE FROM certifications WHERE id = $1', [parsedId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({ error: 'Failed to delete certification' });
  }
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found', path: req.url });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
