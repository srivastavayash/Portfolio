/**
 * yashOS — Cloudflare Worker
 * TypeScript + D1 SQLite
 *
 * Deploy: wrangler deploy
 * Dev:    wrangler dev
 *
 * wrangler.toml must have:
 *   [[d1_databases]]
 *   binding = "DB"
 *   database_name = "yashos-db"
 *   database_id = "<your-d1-id>"
 */

// ─── TYPES ────────────────────────────────────────────────
interface Env {
  DB: D1Database;
  JWT_SECRET: string;       // Cloudflare secret
  ADMIN_PASSWORD_HASH: string; // bcrypt hash stored as secret
}

interface BlogRow {
  id: number; slug: string; title: string; excerpt: string;
  content: string; tags: string; read_time: number;
  featured: number; published: number; views: number;
  created_at: string; updated_at: string;
}

interface DSARow {
  id: number; slug: string; name: string; topic: string;
  difficulty: string; status: string; platform: string;
  problem_url: string; approach: string;
  time_complexity: string; space_complexity: string;
  notes: string; solved_at: string;
}

interface FinanceRow {
  id: number; ticker: string; company_name: string; sector: string;
  market_cap: string; research_notes: string; long_term_thesis: string;
  risks: string; verdict: string; conviction: number;
  last_reviewed: string;
}

interface LifeLogRow {
  id: number; type: string; period_label: string;
  date_start: string; date_end: string; goals: string;
  reflection: string; score: number; is_current: number;
}

// ─── HELPERS ──────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}

function jsonError(message: string, status = 400): Response {
  return json({ error: message }, status);
}

// Simple rate limiting via KV (or just headers check for now)
function getRateLimitKey(req: Request, prefix: string): string {
  const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
  return `${prefix}:${ip}`;
}

// Hash IP for privacy-safe storage
async function hashIP(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + 'yashos-salt'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// Simple JWT (using Web Crypto — no external libs)
async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${header}.${body}.${sigB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const [header, body, sig] = token.split('.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, Uint8Array.from(atob(sig), c => c.charCodeAt(0)), new TextEncoder().encode(`${header}.${body}`));
    if (!valid) return null;
    const payload = JSON.parse(atob(body));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

async function requireAdmin(req: Request, env: Env): Promise<Record<string, unknown> | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyJWT(auth.slice(7), env.JWT_SECRET);
}

// Sanitize input
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 10000);
}

