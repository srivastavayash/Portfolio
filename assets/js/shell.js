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