// ==============================================================================
// HOD UI MODULE - MINIMALIST MODERN DESIGN 👨💼
// ==============================================================================

const UIHod = {
  currentTab: 'departments',

  async render(container, user) {
    this.currentTab = App.activeTab || 'departments';
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Minimalist Header Banner -->
        <div class="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                Department Deanery
              </span>
            </div>
            <h1 class="text-xl md:text-2xl font-bold tracking-tight text-white">${user.name}</h1>
            <p class="text-xs text-slate-400 mt-0.5">Academic Dean & Head of Department • 5 Departments • 11 Sections</p>
          </div>

          <!-- Quick Metrics -->
          <div class="flex items-center gap-2">
            <div class="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <span class="text-[10px] text-slate-400 uppercase font-mono block">Active Sections</span>
              <span class="font-bold text-white text-sm">11 Total</span>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <span class="text-[10px] text-rose-400 uppercase font-mono block">Shortage Warning</span>
              <span class="font-bold text-rose-300 text-sm">18 Students</span>
            </div>
          </div>
        </div>

        <!-- Tab Target Body -->
        <div id="hod-tab-content">
          <div class="flex items-center justify-center p-12 text-slate-500 text-sm">
            <i class="fas fa-spinner fa-spin text-lg mr-2"></i> Loading academic data...
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
    const container = document.getElementById('hod-tab-content');
    if (!container) return;

    if (tabId === 'departments') {
      const depts = await API.getDepartments();
      const sections = await API.getSections();
      const stats = await API.getStats();

      container.innerHTML = `
        <div class="space-y-6">
          <div class="glass-panel rounded-2xl p-5 md:p-6">
            <div class="mb-4">
              <h2 class="text-base font-bold text-white">Academic Departments & Sections</h2>
              <p class="text-slate-400 text-xs">Hierarchy tree across all engineering programs</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4">
              ${depts.map(d => {
                const secList = sections.filter(s => s.deptCode === d.code);
                return `
                  <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300">
                          ${d.code}
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">${secList.length} Sec</span>
                      </div>
                      <h3 class="text-xs font-bold text-white mt-1">${d.name}</h3>
                    </div>

                    <div class="mt-3 pt-2.5 border-t border-white/[0.04]">
                      <div class="space-y-1">
                        ${secList.map(s => `
                          <div class="px-2 py-1 rounded bg-slate-900 text-[11px] font-mono flex items-center justify-between text-slate-200">
                            <span class="font-semibold text-white">${s.fullName}</span>
                            <span class="text-[10px] text-slate-400">Sem ${s.semester}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-5 md:p-6">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Department Academic Metrics</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-white/[0.06] text-slate-400 uppercase">
                    <th class="py-2.5 px-2">Department</th>
                    <th class="py-2.5 px-2">Enrolled</th>
                    <th class="py-2.5 px-2">Attendance</th>
                    <th class="py-2.5 px-2">Avg Result</th>
                    <th class="py-2.5 px-2">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                  ${stats.deptStats.map(ds => `
                    <tr>
                      <td class="py-2.5 px-2 font-bold text-white">${ds.deptCode} • ${ds.deptName}</td>
                      <td class="py-2.5 px-2 text-slate-300 font-mono">${ds.studentsCount} Students</td>
                      <td class="py-2.5 px-2 font-semibold text-emerald-400">${ds.attendance}%</td>
                      <td class="py-2.5 px-2 font-semibold text-slate-200">${ds.avgResult}%</td>
                      <td class="py-2.5 px-2">
                        <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300">Optimal</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (tabId === 'faculty-alloc') {
      const subjects = await API.getSubjects();
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="mb-5">
            <h2 class="text-base font-bold text-white">Faculty Subject Allocation</h2>
            <p class="text-slate-400 text-xs">Teaching assignments across departments and sections</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-white/[0.06] text-slate-400 uppercase">
                  <th class="py-2.5 px-2">Subject</th>
                  <th class="py-2.5 px-2">Dept</th>
                  <th class="py-2.5 px-2">Credits</th>
                  <th class="py-2.5 px-2">Assigned Faculty</th>
                  <th class="py-2.5 px-2">Sections</th>
                  <th class="py-2.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                ${subjects.map(sub => `
                  <tr>
                    <td class="py-2.5 px-2">
                      <div class="font-semibold text-white">${sub.name}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${sub.code}</div>
                    </td>
                    <td class="py-2.5 px-2 font-mono text-slate-300">${sub.deptCode}</td>
                    <td class="py-2.5 px-2 text-slate-300 font-mono">${sub.credits}</td>
                    <td class="py-2.5 px-2 font-medium text-white">${sub.facultyName || 'Unassigned'}</td>
                    <td class="py-2.5 px-2">
                      <div class="flex flex-wrap gap-1">
                        ${(sub.sections || ['All']).map(sec => `
                          <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 font-mono text-slate-300">${sec}</span>
                        `).join('')}
                      </div>
                    </td>
                    <td class="py-2.5 px-2">
                      <button onclick="App.toast('Subject allocation updated for ${sub.code}', 'info')" class="px-2 py-0.5 rounded text-[11px] bg-white/[0.06] hover:bg-white/[0.1] text-slate-200">
                        Reassign
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabId === 'timetable') {
      const timetable = await API.getTimetable('CSE-B');
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 class="text-base font-bold text-white">College Timetable Explorer</h2>
              <p class="text-slate-400 text-xs">Section-wise lecture and laboratory schedules</p>
            </div>
            <select onchange="UIHod.changeTimetableSection(this.value)" class="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white">
              <option value="CSE-B">Section: CSE-B (2nd Year)</option>
              <option value="CSE-A">Section: CSE-A (2nd Year)</option>
              <option value="ECE-A">Section: ECE-A (2nd Year)</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            ${timetable.map(slot => `
              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>${slot.day}</span>
                  <span class="text-white">${slot.time}</span>
                </div>
                <h4 class="font-semibold text-white text-xs">${slot.subject}</h4>
                <div class="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Room: ${slot.room}</span>
                  <span class="text-slate-300">${slot.faculty}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'shortage') {
      const allStudents = await API.getStudents({ limit: 100 });
      const shortageStudents = allStudents.items.filter(s => s.attendance < 80);

      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Attendance Shortage List (<75%)</h2>
              <p class="text-slate-400 text-xs">Students requiring detention notices</p>
            </div>
            <button onclick="App.toast('Automated shortage notifications sent to 18 students!', 'warning')" class="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold transition flex items-center gap-1.5">
              <i class="fas fa-paper-plane text-xs"></i> Send Warning Alerts
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-white/[0.06] text-slate-400 uppercase">
                  <th class="py-2.5 px-2">Student</th>
                  <th class="py-2.5 px-2">Section</th>
                  <th class="py-2.5 px-2">Roll</th>
                  <th class="py-2.5 px-2">Attendance</th>
                  <th class="py-2.5 px-2">Status</th>
                  <th class="py-2.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                ${shortageStudents.slice(0, 10).map(st => `
                  <tr>
                    <td class="py-2.5 px-2 font-semibold text-white">${st.name} (${st.studentId})</td>
                    <td class="py-2.5 px-2 font-mono text-slate-300">${st.sectionName}</td>
                    <td class="py-2.5 px-2 font-mono text-slate-400">#${st.rollNo}</td>
                    <td class="py-2.5 px-2 font-bold text-rose-400">${st.attendance}%</td>
                    <td class="py-2.5 px-2"><span class="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-300">Detention Warning</span></td>
                    <td class="py-2.5 px-2">
                      <button onclick="App.showStudentProfile('${st.studentId}')" class="px-2 py-0.5 rounded text-[11px] bg-white/[0.06] hover:bg-white/[0.1] text-slate-200">
                        Record
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabId === 'exams') {
      const exams = await API.getExams();
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="mb-5">
            <h2 class="text-base font-bold text-white">Examination Schedules</h2>
            <p class="text-slate-400 text-xs">Mid-Semester academic timetable</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            ${exams.map(ex => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono text-indigo-400 font-bold">${ex.code} • ${ex.type}</span>
                  <h4 class="font-semibold text-white text-sm mt-0.5">${ex.subject}</h4>
                  <div class="text-[11px] text-slate-400 mt-1">${ex.date} • ${ex.time} • Room: ${ex.room}</div>
                </div>
                <span class="px-2.5 py-1 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">
                  ${ex.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'notices') {
      const notices = await API.getNotices();
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Academic Notices</h2>
              <p class="text-slate-400 text-xs">Directives issued by Dean & HOD</p>
            </div>
            <button onclick="UIHod.openNoticeModal()" class="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-semibold text-xs">
              + Post Notice
            </button>
          </div>
          <div class="space-y-3">
            ${notices.map(n => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                      n.priority === 'High' ? 'bg-rose-500/15 text-rose-300' : 'bg-white/[0.06] text-slate-300'
                    }">${n.priority}</span>
                    <span class="text-[11px] font-mono text-indigo-400 font-bold">${n.target}</span>
                  </div>
                  <span class="text-[11px] text-slate-500 font-mono">${n.date}</span>
                </div>
                <h3 class="text-sm font-semibold text-white">${n.title}</h3>
                <p class="text-slate-300 text-xs mt-1 leading-relaxed">${n.content}</p>
                ${n.imageUrl ? `<img src="${n.imageUrl}" alt="Notice image" class="mt-3 w-full max-h-80 object-contain rounded-xl border border-white/10 bg-black/10 cursor-zoom-in" onclick="App.showNoticeImage('${n.imageUrl}')" />` : ''}
                <div class="text-[10px] text-slate-500 pt-2 mt-2 border-t border-white/[0.04]">
                  Issued by: <strong class="text-slate-400">${n.author}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  },

  openNoticeModal() {
    App.showModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 class="text-base font-bold text-white">Post Academic Directive</h3>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form onsubmit="UIHod.submitNotice(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Notice Title</label>
            <input type="text" id="hod-not-title" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Directive title..." />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Target</label>
            <select id="hod-not-target" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
              <option value="Entire College">Entire College</option>
              <option value="CSE Department">CSE Department (All 5 Sections)</option>
              <option value="ECE Department">ECE Department</option>
              <option value="IT Department">IT Department</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Priority</label>
            <select id="hod-not-priority" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Notice Image <span class="font-normal text-slate-500">(optional)</span></label>
            <input type="file" id="hod-not-image" accept="image/*" class="w-full text-xs text-slate-400" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Content</label>
            <textarea id="hod-not-content" rows="4" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Write directive..."></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="App.closeModal()" class="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-1.5 rounded-xl bg-white text-slate-950 font-bold">Publish</button>
          </div>
        </form>
      </div>
    `);
  },

  async submitNotice(e) {
    e.preventDefault();
    const title = document.getElementById('hod-not-title').value;
    const target = document.getElementById('hod-not-target').value;
    const priority = document.getElementById('hod-not-priority').value;
    const content = document.getElementById('hod-not-content').value;
    const imageFile = document.getElementById('hod-not-image')?.files?.[0];
    let imageUrl = null;
    if (imageFile) { const fd = new FormData(); fd.append('image', imageFile); const uploaded = await API.uploadNoticeImage(fd); imageUrl = uploaded.imageUrl; }

    await API.createNotice({
      title,
      target,
      priority,
      content,
      imageUrl,
      author: 'Dr. Arvind Swaminathan (HOD)'
    });

    App.closeModal();
    App.toast('Notice published successfully!', 'success');
    if (this.currentTab === 'notices') this.loadTab('notices');
  },

  async changeTimetableSection(sec) {
    const timetable = await API.getTimetable(sec);
    this.loadTab('timetable');
  }
};
