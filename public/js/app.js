// ==============================================================================
// MINIMALIST MODERN APP CONTROLLER & SIDEBAR ROUTER (ANDROID & DESKTOP)
// ==============================================================================

const App = {
  currentUser: null,
  activeTab: 'dashboard',
  theme: localStorage.getItem('gentech_theme') || 'dark',

  injectThemeStyles() {
    if (document.getElementById('gentech-theme-system')) return;
    const style = document.createElement('style');
    style.id = 'gentech-theme-system';
    style.textContent = `
      :root { color-scheme: dark; }
      body { transition: background-color .25s ease, color .25s ease; }
      body[data-theme='dark'] { background-image: radial-gradient(circle at 15% 0%, rgba(99,102,241,.10), transparent 28%), radial-gradient(circle at 90% 10%, rgba(168,85,247,.08), transparent 24%); }
      body[data-theme='light'] { background-image: radial-gradient(circle at 10% 0%, rgba(99,102,241,.06), transparent 28%), radial-gradient(circle at 90% 10%, rgba(245,158,11,.06), transparent 24%); }
      .glass-panel, .director-content-card { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
      .glass-panel:hover, .director-content-card:hover { border-color: rgba(148,163,184,.28) !important; }
      .nav-item { transition: transform .18s ease, background .18s ease, color .18s ease; }
      .nav-item:hover { transform: translateX(2px); }
      .gt-theme-toggle:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; }
      .gt-theme-toggle { position:relative; width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.05); color:#cbd5e1; cursor:pointer; transition:.2s; }
      .gt-theme-toggle:hover { transform:translateY(-1px); background:rgba(255,255,255,.10); color:#fff; }
      .gt-theme-toggle .gt-sun { display:none; }
      body[data-theme='light'] { color-scheme:light; background:#f4f7fb !important; color:#172033 !important; }
      body[data-theme='light'] .gt-theme-toggle { background:#fff; border-color:#e2e8f0; color:#475569; }
      body[data-theme='light'] .gt-theme-toggle .gt-moon { display:none; }
      body[data-theme='light'] .gt-theme-toggle .gt-sun { display:inline-block; }
      body[data-theme='light'] .glass-panel,
      body[data-theme='light'] .glass-dropdown { background:rgba(255,255,255,.96) !important; border-color:#e2e8f0 !important; box-shadow:0 16px 40px rgba(15,23,42,.08) !important; }
      body[data-theme='light'] .nav-item { color:#64748b !important; }
      body[data-theme='light'] .nav-item:hover { background:#f1f5f9 !important; color:#172033 !important; }
      body[data-theme='light'] .nav-item.active { background:linear-gradient(90deg,#fff7ed,#fffbeb) !important; color:#c2410c !important; box-shadow:inset 3px 0 #f59e0b; }
      body[data-theme='light'] .gt-shell, body[data-theme='light'] .gt-sidebar, body[data-theme='light'] .gt-mobile-drawer { background:#fff !important; border-color:#e2e8f0 !important; }
      body[data-theme='light'] header.gt-topbar { background:rgba(255,255,255,.88) !important; border-color:#e2e8f0 !important; }
      body[data-theme='light'] .text-white { color:#172033 !important; }
      body[data-theme='light'] .text-slate-100 { color:#1e293b !important; }
      body[data-theme='light'] .text-slate-200 { color:#334155 !important; }
      body[data-theme='light'] .text-slate-300 { color:#475569 !important; }
      body[data-theme='light'] .text-slate-400 { color:#64748b !important; }
      body[data-theme='light'] .text-slate-500 { color:#94a3b8 !important; }
      body[data-theme='light'] input, body[data-theme='light'] select, body[data-theme='light'] textarea { background:#fff !important; color:#172033 !important; border-color:#dbe3ec !important; }
      body[data-theme='light'] input::placeholder, body[data-theme='light'] textarea::placeholder { color:#94a3b8 !important; }
      body[data-theme='light'] .bg-white\/\[0\.02\] { background:#f8fafc !important; }
      body[data-theme='light'] .bg-white\/\[0\.03\], body[data-theme='light'] .bg-white\/\[0\.04\] { background:#f1f5f9 !important; }
      body[data-theme='light'] .border-white\/\[0\.04\], body[data-theme='light'] .border-white\/\[0\.06\], body[data-theme='light'] .border-white\/\[0\.08\], body[data-theme='light'] .border-white\/\[0\.1\] { border-color:#e2e8f0 !important; }
      body[data-theme='light'] .director-sidebar, body[data-theme='light'] .director-topbar, body[data-theme='light'] .director-content-card { background:#fff !important; border-color:#e2e8f0 !important; }
      body[data-theme='light'] .director-main .text-white { color:#172033 !important; }
      body[data-theme='dark'] .director-sidebar { background:#101725 !important; border-color:#243044 !important; box-shadow:0 14px 40px rgba(0,0,0,.22) !important; }
      body[data-theme='dark'] .director-topbar, body[data-theme='dark'] .director-content-card { background:#101725 !important; border-color:#243044 !important; color:#e5e7eb !important; }
      body[data-theme='dark'] .director-brand { border-color:#243044 !important; }
      body[data-theme='dark'] .director-user { border-color:#243044 !important; }
      body[data-theme='dark'] .director-nav-btn { color:#94a3b8 !important; }
      body[data-theme='dark'] .director-nav-btn:hover { background:#182235 !important; color:#f8fafc !important; }
      body[data-theme='dark'] .director-nav-btn.active { background:#2b2115 !important; color:#fbbf24 !important; }
      body[data-theme='dark'] .director-main .bg-white\/\[0\.02\] { background:#151e2d !important; }
      body[data-theme='dark'] .director-main .bg-white\/\[0\.04\] { background:#182235 !important; }
      body[data-theme='dark'] .director-main .border-white\/\[0\.06\], body[data-theme='dark'] .director-main .border-white\/\[0\.04\], body[data-theme='dark'] .director-main .border-white\/\[0\.08\] { border-color:#29364b !important; }
      body[data-theme='dark'] .director-main input, body[data-theme='dark'] .director-main select, body[data-theme='dark'] .director-main textarea { background:#0f1724 !important; color:#e5e7eb !important; border-color:#29364b !important; }
      /* =========================================================
         GEN-TECH POLISHED THEME LAYER
         Keeps application logic untouched while making every role
         shell visually consistent in both themes.
         ========================================================= */
      body[data-theme='light'] .gt-app-page,
      body[data-theme='light'] .gt-app-page > div { background:#f4f7fb !important; }
      body[data-theme='light'] .gt-app-page aside[class*='bg-[#0c101c]'],
      body[data-theme='light'] #mobile-sidebar-drawer { background:#ffffff !important; border-color:#e5eaf1 !important; box-shadow:10px 0 40px rgba(15,23,42,.06); }
      body[data-theme='light'] header.gt-topbar,
      body[data-theme='light'] .gt-app-page header { background:rgba(255,255,255,.92) !important; color:#172033 !important; border-color:#e5eaf1 !important; box-shadow:0 1px 0 rgba(15,23,42,.03); }
      body[data-theme='light'] .gt-app-page .nav-item { color:#64748b !important; }
      body[data-theme='light'] .gt-app-page .nav-item:hover { background:#f8fafc !important; color:#172033 !important; }
      body[data-theme='light'] .gt-app-page .nav-item.active { background:linear-gradient(90deg,#fff7ed,#fffbeb) !important; color:#c2410c !important; box-shadow:inset 3px 0 #f59e0b; }
      body[data-theme='light'] .gt-app-page .text-white { color:#172033 !important; }
      body[data-theme='light'] .gt-app-page .text-slate-100 { color:#1e293b !important; }
      body[data-theme='light'] .gt-app-page .text-slate-200 { color:#334155 !important; }
      body[data-theme='light'] .gt-app-page .text-slate-300 { color:#475569 !important; }
      body[data-theme='light'] .gt-app-page .text-slate-400 { color:#64748b !important; }
      body[data-theme='light'] .gt-app-page .text-slate-500 { color:#94a3b8 !important; }
      body[data-theme='light'] .gt-app-page input,
      body[data-theme='light'] .gt-app-page select,
      body[data-theme='light'] .gt-app-page textarea { background:#ffffff !important; color:#172033 !important; border-color:#dbe3ec !important; box-shadow:0 1px 2px rgba(15,23,42,.02); }
      body[data-theme='light'] .gt-app-page input::placeholder, body[data-theme='light'] .gt-app-page textarea::placeholder { color:#94a3b8 !important; }
      body[data-theme='light'] .gt-app-page .bg-white\/[0\.02\],
      body[data-theme='light'] .gt-app-page .bg-white\/[0\.03\],
      body[data-theme='light'] .gt-app-page .bg-white\/[0\.04\] { background:#f8fafc !important; }
      body[data-theme='light'] .gt-app-page [class*='border-white/'] { border-color:#e5eaf1 !important; }
      body[data-theme='light'] .gt-app-page .glass-dropdown { background:#ffffff !important; border-color:#e5eaf1 !important; box-shadow:0 18px 45px rgba(15,23,42,.12) !important; }

      body[data-theme='dark'] .gt-app-page { background:#080d17 !important; color:#e5e7eb !important; }
      body[data-theme='dark'] .gt-app-page aside[class*='bg-[#0c101c]'],
      body[data-theme='dark'] #mobile-sidebar-drawer { background:#0b1120 !important; border-color:#1f2a3d !important; }
      body[data-theme='dark'] .gt-app-page header { background:rgba(8,13,23,.88) !important; border-color:#1f2a3d !important; }
      body[data-theme='dark'] .gt-app-page .glass-panel { background:rgba(15,23,36,.88) !important; border-color:#263348 !important; box-shadow:0 14px 38px rgba(0,0,0,.18) !important; }
      body[data-theme='dark'] .gt-app-page input, body[data-theme='dark'] .gt-app-page select, body[data-theme='dark'] .gt-app-page textarea { background:#0e1625 !important; color:#e5e7eb !important; border-color:#29374c !important; }

      .gt-app-page .nav-item, .gt-app-page header, .gt-app-page aside, .gt-app-page .glass-panel, .gt-app-page input { transition:background-color .22s ease,border-color .22s ease,color .22s ease,box-shadow .22s ease,transform .18s ease; }
      .gt-app-page .nav-item:hover { transform:translateX(2px); }
      .gt-login-card { transition:.25s ease; }
      body[data-theme='light'] .gt-login-card { background:rgba(255,255,255,.96) !important; border-color:#e2e8f0 !important; box-shadow:0 24px 70px rgba(15,23,42,.10) !important; }
      body[data-theme='light'] .gt-login-card input { background:#fff !important; color:#172033 !important; border-color:#dbe3ec !important; }
      body[data-theme='light'] .gt-login-card h2, body[data-theme='light'] .gt-login-card label { color:#172033 !important; }
      body[data-theme='light'] .gt-login-card p, body[data-theme='light'] .gt-login-card .text-slate-500 { color:#64748b !important; }
      @media(max-width:1024px){ .gt-theme-label{display:none;} }
    `;

    style.textContent += `
      /* v3 final theme normalization */
      body[data-theme='light'] .gt-app-page,
      body[data-theme='light'] .gt-app-page > div,
      body[data-theme='light'] .gt-app-page main { background:#f4f7fb !important; color:#0f172a !important; }
      body[data-theme='light'] .gt-app-page header,
      body[data-theme='light'] .gt-app-page aside,
      body[data-theme='light'] #mobile-sidebar-drawer { background:#ffffff !important; color:#0f172a !important; border-color:#e2e8f0 !important; }
      body[data-theme='light'] .gt-app-page .glass-panel,
      body[data-theme='light'] .director-sidebar,
      body[data-theme='light'] .director-topbar,
      body[data-theme='light'] .director-content-card { background:#ffffff !important; color:#0f172a !important; border-color:#e2e8f0 !important; }
      body[data-theme='dark'] .gt-app-page,
      body[data-theme='dark'] .gt-app-page > div,
      body[data-theme='dark'] .gt-app-page main { background:#070b14 !important; color:#f8fafc !important; }
      body[data-theme='dark'] .gt-app-page header,
      body[data-theme='dark'] .gt-app-page aside,
      body[data-theme='dark'] #mobile-sidebar-drawer { background:#0d1422 !important; color:#f8fafc !important; border-color:#263348 !important; }
      body[data-theme='dark'] .gt-app-page .glass-panel,
      body[data-theme='dark'] .director-sidebar,
      body[data-theme='dark'] .director-topbar,
      body[data-theme='dark'] .director-content-card { background:#101925 !important; color:#f8fafc !important; border-color:#263348 !important; }
      body[data-theme='dark'] .director-nav-btn:hover { background:#172235 !important; }
      body[data-theme='dark'] .director-nav-btn.active { background:#2b2115 !important; color:#fbbf24 !important; }
      body[data-theme='dark'] .director-main .bg-white\\/\\[0\\.02\\],
      body[data-theme='dark'] .director-main .bg-white\\/\\[0\\.03\\],
      body[data-theme='dark'] .director-main .bg-white\\/\\[0\\.04\\] { background:#151f2e !important; }
      body[data-theme='dark'] .director-main input,
      body[data-theme='dark'] .director-main select,
      body[data-theme='dark'] .director-main textarea { background:#0d1625 !important; color:#f8fafc !important; border-color:#2b394f !important; }
      body[data-theme='light'] .director-main input,
      body[data-theme='light'] .director-main select,
      body[data-theme='light'] .director-main textarea { background:#ffffff !important; color:#0f172a !important; border-color:#dbe3ec !important; }
    `;
    document.head.appendChild(style);
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('gentech_theme', this.theme);
    document.body.dataset.theme = this.theme;
    document.documentElement.style.colorScheme = this.theme;
    const icon = document.getElementById('gt-theme-icon');
    if (icon) icon.className = `fas ${this.theme === 'dark' ? 'fa-moon gt-moon' : 'fa-sun gt-sun'}`;
  },

  themeButton() {
    return `<button type="button" class="gt-theme-toggle" onclick="App.toggleTheme()" title="Toggle light / dark mode" aria-label="Toggle light / dark mode"><i id="gt-theme-icon" class="fas fa-moon gt-moon"></i><i class="fas fa-sun gt-sun"></i></button>`;
  },

  async init() {
    this.injectThemeStyles();
    document.body.dataset.theme = this.theme;
    document.documentElement.style.colorScheme = this.theme;
    // Check saved session
    const saved = localStorage.getItem('college_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('college_user');
      }
    }

    if (this.currentUser) {
      this.setDefaultTab();
      this.renderApp();
    } else {
      this.renderLogin();
    }
  },

  setDefaultTab() {
    if (!this.currentUser) return;
    switch (this.currentUser.role) {
      case 'director':
        this.activeTab = 'overview';
        break;
      case 'hod':
        this.activeTab = 'departments';
        break;
      case 'faculty':
        this.activeTab = 'dashboard';
        break;
      case 'coordinator':
        this.activeTab = 'leaves';
        break;
      case 'student':
      default:
        this.activeTab = 'dashboard';
        break;
    }
  },

  getNavItems(role) {
    switch (role) {
      case 'director':
        return [
          { id: 'overview', label: 'Executive Dashboard', icon: 'chart-pie' },
          { id: 'college', label: 'College Structure', icon: 'sitemap' },
          { id: 'students', label: 'Students Directory', icon: 'user-graduate' },
          { id: 'faculty', label: 'Faculty & Workload', icon: 'chalkboard-teacher' },
          { id: 'attendance', label: 'Attendance & Reports', icon: 'clipboard-check' },
          { id: 'notices', label: 'College Notices', icon: 'newspaper' },
          { id: 'contact', label: 'Contact Us', icon: 'address-book' }
        ];
      case 'hod':
        return [
          { id: 'departments', label: 'Departments & Sections', icon: 'sitemap' },
          { id: 'faculty-alloc', label: 'Faculty Allocation', icon: 'chalkboard-teacher' },
          { id: 'timetable', label: 'College Timetables', icon: 'calendar-alt' },
          { id: 'shortage', label: 'Shortage Warning (<75%)', icon: 'user-slash' },
          { id: 'exams', label: 'Exams & Performance', icon: 'award' },
          { id: 'notices', label: 'Academic Notices', icon: 'bullhorn' },
          { id: 'contact', label: 'Contact Us', icon: 'address-book' }
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: "Today's Schedule", icon: 'clock' },
          { id: 'attendance', label: 'Take Attendance', icon: 'clipboard-list' },
          { id: 'notes', label: 'Study Notes & PDFs', icon: 'book' },
          { id: 'assignments', label: 'Assignments', icon: 'file-alt' },
          { id: 'doubts', label: 'Student Doubts', icon: 'question-circle' },
          { id: 'notices', label: 'College Notices', icon: 'bullhorn' },
          { id: 'contact', label: 'Contact Us', icon: 'address-book' }
        ];
      case 'coordinator':
        return [
          { id: 'leaves', label: 'Leave Approvals', icon: 'clipboard-check' },
          { id: 'students', label: 'Section Students', icon: 'users' },
          { id: 'timetable', label: 'Section Timetable', icon: 'calendar-week' },
          { id: 'notices', label: 'Section Notices', icon: 'bullhorn' },
          { id: 'contact', label: 'Contact Us', icon: 'address-book' }
        ];
      case 'student':
      default:
        return [
          { id: 'dashboard', label: 'Learning Portal', icon: 'home' },
          { id: 'subjects', label: 'My Subjects', icon: 'book-open' },
          { id: 'doubts', label: 'My Doubts & Replies', icon: 'comments' },
          { id: 'attendance', label: 'Attendance (87%)', icon: 'chart-pie' },
          { id: 'timetable', label: 'Weekly Timetable', icon: 'calendar-alt' },
          { id: 'exams', label: 'Exams & Results', icon: 'award' },
          { id: 'leaves', label: 'Leave Requests', icon: 'calendar-check' },
          { id: 'notices', label: 'Notices Board', icon: 'bullhorn' },
          { id: 'contact', label: 'Contact Us', icon: 'address-book' }
        ];
    }
  },

  // -------------------------------------------------------------
  // LOGIN SCREEN (Clean Minimalist Authentication - No Persona Bar)
  // -------------------------------------------------------------
  renderLogin() {
    document.body.className = 'gt-login-page bg-[#090d16] min-h-screen text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white';
    const root = document.getElementById('app-root');

    root.innerHTML = `
      <div class="min-h-screen flex flex-col justify-between p-4 md:p-8">
        <!-- Top Bar -->
        <header class="flex items-center justify-between max-w-5xl w-full mx-auto py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-md shadow-indigo-500/10 border border-white/10">
              🎓
            </div>
            <div>
              <span class="font-bold text-base tracking-tight text-white block">GenTech College</span>
              <span class="text-[11px] text-slate-400 font-mono">Academic Portal</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            ${this.themeButton()}
            <div class="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online
            </div>
          </div>
        </header>

        <!-- Minimalist Login Card -->
        <main class="max-w-md w-full mx-auto my-auto py-6">
          <div class="glass-panel gt-login-card p-8 md:p-10 rounded-3xl border border-white/[0.08] shadow-2xl">
            <div class="text-left mb-8">
              <h2 class="text-2xl font-bold tracking-tight text-white">Sign In</h2>
              <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Enter your institutional credentials. Your role and dashboard are detected automatically.
              </p>
            </div>

            <!-- Login Form -->
            <form onsubmit="App.handleLogin(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">User Identifier</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                    <i class="fas fa-id-card"></i>
                  </span>
                  <input type="text" id="login-identifier" required 
                         placeholder="Student ID, Employee ID, or Email"
                         class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                    <i class="fas fa-lock"></i>
                  </span>
                  <input type="password" id="login-password" value="password123" required
                         class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition" />
                </div>
              </div>

              <button type="submit" id="login-submit-btn" class="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 mt-3">
                <span>Sign In</span>
                <i class="fas fa-arrow-right text-xs"></i>
              </button>
            </form>

            <div class="mt-8 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-500">
              Supported IDs: <span class="text-slate-400 font-mono">DIR001</span>, <span class="text-slate-400 font-mono">HOD001</span>, <span class="text-slate-400 font-mono">FAC001</span>, <span class="text-slate-400 font-mono">COORD001</span>, <span class="text-slate-400 font-mono">CSE23B023</span>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="max-w-5xl w-full mx-auto text-center py-4 text-xs text-slate-500 font-mono">
          GenTech of Technology • Complete College ERP
        </footer>
      </div>
    `;
  },

  async handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = document.getElementById('login-submit-btn');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Signing In...';

    try {
      const res = await API.login(identifier, password);
      this.currentUser = res.user;
      localStorage.setItem('college_user', JSON.stringify(res.user));
      this.setDefaultTab();
      this.toast(`Welcome back, ${res.user.name}`, 'success');
      this.renderApp();
    } catch (err) {
      this.toast(err.message, 'error');
      if (btn) btn.innerHTML = '<span>Sign In</span> <i class="fas fa-arrow-right text-xs"></i>';
    }
  },

  // -------------------------------------------------------------
  // GEMINI AI — shared additive assistant for every role/panel
  // -------------------------------------------------------------
  aiHistory: [],

  toggleAI(open) {
    const panel = document.getElementById('gt-ai-panel');
    if (!panel) return;
    panel.classList.toggle('hidden', !open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open) {
      const input = document.getElementById('gt-ai-input');
      setTimeout(() => input && input.focus(), 50);
    }
  },

  aiQuickAsk(message) {
    const input = document.getElementById('gt-ai-input');
    if (input) input.value = message;
    const form = input?.closest('form');
    if (form) this.sendAI({ preventDefault: () => {} });
  },

  aiEscape(text) {
    return String(text || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  },

  aiFormat(text) {
    return this.aiEscape(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^###\s?(.*)$/gm, '<div class="font-bold mt-2">$1</div>')
      .replace(/^##\s?(.*)$/gm, '<div class="font-bold mt-2">$1</div>')
      .replace(/\n/g, '<br>');
  },

  appendAIMessage(role, text) {
    const box = document.getElementById('gt-ai-messages');
    if (!box) return;
    const item = document.createElement('div');
    item.className = `gt-ai-message ${role === 'user' ? 'user' : 'assistant'}`;
    item.innerHTML = role === 'user'
      ? `<div class="gt-ai-bubble user">${this.aiEscape(text)}</div>`
      : `<div class="gt-ai-bubble assistant">${this.aiFormat(text)}</div>`;
    box.appendChild(item);
    box.scrollTop = box.scrollHeight;
  },

  async sendAI(e) {
    if (e?.preventDefault) e.preventDefault();
    const input = document.getElementById('gt-ai-input');
    const message = input?.value.trim();
    if (!message || !this.currentUser) return;
    input.value = '';
    this.appendAIMessage('user', message);

    const loadingId = `gt-ai-loading-${Date.now()}`;
    const box = document.getElementById('gt-ai-messages');
    const loading = document.createElement('div');
    loading.id = loadingId;
    loading.className = 'gt-ai-message assistant';
    loading.innerHTML = '<div class="gt-ai-bubble assistant"><i class="fas fa-spinner fa-spin mr-2"></i>Thinking…</div>';
    box.appendChild(loading);
    box.scrollTop = box.scrollHeight;

    try {
      const res = await API.aiChat(message, this.aiHistory.slice(-10), this.currentUser, this.activeTab, {
        role: this.currentUser.role,
        department: this.currentUser.department,
        section: this.currentUser.sectionName,
        currentPanel: this.activeTab
      });
      document.getElementById(loadingId)?.remove();
      this.appendAIMessage('assistant', res.answer);
      this.aiHistory.push({ role: 'user', text: message }, { role: 'assistant', text: res.answer });
    } catch (err) {
      document.getElementById(loadingId)?.remove();
      this.appendAIMessage('assistant', `AI unavailable: ${err.message}`);
    }
  },

  async runAIInsights() {
    if (!this.currentUser) return;
    this.toggleAI(true);
    this.appendAIMessage('assistant', 'Analyzing academic performance, attendance, assessment indicators, and available engagement signals…');
    try {
      const res = await API.getAIInsights(this.currentUser, this.activeTab);
      this.appendAIMessage('assistant', res.answer);
    } catch (err) {
      this.appendAIMessage('assistant', `Insights unavailable: ${err.message}`);
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('college_user');
    this.renderLogin();
    this.toast('Signed out successfully.', 'info');
  },

  // -------------------------------------------------------------
  // MODERN SIDEBAR APP SHELL (DESKTOP & MOBILE / ANDROID)
  // -------------------------------------------------------------
  renderApp() {
    const user = this.currentUser;
    document.body.className = `role-theme-${user.role} gt-app-page min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-purple-500 selection:text-white`;

    const navItems = this.getNavItems(user.role);
    const activeItem = navItems.find(n => n.id === this.activeTab) || navItems[0];
    const roleBadgeLabel = user.role.toUpperCase();

    const root = document.getElementById('app-root');
    root.innerHTML = `
      <!-- App Shell Container -->
      <div class="min-h-screen flex flex-col lg:flex-row">

        <!-- ============================================== -->
        <!-- DESKTOP SIDEBAR (Permanent w-64 on lg screens) -->
        <!-- ============================================== -->
        <aside class="hidden lg:flex flex-col w-64 bg-[#0c101c] border-r border-white/[0.08] p-5 justify-between sticky top-0 h-screen flex-shrink-0 z-30">
          <div>
            <!-- Brand Logo -->
            <div class="flex items-center gap-3 px-2 py-2 mb-6">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-md border border-white/10">
                🎓
              </div>
              <div class="overflow-hidden">
                <span class="font-bold text-sm tracking-tight text-white block truncate">GenTech</span>
                <span class="text-[10px] text-slate-400 font-mono">ERP & Learning</span>
              </div>
            </div>

            <!-- Role Badge -->
            <div class="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Current Role</span>
                <span class="text-xs font-bold text-white tracking-wide">${roleBadgeLabel}</span>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <!-- Navigation Links -->
            <nav class="space-y-1">
              ${navItems.map(item => `
                <div onclick="App.switchTab('${item.id}')" id="desktop-nav-${item.id}" class="nav-item ${this.activeTab === item.id ? 'active' : ''}">
                  <i class="fas fa-${item.icon} text-sm w-5 text-center"></i>
                  <span>${item.label}</span>
                </div>
              `).join('')}
            </nav>
          </div>

          <!-- Bottom User Card -->
          <div class="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}" class="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex-shrink-0 object-cover" />
              <div class="truncate">
                <div class="text-xs font-semibold text-white truncate">${user.name}</div>
                <div class="text-[10px] text-slate-400 font-mono truncate">${user.identifier}</div>
              </div>
            </div>
            <button onclick="App.logout()" title="Sign Out" class="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition">
              <i class="fas fa-sign-out-alt text-xs"></i>
            </button>
          </div>
        </aside>

        <!-- ============================================== -->
        <!-- MOBILE SIDEBAR DRAWER (Android Off-Canvas)     -->
        <!-- ============================================== -->
        <div id="mobile-sidebar-backdrop" onclick="App.toggleMobileSidebar(false)" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden opacity-0 pointer-events-none transition-opacity"></div>
        
        <aside id="mobile-sidebar-drawer" class="fixed top-0 bottom-0 left-0 w-72 bg-[#0c101c] border-r border-white/[0.08] p-5 flex flex-col justify-between z-50 lg:hidden -translate-x-full transition-transform duration-300">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm shadow-md border border-white/10">
                  🎓
                </div>
                <div>
                  <span class="font-bold text-sm text-white block">GenTech College</span>
                  <span class="text-[10px] text-slate-400 font-mono">${roleBadgeLabel}</span>
                </div>
              </div>
              <button onclick="App.toggleMobileSidebar(false)" class="w-8 h-8 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center">
                &times;
              </button>
            </div>

            <!-- Navigation Links -->
            <nav class="space-y-1">
              ${navItems.map(item => `
                <div onclick="App.switchTab('${item.id}'); App.toggleMobileSidebar(false);" id="mobile-nav-${item.id}" class="nav-item ${this.activeTab === item.id ? 'active' : ''}">
                  <i class="fas fa-${item.icon} text-sm w-5 text-center"></i>
                  <span>${item.label}</span>
                </div>
              `).join('')}
            </nav>
          </div>

          <!-- Bottom User Card -->
          <div class="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}" class="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 object-cover" />
              <div>
                <div class="text-xs font-semibold text-white">${user.name}</div>
                <div class="text-[10px] text-slate-400 font-mono">${user.identifier}</div>
              </div>
            </div>
            <button onclick="App.logout()" class="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 text-xs font-medium transition">
              Exit
            </button>
          </div>
        </aside>

        <!-- ============================================== -->
        <!-- MAIN CONTENT AREA & TOPBAR                     -->
        <!-- ============================================== -->
        <div class="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          
          <!-- Clean Minimalist Topbar -->
          <header class="sticky top-0 z-20 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            
            <div class="flex items-center gap-3">
              <!-- Mobile Hamburger Menu Button -->
              <button onclick="App.toggleMobileSidebar(true)" class="lg:hidden w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300">
                <i class="fas fa-bars text-sm"></i>
              </button>

              <div>
                <h1 id="topbar-title" class="text-base font-bold text-white tracking-tight leading-tight">${activeItem.label}</h1>
                <div class="text-[11px] text-slate-400 font-mono hidden sm:block">${user.name} • ${user.department || 'Academic'}</div>
              </div>
            </div>

            <!-- Right Controls: Search, Theme & Notifications -->
            <div class="flex items-center gap-2.5">
              ${this.themeButton()}
              <button onclick="App.toggleAI(true)" title="GenTech AI Assistant" class="gt-ai-top-btn w-9 h-9 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-indigo-300 text-sm transition">
                <i class="fas fa-sparkles"></i>
              </button>
              <!-- Search Bar -->
              <div class="relative hidden sm:block">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs">
                  <i class="fas fa-search"></i>
                </span>
                <input type="text" id="global-search-input" placeholder="Search roll no, faculty..." 
                       oninput="App.handleGlobalSearch(event)"
                       class="w-52 md:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition" />
                <div id="global-search-dropdown" class="absolute left-0 mt-2 w-80 glass-dropdown rounded-2xl p-2 hidden shadow-2xl z-50"></div>
              </div>

              <!-- Notifications -->
              <div class="relative">
                <button onclick="App.toggleNotifications()" class="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 text-sm relative">
                  <i class="fas fa-bell"></i>
                  <span class="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2"></span>
                </button>
                <div id="notifications-dropdown" class="absolute right-0 mt-2 w-80 glass-dropdown rounded-2xl p-3 hidden shadow-2xl z-50">
                  <div class="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2">
                    <span class="text-xs font-bold text-white">Notifications</span>
                    <span class="text-[10px] text-slate-400 font-mono">Live Feed</span>
                  </div>
                  <div id="notif-items" class="space-y-2 max-h-72 overflow-y-auto pr-1"></div>
                </div>
              </div>

              <!-- User avatar thumbnail -->
              <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}" class="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 object-cover cursor-pointer" onclick="App.showStudentProfile('${user.identifier}')" />
            </div>
          </header>

          <!-- Main Dynamic Page Body -->
          <main class="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <div id="role-view-container"></div>
          </main>
        </div>

        <!-- ============================================== -->
        <!-- MOBILE BOTTOM NAVIGATION (Android Bottom Bar)  -->
        <!-- ============================================== -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c101c]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 flex items-center justify-around">
          ${navItems.slice(0, 4).map(item => `
            <button onclick="App.switchTab('${item.id}')" class="flex flex-col items-center py-1 px-3 text-xs ${this.activeTab === item.id ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}">
              <i class="fas fa-${item.icon} text-sm mb-1"></i>
              <span class="text-[10px] tracking-tight">${item.label.split(' ')[0]}</span>
            </button>
          `).join('')}
          <button onclick="App.toggleMobileSidebar(true)" class="flex flex-col items-center py-1 px-3 text-xs text-slate-400 hover:text-slate-200">
            <i class="fas fa-bars text-sm mb-1"></i>
            <span class="text-[10px] tracking-tight">Menu</span>
          </button>
        </nav>

      </div>

      <!-- ========================================================= -->
      <!-- GEN-TECH AI: additive assistant available in every panel -->
      <!-- ========================================================= -->
      <button id="gt-ai-fab" onclick="App.toggleAI(true)" aria-label="Open GenTech AI" class="gt-ai-fab">
        <span class="gt-ai-fab-glow"></span>
        <i class="fas fa-sparkles"></i>
        <span class="gt-ai-fab-label">AI</span>
      </button>

      <div id="gt-ai-panel" class="gt-ai-panel hidden" aria-hidden="true">
        <div class="gt-ai-header">
          <div class="flex items-center gap-3 min-w-0">
            <div class="gt-ai-icon"><i class="fas fa-sparkles"></i></div>
            <div class="min-w-0">
              <div class="text-sm font-bold truncate">GenTech AI Assistant</div>
              <div class="text-[10px] text-slate-400 truncate">Gemini • ${roleBadgeLabel} • ${activeItem.label}</div>
            </div>
          </div>
          <button onclick="App.toggleAI(false)" class="gt-ai-close" aria-label="Close AI"><i class="fas fa-times"></i></button>
        </div>
        <div id="gt-ai-messages" class="gt-ai-messages">
          <div class="gt-ai-welcome">
            <div class="font-semibold mb-1">How can I help?</div>
            <div class="text-xs text-slate-400 leading-relaxed">Ask about academics, schedules, exams, departments, campus services, or get AI-powered academic-support recommendations.</div>
            <div class="flex flex-wrap gap-2 mt-3">
              <button onclick="App.aiQuickAsk('What should I focus on in this panel?')" class="gt-ai-chip">Panel help</button>
              <button onclick="App.aiQuickAsk('Explain my academic performance and what I should improve.')" class="gt-ai-chip">Academic review</button>
              <button onclick="App.aiQuickAsk('What are the important academic services available to me?')" class="gt-ai-chip">Services</button>
            </div>
          </div>
        </div>
        <div class="gt-ai-actions">
          <button onclick="App.runAIInsights()" class="gt-ai-insight-btn"><i class="fas fa-chart-line mr-1.5"></i> Academic AI Insights</button>
        </div>
        <form onsubmit="App.sendAI(event)" class="gt-ai-input-wrap">
          <input id="gt-ai-input" autocomplete="off" placeholder="Ask GenTech AI..." class="gt-ai-input" />
          <button type="submit" class="gt-ai-send"><i class="fas fa-paper-plane"></i></button>
        </form>
      </div>

      <!-- Global Modal Shell -->
      <div id="modal-container" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div id="modal-box" class="glass-dropdown max-w-lg w-full rounded-3xl p-6 border border-white/[0.1] shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <!-- Injected Modal Content -->
        </div>
      </div>
    `;

    // Render Role View
    const container = document.getElementById('role-view-container');
    if (user.role === 'director') {
      UIDirector.render(container, user);
    } else if (user.role === 'hod') {
      UIHod.render(container, user);
    } else if (user.role === 'faculty') {
      UIFaculty.render(container, user);
    } else if (user.role === 'coordinator') {
      UICoordinator.render(container, user);
    } else {
      UIStudent.render(container, user);
    }

    this.loadNotifications(user.id);
  },

  // Switch tab in both sidebar and role module
  showNoticeImage(url) {
    if (!url) return;
    this.showModal(`
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="text-sm font-bold text-white">Notice Image</div>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white"><i class="fas fa-times"></i></button>
        </div>
        <img src="${url}" alt="Notice image" class="w-full max-h-[75vh] object-contain rounded-xl bg-black/20" />
      </div>`);
  },

  renderContactPage(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="space-y-5">
        <div class="glass-panel rounded-2xl p-6 md:p-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
              <i class="fas fa-headset text-lg"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Contact Us</h2>
              <p class="text-xs text-slate-400 mt-1">Need help? Reach the right GenTech College support team.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <a href="mailto:support@gentechcollege.edu" class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition">
              <div class="text-indigo-300 mb-2"><i class="fas fa-envelope"></i></div>
              <div class="text-xs font-bold text-white">Technical Support</div>
              <div class="text-[11px] text-slate-400 mt-1">support@gentechcollege.edu</div>
              <div class="text-[10px] text-slate-600 mt-2">Login, AI assistant, portal or technical issues</div>
            </a>
            <a href="mailto:academics@gentechcollege.edu" class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition">
              <div class="text-violet-300 mb-2"><i class="fas fa-graduation-cap"></i></div>
              <div class="text-xs font-bold text-white">Academic Office</div>
              <div class="text-[11px] text-slate-400 mt-1">academics@gentechcollege.edu</div>
              <div class="text-[10px] text-slate-600 mt-2">Exams, results, attendance and academic matters</div>
            </a>
            <a href="mailto:admin@gentechcollege.edu" class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition">
              <div class="text-emerald-300 mb-2"><i class="fas fa-building"></i></div>
              <div class="text-xs font-bold text-white">Administration</div>
              <div class="text-[11px] text-slate-400 mt-1">admin@gentechcollege.edu</div>
              <div class="text-[10px] text-slate-600 mt-2">General college and administrative enquiries</div>
            </a>
            <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div class="text-amber-300 mb-2"><i class="fas fa-clock"></i></div>
              <div class="text-xs font-bold text-white">Office Hours</div>
              <div class="text-[11px] text-slate-400 mt-1">Monday – Friday • 9:00 AM – 5:00 PM</div>
              <div class="text-[10px] text-slate-600 mt-2">For urgent issues, use the Technical Support email.</div>
            </div>
          </div>
          <div class="mt-5 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-[11px] text-slate-400">
            <i class="fas fa-circle-info text-indigo-300 mr-1"></i> Include your name, role, ID and a short description when contacting support so the team can help faster.
          </div>
        </div>
      </div>`;
  },

  async switchTab(tabId) {
    const user = this.currentUser;
    if (!user) return;

    this.activeTab = tabId;

    const navItems = this.getNavItems(user.role);
    const item = navItems.find(n => n.id === tabId);

    // Update topbar and AI context immediately.
    const titleEl = document.getElementById('topbar-title');
    if (titleEl && item) titleEl.innerText = item.label;
    const aiPanelMeta = document.querySelector('#gt-ai-panel .gt-ai-header .text-\\[10px\\]');
    if (aiPanelMeta && item) {
      aiPanelMeta.innerText = `Gemini • ${user.role.toUpperCase()} • ${item.label}`;
    }

    // Update active navigation immediately.
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const dItem = document.getElementById(`desktop-nav-${tabId}`);
    if (dItem) dItem.classList.add('active');
    const mItem = document.getElementById(`mobile-nav-${tabId}`);
    if (mItem) mItem.classList.add('active');

    // Never leave the previous page visible while the next page is loading.
    const containers = {
      director: 'director-tab-content',
      hod: 'hod-tab-content',
      faculty: 'faculty-tab-content',
      coordinator: 'coordinator-tab-content',
      student: 'student-tab-content'
    };
    const target = document.getElementById(containers[user.role]);
    if (target) {
      target.innerHTML = `
        <div class="gt-page-loading">
          <div class="gt-loading-ring"></div>
          <div>
            <div class="text-xs font-bold text-white">Loading ${item?.label || 'page'}</div>
            <div class="text-[10px] text-slate-500 mt-1">Preparing your GenTech workspace…</div>
          </div>
        </div>`;
    }

    // Close mobile navigation after selection.
    if (typeof this.toggleMobileSidebar === 'function') this.toggleMobileSidebar(false);

    try {
      if (tabId === 'contact') {
        this.renderContactPage(target);
        return;
      }
      if (user.role === 'director' && typeof UIDirector.switchTab === 'function') {
        await UIDirector.switchTab(tabId);
      } else if (user.role === 'hod' && typeof UIHod.switchTab === 'function') {
        await UIHod.switchTab(tabId);
      } else if (user.role === 'faculty' && typeof UIFaculty.switchTab === 'function') {
        await UIFaculty.switchTab(tabId);
      } else if (user.role === 'coordinator' && typeof UICoordinator.switchTab === 'function') {
        await UICoordinator.switchTab(tabId);
      } else if (user.role === 'student' && typeof UIStudent.switchTab === 'function') {
        await UIStudent.switchTab(tabId);
      }
    } catch (err) {
      console.error('[GenTech navigation]', err);
      if (target) {
        target.innerHTML = `
          <div class="glass-panel rounded-2xl p-8 text-center gt-nav-error">
            <div class="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <h3 class="text-sm font-bold text-white">Could not load this page</h3>
            <p class="text-xs text-slate-400 mt-1">${String(err?.message || 'Something went wrong while loading this section.')}</p>
            <button onclick="App.switchTab('${tabId}')"
              class="mt-4 px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:scale-[1.02] transition">
              Retry
            </button>
          </div>`;
      }
    }
  },

  toggleMobileSidebar(open) {
    const drawer = document.getElementById('mobile-sidebar-drawer');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    if (!drawer || !backdrop) return;

    if (open) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    } else {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    }
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async loadNotifications(userId) {
    const list = await API.getNotifications(userId);
    const container = document.getElementById('notif-items');
    if (!container) return;

    container.innerHTML = list.length ? list.map(n => `
      <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
        <div class="font-semibold text-white">${n.title}</div>
        <p class="text-slate-400 leading-snug">${n.message}</p>
        <div class="text-[10px] text-slate-500 font-mono">${n.time}</div>
      </div>
    `).join('') : '<div class="text-slate-400 text-xs text-center py-3">No notifications right now.</div>';
  },

  toggleNotifications() {
    const drop = document.getElementById('notifications-dropdown');
    if (drop) drop.classList.toggle('hidden');
  },

  // -------------------------------------------------------------
  // GLOBAL SEARCH (Section 23 Spec)
  // -------------------------------------------------------------
  async handleGlobalSearch(e) {
    const query = e.target.value.trim();
    const dropdown = document.getElementById('global-search-dropdown');
    if (!dropdown) return;

    if (query.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }

    const results = await API.globalSearch(query);
    if (!results || results.length === 0) {
      dropdown.innerHTML = '<div class="p-3 text-xs text-slate-400 text-center">No student or faculty found.</div>';
      dropdown.classList.remove('hidden');
      return;
    }

    dropdown.innerHTML = results.map(r => `
      <div onclick="App.showStudentProfile('${r.details.studentId || r.title}')" class="p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition text-xs border-b border-white/[0.04] last:border-none">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-white">${r.title}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono ${r.type === 'Student' ? 'bg-purple-500/15 text-purple-300' : 'bg-emerald-500/15 text-emerald-300'}">${r.type}</span>
        </div>
        <div class="text-slate-400 mt-0.5">${r.subtitle}</div>
      </div>
    `).join('');

    dropdown.classList.remove('hidden');
  },

  // -------------------------------------------------------------
  // STUDENT PROFILE MODAL
  // -------------------------------------------------------------
  async showStudentProfile(studentId) {
    const searchRes = await API.globalSearch(studentId);
    let student = searchRes.find(s => s.type === 'Student');

    const s = student?.details || {
      name: 'Rahul Sharma',
      studentId: 'CSE23B023',
      department: 'CSE',
      section: 'CSE-B',
      year: 2,
      semester: 3,
      rollNo: 23,
      email: 'rahul@student.edu',
      phone: '+91 98765 43210',
      attendance: '87%',
      sgpa: '8.2',
      cgpa: '8.0'
    };

    this.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div class="flex items-center gap-3">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=RahulSharma23" class="w-12 h-12 rounded-2xl bg-white/[0.03] p-1 border border-white/10" />
            <div>
              <h3 class="text-base font-bold text-white">${student?.title || s.name}</h3>
              <p class="text-xs text-slate-400 font-mono">${s.studentId || studentId} • Section ${s.section}</p>
            </div>
          </div>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div class="text-slate-500 uppercase font-mono text-[10px]">Department & Year</div>
            <div class="font-semibold text-white mt-1">${s.department} • 2nd Year (Sem 3)</div>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div class="text-slate-500 uppercase font-mono text-[10px]">Roll Number</div>
            <div class="font-semibold text-white mt-1">Roll #${s.rollNo || 23}</div>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div class="text-slate-500 uppercase font-mono text-[10px]">Attendance</div>
            <div class="font-semibold text-emerald-400 mt-1">${s.attendance}</div>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div class="text-slate-500 uppercase font-mono text-[10px]">Academic SGPA / CGPA</div>
            <div class="font-semibold text-white mt-1">${s.sgpa} / 10 • CGPA: ${s.cgpa}</div>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
          <div><span class="text-slate-500">Email:</span> <strong class="text-slate-200">${s.email}</strong></div>
          <div><span class="text-slate-500">Phone:</span> <strong class="text-slate-200">${s.phone}</strong></div>
        </div>

        <div class="flex justify-end pt-2">
          <button onclick="App.closeModal()" class="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    `);
  },

  // -------------------------------------------------------------
  // MODALS & TOASTS
  // -------------------------------------------------------------
  showModal(contentHtml) {
    const modal = document.getElementById('modal-container');
    const box = document.getElementById('modal-box');
    if (!modal || !box) return;
    box.innerHTML = contentHtml;
    modal.classList.remove('hidden');
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.classList.add('hidden');
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';

    let icon = 'fas fa-info-circle text-blue-400';
    if (type === 'success') icon = 'fas fa-check-circle text-emerald-400';
    if (type === 'error') icon = 'fas fa-exclamation-circle text-rose-400';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle text-amber-400';

    toast.innerHTML = `
      <i class="${icon} text-base"></i>
      <div class="text-xs text-slate-200 font-medium leading-snug flex-1">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease-out';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
