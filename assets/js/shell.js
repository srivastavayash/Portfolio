/**
 * yashOS — shell.js
 * Injects: cursor, overlays, nav, mobile-nav, footer, terminal, scroll logic
 * Include at bottom of <body> on every page.
 * Call: YashOS.init({ activePage: 'about' })
 */

(function (window) {
  'use strict';

  const RESUME_URL = 'https://drive.google.com/file/d/10lDm-uBw0VwUzHT2gi5AtJ79V8g0rTjZ/view?usp=sharing';

  const NAV_LINKS = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/pages/about.html', label: 'About', key: 'about' },
    { href: '/pages/projects.html', label: 'Projects', key: 'projects' },
    { href: '/pages/blog.html', label: 'Blog', key: 'blog' },
    { href: '/pages/dsa.html', label: 'DSA', key: 'dsa' },
    { href: '/pages/finance.html', label: 'Finance', key: 'finance' },
    { href: '/pages/lifelogs.html', label: 'Life Logs', key: 'lifelogs' },
    { href: '/pages/connect.html', label: 'Connect', key: 'connect' },
  ];

  /* ── TERMINAL COMMANDS ── */
  const COMMANDS = {
    help: () => [
      { t: 'bold', s: '╔══════════════════════════════════════╗' },
      { t: 'bold', s: '║        yashOS Terminal v2.0.0        ║' },
      { t: 'bold', s: '╚══════════════════════════════════════╝' },
      { t: 'blank' },
      { t: 'green', s: '  Navigation' },
      { t: 'output', s: '  about        →  Who Yash is' },
      { t: 'output', s: '  projects     →  All production work' },
      { t: 'output', s: '  blog         →  Engineering articles' },
      { t: 'output', s: '  finance      →  Stock research journal' },
      { t: 'output', s: '  dsa          →  Algorithm tracker' },
      { t: 'output', s: '  lifelogs     →  Weekly / monthly logs' },
      { t: 'output', s: '  contact      →  Get in touch' },
      { t: 'blank' },
      { t: 'green', s: '  Info' },
      { t: 'output', s: '  skills       →  Tech stack & proficiency' },
      { t: 'output', s: '  stats        →  Career numbers' },
      { t: 'output', s: '  whoami       →  Quick bio' },
      { t: 'output', s: '  links        →  All social / external links' },
      { t: 'output', s: '  resume       →  Open resume (Google Drive)' },
      { t: 'blank' },
      { t: 'green', s: '  System' },
      { t: 'output', s: '  clear        →  Clear terminal' },
      { t: 'output', s: '  exit         →  Close terminal' },
      { t: 'blank' },
      { t: 'dim', s: '  Tip: ↑↓ history · Tab autocomplete · Ctrl+` toggle' },
    ],
    whoami: () => [
      { t: 'blank' },
      { t: 'green', s: ' ██╗   ██╗ █████╗ ███████╗██╗  ██╗' },
      { t: 'green', s: ' ╚██╗ ██╔╝██╔══██╗██╔════╝██║  ██║' },
      { t: 'green', s: '  ╚████╔╝ ███████║███████╗███████║' },
      { t: 'green', s: '   ╚██╔╝  ██╔══██║╚════██║██╔══██║' },
      { t: 'green', s: '    ██║   ██║  ██║███████║██║  ██║' },
      { t: 'green', s: '    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝' },
      { t: 'blank' },
      { t: 'output', s: '  Name    : Yash Srivastava' },
      { t: 'output', s: '  Role    : Full Stack Developer @ RPATech' },
      { t: 'output', s: '  Focus   : Backend · AI Pipelines · SaaS Systems' },
      { t: 'output', s: '  Location: Delhi, India (UTC+5:30)' },
      { t: 'output', s: '  GPA     : 9.34 / 10 · B.Tech IT · GGSIPU' },
      { t: 'output', s: '  Status  : Open to opportunities' },
      { t: 'blank' },
      { t: 'dim', s: '  "Building systems, documenting thinking, sharing research."' },
    ],
    skills: () => [
      { t: 'blank' },
      { t: 'bold', s: '  Backend & Languages' },
      { t: 'output', s: '  TypeScript  ████████████████████  95%' },
      { t: 'output', s: '  PHP (OOP)   ██████████████████░░  90%' },
      { t: 'output', s: '  Node.js     █████████████████░░░  88%' },
      { t: 'output', s: '  Python      █████████████░░░░░░░  65%' },
      { t: 'blank' },
      { t: 'bold', s: '  Data & Infrastructure' },
      { t: 'output', s: '  MySQL       ██████████████████░░  92%' },
      { t: 'output', s: '  Redis       ████████████████░░░░  80%' },
      { t: 'output', s: '  JWT/OAuth   █████████████████░░░  88%' },
      { t: 'blank' },
      { t: 'bold', s: '  AI / ML' },
      { t: 'output', s: '  LLM Orch.   ██████████████████░░  90%' },
      { t: 'output', s: '  Prompt Eng. ████████████████░░░░  85%' },
    ],
    stats: () => [
      { t: 'blank' },
      { t: 'output', s: '  ┌─────────────────────────────────┐' },
      { t: 'output', s: '  │  Career Statistics               │' },
      { t: 'output', s: '  ├─────────────────────────────────┤' },
      { t: 'green', s: '  │  Production Systems    6+        │' },
      { t: 'green', s: '  │  Years at RPATech      1+        │' },
      { t: 'green', s: '  │  GPA                   9.34/10   │' },
      { t: 'green', s: '  │  AI Pipeline Latency   <2s       │' },
      { t: 'output', s: '  └─────────────────────────────────┘' },
      { t: 'blank' },
    ],
    links: () => [
      { t: 'blank' },
      { t: 'green', s: '  External Links' },
      { t: 'output', s: '  Email     → srivastavayash017@gmail.com' },
      { t: 'blue', s: '  LinkedIn  → linkedin.com/in/yash-srivastava-8b0253176' },
      { t: 'blue', s: '  GitHub    → github.com/srivastavayash' },
      { t: 'yellow', s: '  LeetCode  → leetcode.com/SrivastavaYash017' },
      { t: 'green', s: '  Resume    → drive.google.com/file/d/10lDm-uBw0VwUzHT2gi5AtJ79V8g0rTjZ' },
      { t: 'blank' },
    ],
    resume: () => {
      window.open(RESUME_URL, '_blank');
      return [{ t: 'green', s: '  → Opening resume in Google Drive...' }];
    },
    about: () => { nav('/pages/about.html'); return [{ t: 'green', s: '  → /about' }]; },
    projects: () => { nav('/pages/projects.html'); return [{ t: 'green', s: '  → /projects' }]; },
    blog: () => { nav('/pages/blog.html'); return [{ t: 'green', s: '  → /blog' }]; },
    finance: () => { nav('/pages/finance.html'); return [{ t: 'green', s: '  → /finance' }]; },
    dsa: () => { nav('/pages/dsa.html'); return [{ t: 'green', s: '  → /dsa' }]; },
    lifelogs: () => { nav('/pages/lifelogs.html'); return [{ t: 'green', s: '  → /lifelogs' }]; },
    contact: () => { nav('/pages/connect.html'); return [{ t: 'green', s: '  → /connect' }]; },
    clear: () => { termBody && (termBody.innerHTML = ''); return []; },
    exit: () => { setTimeout(closeTerminal, 200); return [{ t: 'green', s: '  Closing...' }]; },
  };

  function nav(href) { setTimeout(() => window.location.href = href, 300); }

  /* ── STATE ── */
  let mx = 0, my = 0, rx = 0, ry = 0;
  let termBooted = false;
  let histIdx = -1;
  const termHistory = [];

  /* ── DOM REFS ── */
  let cursor, ring, termOverlay, termBody, termInput, navbar;

  /* ── BUILD HTML ── */
  function buildShell(activePage) {
    // Overlays + cursor
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="noise-overlay"></div>
      <div class="scan-overlay"></div>
      <div id="scroll-progress"></div>
      <div id="cursor"></div>
      <div id="cursor-ring"></div>
    `);

    // Mobile nav
    const mobileLinks = NAV_LINKS.map(l =>
      `<a href="${l.href}" onclick="YashOS.closeMobileNav()">${l.label}</a>`
    ).join('');
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="mobile-nav" id="mobile-nav">
        <button class="mobile-nav-close" onclick="YashOS.closeMobileNav()">✕</button>
        ${mobileLinks}
        <a href="${RESUME_URL}" target="_blank" rel="noopener" onclick="YashOS.closeMobileNav()" style="color:var(--green)">Resume ↗</a>
      </div>
    `);

    // Desktop Nav
    const navLinksHTML = NAV_LINKS.map(l =>
      `<a href="${l.href}"${l.key === activePage ? ' class="active"' : ''}>${l.label}</a>`
    ).join('');

    document.body.insertAdjacentHTML('afterbegin', `
      <nav id="navbar">
        <a class="nav-logo" href="/">
          <div class="nav-logo-icon">
            <svg viewBox="0 0 14 14" fill="none"><path d="M2 2L7 12L12 2" stroke="#080808" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="nav-logo-text">yash<span>OS</span></span>
        </a>
        <div class="nav-center">${navLinksHTML}</div>
        <div class="nav-right">
          <a href="${RESUME_URL}" target="_blank" rel="noopener" class="resume-btn" title="Download Resume">Resume ↗</a>
          <button class="terminal-btn" onclick="YashOS.openTerminal()">
            <div class="t-dot"></div>Terminal
          </button>
          <button class="nav-mobile-btn" onclick="YashOS.openMobileNav()">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    `);

    // Footer
    document.body.insertAdjacentHTML('beforeend', `
      <footer>
        <div class="footer-left">© 2026 Yash Srivastava · Built with intention, shipped with precision.</div>
        <div class="footer-right">
          <a href="/pages/about.html">About</a>
          <a href="/pages/projects.html">Projects</a>
          <a href="/pages/connect.html">Connect</a>
          <a href="${RESUME_URL}" target="_blank" rel="noopener" style="color:var(--green)">Resume ↗</a>
          <div class="footer-status">
            <div style="width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse-dot 2s ease-in-out infinite;"></div>
            Available
          </div>
        </div>
      </footer>
    `);

    // Terminal
    document.body.insertAdjacentHTML('beforeend', `
      <div id="terminal-overlay">
        <div class="terminal-window">
          <div class="terminal-titlebar">
            <div class="t-dots">
              <div class="t-dot-btn red" onclick="YashOS.closeTerminal()"></div>
              <div class="t-dot-btn yellow"></div>
              <div class="t-dot-btn green"></div>
            </div>
            <div class="t-title">yashOS Terminal — v2.0.0</div>
            <div class="t-version">bash</div>
          </div>
          <div class="terminal-body" id="terminal-body"></div>
          <div class="terminal-input-row">
            <span class="t-prompt-label">
              <span class="t-user">yash</span><span class="t-at">@</span><span class="t-dir">yashos</span><span class="t-arrow"> $ </span>
            </span>
            <input type="text" id="terminal-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="type 'help'"/>
          </div>
        </div>
      </div>
    `);

    // Social Strip
    document.body.insertAdjacentHTML('beforeend', `
      <div class="social-strip" id="social-strip">
        <div class="social-strip-line"></div>
        <a class="social-btn" href="https://github.com/srivastavayash" target="_blank" rel="noopener" data-label="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </a>
        <a class="social-btn" href="https://linkedin.com/in/yash-srivastava-8b0253176" target="_blank" rel="noopener" data-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a class="social-btn" href="https://leetcode.com/SrivastavaYash017" target="_blank" rel="noopener" data-label="LeetCode">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>
        </a>
        <a class="social-btn" href="mailto:srivastavayash017@gmail.com" data-label="Email">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.909 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
        </a>
        <a class="social-btn" href="${RESUME_URL}" target="_blank" rel="noopener" data-label="Resume">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6zm2-5h8v1.5H8V15zm0-3h8v1.5H8V12zm0-3h4v1.5H8V9z"/></svg>
        </a>
        <div class="social-strip-bottom-line"></div>
      </div>
    `);
  }

  /* ── CURSOR ── */
  function initCursor() {
    cursor = document.getElementById('cursor');
    ring = document.getElementById('cursor-ring');
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * .1; ry += (my - ry) * .1;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
    });
  }

  /* ── SCROLL ── */
  function initScroll() {
    navbar = document.getElementById('navbar');
    const bar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      if (bar) bar.style.width = pct + '%';
    });
  }

  /* ── REVEAL ── */
  function initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(r => obs.observe(r));
  }

  /* ── TERMINAL ── */
  function addLine(type, text) {
    const div = document.createElement('div');
    div.classList.add('t-line');
    if (type === 'blank') {
      div.classList.add('blank');
    } else if (type === 'prompt') {
      div.classList.add('prompt');
      div.innerHTML = `<span class="t-user">yash</span><span class="t-at">@</span><span class="t-dir">yashos</span> $ ${text.replace(/</g, '&lt;')}`;
    } else {
      div.classList.add('output');
      if (type !== 'output') div.classList.add(type);
      div.textContent = text;
    }
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    termHistory.unshift(cmd); histIdx = -1;
    addLine('prompt', raw.trim());
    const fn = COMMANDS[cmd];
    if (fn) {
      fn().forEach(l => addLine(l.t, l.s || ''));
    } else {
      addLine('blank', '');
      addLine('red', `  command not found: ${cmd}`);
      addLine('dim', `  type 'help' for available commands`);
      addLine('blank', '');
    }
  }

  function bootTerminal() {
    if (termBooted) return;
    termBooted = true;
    const lines = [
      { t: 'green', s: '  yashOS Terminal v2.0.0' },
      { t: 'dim', s: '  ─────────────────────────────────────' },
      { t: 'output', s: '  Initializing environment...' },
      { t: 'green', s: '  ✓ Session loaded' },
      { t: 'green', s: '  ✓ Knowledge base mounted' },
      { t: 'blank', s: '' },
      { t: 'output', s: "  Welcome. Type 'help' to begin." },
      { t: 'blank', s: '' },
    ];
    let i = 0;
    (function next() {
      if (i < lines.length) {
        const l = lines[i++];
        addLine(l.t, l.s);
        setTimeout(next, 60);
      } else {
        termInput.focus();
      }
    })();
  }

  function openTerminal() {
    termOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    bootTerminal();
    setTimeout(() => termInput && termInput.focus(), 400);
  }
  function closeTerminal() {
    termOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  function openMobileNav() { document.getElementById('mobile-nav').classList.add('active'); }
  function closeMobileNav() { document.getElementById('mobile-nav').classList.remove('active'); }

  function initTerminal() {
    termOverlay = document.getElementById('terminal-overlay');
    termBody = document.getElementById('terminal-body');
    termInput = document.getElementById('terminal-input');

    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { runCommand(termInput.value); termInput.value = ''; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (histIdx < termHistory.length - 1) { histIdx++; termInput.value = termHistory[histIdx]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); histIdx > 0 ? (histIdx--, termInput.value = termHistory[histIdx]) : (histIdx = -1, termInput.value = ''); }
      else if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(COMMANDS).find(k => k.startsWith(termInput.value.trim())); if (m) termInput.value = m; }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); termBody.innerHTML = ''; }
    });
    termOverlay.addEventListener('click', e => { if (e.target === termOverlay) closeTerminal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && termOverlay.classList.contains('active')) closeTerminal();
      if (e.key === '`' && e.ctrlKey) { e.preventDefault(); termOverlay.classList.contains('active') ? closeTerminal() : openTerminal(); }
    });
  }

  /* ── PUBLIC API ── */
  window.YashOS = {
    init(opts = {}) {
      const activePage = opts.activePage || 'home';
      buildShell(activePage);
      initCursor();
      initScroll();
      initReveal();
      initTerminal();
      if (opts.onReady) opts.onReady();
    },
    openTerminal,
    closeTerminal,
    openMobileNav,
    closeMobileNav,
  };

})(window);