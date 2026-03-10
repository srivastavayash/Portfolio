-- ═══════════════════════════════════════════════════════
-- yashOS — D1 Database Schema
-- Cloudflare D1 (SQLite)
-- Run: wrangler d1 execute yashos-db --file=schema.sql
-- ═══════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;

-- ── ADMIN USERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- bcrypt hash
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  last_login  TEXT
);

-- ── BLOG POSTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  excerpt     TEXT NOT NULL,
  content     TEXT NOT NULL,  -- Markdown
  tags        TEXT NOT NULL DEFAULT '[]',  -- JSON array
  read_time   INTEGER NOT NULL DEFAULT 5,  -- minutes
  featured    INTEGER NOT NULL DEFAULT 0,  -- boolean
  published   INTEGER NOT NULL DEFAULT 0,  -- boolean
  views       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug      ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_featured  ON blogs(featured, published);

-- ── RESEARCH PAPERS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_papers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  abstract    TEXT NOT NULL,
  content     TEXT NOT NULL,  -- Markdown with sections
  tags        TEXT NOT NULL DEFAULT '[]',
  published   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── PROJECTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  num         TEXT NOT NULL,  -- "01", "02"
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL,
  description TEXT NOT NULL,  -- Markdown
  stack       TEXT NOT NULL DEFAULT '[]',  -- JSON array
  tags        TEXT NOT NULL DEFAULT '[]',  -- category tags
  highlights  TEXT NOT NULL DEFAULT '[]',
  arch_notes  TEXT,
  github_url  TEXT,
  demo_url    TEXT,
  status      TEXT NOT NULL DEFAULT 'active',  -- active | archived
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── DSA PROBLEMS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dsa_problems (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  topic        TEXT NOT NULL,  -- arrays, strings, trees, graphs, dp, etc.
  difficulty   TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
  status       TEXT NOT NULL DEFAULT 'solved' CHECK(status IN ('solved','review','attempted')),
  platform     TEXT NOT NULL DEFAULT 'LeetCode',
  problem_url  TEXT,
  approach     TEXT NOT NULL,
  time_complexity  TEXT NOT NULL,
  space_complexity TEXT NOT NULL,
  notes        TEXT,
  solved_at    TEXT DEFAULT (datetime('now')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dsa_topic  ON dsa_problems(topic);
CREATE INDEX IF NOT EXISTS idx_dsa_diff   ON dsa_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_status ON dsa_problems(status);

-- ── FINANCE ENTRIES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_entries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker       TEXT NOT NULL,
  company_name TEXT NOT NULL,
  sector       TEXT NOT NULL,
  market_cap   TEXT,  -- "Large Cap", "Mid Cap", "Small Cap"
  exchange     TEXT NOT NULL DEFAULT 'NSE',
  research_notes TEXT NOT NULL,
  long_term_thesis TEXT,
  risks        TEXT NOT NULL DEFAULT '[]',  -- JSON array
  verdict      TEXT NOT NULL DEFAULT 'watch' CHECK(verdict IN ('buy','hold','watch','avoid')),
  conviction   INTEGER NOT NULL DEFAULT 5 CHECK(conviction BETWEEN 1 AND 10),
  last_reviewed TEXT NOT NULL DEFAULT (date('now')),
  published    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── LIFE LOGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS life_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT NOT NULL DEFAULT 'weekly' CHECK(type IN ('weekly','monthly')),
  period_label TEXT NOT NULL,  -- "Week 11", "March 2026"
  date_start  TEXT NOT NULL,
  date_end    TEXT NOT NULL,
  goals       TEXT NOT NULL DEFAULT '[]',  -- JSON array of goal objects
  reflection  TEXT,
  score       INTEGER,  -- 0-100 completion %
  is_current  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_logs_type    ON life_logs(type);
CREATE INDEX IF NOT EXISTS idx_logs_current ON life_logs(is_current);

-- ── LOG REACTIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS log_reactions (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  log_id   INTEGER NOT NULL REFERENCES life_logs(id) ON DELETE CASCADE,
  emoji    TEXT NOT NULL,
  ip_hash  TEXT NOT NULL,  -- hashed IP to prevent spam
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(log_id, emoji, ip_hash)
);

-- ── CONTACT MESSAGES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT 'other',
  message   TEXT NOT NULL,
  read      INTEGER NOT NULL DEFAULT 0,
  ip_hash   TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── ADMIN SESSIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id         TEXT PRIMARY KEY,  -- UUID
  user_id    INTEGER NOT NULL REFERENCES admin_users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── PAGE VIEWS (analytics) ───────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  path     TEXT NOT NULL,
  referrer TEXT,
  ua_hash  TEXT,
  country  TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_views_date ON page_views(created_at);

-- ═══════════════════════════════════════════════════════
-- SEED DATA (optional dev seeds)
-- ═══════════════════════════════════════════════════════

-- Default admin (password: changeme — CHANGE IN PRODUCTION)
-- password hash below is bcrypt of "changeme" — replace immediately
INSERT OR IGNORE INTO admin_users (username, password_hash)
VALUES ('yash', '$2b$10$PLACEHOLDER_HASH_CHANGE_BEFORE_DEPLOY');