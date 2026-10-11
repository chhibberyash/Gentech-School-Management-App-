const UIDirector = {
  currentTab: 'overview',

  async render(container, user) {
    this.currentTab = App.activeTab || 'overview';

    // =========================================================
    // MINIMAL PROFESSIONAL DIRECTOR UI
    // =========================================================

    if (!document.getElementById('director-minimal-ui')) {
      const style = document.createElement('style');
      style.id = 'director-minimal-ui';

      style.textContent = `
        .director-shell {
          min-height: calc(100vh - 2rem);
          color: #172033;
        }

        .director-layout {
          align-items: flex-start;
        }

        .director-sidebar {
          width: 248px;
          flex: 0 0 248px;
          background: #ffffff;
          border: 1px solid #e7eaf0;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
        }

        .director-main {
          min-width: 0;
        }

        .director-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 5px 5px 22px;
          margin-bottom: 10px;
          border-bottom: 1px solid #eef0f4;
        }

        .director-brand-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #172033;
          color: #ffffff;
          font-weight: 800;
        }

        .director-nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 13px;
          border-radius: 11px;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          transition: all 0.18s ease;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .director-nav-btn:hover {
          background: #f5f7fa;
          color: #172033;
        }

        .director-nav-btn.active {
          background: #fff7ed;
          color: #c2410c;
          box-shadow: inset 3px 0 0 #f59e0b;
        }

        .director-nav-btn i {
          width: 18px;
          text-align: center;
          font-size: 14px;
        }

        .director-page-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .director-user {
          margin-top: auto;
          padding-top: 18px;
          border-top: 1px solid #eef0f4;
        }

        .director-topbar {
          background: #ffffff;
          border: 1px solid #e7eaf0;
          border-radius: 18px;
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.045);
        }

        .director-content-card {
          background: #ffffff !important;
          border: 1px solid #e7eaf0 !important;
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.045) !important;
          color: #172033 !important;
        }

        .director-main .text-white {
          color: #172033 !important;
        }

        .director-main .text-slate-200 {
          color: #334155 !important;
        }

        .director-main .text-slate-300 {
          color: #475569 !important;
        }

        .director-main .text-slate-400 {
          color: #64748b !important;
        }

        .director-main .text-slate-500 {
          color: #94a3b8 !important;
        }

        .director-main .bg-white\\/\\[0.02\\] {
          background: #fafbfc !important;
        }

        .director-main .bg-white\\/\\[0.04\\] {
          background: #f8fafc !important;
        }

        .director-main .border-white\\/\\[0.06\\],
        .director-main .border-white\\/\\[0.04\\],
        .director-main .border-white\\/\\[0.08\\] {
          border-color: #e7eaf0 !important;
        }

        .director-main input,
        .director-main select,
        .director-main textarea {
          background: #ffffff !important;
          color: #172033 !important;
          border-color: #dfe4ea !important;
        }

        .director-main input::placeholder,
        .director-main textarea::placeholder {
          color: #94a3b8 !important;
        }

        .director-main table {
          color: #172033;
        }

        .director-main th {
          color: #64748b !important;
        }

        .director-main td {
          color: #334155;
        }

        .director-main .hover\\:bg-white\\/\\[0.02\\]:hover {
          background: #f8fafc !important;
        }

        @media (max-width: 1100px) {
          .director-sidebar {
            width: 220px;
            flex-basis: 220px;
          }
        }

        @media (max-width: 900px) {
          .director-layout {
            flex-direction: column !important;
          }

          .director-sidebar {
            width: 100%;
            flex-basis: auto;
          }

          .director-nav {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 5px;
          }

          .director-nav-btn {
            justify-content: center;
            padding: 10px 6px;
            font-size: 11px;
          }

          .director-nav-btn span {
            display: inline;
          }

          .director-brand {
            margin-bottom: 8px;
            padding-bottom: 12px;
          }

          .director-user {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .director-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .director-topbar {
            padding: 16px !important;
          }
        }

        @media (max-width: 420px) {
          .director-nav {
            grid-template-columns: 1fr 1fr;
          }

          .director-nav-btn span {
            font-size: 10px;
          }
        }
      `;

      document.head.appendChild(style);
    }

    // =========================================================
    // NAVIGATION
    // =========================================================

    const nav = [
      ['overview', 'fa-chart-pie', 'Overview'],
      ['college', 'fa-building-columns', 'College'],
      ['students', 'fa-user-graduate', 'Students'],
      ['faculty', 'fa-chalkboard-teacher', 'Faculty'],
      ['attendance', 'fa-calendar-check', 'Attendance'],
      ['notices', 'fa-bullhorn', 'Notices']
    ];

    const pageTitles = {
      overview: 'Institution Overview',
      college: 'College Structure',
      students: 'Students Directory',
      faculty: 'Faculty Directory',
      attendance: 'Attendance Analytics',
      notices: 'College Notices'
    };

    // =========================================================
    // MAIN SHELL
    // =========================================================

    container.innerHTML = `
      <div class="director-shell director-layout flex gap-5 p-1 md:p-2">

        <!-- =====================================================
             SIDEBAR
        ====================================================== -->

        <aside class="director-sidebar p-4 flex flex-col">

          <!-- BRAND -->

          <div class="director-brand">

            <div class="director-brand-mark">
              <i class="fas fa-graduation-cap"></i>
            </div>

            <div class="min-w-0">

              <div class="font-extrabold text-[15px] text-slate-900 truncate">
                GenTech
              </div>

              <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                College Management
              </div>

            </div>

          </div>

          <!-- SECTION LABEL -->

          <div class="px-2 mb-2 director-page-label">
            Directorate
          </div>

          <!-- NAVIGATION -->

          <nav class="director-nav space-y-1">

            ${nav.map(([id, icon, label]) => `
              <button
                type="button"
                data-director-tab="${id}"
                onclick="UIDirector.switchTab('${id}')"
                class="director-nav-btn ${
                  this.currentTab === id ? 'active' : ''
                }"
              >

                <i class="fas ${icon}"></i>

                <span>
                  ${label}
                </span>

              </button>
            `).join('')}

          </nav>

          <!-- USER -->

          <div class="director-user">

            <div class="flex items-center gap-3 px-2">

              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <i class="fas fa-user-tie text-sm"></i>
              </div>

              <div class="min-w-0">

                <div class="text-xs font-bold text-slate-800 truncate">
                  ${user.name}
                </div>

                <div class="text-[10px] text-slate-400">
                  Director
                </div>

              </div>

            </div>

          </div>

        </aside>


        <!-- =====================================================
             MAIN CONTENT
        ====================================================== -->

        <main class="director-main flex-1">

          <!-- TOP BAR -->

          <div class="director-topbar px-5 py-4 md:px-6 md:py-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <div class="director-page-label mb-1">
                Institutional Directorate
              </div>

              <h1
                id="director-page-title"
                class="text-xl md:text-2xl font-extrabold tracking-tight"
              >
                ${pageTitles[this.currentTab] || 'Institution Overview'}
              </h1>

              <p class="text-xs text-slate-500 mt-1">
                Academic Council & Institutional Governance
              </p>

            </div>


            <!-- QUICK ACTIONS -->

            <div class="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onclick="UIDirector.openNoticeModal()"
                class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <i class="fas fa-bullhorn"></i>
                Post Notice
              </button>


              <button
                type="button"
                onclick="UIDirector.openAddStudentModal()"
                class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center gap-2"
              >
                <i class="fas fa-user-plus"></i>
                Add Student
              </button>


              <button
                type="button"
                onclick="UIDirector.openAddFacultyModal()"
                class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center gap-2"
              >
                <i class="fas fa-user-tie"></i>
                Add Faculty
              </button>

            </div>

          </div>


          <!-- TAB CONTENT -->

          <div id="director-tab-content">

            <div class="director-content-card rounded-2xl p-12 flex items-center justify-center text-slate-500 text-sm">

              <i class="fas fa-spinner fa-spin text-lg mr-2"></i>

              Loading data...

            </div>

          </div>

        </main>

      </div>
    `;

    await this.loadTab(this.currentTab);
  },


  // ===========================================================
  // TAB SWITCHING
  // ===========================================================

  async switchTab(tabId) {
    this.currentTab = tabId;

    // Keep App's existing active tab state
    App.activeTab = tabId;

    // Update sidebar active state
    document.querySelectorAll('[data-director-tab]').forEach(btn => {
      btn.classList.toggle(
        'active',
        btn.dataset.directorTab === tabId
      );
    });

    // Update page title
    const pageTitles = {
      overview: 'Institution Overview',
      college: 'College Structure',
      students: 'Students Directory',
      faculty: 'Faculty Directory',
      attendance: 'Attendance Analytics',
      notices: 'College Notices'
    };

    const title = document.getElementById('director-page-title');

    if (title) {
      title.textContent =
        pageTitles[tabId] || 'Institution Overview';
    }

    await this.loadTab(tabId);
  },


  // ===========================================================
  // LOAD TAB
  // ===========================================================

  async loadTab(tabId) {
    const container =
      document.getElementById('director-tab-content');

    if (!container) return;


    // =========================================================
    // OVERVIEW
    // =========================================================

    if (tabId === 'overview') {

      const stats = await API.getStats();

      container.innerHTML = `

        <!-- STAT CARDS -->

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

          <!-- STUDENTS -->

          <div class="director-content-card rounded-2xl p-5">

            <div class="flex items-start justify-between">

              <div>

                <p class="text-xs font-semibold text-slate-500">
                  Total Students
                </p>

                <h3 class="text-2xl font-extrabold mt-2">
                  ${stats.totalStudents ?? 0}
                </h3>

              </div>

              <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <i class="fas fa-user-graduate"></i>
              </div>

            </div>

            <p class="text-[11px] text-slate-400 mt-3">
              Enrolled students
            </p>

          </div>


          <!-- FACULTY -->

          <div class="director-content-card rounded-2xl p-5">

            <div class="flex items-start justify-between">

              <div>

                <p class="text-xs font-semibold text-slate-500">
                  Total Faculty
                </p>

                <h3 class="text-2xl font-extrabold mt-2">
                  ${stats.totalFaculty ?? 0}
                </h3>

              </div>

              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i class="fas fa-chalkboard-teacher"></i>
              </div>

            </div>

            <p class="text-[11px] text-slate-400 mt-3">
              Active faculty members
            </p>

          </div>


          <!-- DEPARTMENTS -->

          <div class="director-content-card rounded-2xl p-5">

            <div class="flex items-start justify-between">

              <div>

                <p class="text-xs font-semibold text-slate-500">
                  Departments
                </p>

                <h3 class="text-2xl font-extrabold mt-2">
                  ${stats.departments ?? 0}
                </h3>

              </div>

              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i class="fas fa-building"></i>
              </div>

            </div>

            <p class="text-[11px] text-slate-400 mt-3">
              Academic departments
            </p>

          </div>


          <!-- SECTIONS -->

          <div class="director-content-card rounded-2xl p-5">

            <div class="flex items-start justify-between">

              <div>

                <p class="text-xs font-semibold text-slate-500">
                  Sections
                </p>

                <h3 class="text-2xl font-extrabold mt-2">
                  ${stats.sections ?? 0}
                </h3>

              </div>

              <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <i class="fas fa-layer-group"></i>
              </div>

            </div>

            <p class="text-[11px] text-slate-400 mt-3">
              Active sections
            </p>

          </div>

        </div>


        <!-- SECONDARY STATS -->

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

          <div class="director-content-card rounded-2xl p-5">

            <p class="text-xs text-slate-500">
              Attendance
            </p>

            <div class="flex items-end gap-2 mt-2">

              <span class="text-2xl font-extrabold">
                ${stats.attendance ?? 0}%
              </span>

            </div>

          </div>


          <div class="director-content-card rounded-2xl p-5">

            <p class="text-xs text-slate-500">
              Average Result
            </p>

            <div class="flex items-end gap-2 mt-2">

              <span class="text-2xl font-extrabold">
                ${stats.averageResult ?? 0}%
              </span>

            </div>

          </div>


          <div class="director-content-card rounded-2xl p-5">

            <p class="text-xs text-slate-500">
              Pending Approvals
            </p>

            <div class="flex items-end gap-2 mt-2">

              <span class="text-2xl font-extrabold">
                ${stats.pendingApprovals ?? 0}
              </span>

            </div>

          </div>


          <div class="director-content-card rounded-2xl p-5">

            <p class="text-xs text-slate-500">
              Active Notices
            </p>

            <div class="flex items-end gap-2 mt-2">

              <span class="text-2xl font-extrabold">
                ${stats.activeNotices ?? 0}
              </span>

            </div>

          </div>

        </div>


        <!-- DEPARTMENT PERFORMANCE -->

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <div class="director-content-card rounded-2xl p-6">

            <div class="flex items-center justify-between mb-5">

              <div>

                <h3 class="font-bold text-base">
                  Department Performance
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Academic performance overview
                </p>

              </div>

              <i class="fas fa-chart-line text-slate-400"></i>

            </div>

            <div class="space-y-4">

              ${
                (stats.deptStats || []).map(dept => `
                  <div>

                    <div class="flex justify-between mb-1">

                      <span class="text-xs font-semibold">
                        ${dept.name}
                      </span>

                      <span class="text-xs text-slate-500">
                        ${dept.performance ?? dept.average ?? 0}%
                      </span>

                    </div>

                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        class="h-full bg-slate-800 rounded-full"
                        style="width:${dept.performance ?? dept.average ?? 0}%"
                      ></div>

                    </div>

                  </div>
                `).join('')
              }

            </div>

          </div>


          <!-- CSE SECTIONS -->

          <div class="director-content-card rounded-2xl p-6">

            <div class="flex items-center justify-between mb-5">

              <div>

                <h3 class="font-bold text-base">
                  CSE Section Comparison
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Section-wise academic overview
                </p>

              </div>

              <i class="fas fa-users text-slate-400"></i>

            </div>

            <div class="space-y-3">

              ${
                (stats.cseSections || []).map(section => `
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">

                    <div class="flex items-center gap-3">

                      <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs">
                        ${section.name || section.section || '-'}
                      </div>

                      <div>

                        <div class="text-sm font-semibold">
                          Section ${section.name || section.section || '-'}
                        </div>

                        <div class="text-[11px] text-slate-400">
                          ${section.students ?? 0} students
                        </div>

                      </div>

                    </div>

                    <div class="text-sm font-bold">
                      ${section.performance ?? section.average ?? 0}%
                    </div>

                  </div>
                `).join('')
              }

            </div>

          </div>

        </div>

      `;
    }


    // =========================================================
    // COLLEGE
    // =========================================================

    else if (tabId === 'college') {

      const depts = await API.getDepartments();
      const sections = await API.getSections();

      container.innerHTML = `

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- DEPARTMENTS -->

          <div class="director-content-card rounded-2xl p-6">

            <div class="flex items-center justify-between mb-5">

              <div>

                <h3 class="font-bold text-base">
                  Departments
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Academic departments in the institution
                </p>

              </div>

              <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <i class="fas fa-building"></i>
              </div>

            </div>


            <div class="space-y-2">

              ${
                (depts || []).map(dept => `

                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">

                    <div class="flex items-center gap-3">

                      <div class="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <i class="fas fa-building-columns text-slate-500"></i>
                      </div>

                      <div>

                        <div class="font-semibold text-sm">
                          ${dept.name || dept.department || '-'}
                        </div>

                        <div class="text-[11px] text-slate-400">
                          ${dept.code || ''}
                        </div>

                      </div>

                    </div>

                  </div>

                `).join('') || `

                  <div class="text-center py-10 text-sm text-slate-400">
                    No departments found.
                  </div>

                `}

            </div>

          </div>


          <!-- SECTIONS -->

          <div class="director-content-card rounded-2xl p-6">

            <div class="flex items-center justify-between mb-5">

              <div>

                <h3 class="font-bold text-base">
                  Sections
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Active academic sections
                </p>

              </div>

              <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <i class="fas fa-layer-group"></i>
              </div>

            </div>


            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

              ${
                (sections || []).map(section => `

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">

                    <div class="flex items-center justify-between">

                      <div>

                        <div class="font-bold text-sm">
                          ${section.name || section.section || '-'}
                        </div>

                        <div class="text-[11px] text-slate-400 mt-1">
                          ${section.department || section.dept || ''}
                        </div>

                      </div>

                      <i class="fas fa-users text-slate-400"></i>

                    </div>

                  </div>

                `).join('') || `

                  <div class="col-span-full text-center py-10 text-sm text-slate-400">
                    No sections found.
                  </div>

                `}

            </div>

          </div>

        </div>

      `;
    }


    // =========================================================
    // STUDENTS
    // =========================================================

    else if (tabId === 'students') {

      const studentsData =
        await API.getStudents({
          limit: 50
        });

      const students = studentsData.items || [];

      container.innerHTML = `

        <div class="director-content-card rounded-2xl overflow-hidden">

          <!-- HEADER -->

          <div class="p-5 border-b border-slate-200">

            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              <div>

                <h3 class="font-bold text-base">
                  Students Directory
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Search and manage enrolled students
                </p>

              </div>


              <button
                onclick="UIDirector.openAddStudentModal()"
                class="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 w-fit"
              >
                <i class="fas fa-user-plus"></i>
                Add Student
              </button>

            </div>


            <!-- FILTERS -->

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

              <div class="relative">

                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>

                <input
                  id="director-stu-search"
                  type="text"
                  placeholder="Search student..."
                  oninput="UIDirector.filterStudents()"
                  class="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-100"
                />

              </div>


              <select
                id="director-stu-sec"
                onchange="UIDirector.filterStudents()"
                class="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              >

                <option value="">
                  All Sections
                </option>

                <option value="A">
                  Section A
                </option>

                <option value="B">
                  Section B
                </option>

                <option value="C">
                  Section C
                </option>

              </select>

            </div>

          </div>


          <!-- TABLE -->

          <div class="overflow-x-auto">

            <table class="w-full min-w-[760px]">

              <thead class="bg-slate-50">

                <tr>

                  <th class="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-bold">
                    Student
                  </th>

                  <th class="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-bold">
                    Student ID
                  </th>

                  <th class="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-bold">
                    Roll No.
                  </th>

                  <th class="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-bold">
                    Department
                  </th>

                  <th class="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-bold">
                    Section
                  </th>

                  <th class="text-right px-5 py-3 text-[11px] uppercase tracking-wider font-bold">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody
                id="director-students-tbody"
                class="divide-y divide-slate-100"
              >

                ${
                  students.map(student => `

                    <tr class="hover:bg-slate-50 transition">

                      <td class="px-5 py-4">

                        <div class="flex items-center gap-3">

                          <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                            ${(student.name || '?').charAt(0).toUpperCase()}
                          </div>

                          <div>

                            <div class="text-sm font-semibold">
                              ${student.name || '-'}
                            </div>

                            <div class="text-[11px] text-slate-400">
                              ${student.email || ''}
                            </div>

                          </div>

                        </div>

                      </td>


                      <td class="px-5 py-4 text-sm">
                        ${student.studentId || '-'}
                      </td>


                      <td class="px-5 py-4 text-sm">
                        ${student.rollNo || '-'}
                      </td>


                      <td class="px-5 py-4 text-sm">
                        ${student.department || '-'}
                      </td>


                      <td class="px-5 py-4">

                        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                          ${student.section || '-'}
                        </span>

                      </td>


                      <td class="px-5 py-4 text-right">

                        <button
                          onclick="App.showStudentProfile('${student.id || student.studentId}')"
                          class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
                          title="View profile"
                        >
                          <i class="fas fa-arrow-right text-xs"></i>
                        </button>

                      </td>

                    </tr>

                  `).join('') || `

                    <tr>

                      <td
                        colspan="6"
                        class="px-5 py-12 text-center text-sm text-slate-400"
                      >
                        No students found.
                      </td>

                    </tr>

                  `
                }

              </tbody>

            </table>

          </div>

        </div>

      `;
    }


    // =========================================================
    // FACULTY
    // =========================================================

    else if (tabId === 'faculty') {

      const facultyList =
        await API.getFaculty();

      container.innerHTML = `

        <div class="director-content-card rounded-2xl overflow-hidden">

          <div class="p-5 border-b border-slate-200">

            <div class="flex items-center justify-between">

              <div>

                <h3 class="font-bold text-base">
                  Faculty Directory
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Faculty members and academic staff
                </p>

              </div>


              <button
                onclick="UIDirector.openAddFacultyModal()"
                class="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2"
              >
                <i class="fas fa-user-plus"></i>
                Add Faculty
              </button>

            </div>

          </div>


          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">

            ${
              (facultyList || []).map(faculty => `

                <div class="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition">

                  <div class="flex items-start gap-3">

                    <div class="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">

                      <i class="fas fa-user-tie"></i>

                    </div>


                    <div class="min-w-0 flex-1">

                      <div class="font-bold text-sm truncate">
                        ${faculty.name || '-'}
                      </div>

                      <div class="text-xs text-slate-400 mt-1">
                        ${faculty.designation || ''}
                      </div>

                    </div>

                  </div>


                  <div class="mt-5 space-y-2">

                    <div class="flex items-center gap-2 text-xs text-slate-500">

                      <i class="fas fa-building w-4"></i>

                      <span>
                        ${faculty.department || '-'}
                      </span>

                    </div>


                    <div class="flex items-center gap-2 text-xs text-slate-500">

                      <i class="fas fa-book w-4"></i>

                      <span>
                        ${faculty.specialization || '-'}
                      </span>

                    </div>


                    <div class="flex items-center gap-2 text-xs text-slate-500">

                      <i class="fas fa-envelope w-4"></i>

                      <span class="truncate">
                        ${faculty.email || '-'}
                      </span>

                    </div>

                  </div>

                </div>

              `).join('') || `

                <div class="col-span-full py-12 text-center text-sm text-slate-400">
                  No faculty members found.
                </div>

              `
            }

          </div>

        </div>

      `;
    }


    // =========================================================
    // ATTENDANCE
    // =========================================================

    else if (tabId === 'attendance') {

      container.innerHTML = `

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <!-- OVERALL -->

          <div class="director-content-card rounded-2xl p-6">

            <p class="text-xs font-semibold text-slate-500">
              Overall Attendance
            </p>

            <div class="mt-4 flex items-end gap-2">

              <span class="text-4xl font-extrabold">
                86%
              </span>

              <span class="text-xs text-emerald-600 font-semibold mb-1">
                Healthy
              </span>

            </div>

            <div class="h-2 bg-slate-100 rounded-full mt-5 overflow-hidden">

              <div
                class="h-full bg-emerald-500 rounded-full"
                style="width:86%"
              ></div>

            </div>

            <p class="text-[11px] text-slate-400 mt-3">
              Institutional average
            </p>

          </div>


          <!-- LOW ATTENDANCE -->

          <div class="director-content-card rounded-2xl p-6">

            <p class="text-xs font-semibold text-slate-500">
              Low Attendance
            </p>

            <div class="mt-4">

              <span class="text-4xl font-extrabold">
                14%
              </span>

            </div>

            <p class="text-xs text-slate-400 mt-3">
              Students below required attendance
            </p>

          </div>


          <!-- ABSENTEES -->

          <div class="director-content-card rounded-2xl p-6">

            <p class="text-xs font-semibold text-slate-500">
              Today's Absentees
            </p>

            <div class="mt-4">

              <span class="text-4xl font-extrabold">
                32
              </span>

            </div>

            <p class="text-xs text-slate-400 mt-3">
              Attendance records
            </p>

          </div>

        </div>


        <!-- ANALYTICS -->

        <div class="director-content-card rounded-2xl p-6 mt-5">

          <div class="flex items-center justify-between mb-6">

            <div>

              <h3 class="font-bold">
                Attendance Analytics
              </h3>

              <p class="text-xs text-slate-400 mt-1">
                Institutional attendance overview
              </p>

            </div>

            <i class="fas fa-chart-column text-slate-400"></i>

          </div>


          <div class="space-y-5">

            <div>

              <div class="flex justify-between mb-2">

                <span class="text-xs font-semibold">
                  Computer Science
                </span>

                <span class="text-xs text-slate-500">
                  91%
                </span>

              </div>

              <div class="h-2 bg-slate-100 rounded-full">

                <div
                  class="h-full bg-slate-800 rounded-full"
                  style="width:91%"
                ></div>

              </div>

            </div>


            <div>

              <div class="flex justify-between mb-2">

                <span class="text-xs font-semibold">
                  Electronics
                </span>

                <span class="text-xs text-slate-500">
                  87%
                </span>

              </div>

              <div class="h-2 bg-slate-100 rounded-full">

                <div
                  class="h-full bg-slate-800 rounded-full"
                  style="width:87%"
                ></div>

              </div>

            </div>


            <div>

              <div class="flex justify-between mb-2">

                <span class="text-xs font-semibold">
                  Mechanical
                </span>

                <span class="text-xs text-slate-500">
                  82%
                </span>

              </div>

              <div class="h-2 bg-slate-100 rounded-full">

                <div
                  class="h-full bg-slate-800 rounded-full"
                  style="width:82%"
                ></div>

              </div>

            </div>

          </div>

        </div>

      `;
    }


    // =========================================================
    // NOTICES
    // =========================================================

    else if (tabId === 'notices') {

      const notices =
        await API.getNotices();

      container.innerHTML = `

        <div class="director-content-card rounded-2xl overflow-hidden">

          <div class="p-5 border-b border-slate-200">

            <div class="flex items-center justify-between">

              <div>

                <h3 class="font-bold text-base">
                  College Notices
                </h3>

                <p class="text-xs text-slate-400 mt-1">
                  Institutional announcements and notices
                </p>

              </div>


              <button
                onclick="UIDirector.openNoticeModal()"
                class="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2"
              >
                <i class="fas fa-plus"></i>
                New Notice
              </button>

            </div>

          </div>


          <div class="divide-y divide-slate-100">

            ${
              (notices || []).map(notice => `

                <div class="p-5 hover:bg-slate-50 transition">

                  <div class="flex items-start justify-between gap-4">

                    <div class="flex gap-3 min-w-0">

                      <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">

                        <i class="fas fa-bullhorn"></i>

                      </div>


                      <div class="min-w-0">

                        <h4 class="font-bold text-sm">
                          ${notice.title || '-'}
                        </h4>

                        <p class="text-xs text-slate-500 mt-2">${notice.content || ''}</p>
                        ${notice.imageUrl ? `<img src="${notice.imageUrl}" alt="Notice image" class="mt-3 w-full max-h-80 object-contain rounded-xl border border-slate-200 bg-slate-50 cursor-zoom-in" onclick="App.showNoticeImage('${notice.imageUrl}')" />` : ''}


                        <div class="flex flex-wrap items-center gap-2 mt-3">

                          <span class="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                            ${notice.target || 'Everyone'}
                          </span>

                          <span class="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                            ${notice.priority || 'Normal'}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              `).join('') || `

                <div class="py-14 text-center">

                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">

                    <i class="fas fa-bullhorn"></i>

                  </div>

                  <p class="text-sm text-slate-400 mt-3">
                    No notices available.
                  </p>

                </div>

              `
            }

          </div>

        </div>

      `;
    }
  },


  // ===========================================================
  // FILTER STUDENTS
  // ===========================================================

  async filterStudents() {

    const search =
      document.getElementById('director-stu-search')?.value || '';

    const section =
      document.getElementById('director-stu-sec')?.value || '';

    const tbody =
      document.getElementById('director-students-tbody');

    if (!tbody) return;

    const data =
      await API.getStudents({
        search,
        section,
        limit: 50
      });

    tbody.innerHTML =

      data.items.map(student => `

        <tr class="hover:bg-slate-50 transition">

          <td class="px-5 py-4">

            <div class="flex items-center gap-3">

              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">

                ${(student.name || '?')
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <div class="text-sm font-semibold">
                  ${student.name || '-'}
                </div>

                <div class="text-[11px] text-slate-400">
                  ${student.email || ''}
                </div>

              </div>

            </div>

          </td>


          <td class="px-5 py-4 text-sm">
            ${student.studentId || '-'}
          </td>


          <td class="px-5 py-4 text-sm">
            ${student.rollNo || '-'}
          </td>


          <td class="px-5 py-4 text-sm">
            ${student.department || '-'}
          </td>


          <td class="px-5 py-4">

            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
              ${student.section || '-'}
            </span>

          </td>


          <td class="px-5 py-4 text-right">

            <button
              onclick="App.showStudentProfile('${student.id || student.studentId}')"
              class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
            >
              <i class="fas fa-arrow-right text-xs"></i>
            </button>

          </td>

        </tr>

      `).join('') || `

        <tr>

          <td
            colspan="6"
            class="px-5 py-12 text-center text-sm text-slate-400"
          >
            No students found.
          </td>

        </tr>

      `;
  },


  // ===========================================================
  // NOTICE MODAL
  // ===========================================================

  openNoticeModal() {

    App.showModal(`

      <div class="p-6">

        <div class="flex items-center justify-between mb-5">

          <div>

            <h2 class="text-lg font-bold text-slate-900">
              Publish Notice
            </h2>

            <p class="text-xs text-slate-400 mt-1">
              Send an announcement to the college
            </p>

          </div>

          <button
            onclick="App.closeModal()"
            class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500"
          >
            <i class="fas fa-times"></i>
          </button>

        </div>


        <form
          onsubmit="UIDirector.submitNotice(event)"
          class="space-y-4"
        >

          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Notice Title
            </label>

            <input
              id="not-title"
              required
              type="text"
              placeholder="Enter notice title"
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            />

          </div>


          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Target Audience
              </label>

              <select
                id="not-target"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              >

                <option value="Everyone">
                  Everyone
                </option>

                <option value="Students">
                  Students
                </option>

                <option value="Faculty">
                  Faculty
                </option>

              </select>

            </div>


            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Priority
              </label>

              <select
                id="not-priority"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              >

                <option value="Normal">
                  Normal
                </option>

                <option value="Important">
                  Important
                </option>

                <option value="Urgent">
                  Urgent
                </option>

              </select>

            </div>

          </div>


          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Notice Content
            </label>

            <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Notice Image <span class="font-normal text-slate-400">(optional)</span></label>
            <input id="not-image" type="file" accept="image/*" class="w-full text-xs text-slate-500" />
          </div>

          <div>
            <textarea
              id="not-content"
              required
              rows="5"
              placeholder="Write your announcement..."
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm resize-none"
            ></textarea>

          </div>


          <div class="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onclick="App.closeModal()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Publish Notice
            </button>

          </div>

        </form>

      </div>

    `);
  },


  // ===========================================================
  // SUBMIT NOTICE
  // ===========================================================

  async submitNotice(e) {

    e.preventDefault();

    const title =
      document.getElementById('not-title').value;

    const target =
      document.getElementById('not-target').value;

    const priority =
      document.getElementById('not-priority').value;

    const content =
      document.getElementById('not-content').value;
    const imageFile = document.getElementById('not-image')?.files?.[0];
    let imageUrl = null;
    if (imageFile) {
      const fd = new FormData();
      fd.append('image', imageFile);
      const uploaded = await API.uploadNoticeImage(fd);
      imageUrl = uploaded.imageUrl;
    }

    await API.createNotice({
      title,
      target,
      priority,
      content,
      imageUrl,
      author: 'Office of the Director'
    });


    App.closeModal();

    App.toast(
      'Notice published successfully!',
      'success'
    );


    if (this.currentTab === 'notices') {
      this.loadTab('notices');
    }
  },


  // ===========================================================
  // ADD STUDENT MODAL
  // ===========================================================

  openAddStudentModal() {

    App.showModal(`

      <div class="p-6">

        <div class="flex items-center justify-between mb-5">

          <div>

            <h2 class="text-lg font-bold text-slate-900">
              Add Student
            </h2>

            <p class="text-xs text-slate-400 mt-1">
              Enroll a new student
            </p>

          </div>

          <button
            onclick="App.closeModal()"
            class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500"
          >
            <i class="fas fa-times"></i>
          </button>

        </div>


        <form
          onsubmit="UIDirector.submitAddStudent(event)"
          class="space-y-4"
        >

          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Student Name
            </label>

            <input
              id="add-stu-name"
              required
              type="text"
              placeholder="Full name"
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            />

          </div>


          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Department
              </label>

              <input
                id="add-stu-dept"
                required
                type="text"
                placeholder="Department"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              />

            </div>


            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Section
              </label>

              <select
                id="add-stu-sec"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              >

                <option value="A">
                  Section A
                </option>

                <option value="B">
                  Section B
                </option>

                <option value="C">
                  Section C
                </option>

              </select>

            </div>

          </div>


          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Student ID
              </label>

              <input
                id="add-stu-id"
                required
                type="text"
                placeholder="Student ID"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              />

            </div>


            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Roll Number
              </label>

              <input
                id="add-stu-roll"
                required
                type="text"
                placeholder="Roll number"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              />

            </div>

          </div>


          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Email
            </label>

            <input
              id="add-stu-email"
              required
              type="email"
              placeholder="student@example.com"
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            />

          </div>


          <div class="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onclick="App.closeModal()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Add Student
            </button>

          </div>

        </form>

      </div>

    `);
  },


  // ===========================================================
  // SUBMIT ADD STUDENT
  // ===========================================================

  async submitAddStudent(e) {

    e.preventDefault();

    const studentData = {

      name:
        document.getElementById('add-stu-name').value,

      department:
        document.getElementById('add-stu-dept').value,

      section:
        document.getElementById('add-stu-sec').value,

      studentId:
        document.getElementById('add-stu-id').value,

      rollNo:
        document.getElementById('add-stu-roll').value,

      email:
        document.getElementById('add-stu-email').value
    };


    await API.addStudent(studentData);

    App.closeModal();

    App.toast(
      `Enrolled ${studentData.name} successfully!`,
      'success'
    );


    if (this.currentTab === 'students') {
      this.loadTab('students');
    }
  },


  // ===========================================================
  // ADD FACULTY MODAL
  // ===========================================================

  openAddFacultyModal() {

    App.showModal(`

      <div class="p-6">

        <div class="flex items-center justify-between mb-5">

          <div>

            <h2 class="text-lg font-bold text-slate-900">
              Add Faculty
            </h2>

            <p class="text-xs text-slate-400 mt-1">
              Add a new faculty member
            </p>

          </div>

          <button
            onclick="App.closeModal()"
            class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500"
          >
            <i class="fas fa-times"></i>
          </button>

        </div>


        <form
          onsubmit="UIDirector.submitAddFaculty(event)"
          class="space-y-4"
        >

          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Faculty Name
            </label>

            <input
              id="add-fac-name"
              required
              type="text"
              placeholder="Full name"
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            />

          </div>


          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Department
              </label>

              <input
                id="add-fac-dept"
                required
                type="text"
                placeholder="Department"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              />

            </div>


            <div>

              <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                Designation
              </label>

              <input
                id="add-fac-desig"
                required
                type="text"
                placeholder="Professor / Lecturer"
                class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              />

            </div>

          </div>


          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Specialization
            </label>

            <input
              id="add-fac-spec"
              type="text"
              placeholder="Area of specialization"
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            />

          </div>


          <div>

            <label class="block text-xs font-semibold text-slate-600 mb-1.5">
              Email
            </label>

            <input
              id="add-fac-email"
              required
              type="email"
              placeholder="faculty@example.com"
              class="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            />

          </div>


          <div class="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onclick="App.closeModal()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Add Faculty
            </button>

          </div>

        </form>

      </div>

    `);
  },


  // ===========================================================
  // SUBMIT ADD FACULTY
  // ===========================================================

  async submitAddFaculty(e) {

    e.preventDefault();

    const facultyData = {

      name:
        document.getElementById('add-fac-name').value,

      department:
        document.getElementById('add-fac-dept').value,

      designation:
        document.getElementById('add-fac-desig').value,

      specialization:
        document.getElementById('add-fac-spec').value,

      email:
        document.getElementById('add-fac-email').value
    };


    await API.addFaculty(facultyData);

    App.closeModal();

    App.toast(
      `Added ${facultyData.name} to faculty!`,
      'success'
    );


    if (this.currentTab === 'faculty') {
      this.loadTab('faculty');
    }
  }
};