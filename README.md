# yashOS — Setup Guide

## Structure
```
/yashos
  /assets
    /css
      shared.css       ← Design system, import in every page
    /js
      shell.js         ← Nav, footer, terminal — call YashOS.init()
  /pages
    about.html
    projects.html
    blog.html
    dsa.html
    finance.html
    lifelogs.html
    connect.html
  /worker
    /src
      index.ts         ← Cloudflare Worker (TypeScript)
    schema.sql         ← D1 SQLite schema
    wrangler.toml      ← Wrangler config
  index.html           ← Home page (in root)
```

## Deploying Frontend
1. Put `index.html` at root and pages at `/about`, `/projects`, etc.
2. Use Cloudflare Pages for hosting:
   ```
   wrangler pages deploy .
   ```
3. Set URL rewrites so `/about` → `/pages/about.html`

## Setting Up Backend

### 1. Create D1 Database
```bash
wrangler d1 create yashos-db
# Copy the database_id into wrangler.toml
```

### 2. Apply Schema
```bash
wrangler d1 execute yashos-db --file=worker/schema.sql
```

### 3. Set Secrets
```bash
wrangler secret put JWT_SECRET
# Enter a long random string

wrangler secret put ADMIN_PASSWORD_HASH
# Enter a plain password for now (TODO: replace with bcrypt hash in production)
```

### 4. Deploy Worker
```bash
cd worker
npm install
wrangler deploy
```

### 5. Connect Pages to Worker
In Cloudflare Pages settings, bind the Worker to handle `/api/*` routes.

## Adding Content (Admin)
All content is managed via the API. Get a token first:

```bash
curl -X POST https://your-worker.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yash","password":"your-password"}'
```

Then use the token in Authorization header:
```bash
curl -X POST https://your-worker.workers.dev/api/admin/blogs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-post","title":"My Post","content":"...","published":1}'
```

## Using Shell in Pages
Every page just needs:
```html
<link rel="stylesheet" href="/assets/css/shared.css"/>
<!-- ... page content ... -->
<script src="/assets/js/shell.js"></script>
<script>YashOS.init({ activePage: 'about' });</script>
```
Active page keys: `home`, `about`, `projects`, `blog`, `dsa`, `finance`, `connect`

## TODO Before Production
- [ ] Replace admin password check with proper bcrypt (use wasm-pack bcrypt for Workers)
- [ ] Add input sanitization for XSS in rich content fields
- [ ] Set `Access-Control-Allow-Origin` to your actual domain (not `*`)
- [ ] Add blog post detail page (`/blog/[slug].html`)
- [ ] Add research papers page
- [ ] Wire all `// TODO: fetch from /api/...` comments in each page
- [ ] Add admin dashboard UI
