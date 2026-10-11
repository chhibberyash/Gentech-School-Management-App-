// ==============================================================================
// FACULTY UI MODULE - MINIMALIST MODERN DESIGN 👨🏫
// ==============================================================================

const UIFaculty = {
  currentTab: 'dashboard',
  selectedClassSection: 'CSE-B',

  async render(container, user) {
    this.currentTab = App.activeTab || 'dashboard';
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Minimalist Header Banner -->
        <div class="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'}" class="w-12 h-12 rounded-xl object-cover border border-white/10" />
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  Faculty Workspace
                </span>
              </div>
              <h1 class="text-xl md:text-2xl font-bold tracking-tight text-white">${user.name}</h1>
              <p class="text-xs text-slate-400 font-mono">${user.department || 'CSE'} Department • ${user.specialization || 'Data Structures'}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="UIFaculty.openTakeAttendanceModal()" class="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5">
              <i class="fas fa-clipboard-check text-xs"></i> Take Attendance
            </button>
            <button onclick="UIFaculty.openUploadNoteModal()" class="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold transition flex items-center gap-1.5">
              <i class="fas fa-file-upload text-xs"></i> Upload Notes
            </button>
            <button onclick="UIFaculty.openCreateAssignmentModal()" class="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold transition flex items-center gap-1.5">
              <i class="fas fa-tasks text-xs"></i> Assignment
            </button>
          </div>
        </div>

        <!-- Dynamic Body -->
        <div id="faculty-tab-content">
          <div class="flex items-center justify-center p-12 text-slate-500 text-sm">
            <i class="fas fa-spinner fa-spin text-lg mr-2"></i> Loading teaching workspace...
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
    const container = document.getElementById('faculty-tab-content');
    if (!container) return;

    if (tabId === 'dashboard') {
      const doubts = await API.getDoubts({ status: 'Waiting for Teacher' });
      container.innerHTML = `
        <!-- Metrics Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div class="glass-panel p-5 rounded-2xl cursor-pointer hover:border-white/20 transition" onclick="App.switchTab('attendance')">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Attendance</div>
            <div class="text-2xl md:text-3xl font-extrabold text-white mt-1">2</div>
            <div class="text-[11px] text-amber-400 mt-2">CSE-B & CSE-A today</div>
          </div>
          <div class="glass-panel p-5 rounded-2xl cursor-pointer hover:border-white/20 transition" onclick="App.switchTab('assignments')">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Assignments</div>
            <div class="text-2xl md:text-3xl font-extrabold text-white mt-1">3</div>
            <div class="text-[11px] text-emerald-400 mt-2">42 Submissions ready</div>
          </div>
          <div class="glass-panel p-5 rounded-2xl cursor-pointer hover:border-white/20 transition" onclick="App.switchTab('doubts')">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Doubts in Queue</div>
            <div class="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">${doubts.length || 4}</div>
            <div class="text-[11px] text-amber-400 mt-2">Requires response</div>
          </div>
          <div class="glass-panel p-5 rounded-2xl">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Marks Entry</div>
            <div class="text-2xl md:text-3xl font-extrabold text-white mt-1">1</div>
            <div class="text-[11px] text-slate-400 mt-2">Internal assessment</div>
          </div>
        </div>

        <!-- Today's Schedule & Classes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div class="glass-panel rounded-2xl p-5 md:p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-white uppercase tracking-wider">Today's Teaching Schedule</h2>
              <span class="text-[11px] font-mono font-semibold text-emerald-400">MONDAY</span>
            </div>

            <div class="space-y-3">
              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="px-2.5 py-1 rounded bg-white/[0.06] font-mono text-xs font-semibold text-white">09:00 AM</div>
                  <div>
                    <h4 class="font-semibold text-white text-xs">Data Structures & Algorithms</h4>
                    <p class="text-[11px] text-slate-400 font-mono">CSE-B • Room LHC-201</p>
                  </div>
                </div>
                <button onclick="UIFaculty.openTakeAttendanceModal('CSE-B', 'Data Structures')" class="px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25">
                  Attendance
                </button>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="px-2.5 py-1 rounded bg-white/[0.06] font-mono text-xs font-semibold text-white">11:00 AM</div>
                  <div>
                    <h4 class="font-semibold text-white text-xs">Database Management Systems</h4>
                    <p class="text-[11px] text-slate-400 font-mono">CSE-C • Room LHC-203</p>
                  </div>
                </div>
                <button onclick="UIFaculty.openTakeAttendanceModal('CSE-C', 'DBMS')" class="px-2.5 py-1 rounded text-[11px] font-medium bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25">
                  Attendance
                </button>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="px-2.5 py-1 rounded bg-white/[0.06] font-mono text-xs font-semibold text-white">02:00 PM</div>
                  <div>
                    <h4 class="font-semibold text-white text-xs">Programming Lab</h4>
                    <p class="text-[11px] text-slate-400 font-mono">CSE-A • Lab-402</p>
                  </div>
                </div>
                <button onclick="UIFaculty.openTakeAttendanceModal('CSE-A', 'Programming Lab')" class="px-2.5 py-1 rounded text-[11px] font-medium bg-amber-500/15 text-amber-300 hover:bg-amber-500/25">
                  Attendance
                </button>
              </div>
            </div>
          </div>

          <!-- My Classes -->
          <div class="glass-panel rounded-2xl p-5 md:p-6">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Assigned Classes</h2>
            <div class="space-y-3">
              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase text-emerald-400">CSE-B</span>
                  <h4 class="font-semibold text-white text-xs mt-0.5">Data Structures & Algorithms</h4>
                  <p class="text-[11px] text-slate-400 mt-0.5">50 Students Enrolled</p>
                </div>
                <button onclick="App.switchTab('notes')" class="px-2.5 py-1 rounded text-[11px] bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]">
                  Notes
                </button>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase text-indigo-400">CSE-C</span>
                  <h4 class="font-semibold text-white text-xs mt-0.5">Database Management Systems</h4>
                  <p class="text-[11px] text-slate-400 mt-0.5">50 Students Enrolled</p>
                </div>
                <button onclick="App.switchTab('notes')" class="px-2.5 py-1 rounded text-[11px] bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]">
                  Notes
                </button>
              </div>

              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase text-amber-400">CSE-A</span>
                  <h4 class="font-semibold text-white text-xs mt-0.5">Programming Lab</h4>
                  <p class="text-[11px] text-slate-400 mt-0.5">50 Students Enrolled</p>
                </div>
                <button onclick="App.switchTab('notes')" class="px-2.5 py-1 rounded text-[11px] bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]">
                  Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tabId === 'attendance') {
      const studentsData = await API.getStudents({ section: this.selectedClassSection, limit: 50 });
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Attendance Register</h2>
              <p class="text-slate-400 text-xs">Section: <span class="font-mono text-emerald-400">${this.selectedClassSection}</span> • Data Structures</p>
            </div>
            <div class="flex items-center gap-2">
              <select onchange="UIFaculty.selectedClassSection = this.value; UIFaculty.loadTab('attendance')" class="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white">
                <option value="CSE-B" ${this.selectedClassSection === 'CSE-B' ? 'selected' : ''}>CSE-B</option>
                <option value="CSE-A" ${this.selectedClassSection === 'CSE-A' ? 'selected' : ''}>CSE-A</option>
                <option value="CSE-C" ${this.selectedClassSection === 'CSE-C' ? 'selected' : ''}>CSE-C</option>
              </select>
              <button onclick="UIFaculty.markAllPresent()" class="px-3 py-1.5 rounded-xl bg-white/[0.06] text-emerald-300 text-xs font-semibold hover:bg-white/[0.1]">
                Mark All Present
              </button>
              <button onclick="UIFaculty.submitAttendanceRegister()" class="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold">
                Submit Register
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[550px] overflow-y-auto pr-1">
            ${studentsData.items.map(s => `
              <div id="att-card-${s.id}" class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div class="flex items-center gap-2 overflow-hidden">
                  <img src="${s.avatar}" class="w-7 h-7 rounded-full bg-slate-800 flex-shrink-0" />
                  <div class="truncate">
                    <div class="text-xs font-semibold text-white truncate">${s.name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">#${s.rollNo} • ${s.studentId}</div>
                  </div>
                </div>
                <button type="button" onclick="UIFaculty.toggleAttendanceStatus('${s.id}')" id="att-btn-${s.id}" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  P
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'notes') {
      const notes = await API.getNotes('sub-dsa');
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Study Notes & PDFs</h2>
              <p class="text-slate-400 text-xs">Course materials accessible to enrolled students</p>
            </div>
            <button onclick="UIFaculty.openUploadNoteModal()" class="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs">
              + Upload PDF
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            ${notes.map(n => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-mono text-emerald-400 font-bold">${n.subjectName}</span>
                    <span class="text-[11px] text-slate-500 font-mono">${n.uploadDate}</span>
                  </div>
                  <h4 class="font-semibold text-white text-sm">${n.title}</h4>
                  <p class="text-slate-400 text-xs mt-1 leading-relaxed">${n.description}</p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <span class="text-slate-500 text-[11px]"><i class="fas fa-file-pdf text-rose-400"></i> ${n.fileName}</span>
                  <a href="${n.fileUrl}" download="${n.fileName}" class="text-emerald-400 hover:underline font-semibold">
                    Download
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'assignments') {
      const assignments = await API.getAssignments('CSE-B');
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Assignments & Submissions</h2>
              <p class="text-slate-400 text-xs">Track student submissions and issue grades</p>
            </div>
            <button onclick="UIFaculty.openCreateAssignmentModal()" class="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs">
              + New Assignment
            </button>
          </div>

          <div class="space-y-3">
            ${assignments.map(a => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-mono font-bold bg-white/[0.06] px-1.5 py-0.5 rounded text-white">${a.section}</span>
                    <span class="text-xs text-slate-400 font-semibold">${a.subjectName}</span>
                    <span class="text-xs text-slate-500 font-mono">• Due: ${a.dueDate}</span>
                  </div>
                  <h3 class="text-sm font-semibold text-white">${a.title}</h3>
                  <p class="text-slate-400 text-xs mt-0.5">${a.description}</p>
                </div>

                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <div class="text-xs text-slate-400 font-mono">Submitted: <strong class="text-emerald-400">${a.submittedCount}</strong> / Pending: <strong class="text-amber-400">${a.pendingCount}</strong></div>
                  </div>
                  <button onclick="UIFaculty.viewSubmissions('${a.id}', '${a.title}')" class="px-3 py-1 rounded-lg text-xs bg-white/[0.06] hover:bg-white/[0.1] text-white">
                    Submissions
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'doubts') {
      const doubts = await API.getDoubts();
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="mb-5">
            <h2 class="text-base font-bold text-white">Student Doubts Queue</h2>
            <p class="text-slate-400 text-xs">Student questions routed with photo diagram attachments</p>
          </div>

          <div class="space-y-3.5">
            ${doubts.map(d => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <img src="${d.studentAvatar}" class="w-8 h-8 rounded-full bg-slate-800" />
                    <div>
                      <h4 class="text-xs font-bold text-white">${d.studentName}</h4>
                      <div class="text-[10px] text-slate-400 font-mono">${d.studentRoll} • Section ${d.section} • ${d.subjectName}</div>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                    d.status === 'Answered' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                  }">
                    ${d.status === 'Answered' ? 'Answered' : 'Waiting for Reply'}
                  </span>
                </div>

                <div class="p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                  <p class="text-slate-200 text-xs">"${d.question}"</p>
                  ${d.attachmentUrl ? `
                    <div class="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center gap-2.5">
                      <img src="${d.attachmentUrl}" class="w-14 h-14 rounded-lg object-cover border border-white/10 cursor-pointer" onclick="window.open('${d.attachmentUrl}', '_blank')" />
                      <div class="text-[11px] text-slate-400">
                        <span class="text-emerald-400 font-semibold block"><i class="fas fa-paperclip"></i> Attached Diagram</span>
                        <span>Click to view full photo</span>
                      </div>
                    </div>
                  ` : ''}
                </div>

                ${(d.replies || []).map(r => `
                  <div class="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-0.5 ml-4">
                    <div class="text-emerald-300 font-semibold text-[11px]">Faculty Answer (${r.authorName}):</div>
                    <p class="text-slate-200 text-xs leading-relaxed">${r.message}</p>
                  </div>
                `).join('')}

                <div class="flex justify-end pt-1">
                  <button onclick="UIFaculty.openDoubtReplyModal('${d.id}', '${d.studentName}')" class="px-3 py-1 rounded-lg text-xs bg-white text-slate-950 font-bold transition">
                    ${d.status === 'Answered' ? 'Follow-up Reply' : 'Reply to Student'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'notices') {
      const notices = await API.getNotices();
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="mb-5">
            <h2 class="text-base font-bold text-white">Institutional Notices Board</h2>
            <p class="text-slate-400 text-xs">Directives issued by Dean & Academic Council</p>
          </div>
          <div class="space-y-3">
            ${notices.map(n => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-semibold ${n.priority === 'High' ? 'text-rose-400' : 'text-slate-400'}">${n.priority} • ${n.target}</span>
                  <span class="text-[11px] text-slate-500 font-mono">${n.date}</span>
                </div>
                <h3 class="text-sm font-semibold text-white">${n.title}</h3>
                <p class="text-slate-300 text-xs mt-1 leading-relaxed">${n.content}</p>
                <div class="text-[10px] text-slate-500 pt-2 mt-2 border-t border-white/[0.04]">Issued by: <strong class="text-slate-400">${n.author}</strong></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  },

  toggleAttendanceStatus(studentId) {
    const btn = document.getElementById(`att-btn-${studentId}`);
    if (!btn) return;
    if (btn.innerText === 'P') {
      btn.innerText = 'A';
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-rose-500/20 text-rose-300 border border-rose-500/30';
    } else {
      btn.innerText = 'P';
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  },

  markAllPresent() {
    const btns = document.querySelectorAll('[id^="att-btn-"]');
    btns.forEach(btn => {
      btn.innerText = 'P';
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    });
    App.toast('All 50 students marked Present!', 'success');
  },

  submitAttendanceRegister() {
    App.toast('Attendance record for 50 students committed!', 'success');
  },

  openTakeAttendanceModal(section = 'CSE-B', subject = 'Data Structures') {
    this.selectedClassSection = section;
    App.switchTab('attendance');
  },

  openUploadNoteModal() {
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 class="text-base font-bold text-white">Upload Study Notes PDF</h3>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form onsubmit="UIFaculty.submitUploadNote(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Subject</label>
            <select id="note-subject" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
              <option value="sub-dsa">Data Structures & Algorithms (CSE-B)</option>
              <option value="sub-dbms">Database Management Systems (CSE-C)</option>
              <option value="sub-os">Operating Systems (CSE-B)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Title</label>
            <input type="text" id="note-title" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Chapter / Topic title..." />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Description</label>
            <textarea id="note-desc" rows="2" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Key topics covered..."></textarea>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">PDF File</label>
            <input type="file" id="note-file" accept=".pdf" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="App.closeModal()" class="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-1.5 rounded-xl bg-white text-slate-950 font-bold">Upload</button>
          </div>
        </form>
      </div>
    `);
  },

  async submitUploadNote(e) {
    e.preventDefault();
    const title = document.getElementById('note-title').value;
    const desc = document.getElementById('note-desc').value;
    const subjectId = document.getElementById('note-subject').value;
    const fileInput = document.getElementById('note-file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('subjectId', subjectId);
    formData.append('subjectName', 'Data Structures & Algorithms');
    formData.append('author', 'Prof. R.K. Sharma');
    if (fileInput.files[0]) formData.append('file', fileInput.files[0]);

    await API.uploadNote(formData);
    App.closeModal();
    App.toast('Study notes uploaded successfully!', 'success');
    if (this.currentTab === 'notes') this.loadTab('notes');
  },

  openCreateAssignmentModal() {
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 class="text-base font-bold text-white">Create Assignment</h3>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form onsubmit="UIFaculty.submitCreateAssignment(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Subject</label>
              <select id="asg-subject" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                <option value="sub-dsa">Data Structures</option>
                <option value="sub-dbms">DBMS</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Section</label>
              <select id="asg-sec" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                <option value="CSE-B">CSE-B</option>
                <option value="CSE-A">CSE-A</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Title</label>
            <input type="text" id="asg-title" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Assignment title..." />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Instructions</label>
            <textarea id="asg-desc" rows="3" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Problem statements and submission guidelines..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Due Date</label>
              <input type="date" id="asg-due" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" value="2026-10-25" />
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Max Marks</label>
              <input type="number" id="asg-marks" value="20" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="App.closeModal()" class="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-1.5 rounded-xl bg-white text-slate-950 font-bold">Publish</button>
          </div>
        </form>
      </div>
    `);
  },

  async submitCreateAssignment(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('asg-title').value);
    formData.append('description', document.getElementById('asg-desc').value);
    formData.append('section', document.getElementById('asg-sec').value);
    formData.append('subjectId', document.getElementById('asg-subject').value);
    formData.append('subjectName', 'Data Structures');
    formData.append('dueDate', document.getElementById('asg-due').value);
    formData.append('maxMarks', document.getElementById('asg-marks').value);
    formData.append('authorName', 'Prof. R.K. Sharma');

    await API.createAssignment(formData);
    App.closeModal();
    App.toast('Assignment published to students!', 'success');
    if (this.currentTab === 'assignments') this.loadTab('assignments');
  },

  openDoubtReplyModal(doubtId, studentName) {
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 class="text-base font-bold text-white">Reply to ${studentName}'s Doubt</h3>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form onsubmit="UIFaculty.submitDoubtReply(event, '${doubtId}')" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Teacher's Answer / Guidance</label>
            <textarea id="reply-msg" rows="5" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Provide step-by-step explanation..."></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="App.closeModal()" class="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-1.5 rounded-xl bg-white text-slate-950 font-bold">Send Reply</button>
          </div>
        </form>
      </div>
    `);
  },

  async submitDoubtReply(e, doubtId) {
    e.preventDefault();
    const message = document.getElementById('reply-msg').value;
    await API.replyDoubt(doubtId, {
      message,
      authorName: 'Prof. R.K. Sharma',
      authorRole: 'faculty'
    });
    App.closeModal();
    App.toast('Reply sent! Student notified.', 'success');
    if (this.currentTab === 'doubts') this.loadTab('doubts');
  },

  async viewSubmissions(asgId, title) {
    const subs = await API.getSubmissions(asgId);
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 class="text-base font-bold text-white">${title} - Submissions</h3>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div class="space-y-2 max-h-80 overflow-y-auto">
          ${subs.length ? subs.map(s => `
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-white">${s.studentName}</span>
                <span class="text-slate-400 ml-2 font-mono">${s.studentRoll}</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold font-mono">${s.grade}</span>
            </div>
          `).join('') : '<div class="text-slate-400 text-center py-4 text-xs">No submissions recorded yet.</div>'}
        </div>
      </div>
    `);
  }
};
