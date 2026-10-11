// ==============================================================================
// API Client for College Management System
// ==============================================================================

const API = {
  // Use the same-origin API when served by Express.
  // When the UI is opened through Live Server/file hosting during local development,
  // send API requests to the Express backend on localhost:3000 instead of the UI server.
  baseUrl: (() => {
    const port = window.location.port;
    const protocol = window.location.protocol;
    if (protocol === 'http:' || protocol === 'https:') {
      if (port && port !== '3000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `${protocol}//${window.location.hostname}:3000/api`;
      }
      return '/api';
    }
    return 'http://localhost:3000/api';
  })(),

  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: options.isFormData ? {} : { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const raw = await res.text();
        const hint = raw.includes('<!DOCTYPE') || raw.includes('<html')
          ? `API endpoint returned an HTML page instead of JSON (HTTP ${res.status}). Check that the backend/API routes are deployed.`
          : `Server returned an unexpected response (HTTP ${res.status}).`;
        throw new Error(hint);
      }
      if (!res.ok) {
        throw new Error(data?.error || 'Server request failed');
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth
  login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  },

  getDemoAccounts() {
    return this.request('/auth/demo-accounts');
  },

  // College & Stats
  getStats() {
    return this.request('/stats');
  },

  getDepartments() {
    return this.request('/departments');
  },

  getSections() {
    return this.request('/sections');
  },

  // Students
  getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students?${query}`);
  },

  getStudent(id) {
    return this.request(`/students/${id}`);
  },

  addStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  // Faculty
  getFaculty() {
    return this.request('/faculty');
  },

  addFaculty(facultyData) {
    return this.request('/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  },

  // Subjects
  getSubjects(dept) {
    return this.request(`/subjects${dept ? `?dept=${dept}` : ''}`);
  },

  // Timetable
  getTimetable(section = 'CSE-B') {
    return this.request(`/timetable?section=${encodeURIComponent(section)}`);
  },

  getFacultyTimetable(name) {
    return this.request(`/timetable/faculty${name ? `?name=${encodeURIComponent(name)}` : ''}`);
  },

  // Notes
  getNotes(subjectId, section) {
    let url = '/notes';
    const params = [];
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (section) params.push(`section=${section}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.request(url);
  },

  uploadNote(formData) {
    return this.request('/notes', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  // Assignments & Submissions
  getAssignments(section = 'CSE-B') {
    return this.request(`/assignments?section=${encodeURIComponent(section)}`);
  },

  createAssignment(formData) {
    return this.request('/assignments', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  getSubmissions(asgId) {
    return this.request(`/assignments/${asgId}/submissions`);
  },

  submitAssignment(asgId, formData) {
    return this.request(`/assignments/${asgId}/submit`, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  // Doubts System
  getDoubts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/doubts?${query}`);
  },

  createDoubt(formData) {
    return this.request('/doubts', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  replyDoubt(doubtId, replyData) {
    return this.request(`/doubts/${doubtId}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData)
    });
  },

  // DPP (Daily Practice Problems)
  getDpp(subjectId) {
    return this.request(`/dpp${subjectId ? `?subjectId=${subjectId}` : ''}`);
  },

  // Attendance
  getStudentAttendance(studentId) {
    return this.request(`/attendance/student/${studentId}`);
  },

  markAttendance(records) {
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ records })
    });
  },

  // Exams & Results
  getExams() {
    return this.request('/exams');
  },

  getResults(studentId) {
    return this.request(`/results/${studentId}`);
  },

  // Notices
  getNotices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/notices?${query}`);
  },

  createNotice(noticeData) {
    return this.request('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData)
    });
  },

  uploadNoticeImage(formData) {
    return this.request('/notices/upload-image', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  // Leave Management
  getLeaves(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/leaves?${query}`);
  },

  applyLeave(leaveData) {
    return this.request('/leaves/apply', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  },

  reviewLeave(leaveId, data) {
    return this.request(`/leaves/${leaveId}/review`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Notifications
  getNotifications(userId) {
    return this.request(`/notifications${userId ? `?userId=${userId}` : ''}`);
  },

  // Gemini AI
  aiChat(message, history = [], user = {}, panel = 'dashboard', context = {}) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, user, panel, context })
    });
  },

  getAIInsights(user = {}, panel = 'dashboard') {
    return this.request('/ai/insights', {
      method: 'POST',
      body: JSON.stringify({ user, panel })
    });
  },

  // Global Search
  globalSearch(q) {
    return this.request(`/search?q=${encodeURIComponent(q)}`);
  }
};