// ─── ROUTER ───────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      // ── PUBLIC ROUTES ──────────────────────────────────

      // Health check
      if (path === '/api/health' && method === 'GET') {
        return json({ status: 'ok', ts: new Date().toISOString() });
      }

      // ── BLOGS ──────────────────────────────────────────
      if (path === '/api/blogs' && method === 'GET') {
        const featured = url.searchParams.get('featured');
        const tag = url.searchParams.get('tag');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
        const offset = (page - 1) * limit;

        let query = 'SELECT id,slug,title,excerpt,tags,read_time,featured,views,created_at FROM blogs WHERE published=1';
        const params: unknown[] = [];

        if (featured === 'true') { query += ' AND featured=1'; }
        if (tag) { query += ' AND tags LIKE ?'; params.push(`%"${tag}"%`); }

        query += ' ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const { results } = await env.DB.prepare(query).bind(...params).all<BlogRow>();
        const total = await env.DB.prepare('SELECT COUNT(*) as n FROM blogs WHERE published=1').first<{ n: number }>();

        return json({
          data: results.map(r => ({ ...r, tags: JSON.parse(r.tags) })),
          pagination: { page, limit, total: total?.n || 0 },
        });
      }

      if (path.startsWith('/api/blogs/') && method === 'GET') {
        const slug = path.split('/')[3];
        const post = await env.DB.prepare('SELECT * FROM blogs WHERE slug=? AND published=1').bind(slug).first<BlogRow>();
        if (!post) return jsonError('Not found', 404);

        // Increment view count
        await env.DB.prepare('UPDATE blogs SET views=views+1 WHERE id=?').bind(post.id).run();

        return json({ ...post, tags: JSON.parse(post.tags) });
      }

      // ── DSA ────────────────────────────────────────────
      if (path === '/api/dsa' && method === 'GET') {
        const topic = url.searchParams.get('topic');
        const diff = url.searchParams.get('difficulty');
        const status = url.searchParams.get('status');

        let query = 'SELECT * FROM dsa_problems WHERE 1=1';
        const params: unknown[] = [];

        if (topic) { query += ' AND topic=?'; params.push(topic); }
        if (diff) { query += ' AND difficulty=?'; params.push(diff); }
        if (status) { query += ' AND status=?'; params.push(status); }

        query += ' ORDER BY solved_at DESC';

        const { results } = await env.DB.prepare(query).bind(...params).all<DSARow>();
        return json({ data: results });
      }

      if (path === '/api/dsa/stats' && method === 'GET') {
        const total = await env.DB.prepare('SELECT COUNT(*) as n FROM dsa_problems').first<{ n: number }>();
        const easy = await env.DB.prepare("SELECT COUNT(*) as n FROM dsa_problems WHERE difficulty='easy'").first<{ n: number }>();
        const medium = await env.DB.prepare("SELECT COUNT(*) as n FROM dsa_problems WHERE difficulty='medium'").first<{ n: number }>();
        const hard = await env.DB.prepare("SELECT COUNT(*) as n FROM dsa_problems WHERE difficulty='hard'").first<{ n: number }>();
        const solved = await env.DB.prepare("SELECT COUNT(*) as n FROM dsa_problems WHERE status='solved'").first<{ n: number }>();
        return json({ total: total?.n || 0, easy: easy?.n || 0, medium: medium?.n || 0, hard: hard?.n || 0, solved: solved?.n || 0 });
      }

      // ── FINANCE ────────────────────────────────────────
      if (path === '/api/finance' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM finance_entries WHERE published=1 ORDER BY created_at DESC'
        ).all<FinanceRow>();
        return json({ data: results.map(r => ({ ...r, risks: JSON.parse(r.risks) })) });
      }

      // ── LIFE LOGS ──────────────────────────────────────
      if (path === '/api/lifelogs' && method === 'GET') {
        const type = url.searchParams.get('type') || 'weekly';
        const { results } = await env.DB.prepare(
          'SELECT * FROM life_logs WHERE type=? AND published=1 ORDER BY date_start DESC LIMIT 20'
        ).bind(type).all<LifeLogRow>();
        return json({
          data: results.map(r => ({ ...r, goals: JSON.parse(r.goals) })),
        });
      }

      if (path === '/api/lifelogs/stats' && method === 'GET') {
        const weeks = await env.DB.prepare("SELECT COUNT(*) as n FROM life_logs WHERE type='weekly'").first<{ n: number }>();
        const goals = await env.DB.prepare("SELECT SUM(json_array_length(goals)) as n FROM life_logs").first<{ n: number }>();
        return json({ weeks: weeks?.n || 0, goals: goals?.n || 0 });
      }

      // Log reactions
      if (path.match(/^\/api\/lifelogs\/\d+\/react$/) && method === 'POST') {
        const logId = parseInt(path.split('/')[3]);
        const body = await req.json() as { emoji: string };
        if (!['🔥', '💪', '🧠', '👀'].includes(body.emoji)) return jsonError('Invalid emoji');

        const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
        const ipHash = await hashIP(ip);

        try {
          await env.DB.prepare(
            'INSERT INTO log_reactions (log_id, emoji, ip_hash) VALUES (?,?,?)'
          ).bind(logId, body.emoji, ipHash).run();
          return json({ ok: true });
        } catch {
          // Already reacted
          await env.DB.prepare(
            'DELETE FROM log_reactions WHERE log_id=? AND emoji=? AND ip_hash=?'
          ).bind(logId, body.emoji, ipHash).run();
          return json({ ok: true, removed: true });
        }
      }

      // Reaction counts for a log
      if (path.match(/^\/api\/lifelogs\/\d+\/reactions$/) && method === 'GET') {
        const logId = parseInt(path.split('/')[3]);
        const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
        const ipHash = await hashIP(ip);

        const { results } = await env.DB.prepare(
          'SELECT emoji, COUNT(*) as count FROM log_reactions WHERE log_id=? GROUP BY emoji'
        ).bind(logId).all<{ emoji: string; count: number }>();

        const myReactions = await env.DB.prepare(
          'SELECT emoji FROM log_reactions WHERE log_id=? AND ip_hash=?'
        ).bind(logId, ipHash).all<{ emoji: string }>();

        return json({
          counts: Object.fromEntries(results.map(r => [r.emoji, r.count])),
          mine: myReactions.results.map(r => r.emoji),
        });
      }

      // ── CONTACT ────────────────────────────────────────
      if (path === '/api/contact' && method === 'POST') {
        const body = await req.json() as { name: string; email: string; type: string; message: string };

        if (!body.name || !body.email || !body.message) return jsonError('Missing fields');
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(body.email)) return jsonError('Invalid email');

        const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
        const ipHash = await hashIP(ip);

        // Rate limit: max 3 messages per IP per hour
        const hourAgo = new Date(Date.now() - 3600000).toISOString();
        const recent = await env.DB.prepare(
          'SELECT COUNT(*) as n FROM contact_messages WHERE ip_hash=? AND created_at > ?'
        ).bind(ipHash, hourAgo).first<{ n: number }>();

        if ((recent?.n || 0) >= 3) return jsonError('Rate limit exceeded. Try again later.', 429);

        await env.DB.prepare(
          'INSERT INTO contact_messages (name,email,type,message,ip_hash) VALUES (?,?,?,?,?)'
        ).bind(
          sanitize(body.name),
          sanitize(body.email),
          sanitize(body.type || 'other'),
          sanitize(body.message),
          ipHash
        ).run();

        return json({ ok: true, message: 'Message received.' });
      }

      // ── PROJECTS (public) ──────────────────────────────
      if (path === '/api/projects' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id,slug,num,name,tagline,stack,tags,status,sort_order FROM projects ORDER BY sort_order ASC'
        ).all();
        return json({ data: results });
      }

      if (path.startsWith('/api/projects/') && method === 'GET') {
        const slug = path.split('/')[3];
        const proj = await env.DB.prepare('SELECT * FROM projects WHERE slug=?').bind(slug).first();
        if (!proj) return jsonError('Not found', 404);
        return json(proj);
      }

      // ── PAGE ANALYTICS ────────────────────────────────
      if (path === '/api/analytics/pageview' && method === 'POST') {
        const body = await req.json() as { path: string; referrer?: string };
        const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
        const ua = req.headers.get('User-Agent') || '';
        const uaHash = await hashIP(ua);
        const country = req.headers.get('CF-IPCountry') || '';

        await env.DB.prepare(
          'INSERT INTO page_views (path,referrer,ua_hash,country) VALUES (?,?,?,?)'
        ).bind(sanitize(body.path), sanitize(body.referrer || ''), uaHash, country).run();

        return json({ ok: true });
      }

      // ── ADMIN ROUTES ───────────────────────────────────

      // Admin login
      if (path === '/api/admin/login' && method === 'POST') {
        const body = await req.json() as { username: string; password: string };
        const user = await env.DB.prepare(
          'SELECT * FROM admin_users WHERE username=?'
        ).bind(sanitize(body.username)).first<{ id: number; username: string; password_hash: string }>();

        if (!user) return jsonError('Invalid credentials', 401);

        // NOTE: In production, use proper bcrypt verification
        // For Cloudflare Workers, use a WASM bcrypt or compare via env secret
        // This is a placeholder — replace with real bcrypt check
        const passwordMatch = body.password === env.ADMIN_PASSWORD_HASH; // REPLACE with bcrypt.compare
        if (!passwordMatch) return jsonError('Invalid credentials', 401);

        const token = await signJWT(
          { sub: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
          env.JWT_SECRET
        );

        await env.DB.prepare('UPDATE admin_users SET last_login=? WHERE id=?')
          .bind(new Date().toISOString(), user.id).run();

        return json({ token });
      }

      // ── PROTECTED ADMIN ROUTES ─────────────────────────

      const adminPayload = await requireAdmin(req, env);

      // Admin: create blog
      if (path === '/api/admin/blogs' && method === 'POST') {
        if (!adminPayload) return jsonError('Unauthorized', 401);
        const b = await req.json() as Partial<BlogRow>;
        if (!b.slug || !b.title || !b.content) return jsonError('Missing required fields');

        await env.DB.prepare(
          'INSERT INTO blogs (slug,title,excerpt,content,tags,read_time,featured,published) VALUES (?,?,?,?,?,?,?,?)'
        ).bind(
          sanitize(b.slug), sanitize(b.title), sanitize(b.excerpt || ''),
          b.content, JSON.stringify(b.tags || []),
          b.read_time || 5, b.featured ? 1 : 0, b.published ? 1 : 0
        ).run();

        return json({ ok: true });
      }

      // Admin: create DSA problem
      if (path === '/api/admin/dsa' && method === 'POST') {
        if (!adminPayload) return jsonError('Unauthorized', 401);
        const b = await req.json() as Partial<DSARow>;
        if (!b.name || !b.topic || !b.difficulty) return jsonError('Missing required fields');

        await env.DB.prepare(
          'INSERT INTO dsa_problems (slug,name,topic,difficulty,status,platform,problem_url,approach,time_complexity,space_complexity,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
        ).bind(
          sanitize(b.slug || b.name.toLowerCase().replace(/\s+/g, '-')),
          sanitize(b.name), sanitize(b.topic), b.difficulty,
          b.status || 'solved', b.platform || 'LeetCode',
          sanitize(b.problem_url || ''), sanitize(b.approach || ''),
          sanitize(b.time_complexity || ''), sanitize(b.space_complexity || ''),
          sanitize(b.notes || '')
        ).run();

        return json({ ok: true });
      }

      // Admin: create finance entry
      if (path === '/api/admin/finance' && method === 'POST') {
        if (!adminPayload) return jsonError('Unauthorized', 401);
        const b = await req.json() as Partial<FinanceRow>;
        if (!b.ticker || !b.company_name) return jsonError('Missing required fields');

        await env.DB.prepare(
          'INSERT INTO finance_entries (ticker,company_name,sector,market_cap,research_notes,long_term_thesis,risks,verdict,conviction) VALUES (?,?,?,?,?,?,?,?,?)'
        ).bind(
          sanitize(b.ticker.toUpperCase()), sanitize(b.company_name),
          sanitize(b.sector || ''), sanitize(b.market_cap || ''),
          sanitize(b.research_notes || ''), sanitize(b.long_term_thesis || ''),
          JSON.stringify(b.risks || []), b.verdict || 'watch', b.conviction || 5
        ).run();

        return json({ ok: true });
      }

      // Admin: create life log
      if (path === '/api/admin/lifelogs' && method === 'POST') {
        if (!adminPayload) return jsonError('Unauthorized', 401);
        const b = await req.json() as Partial<LifeLogRow>;
        if (!b.period_label || !b.date_start) return jsonError('Missing required fields');

        // If this is current, unset previous current
        if (b.is_current) {
          await env.DB.prepare("UPDATE life_logs SET is_current=0 WHERE type=?").bind(b.type || 'weekly').run();
        }

        await env.DB.prepare(
          'INSERT INTO life_logs (type,period_label,date_start,date_end,goals,reflection,score,is_current) VALUES (?,?,?,?,?,?,?,?)'
        ).bind(
          b.type || 'weekly', sanitize(b.period_label),
          sanitize(b.date_start), sanitize(b.date_end || ''),
          JSON.stringify(b.goals || []), sanitize(b.reflection || ''),
          b.score || 0, b.is_current ? 1 : 0
        ).run();

        return json({ ok: true });
      }

      // Admin: get messages
      if (path === '/api/admin/messages' && method === 'GET') {
        if (!adminPayload) return jsonError('Unauthorized', 401);
        const { results } = await env.DB.prepare(
          'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50'
        ).all();
        return json({ data: results });
      }

      // Admin: analytics summary
      if (path === '/api/admin/analytics' && method === 'GET') {
        if (!adminPayload) return jsonError('Unauthorized', 401);
        const total = await env.DB.prepare('SELECT COUNT(*) as n FROM page_views').first<{ n: number }>();
        const today = await env.DB.prepare("SELECT COUNT(*) as n FROM page_views WHERE created_at > date('now')").first<{ n: number }>();
        const pages = await env.DB.prepare("SELECT path, COUNT(*) as views FROM page_views GROUP BY path ORDER BY views DESC LIMIT 10").all();
        return json({ total: total?.n || 0, today: today?.n || 0, topPages: pages.results });
      }

      return jsonError('Not found', 404);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonError('Internal server error', 500);
    }
  },
};  