// ==============================================================================
// STUDENT LEARNING PORTAL UI MODULE — Minimalist Modern Design
// ==============================================================================

const UIStudent = {
  currentTab: 'dashboard',
  selectedSubject: null,
  activeSubjectTab: 'notes',

  async render(container, user) {
    this.currentTab = (typeof App !== 'undefined' && App.activeTab) ? App.activeTab : 'dashboard';

    const dept = user.department || 'CSE';
    const section = user.sectionName ? user.sectionName.split('-')[1] : 'B';
    const identifier = user.identifier || 'CSE23B023';
    const rollNo = user.rollNo || 23;
    const avatarSeed = (user.name || 'RahulSharma').replace(/\s+/g, '');

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Minimalist Header Banner -->
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img src="${user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}"
                   class="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex-shrink-0" />
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-bold text-white">Welcome, ${user.name || 'Rahul Sharma'} 👋</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08]">Student</span>
                </div>
                <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                  ${identifier} &bull; ${dept} / 2nd Year / Section ${section} &bull; Roll #${rollNo}
                </p>
              </div>
            </div>
            <!-- Quick Actions -->
            <div class="flex items-center gap-2">
              <button onclick="UIStudent.openAskDoubtGlobalModal()"
                class="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs transition hover:bg-slate-100 flex items-center gap-1.5">
                <i class="fas fa-question-circle"></i> Ask Doubt
              </button>
              <button onclick="UIStudent.openApplyLeaveModal()"
                class="px-3.5 py-1.5 rounded-xl bg-white/[0.06] text-slate-200 border border-white/[0.08] text-xs font-medium transition hover:bg-white/[0.10] flex items-center gap-1.5">
                <i class="fas fa-plane-departure text-[10px]"></i> Apply Leave
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic Content Area -->
        <div id="student-tab-content">
          <div class="flex items-center justify-center p-12 text-slate-500 text-sm">
            <i class="fas fa-spinner fa-spin mr-2"></i> Loading...
          </div>
        </div>
      </div>
    `;

    await this.loadTab(this.currentTab);
  },

  async switchTab(tabId) {
    this.currentTab = tabId;
    await this.loadTab(tabId);
  },

  async loadTab(tabId) {
    const container = document.getElementById('student-tab-content');
    if (!container) return;

    // ── DASHBOARD ──────────────────────────────────────────────────────────────
    if (tabId === 'dashboard') {
      const doubts = await API.getDoubts();
      const waitingCount = doubts.filter(d => d.status === 'Waiting for Teacher').length;

      container.innerHTML = `
        <div class="space-y-4">
          <!-- Attendance Warning -->
          <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span class="text-amber-400 text-sm mt-0.5">⚠️</span>
            <div>
              <div class="text-xs font-bold text-amber-300">Attendance Warning — Discrete Mathematics (79%)</div>
              <div class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                You are close to the 75% minimum. Attend the next 3 lecture sessions to stay exam-eligible.
              </div>
            </div>
          </div>

          <!-- Stat Cards -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            ${[
              { label: 'Attendance',   value: '87%',          sub: 'Overall across 5 subjects',  color: 'text-emerald-400', tab: null },
              { label: 'Current SGPA', value: '8.2',          sub: 'CGPA: 8.0 (Semester 3)',     color: 'text-violet-400',  tab: null },
              { label: 'Assignments',  value: '3',            sub: 'Pending submissions',        color: 'text-amber-400',   tab: 'subjects' },
              { label: 'Doubts',       value: waitingCount || 1, sub: 'Waiting for teacher',    color: 'text-sky-400',     tab: 'doubts' },
              { label: 'Exams',        value: '2',            sub: 'Upcoming mid-sem',           color: 'text-rose-400',    tab: 'exams' }
            ].map(s => `
              <div class="glass-panel p-4 rounded-xl ${s.tab ? 'cursor-pointer hover:border-white/20 transition' : ''}"
                   ${s.tab ? `onclick="App.switchTab('${s.tab}')"` : ''}>
                <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">${s.label}</div>
                <div class="text-2xl font-extrabold ${s.color} mt-1 font-mono">${s.value}</div>
                <div class="text-[10px] text-slate-500 mt-1.5">${s.sub}</div>
              </div>
            `).join('')}
          </div>

          <!-- My Subjects Showcase -->
          <div class="glass-panel rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm font-bold text-white">My Subjects &bull; CSE-B</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Tap a subject to open Notes, Assignments, DPP, or Doubts</div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              ${[
                { id: 'sub-dsa',  name: 'Data Structures & Algorithms', code: 'CS301', teacher: 'Prof. R.K. Sharma',   notes: 3, color: 'violet' },
                { id: 'sub-dbms', name: 'Database Management Systems',  code: 'CS302', teacher: 'Dr. Priya Verma',    notes: 1, color: 'blue'   },
                { id: 'sub-os',   name: 'Operating Systems',            code: 'CS303', teacher: 'Prof. Amit Sen',     notes: 1, color: 'emerald'},
                { id: 'sub-math', name: 'Discrete Mathematics',         code: 'MA301', teacher: 'Dr. Neha Gupta',    notes: 1, color: 'amber'  },
                { id: 'sub-cn',   name: 'Computer Networks',            code: 'CS304', teacher: 'Prof. Vikram Joshi', notes: 0, color: 'cyan'   }
              ].map(sub => `
                <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 cursor-pointer hover:border-white/20 transition flex flex-col justify-between gap-3"
                     onclick="UIStudent.openSubjectModal('${sub.id}', '${sub.name}', '${sub.teacher}')">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]">${sub.code}</span>
                      <span class="text-[10px] text-slate-500">${sub.notes} Notes</span>
                    </div>
                    <div class="text-xs font-bold text-white leading-snug">${sub.name}</div>
                    <div class="text-[10px] text-slate-500 mt-1">${sub.teacher}</div>
                  </div>
                  <div class="grid grid-cols-4 gap-1 text-[10px] font-semibold text-center">
                    <span class="py-1 rounded bg-white/[0.04] text-slate-300">Notes</span>
                    <span class="py-1 rounded bg-white/[0.04] text-slate-300">Asg</span>
                    <span class="py-1 rounded bg-white/[0.04] text-sky-400">DPP🚀</span>
                    <span class="py-1 rounded bg-white/[0.04] text-amber-400">Doubt❓</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

    // ── SUBJECTS ───────────────────────────────────────────────────────────────
    } else if (tabId === 'subjects') {
      const subjects = await API.getSubjects('CSE');
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5">
          <div class="mb-4">
            <div class="text-sm font-bold text-white">Course Curriculum & Learning Hub</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Active Semester 3 courses for CSE-B</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${subjects.slice(0, 5).map(sub => `
              <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]">${sub.code}</span>
                    <span class="text-[10px] text-slate-500">${sub.credits} Credits</span>
                  </div>
                  <div class="text-xs font-bold text-white">${sub.name}</div>
                  <div class="text-[10px] text-slate-500 mt-1">${sub.facultyName}</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button onclick="UIStudent.openSubjectModal('${sub.id}', '${sub.name}', '${sub.facultyName}', 'notes')"
                    class="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 transition">📄 Notes</button>
                  <button onclick="UIStudent.openSubjectModal('${sub.id}', '${sub.name}', '${sub.facultyName}', 'assignments')"
                    class="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 transition">📝 Asg</button>
                  <button onclick="UIStudent.openSubjectModal('${sub.id}', '${sub.name}', '${sub.facultyName}', 'dpp')"
                    class="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.05] hover:bg-white/[0.10] text-sky-400 transition">🚀 DPP</button>
                  <button onclick="UIStudent.openSubjectModal('${sub.id}', '${sub.name}', '${sub.facultyName}', 'doubts')"
                    class="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.05] hover:bg-white/[0.10] text-amber-400 transition">❓ Doubt</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    // ── DOUBTS ─────────────────────────────────────────────────────────────────
    } else if (tabId === 'doubts') {
      const doubts = await API.getDoubts();
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-2">
                <i class="fas fa-comments text-violet-400"></i> My Doubts & Teacher Replies
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">Auto-routed to assigned teacher</div>
            </div>
            <button onclick="UIStudent.openAskDoubtGlobalModal()"
              class="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition">
              + Ask Doubt
            </button>
          </div>

          <div class="space-y-3">
            ${doubts.length ? doubts.map(d => `
              <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">${d.subjectName}</span>
                    <span class="text-[10px] text-slate-500">→ ${d.facultyName}</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                    d.status === 'Answered'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  }">
                    ${d.status === 'Answered' ? '🟢 Answered' : '🟡 Waiting'}
                  </span>
                </div>

                <div class="p-3 rounded-xl bg-black/30 border border-white/[0.05]">
                  <div class="text-[10px] text-slate-500 mb-1">Your Question</div>
                  <p class="text-xs text-slate-200">"${d.question}"</p>
                  ${d.attachmentUrl ? `
                    <div class="mt-2.5 pt-2.5 border-t border-white/[0.05] flex items-center gap-2">
                      <img src="${d.attachmentUrl}" class="w-16 h-16 rounded-lg object-cover border border-white/[0.08] cursor-pointer"
                           onclick="window.open('${d.attachmentUrl}', '_blank')" />
                      <div class="text-[10px] text-slate-500">
                        <div class="text-violet-400 font-bold"><i class="fas fa-camera"></i> Attached Photo</div>
                        <div>${d.attachmentName || 'diagram.jpg'}</div>
                      </div>
                    </div>
                  ` : ''}
                </div>

                ${(d.replies || []).map(r => `
                  <div class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                    <div class="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                      <span><i class="fas fa-check-circle"></i> ${r.authorName}</span>
                      <span class="text-slate-500 font-mono">${r.createdAt}</span>
                    </div>
                    <p class="text-xs text-slate-200 leading-relaxed">${r.message}</p>
                  </div>
                `).join('')}

                ${(!d.replies || d.replies.length === 0) ? `
                  <div class="text-[10px] text-slate-500 italic flex items-center gap-1.5">
                    <i class="fas fa-hourglass-half text-amber-400"></i> Teacher notified — reply coming soon.
                  </div>
                ` : ''}
              </div>
            `).join('') : `
              <div class="text-center py-10 text-slate-500 text-xs">
                <i class="fas fa-comments text-2xl mb-3 block text-slate-700"></i>
                No doubts yet. Ask your first doubt above!
              </div>
            `}
          </div>
        </div>
      `;

    // ── ATTENDANCE ─────────────────────────────────────────────────────────────
    } else if (tabId === 'attendance') {
      const attList = await API.getStudentAttendance(((typeof App !== 'undefined' && App.currentUser) || {}).id);
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-sm font-bold text-white">Course Attendance Breakdown</div>
              <div class="text-[11px] text-slate-500 mt-0.5">Overall: <span class="text-emerald-400 font-mono font-bold">87%</span></div>
            </div>
          </div>
          <div class="space-y-3">
            ${attList.map(a => `
              <div class="p-4 rounded-xl bg-white/[0.02] border ${a.status === 'Warning' ? 'border-amber-500/30 bg-amber-500/[0.03]' : 'border-white/[0.06]'}">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <div class="text-xs font-bold text-white">${a.name}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">${a.faculty} &bull; ${a.attended}/${a.total} classes</div>
                  </div>
                  <div class="text-right">
                    <div class="text-base font-extrabold font-mono ${a.percentage < 80 ? 'text-amber-400' : 'text-emerald-400'}">${a.percentage}%</div>
                    <span class="text-[10px] font-semibold ${a.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'}">
                      ${a.status === 'Warning' ? '⚠️ Near 75% limit' : '✓ Good'}
                    </span>
                  </div>
                </div>
                <div class="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div class="${a.percentage < 80 ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full" style="width: ${a.percentage}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    // ── TIMETABLE ──────────────────────────────────────────────────────────────
    } else if (tabId === 'timetable') {
      const timetable = await API.getTimetable(((typeof App !== 'undefined' && App.currentUser) || {}).sectionName || 'CSE-B');
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5">
          <div class="mb-4">
            <div class="text-sm font-bold text-white">Weekly Class Schedule — CSE-B</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Lectures, labs & faculty assignments</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${timetable.map(t => `
              <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                <div class="flex items-center justify-between text-[10px] font-mono text-violet-400 mb-1">
                  <span>${t.day}</span><span>${t.time}</span>
                </div>
                <div class="text-xs font-bold text-white">${t.subject}</div>
                <div class="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
                  <span>Room: ${t.room}</span>
                  <span class="text-slate-400">${t.faculty}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    // ── EXAMS & RESULTS ────────────────────────────────────────────────────────
    } else if (tabId === 'exams') {
      const exams   = await API.getExams();
      const results = await API.getResults(((typeof App !== 'undefined' && App.currentUser) || {}).id);
      container.innerHTML = `
        <div class="space-y-4">
          <!-- Upcoming Exams -->
          <div class="glass-panel rounded-2xl p-5">
            <div class="text-sm font-bold text-white mb-3">Upcoming Examinations (Mid-Sem)</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${exams.map(e => `
                <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div class="text-[10px] font-mono text-violet-400 font-bold">${e.code}</div>
                    <div class="text-xs font-bold text-white mt-0.5">${e.subject}</div>
                    <div class="text-[10px] text-slate-500 mt-1">${e.date} &bull; ${e.time} &bull; ${e.room}</div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">${e.status}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Results -->
          <div class="glass-panel rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm font-bold text-white">Semester 3 Academic Performance</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Internal evaluations & mid-semester scorecard</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">SGPA: 8.2</span>
                <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/[0.06] text-slate-300">CGPA: 8.0</span>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b border-white/[0.06] text-[10px] text-slate-500 uppercase tracking-wider">
                    <th class="py-2.5 px-3">Subject</th>
                    <th class="py-2.5 px-3">Internal</th>
                    <th class="py-2.5 px-3">Mid-Sem</th>
                    <th class="py-2.5 px-3">End-Sem</th>
                    <th class="py-2.5 px-3">Total</th>
                    <th class="py-2.5 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                  ${results.marks.map(m => `
                    <tr class="hover:bg-white/[0.02] transition">
                      <td class="py-2.5 px-3 text-xs font-semibold text-white">${m.subject}</td>
                      <td class="py-2.5 px-3 text-xs font-mono text-slate-400">${m.internal}</td>
                      <td class="py-2.5 px-3 text-xs font-mono text-slate-400">${m.midSem}</td>
                      <td class="py-2.5 px-3 text-xs font-mono text-slate-400">${m.endSem}</td>
                      <td class="py-2.5 px-3 text-xs font-bold font-mono text-emerald-400">${m.total}</td>
                      <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/15 text-violet-300">${m.grade}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

    // ── LEAVES ─────────────────────────────────────────────────────────────────
    } else if (tabId === 'leaves') {
      const leaves = await API.getLeaves({ studentId: ((typeof App !== 'undefined' && App.currentUser) || {}).id });
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-sm font-bold text-white">My Leave Applications</div>
              <div class="text-[11px] text-slate-500 mt-0.5">Reviewed by Class Coordinator (Prof. Kavita Nair)</div>
            </div>
            <button onclick="UIStudent.openApplyLeaveModal()"
              class="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition">
              + Apply Leave
            </button>
          </div>
          <div class="space-y-3">
            ${leaves.length ? leaves.map(l => `
              <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">${l.type}</span>
                    <span class="text-[10px] text-slate-500">${l.fromDate} → ${l.toDate}</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                    l.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' :
                    l.status === 'Rejected' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                  }">${l.status}</span>
                </div>
                <p class="text-xs text-slate-400 italic bg-black/20 px-3 py-2 rounded-lg border border-white/[0.04]">"${l.reason}"</p>
                ${l.reviewNote ? `<div class="text-[10px] text-violet-400/80">Coordinator Note: ${l.reviewNote} (${l.reviewedBy})</div>` : ''}
              </div>
            `).join('') : `
              <div class="text-center py-10 text-slate-500 text-xs">
                <i class="fas fa-calendar-check text-2xl mb-3 block text-slate-700"></i>
                No leave applications yet.
              </div>
            `}
          </div>
        </div>
      `;

    // ── NOTICES ────────────────────────────────────────────────────────────────
    } else if (tabId === 'notices') {
      const notices = await API.getNotices();
      const studentNotices = notices.filter(n =>
        n.target === 'Entire College' ||
        n.target.includes('CSE') ||
        n.target.includes('All') ||
        n.targetType === 'college'
      );
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-2">
                <i class="fas fa-bullhorn text-violet-400"></i> Official Notices
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">College, CSE Department & Section B notices</div>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">
              ${studentNotices.length} Active
            </span>
          </div>
          <div class="space-y-3">
            ${studentNotices.length ? studentNotices.map(n => `
              <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2 hover:border-white/15 transition">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${
                      n.priority === 'High' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' : 'bg-white/[0.06] text-slate-400'
                    }">${n.priority}</span>
                    <span class="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">${n.target}</span>
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono">${n.date}</span>
                </div>
                <div class="text-xs font-bold text-white">${n.title}</div>
                <p class="text-[11px] text-slate-400 leading-relaxed">${n.content}</p>
                ${n.imageUrl ? `<img src="${n.imageUrl}" alt="Notice image" class="mt-3 w-full max-h-80 object-contain rounded-xl border border-white/[0.06] bg-black/10 cursor-zoom-in" onclick="App.showNoticeImage('${n.imageUrl}')" />` : ''}
                <div class="text-[10px] text-slate-600 pt-1.5 border-t border-white/[0.04]">
                  Issued by: <span class="text-slate-500">${n.author}</span>
                </div>
              </div>
            `).join('') : `
              <div class="text-center py-10 text-slate-500 text-xs">
                <i class="fas fa-bullhorn text-2xl mb-3 block text-slate-700"></i>
                No notices yet.
              </div>
            `}
          </div>
        </div>
      `;
    }
  },

  // ── SUBJECT MODAL (Notes / Assignments / DPP / Ask Doubt) ──────────────────
  async openSubjectModal(subjectId, subjectName, teacherName, defaultTab = 'notes') {
    this.selectedSubject = { id: subjectId, name: subjectName, teacher: teacherName };
    this.activeSubjectTab = defaultTab;

    const notes       = await API.getNotes(subjectId);
    const assignments = await API.getAssignments(((typeof App !== 'undefined' && App.currentUser) || {}).sectionName || 'CSE-B');
    const dppSets     = await API.getDpp(subjectId);

    App.showModal(`
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <div class="text-base font-bold text-white">${subjectName}</div>
            <div class="text-[10px] text-violet-400 font-mono mt-0.5">Teacher: <strong>${teacherName}</strong></div>
          </div>
          <button onclick="App.closeModal()" class="text-slate-500 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <!-- 4 Sub-Tabs -->
        <div class="grid grid-cols-4 gap-1.5">
          ${[
            { id: 'notes',       label: '📄 Notes',       count: notes.length },
            { id: 'assignments', label: '📝 Assignments',  count: assignments.length },
            { id: 'dpp',         label: '🚀 DPP',          count: dppSets.length },
            { id: 'doubts',      label: '❓ Ask Doubt',    count: '' }
          ].map(t => `
            <button onclick="UIStudent.switchSubjectModalTab('${t.id}')" id="sub-tab-btn-${t.id}"
              class="py-2 rounded-xl text-[10px] font-bold transition ${
                this.activeSubjectTab === t.id
                  ? 'bg-white text-slate-950'
                  : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.10]'
              }">
              ${t.label}${t.count !== '' ? ` (${t.count})` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Body -->
        <div id="subject-modal-body" class="max-h-[480px] overflow-y-auto pr-1 space-y-2">
          <!-- Dynamic -->
        </div>
      </div>
    `);

    this.renderSubjectModalContent();
  },

  switchSubjectModalTab(tabId) {
    this.activeSubjectTab = tabId;
    ['notes', 'assignments', 'dpp', 'doubts'].forEach(t => {
      const btn = document.getElementById(`sub-tab-btn-${t}`);
      if (btn) {
        btn.className = `py-2 rounded-xl text-[10px] font-bold transition ${
          t === tabId
            ? 'bg-white text-slate-950'
            : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.10]'
        }`;
      }
    });
    this.renderSubjectModalContent();
  },

  async renderSubjectModalContent() {
    const body = document.getElementById('subject-modal-body');
    if (!body || !this.selectedSubject) return;

    if (this.activeSubjectTab === 'notes') {
      const notes = await API.getNotes(this.selectedSubject.id);
      body.innerHTML = notes.length ? notes.map(n => `
        <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-bold text-white">${n.title}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">${n.description}</div>
            <div class="text-[10px] text-slate-600 font-mono mt-1.5">
              <i class="fas fa-file-pdf text-rose-400"></i> ${n.fileName} &bull; ${n.author} &bull; ${n.uploadDate}
            </div>
          </div>
          <a href="${n.fileUrl}" download="${n.fileName}"
            class="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white text-slate-950 hover:bg-slate-100 transition flex items-center gap-1 flex-shrink-0">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      `).join('') : `<div class="text-slate-500 text-center py-8 text-xs">No notes published yet.</div>`;

    } else if (this.activeSubjectTab === 'assignments') {
      const assignments = await API.getAssignments(((typeof App !== 'undefined' && App.currentUser) || {}).sectionName || 'CSE-B');
      body.innerHTML = assignments.map(a => `
        <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-bold text-white">${a.title}</div>
            <span class="text-[10px] text-violet-400 font-mono">Due: ${a.dueDate}</span>
          </div>
          <p class="text-[10px] text-slate-500">${a.description}</p>
          <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] text-emerald-400"><i class="fas fa-check-circle"></i> Ready for submission</span>
            <button onclick="UIStudent.openSubmitAssignmentModal('${a.id}', '${a.title}')"
              class="px-3 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-950 hover:bg-slate-100 transition">
              Submit
            </button>
          </div>
        </div>
      `).join('');

    } else if (this.activeSubjectTab === 'dpp') {
      const dppSets = await API.getDpp(this.selectedSubject.id);
      const set = dppSets[0];
      if (!set) {
        body.innerHTML = `
          <div class="text-center py-10 text-slate-500 text-xs">
            <div class="text-3xl mb-2">🚀</div>
            <div class="font-bold text-white text-sm">DPP Practice Session</div>
            <div class="mt-1">Coming soon for this subject!</div>
          </div>
        `;
        return;
      }
      body.innerHTML = `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-violet-950/20 border border-violet-800/30 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-violet-300">${set.title}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">5 Questions &bull; Instant Evaluation</div>
            </div>
            <div class="text-amber-400 font-bold text-[10px] flex items-center gap-1">
              <i class="fas fa-fire"></i> ${set.streakDay} Day Streak
            </div>
          </div>
          <div class="space-y-3">
            ${set.questions.map((q, idx) => `
              <div class="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
                <div class="text-xs font-bold text-white flex items-start gap-2">
                  <span class="text-violet-400 font-mono">Q${idx + 1}.</span>
                  <span>${q.question}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  ${q.options.map((opt, oIdx) => `
                    <button type="button" onclick="UIStudent.handleQuizAnswer('${q.id}', ${oIdx}, ${q.correctIndex})"
                      id="opt-${q.id}-${oIdx}"
                      class="quiz-option p-2.5 rounded-lg text-[10px] text-left bg-black/30 border border-white/[0.06] text-slate-300 font-medium">
                      ${String.fromCharCode(65 + oIdx)}. ${opt}
                    </button>
                  `).join('')}
                </div>
                <div id="exp-${q.id}" class="hidden text-[10px] text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/30">
                  <strong>Explanation:</strong> ${q.explanation}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } else if (this.activeSubjectTab === 'doubts') {
      body.innerHTML = `
        <form onsubmit="UIStudent.submitSubjectDoubt(event)" class="space-y-3">
          <div class="p-3 rounded-xl bg-violet-950/20 border border-violet-800/30 text-[10px] text-violet-300 space-y-1">
            <div><strong>Student:</strong> Rahul Sharma (CSE23B023)</div>
            <div><strong>Department:</strong> CSE &bull; Section B</div>
            <div><strong>Subject:</strong> ${this.selectedSubject.name}</div>
            <div><strong>Teacher:</strong> ${this.selectedSubject.teacher}</div>
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-slate-400 mb-1">Your Question / Doubt</label>
            <textarea id="sub-doubt-question" rows="4" required
              class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-white text-xs"
              placeholder="Sir, I don't understand this algorithm..."></textarea>
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-slate-400 mb-1">Attach Photo / Diagram (Optional)</label>
            <input type="file" id="sub-doubt-photo" accept="image/*"
              class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-slate-400 text-xs" />
          </div>
          <div class="flex justify-end pt-1">
            <button type="submit"
              class="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition">
              Send to ${this.selectedSubject.teacher}
            </button>
          </div>
        </form>
      `;
    }
  },

  handleQuizAnswer(qId, selectedIdx, correctIdx) {
    const btn = document.getElementById(`opt-${qId}-${selectedIdx}`);
    const exp = document.getElementById(`exp-${qId}`);
    if (exp) exp.classList.remove('hidden');
    if (selectedIdx === correctIdx) {
      if (btn) btn.classList.add('correct');
      App.toast('Correct answer! +5 points', 'success');
    } else {
      if (btn) btn.classList.add('incorrect');
      const correctBtn = document.getElementById(`opt-${qId}-${correctIdx}`);
      if (correctBtn) correctBtn.classList.add('correct');
      App.toast('Incorrect. Review the explanation below.', 'error');
    }
  },

  async submitSubjectDoubt(e) {
    e.preventDefault();
    const question = document.getElementById('sub-doubt-question').value;
    const photo    = document.getElementById('sub-doubt-photo').files[0];

    const formData = new FormData();
    formData.append('question',       question);
    formData.append('subjectId',      this.selectedSubject.id);
    formData.append('subjectName',    this.selectedSubject.name);
    formData.append('studentId',      App.currentUser.id);
    formData.append('studentName',    App.currentUser.name);
    formData.append('studentRoll',    App.currentUser.identifier);
    formData.append('studentAvatar',  App.currentUser.avatar || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(App.currentUser.name || 'student')));
    formData.append('department',     App.currentUser.department || 'CSE');
    formData.append('section',        App.currentUser.sectionName || 'CSE-B');
    if (this.selectedSubject.facultyId) formData.append('facultyId', this.selectedSubject.facultyId);
    formData.append('facultyName',    this.selectedSubject.teacher);
    if (photo) formData.append('photo', photo);

    await API.createDoubt(formData);
    App.closeModal();
    App.toast(`Doubt sent to ${this.selectedSubject.teacher}!`, 'success');
    if (this.currentTab === 'doubts') this.loadTab('doubts');
  },

  openAskDoubtGlobalModal() {
    this.openSubjectModal('sub-dsa', 'Data Structures & Algorithms', 'Prof. R.K. Sharma', 'doubts');
  },

  openSubmitAssignmentModal(asgId, title) {
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div class="text-sm font-bold text-white">Submit: ${title}</div>
          <button onclick="App.closeModal()" class="text-slate-500 hover:text-white text-xl">&times;</button>
        </div>
        <form onsubmit="UIStudent.handleSubmitAssignment(event, '${asgId}')" class="space-y-3">
          <div>
            <label class="block text-[10px] font-semibold text-slate-400 mb-1">Attach Solution PDF</label>
            <input type="file" id="asg-sol-file" accept=".pdf"
              class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-slate-400 text-xs" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="App.closeModal()"
              class="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition">Cancel</button>
            <button type="submit"
              class="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition">
              Submit Assignment
            </button>
          </div>
        </form>
      </div>
    `);
  },

  async handleSubmitAssignment(e, asgId) {
    e.preventDefault();
    const file = document.getElementById('asg-sol-file').files[0];
    const formData = new FormData();
    formData.append('studentId',   App.currentUser.id);
    formData.append('studentName', App.currentUser.name);
    formData.append('studentRoll', App.currentUser.identifier);
    if (file) formData.append('file', file);

    await API.submitAssignment(asgId, formData);
    App.closeModal();
    App.toast('Assignment submitted successfully!', 'success');
  },

  openApplyLeaveModal() {
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fas fa-plane-departure text-violet-400"></i> Apply for Leave
          </div>
          <button onclick="App.closeModal()" class="text-slate-500 hover:text-white text-xl">&times;</button>
        </div>
        <form onsubmit="UIStudent.submitApplyLeave(event)" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-semibold text-slate-400 mb-1">From Date</label>
              <input type="date" id="leave-from" required value="2026-10-15"
                class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-white text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-400 mb-1">To Date</label>
              <input type="date" id="leave-to" required value="2026-10-17"
                class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-white text-xs" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-slate-400 mb-1">Leave Category</label>
            <select id="leave-type"
              class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-white text-xs">
              <option value="Medical">Medical (Health / Doctor consultation)</option>
              <option value="Personal">Personal / Family Function</option>
              <option value="Academic">Academic (Conference / Hackathon)</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-slate-400 mb-1">Detailed Reason</label>
            <textarea id="leave-reason" rows="3" required
              class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-white text-xs"
              placeholder="Explain reason for absence..."></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="App.closeModal()"
              class="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition">Cancel</button>
            <button type="submit"
              class="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition">
              Submit to Coordinator
            </button>
          </div>
        </form>
      </div>
    `);
  },

  async submitApplyLeave(e) {
    e.preventDefault();
    const fromDate = document.getElementById('leave-from').value;
    const toDate   = document.getElementById('leave-to').value;
    const type     = document.getElementById('leave-type').value;
    const reason   = document.getElementById('leave-reason').value;

    await API.applyLeave({
      studentId:   App.currentUser.id,
      studentName: App.currentUser.name,
      studentRoll: App.currentUser.identifier,
      section:     App.currentUser.sectionName || 'CSE-B',
      fromDate,
      toDate,
      type,
      reason
    });

    App.closeModal();
    App.toast('Leave application submitted to Coordinator Prof. Kavita Nair!', 'success');
    if (this.currentTab === 'leaves') this.loadTab('leaves');
  }
};
