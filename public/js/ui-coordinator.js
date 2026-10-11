// ==============================================================================
// CLASS COORDINATOR UI MODULE - MINIMALIST MODERN DESIGN 📋
// ==============================================================================

const UICoordinator = {
  currentTab: 'leaves',
  sectionName: 'CSE-B',

  async render(container, user) {
    this.sectionName = user.sectionName || 'CSE-B';
    this.currentTab = App.activeTab || 'leaves';

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Minimalist Header Banner -->
        <div class="glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-teal-500/15 text-teal-300 border border-teal-500/20">
                Class Coordinator Workspace
              </span>
            </div>
            <h1 class="text-xl md:text-2xl font-bold tracking-tight text-white">${user.name}</h1>
            <p class="text-xs text-slate-400 mt-0.5">Assigned Class: <span class="font-mono text-teal-300 font-bold">${this.sectionName}</span> • 2nd Year • 50 Students</p>
          </div>

          <!-- Quick Metrics -->
          <div class="flex items-center gap-2">
            <div class="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <span class="text-[10px] text-slate-400 uppercase font-mono block">Section Attendance</span>
              <span class="font-bold text-white text-sm">87.2%</span>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <span class="text-[10px] text-slate-400 uppercase font-mono block">Average SGPA</span>
              <span class="font-bold text-teal-300 text-sm">8.15</span>
            </div>
          </div>
        </div>

        <!-- Dynamic Body -->
        <div id="coordinator-tab-content">
          <div class="flex items-center justify-center p-12 text-slate-500 text-sm">
            <i class="fas fa-spinner fa-spin text-lg mr-2"></i> Loading section monitor...
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
    const container = document.getElementById('coordinator-tab-content');
    if (!container) return;

    if (tabId === 'leaves') {
      const leaves = await API.getLeaves({ section: this.sectionName });
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="mb-5">
            <h2 class="text-base font-bold text-white">Student Leave Applications</h2>
            <p class="text-slate-400 text-xs">Review and approve absence requests for Section ${this.sectionName}</p>
          </div>

          <div class="space-y-3">
            ${leaves.map(l => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-white text-xs">${l.studentName}</span>
                    <span class="font-mono text-[10px] text-slate-400">${l.studentRoll}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                      l.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-300' :
                      l.status === 'Rejected' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'
                    }">${l.status}</span>
                  </div>
                  <div class="text-[11px] text-slate-400">
                    Duration: <strong class="text-slate-200">${l.fromDate} → ${l.toDate}</strong> • ${l.type}
                  </div>
                  <p class="text-xs text-slate-300 italic bg-black/30 p-2 rounded-lg border border-white/[0.04]">
                    "${l.reason}"
                  </p>
                  ${l.reviewNote ? `<div class="text-[11px] text-teal-300">Remark: ${l.reviewNote}</div>` : ''}
                </div>

                ${l.status === 'Pending' ? `
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button onclick="UICoordinator.handleLeaveReview('${l.id}', 'Approved')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition">
                      Approve
                    </button>
                    <button onclick="UICoordinator.handleLeaveReview('${l.id}', 'Rejected')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition">
                      Reject
                    </button>
                  </div>
                ` : `
                  <span class="text-[11px] text-slate-500 font-mono">Processed</span>
                `}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tabId === 'students') {
      const data = await API.getStudents({ section: this.sectionName, limit: 50 });
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Section ${this.sectionName} Students Roster</h2>
              <p class="text-slate-400 text-xs">Total 50 students enrolled</p>
            </div>
            <span class="text-xs text-slate-400 font-mono">50 Students</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-white/[0.06] text-slate-400 uppercase">
                  <th class="py-2.5 px-2">Roll</th>
                  <th class="py-2.5 px-2">Student</th>
                  <th class="py-2.5 px-2">ID</th>
                  <th class="py-2.5 px-2">Attendance</th>
                  <th class="py-2.5 px-2">SGPA</th>
                  <th class="py-2.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                ${data.items.map(s => `
                  <tr>
                    <td class="py-2.5 px-2 font-mono text-slate-400 font-semibold">#${s.rollNo}</td>
                    <td class="py-2.5 px-2 font-medium text-white">${s.name}</td>
                    <td class="py-2.5 px-2 font-mono text-slate-300">${s.studentId}</td>
                    <td class="py-2.5 px-2 font-bold ${s.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}">${s.attendance}%</td>
                    <td class="py-2.5 px-2 font-mono text-slate-300">${s.sgpa}</td>
                    <td class="py-2.5 px-2">
                      <button onclick="App.showStudentProfile('${s.studentId}')" class="px-2 py-0.5 rounded text-[11px] bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]">
                        Profile
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
      const timetable = await API.getTimetable(this.sectionName);
      container.innerHTML = `
        <div class="glass-panel rounded-2xl p-5 md:p-6">
          <div class="mb-5">
            <h2 class="text-base font-bold text-white">Section Timetable (${this.sectionName})</h2>
            <p class="text-slate-400 text-xs">Assigned classroom periods and faculty</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            ${timetable.map(t => `
              <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div class="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>${t.day}</span>
                  <span class="text-white">${t.time}</span>
                </div>
                <h4 class="font-semibold text-white text-xs mt-1">${t.subject}</h4>
                <div class="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Room: ${t.room}</span>
                  <span class="text-slate-300">${t.faculty}</span>
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
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Section Announcements</h2>
              <p class="text-slate-400 text-xs">Notices broadcasted to ${this.sectionName}</p>
            </div>
            <button onclick="UICoordinator.openNoticeModal()" class="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs">
              + Post Notice
            </button>
          </div>
          <div class="space-y-3">
            ${notices.map(n => `
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-mono text-teal-400 font-bold">${n.target}</span>
                  <span class="text-[11px] text-slate-500 font-mono">${n.date}</span>
                </div>
                <h3 class="text-sm font-semibold text-white">${n.title}</h3>
                <p class="text-slate-300 text-xs mt-1 leading-relaxed">${n.content}</p>
                ${n.imageUrl ? `<img src="${n.imageUrl}" alt="Notice image" class="mt-3 w-full max-h-80 object-contain rounded-xl border border-white/10 bg-black/10 cursor-zoom-in" onclick="App.showNoticeImage('${n.imageUrl}')" />` : ''}
                <div class="text-[10px] text-slate-500 pt-2 mt-2 border-t border-white/[0.04]">Issued by: <strong class="text-slate-400">${n.author}</strong></div>
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
          <h3 class="text-base font-bold text-white">Post Section Announcement</h3>
          <button onclick="App.closeModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form onsubmit="UICoordinator.submitNotice(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Title</label>
            <input type="text" id="coord-not-title" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Announcement title..." />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Target Section</label>
            <input type="text" id="coord-not-target" readonly value="${this.sectionName} Section" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Priority</label>
            <select id="coord-not-priority" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Notice Image <span class="font-normal text-slate-500">(optional)</span></label>
            <input type="file" id="coord-not-image" accept="image/*" class="w-full text-xs text-slate-400" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Content</label>
            <textarea id="coord-not-content" rows="4" required class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" placeholder="Write message for students..."></textarea>
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
    const title = document.getElementById('coord-not-title').value;
    const priority = document.getElementById('coord-not-priority').value;
    const content = document.getElementById('coord-not-content').value;
    const imageFile = document.getElementById('coord-not-image')?.files?.[0];
    let imageUrl = null;
    if (imageFile) { const fd = new FormData(); fd.append('image', imageFile); const uploaded = await API.uploadNoticeImage(fd); imageUrl = uploaded.imageUrl; }

    await API.createNotice({
      title,
      target: `${this.sectionName} Section`,
      targetType: 'section',
      targetValue: this.sectionName,
      priority,
      content,
      imageUrl,
      author: `Prof. Kavita Nair (${this.sectionName} Coordinator)`
    });

    App.closeModal();
    App.toast(`Notice broadcasted to ${this.sectionName}!`, 'success');
    if (this.currentTab === 'notices') this.loadTab('notices');
  },

  async handleLeaveReview(leaveId, status) {
    const note = prompt(`Enter coordinator remarks for ${status.toLowerCase()} this leave request:`, status === 'Approved' ? 'Approved by Class Coordinator.' : 'Rejected due to internal exams scheduled.');
    if (note === null) return;

    await API.reviewLeave(leaveId, {
      status,
      note,
      reviewer: 'Prof. Kavita Nair (Coordinator)'
    });

    App.toast(`Leave request marked as ${status}!`, 'success');
    this.loadTab('leaves');
  }
};
