/**
 * Data Generator for Complete College Management System
 * Generates 300+ students across all 11 sections (50 per primary section),
 * along with Director, HOD, Faculty, Coordinators, Subjects, Timetables, Notes, Doubts, DPPs, etc.
 */

const fs = require('fs');
const path = require('path');

const firstNames = [
  'Rahul', 'Priya', 'Aman', 'Ananya', 'Rohan', 'Sneha', 'Aditya', 'Kavya', 'Siddharth', 'Tanvi',
  'Vikram', 'Pooja', 'Abhishek', 'Rhea', 'Karan', 'Meera', 'Dev', 'Ishita', 'Arjun', 'Simran',
  'Manish', 'Neha', 'Gaurav', 'Shreya', 'Nikhil', 'Divya', 'Varun', 'Swati', 'Harsh', 'Isha',
  'Yash', 'Rashi', 'Ayush', 'Ritu', 'Pranav', 'Sanya', 'Akash', 'Shruti', 'Deepak', 'Komal',
  'Saurabh', 'Nandini', 'Chirag', 'Payal', 'Mohit', 'Pallavi', 'Tushar', 'Bhavna', 'Rajat', 'Garima'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Joshi', 'Mehta', 'Nair', 'Reddy',
  'Choudhary', 'Mishra', 'Yadav', 'Shah', 'Malhotra', 'Bose', 'Kapoor', 'Chatterjee', 'Iyer', 'Menon',
  'Das', 'Aggarwal', 'Bhat', 'Saxena', 'Pandey', 'Thakur', 'Deshmukh', 'Kulkarni', 'Sengupta', 'Pillai'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateData() {
  const departments = [
    { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', icon: 'cpu', color: 'indigo' },
    { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication Engineering', icon: 'zap', color: 'blue' },
    { id: 'dept-biotech', code: 'Biotech', name: 'Biotechnology Engineering', icon: 'dna', color: 'emerald' },
    { id: 'dept-mech', code: 'Mechanical', name: 'Mechanical Engineering', icon: 'settings', color: 'amber' },
    { id: 'dept-it', code: 'IT', name: 'Information Technology', icon: 'globe', color: 'cyan' }
  ];

  const sections = [
    { id: 'sec-cse-a', deptId: 'dept-cse', deptCode: 'CSE', name: 'A', fullName: 'CSE-A', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-cse-b', deptId: 'dept-cse', deptCode: 'CSE', name: 'B', fullName: 'CSE-B', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-cse-c', deptId: 'dept-cse', deptCode: 'CSE', name: 'C', fullName: 'CSE-C', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-cse-d', deptId: 'dept-cse', deptCode: 'CSE', name: 'D', fullName: 'CSE-D', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-cse-e', deptId: 'dept-cse', deptCode: 'CSE', name: 'E', fullName: 'CSE-E', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-ece-a', deptId: 'dept-ece', deptCode: 'ECE', name: 'A', fullName: 'ECE-A', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-ece-b', deptId: 'dept-ece', deptCode: 'ECE', name: 'B', fullName: 'ECE-B', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-bio-a', deptId: 'dept-biotech', deptCode: 'Biotech', name: 'A', fullName: 'Biotech-A', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-mech-a', deptId: 'dept-mech', deptCode: 'Mechanical', name: 'A', fullName: 'Mechanical-A', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-it-a', deptId: 'dept-it', deptCode: 'IT', name: 'A', fullName: 'IT-A', year: 2, semester: 3, capacity: 60 },
    { id: 'sec-it-b', deptId: 'dept-it', deptCode: 'IT', name: 'B', fullName: 'IT-B', year: 2, semester: 3, capacity: 60 }
  ];

  // Users list
  const users = [
    {
      id: 'usr-dir-01',
      identifier: 'DIR001',
      email: 'director@college.edu',
      password: 'password123',
      name: 'Dr. Rajeshwar Rao',
      role: 'director',
      department: 'Administration',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      designation: 'Director & Academic Council Head'
    },
    {
      id: 'usr-hod-01',
      identifier: 'HOD001',
      email: 'hod@college.edu',
      password: 'password123',
      name: 'Dr. Arvind Swaminathan',
      role: 'hod',
      department: 'CSE',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      designation: 'Head of Department & Academic Dean'
    },
    {
      id: 'usr-fac-01',
      identifier: 'FAC001',
      email: 'sharma@faculty.edu',
      password: 'password123',
      name: 'Prof. R.K. Sharma',
      role: 'faculty',
      department: 'CSE',
      phone: '+91 98765 43212',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      designation: 'Senior Assistant Professor',
      specialization: 'Data Structures & Algorithms'
    },
    {
      id: 'usr-fac-02',
      identifier: 'FAC002',
      email: 'verma@faculty.edu',
      password: 'password123',
      name: 'Dr. Priya Verma',
      role: 'faculty',
      department: 'CSE',
      phone: '+91 98765 43213',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      designation: 'Associate Professor',
      specialization: 'Database Systems'
    },
    {
      id: 'usr-fac-03',
      identifier: 'FAC003',
      email: 'sen@faculty.edu',
      password: 'password123',
      name: 'Prof. Amit Sen',
      role: 'faculty',
      department: 'CSE',
      phone: '+91 98765 43214',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      designation: 'Assistant Professor',
      specialization: 'Operating Systems'
    },
    {
      id: 'usr-fac-04',
      identifier: 'FAC004',
      email: 'gupta@faculty.edu',
      password: 'password123',
      name: 'Dr. Neha Gupta',
      role: 'faculty',
      department: 'CSE',
      phone: '+91 98765 43215',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
      designation: 'Professor',
      specialization: 'Discrete Mathematics'
    },
    {
      id: 'usr-fac-05',
      identifier: 'FAC005',
      email: 'joshi@faculty.edu',
      password: 'password123',
      name: 'Prof. Vikram Joshi',
      role: 'faculty',
      department: 'IT',
      phone: '+91 98765 43216',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
      designation: 'Assistant Professor',
      specialization: 'Computer Networks & Security'
    },
    {
      id: 'usr-coord-01',
      identifier: 'COORD001',
      email: 'coordinator.cseb@college.edu',
      password: 'password123',
      name: 'Prof. Kavita Nair',
      role: 'coordinator',
      department: 'CSE',
      sectionId: 'sec-cse-b',
      sectionName: 'CSE-B',
      year: 2,
      phone: '+91 98765 43217',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      designation: 'Class Coordinator (CSE-B)'
    }
  ];

  // Subjects
  const subjects = [
    {
      id: 'sub-dsa',
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      deptCode: 'CSE',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-01',
      facultyName: 'Prof. R.K. Sharma',
      sections: ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E']
    },
    {
      id: 'sub-dbms',
      code: 'CS302',
      name: 'Database Management Systems',
      deptCode: 'CSE',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-02',
      facultyName: 'Dr. Priya Verma',
      sections: ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E']
    },
    {
      id: 'sub-os',
      code: 'CS303',
      name: 'Operating Systems',
      deptCode: 'CSE',
      semester: 3,
      credits: 3,
      facultyId: 'usr-fac-03',
      facultyName: 'Prof. Amit Sen',
      sections: ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E']
    },
    {
      id: 'sub-math',
      code: 'MA301',
      name: 'Discrete Mathematics',
      deptCode: 'CSE',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-04',
      facultyName: 'Dr. Neha Gupta',
      sections: ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E']
    },
    {
      id: 'sub-cn',
      code: 'CS304',
      name: 'Computer Networks',
      deptCode: 'CSE',
      semester: 3,
      credits: 3,
      facultyId: 'usr-fac-05',
      facultyName: 'Prof. Vikram Joshi',
      sections: ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E']
    },
    {
      id: 'sub-dsp',
      code: 'EC301',
      name: 'Digital Signal Processing',
      deptCode: 'ECE',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-05',
      facultyName: 'Prof. Vikram Joshi',
      sections: ['ECE-A', 'ECE-B']
    },
    {
      id: 'sub-bio',
      code: 'BT301',
      name: 'Molecular Biology & Genetics',
      deptCode: 'Biotech',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-04',
      facultyName: 'Dr. Neha Gupta',
      sections: ['Biotech-A']
    },
    {
      id: 'sub-thermo',
      code: 'ME301',
      name: 'Applied Thermodynamics',
      deptCode: 'Mechanical',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-03',
      facultyName: 'Prof. Amit Sen',
      sections: ['Mechanical-A']
    },
    {
      id: 'sub-web',
      code: 'IT301',
      name: 'Web Engineering & Cloud Tech',
      deptCode: 'IT',
      semester: 3,
      credits: 4,
      facultyId: 'usr-fac-02',
      facultyName: 'Dr. Priya Verma',
      sections: ['IT-A', 'IT-B']
    }
  ];

  // Student generator
  const students = [];
  const sectionCounts = {
    'sec-cse-a': 50,
    'sec-cse-b': 50,
    'sec-cse-c': 50,
    'sec-cse-d': 30,
    'sec-cse-e': 30,
    'sec-ece-a': 25,
    'sec-ece-b': 25,
    'sec-bio-a': 15,
    'sec-mech-a': 15,
    'sec-it-a': 25,
    'sec-it-b': 20
  }; // Total = 335 students (> 300 students requirement!)

  let globalStudentCounter = 1;

  sections.forEach((sec) => {
    const count = sectionCounts[sec.id] || 25;
    for (let i = 1; i <= count; i++) {
      const padNum = String(i).padStart(3, '0');
      const rollNo = i;
      const studentId = `${sec.deptCode}23${sec.name}${padNum}`;

      // Default featured student: Rahul Sharma in CSE-B (roll 23)
      let firstName, lastName, email;
      if (sec.id === 'sec-cse-b' && i === 23) {
        firstName = 'Rahul';
        lastName = 'Sharma';
        email = 'rahul@student.edu';
      } else {
        firstName = firstNames[(globalStudentCounter + i) % firstNames.length];
        lastName = lastNames[(globalStudentCounter * 2 + i) % lastNames.length];
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${studentId.toLowerCase()}@college.edu`;
      }

      // Attendance between 70% and 96%
      const attendance = (sec.id === 'sec-cse-b' && i === 23) ? 87 : getRandomInt(72, 96);
      const sgpa = (sec.id === 'sec-cse-b' && i === 23) ? 8.2 : Number((getRandomInt(65, 98) / 10).toFixed(1));
      const cgpa = (sec.id === 'sec-cse-b' && i === 23) ? 8.0 : Number((getRandomInt(65, 96) / 10).toFixed(1));

      const studentUser = {
        id: `usr-stu-${globalStudentCounter}`,
        identifier: studentId,
        studentId: studentId,
        rollNo: rollNo,
        email: email,
        password: 'password123',
        name: `${firstName} ${lastName}`,
        role: 'student',
        department: sec.deptCode,
        deptId: sec.deptId,
        sectionId: sec.id,
        sectionName: sec.fullName,
        year: sec.year,
        semester: sec.semester,
        attendance: attendance,
        sgpa: sgpa,
        cgpa: cgpa,
        phone: `+91 ${getRandomInt(90000, 99999)} ${getRandomInt(10000, 99999)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${i}`
      };

      students.push(studentUser);
      users.push(studentUser);
      globalStudentCounter++;
    }
  });

  // Notes
  const notes = [
    {
      id: 'note-01',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Unit 1: Arrays, Stacks and Queues',
      description: 'Comprehensive notes covering memory allocation, amortized complexity, and array applications.',
      fileName: 'Unit_1_Arrays_and_Stacks.pdf',
      fileSize: '3.4 MB',
      uploadDate: '2026-09-15',
      author: 'Prof. R.K. Sharma',
      authorId: 'usr-fac-01',
      fileUrl: '/uploads/sample_notes.pdf'
    },
    {
      id: 'note-02',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Unit 2: Non-Linear Data Structures (Trees & Graphs)',
      description: 'Binary trees, AVL balancing, Graph traversals (BFS, DFS), and shortest path algorithms.',
      fileName: 'Unit_2_Trees_and_Graphs.pdf',
      fileSize: '4.8 MB',
      uploadDate: '2026-09-28',
      author: 'Prof. R.K. Sharma',
      authorId: 'usr-fac-01',
      fileUrl: '/uploads/sample_notes.pdf'
    },
    {
      id: 'note-03',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Trees & Graphs: Important Exam Questions & Solutions',
      description: 'Curated university previous years questions with step-by-step tree dry runs.',
      fileName: 'Trees_Important_Questions.pdf',
      fileSize: '2.1 MB',
      uploadDate: '2026-10-02',
      author: 'Prof. R.K. Sharma',
      authorId: 'usr-fac-01',
      fileUrl: '/uploads/sample_notes.pdf'
    },
    {
      id: 'note-04',
      subjectId: 'sub-dbms',
      subjectName: 'Database Management Systems',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Relational Algebra & SQL Normalization (1NF to BCNF)',
      description: 'Functional dependencies, lossless join decomposition, and 3NF/BCNF normalization rules.',
      fileName: 'DBMS_Normalization_Masterclass.pdf',
      fileSize: '5.2 MB',
      uploadDate: '2026-09-20',
      author: 'Dr. Priya Verma',
      authorId: 'usr-fac-02',
      fileUrl: '/uploads/sample_notes.pdf'
    },
    {
      id: 'note-05',
      subjectId: 'sub-os',
      subjectName: 'Operating Systems',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Process Synchronization & Deadlock Handling',
      description: 'Semaphores, Peterson algorithm, Dining Philosophers, and Bankers Algorithm safety check.',
      fileName: 'OS_Synchronization_Deadlocks.pdf',
      fileSize: '3.9 MB',
      uploadDate: '2026-09-24',
      author: 'Prof. Amit Sen',
      authorId: 'usr-fac-03',
      fileUrl: '/uploads/sample_notes.pdf'
    },
    {
      id: 'note-06',
      subjectId: 'sub-math',
      subjectName: 'Discrete Mathematics',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Graph Theory & Combinatorics Handouts',
      description: 'Eulerian and Hamiltonian graphs, planar graphs, coloring, and pigeonhole principle.',
      fileName: 'Discrete_Math_Graphs.pdf',
      fileSize: '2.7 MB',
      uploadDate: '2026-09-18',
      author: 'Dr. Neha Gupta',
      authorId: 'usr-fac-04',
      fileUrl: '/uploads/sample_notes.pdf'
    }
  ];

  // Assignments
  const assignments = [
    {
      id: 'asg-01',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Assignment 1: Balanced BST & AVL Rotations',
      description: 'Implement AVL Tree insertion with single and double rotations. Benchmark against plain BST.',
      dueDate: '2026-10-15',
      maxMarks: 20,
      totalStudents: 50,
      submittedCount: 42,
      pendingCount: 8,
      authorId: 'usr-fac-01',
      authorName: 'Prof. R.K. Sharma',
      fileUrl: '/uploads/sample_assignment.pdf',
      status: 'Active'
    },
    {
      id: 'asg-02',
      subjectId: 'sub-dbms',
      subjectName: 'Database Management Systems',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Assignment 2: Complex Queries & Transaction Isolation',
      description: 'Write complex SQL with window functions and analyze ACID consistency anomalies.',
      dueDate: '2026-10-20',
      maxMarks: 25,
      totalStudents: 50,
      submittedCount: 35,
      pendingCount: 15,
      authorId: 'usr-fac-02',
      authorName: 'Dr. Priya Verma',
      fileUrl: '/uploads/sample_assignment.pdf',
      status: 'Active'
    },
    {
      id: 'asg-03',
      subjectId: 'sub-os',
      subjectName: 'Operating Systems',
      deptCode: 'CSE',
      section: 'CSE-B',
      title: 'Assignment 1: CPU Scheduling Simulator',
      description: 'Simulate Round Robin and Priority scheduling algorithms and calculate average waiting time.',
      dueDate: '2026-10-22',
      maxMarks: 20,
      totalStudents: 50,
      submittedCount: 18,
      pendingCount: 32,
      authorId: 'usr-fac-03',
      authorName: 'Prof. Amit Sen',
      fileUrl: '/uploads/sample_assignment.pdf',
      status: 'Active'
    }
  ];

  // Rahul Sharma's Assignment Submissions
  const submissions = [
    {
      id: 'subm-01',
      assignmentId: 'asg-01',
      studentId: 'usr-stu-73', // Rahul
      studentName: 'Rahul Sharma',
      studentRoll: 'CSE23B023',
      submittedAt: '2026-10-04 14:32',
      fileName: 'Rahul_Sharma_AVL_Trees.pdf',
      status: 'Submitted',
      grade: '19/20',
      feedback: 'Excellent explanation of double rotation cases!'
    }
  ];

  // Daily Practice Problems (DPP)
  const dppSets = [
    {
      id: 'dpp-dsa',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures',
      title: "Today's Practice: Trees & Heaps",
      questionsCount: 5,
      streakDay: 14,
      questions: [
        {
          id: 'q1',
          question: 'What is the worst-case time complexity of searching in an AVL tree with n nodes?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctIndex: 1,
          explanation: 'Because AVL trees maintain strict height balancing (|hL - hR| <= 1), the maximum height is 1.44 log n, giving O(log n) worst case.'
        },
        {
          id: 'q2',
          question: 'In a min-heap, where is the second minimum element always located?',
          options: ['At the root', 'Either index 1 or 2 (children of root)', 'At any leaf node', 'At the last index'],
          correctIndex: 1,
          explanation: 'In a min-heap, the smallest element is at the root. The second smallest must be one of the immediate children of the root.'
        },
        {
          id: 'q3',
          question: 'Which tree traversal gives the keys of a Binary Search Tree in sorted ascending order?',
          options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
          correctIndex: 1,
          explanation: 'Inorder traversal visits Left Subtree -> Node -> Right Subtree, which yields strictly sorted keys for a BST.'
        },
        {
          id: 'q4',
          question: 'What is the maximum number of nodes in a binary tree of height h (where root is height 0)?',
          options: ['2^(h+1) - 1', '2^h', '2^(h-1)', '2^(h+1)'],
          correctIndex: 0,
          explanation: 'A full binary tree has 1 + 2 + 4 + ... + 2^h = 2^(h+1) - 1 nodes.'
        },
        {
          id: 'q5',
          question: 'Which balance factor triggers an LR (Left-Right) rotation in an AVL tree?',
          options: ['Node BF = +2, Left child BF = -1', 'Node BF = -2, Right child BF = +1', 'Node BF = +2, Left child BF = +1', 'Node BF = 0'],
          correctIndex: 0,
          explanation: 'An LR rotation occurs when a node has balance factor +2 and its left child is right-heavy (balance factor -1).'
        }
      ]
    },
    {
      id: 'dpp-dbms',
      subjectId: 'sub-dbms',
      subjectName: 'DBMS',
      title: "Today's Practice: Normalization & Transactions",
      questionsCount: 5,
      streakDay: 9,
      questions: [
        {
          id: 'db-q1',
          question: 'Which normal form eliminates partial dependency on a candidate key?',
          options: ['1NF', '2NF', '3NF', 'BCNF'],
          correctIndex: 1,
          explanation: 'Second Normal Form (2NF) enforces 1NF and guarantees that no non-prime attribute is functionally dependent on a proper subset of any candidate key.'
        },
        {
          id: 'db-q2',
          question: 'In ACID properties, which property ensures that all transaction operations complete or none do?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctIndex: 0,
          explanation: 'Atomicity follows the all-or-nothing rule.'
        },
        {
          id: 'db-q3',
          question: 'What type of lock allows multiple concurrent transactions to read data simultaneously?',
          options: ['Exclusive Lock (X)', 'Shared Lock (S)', 'Intent Exclusive Lock', 'Update Lock'],
          correctIndex: 1,
          explanation: 'A Shared lock permits concurrent reads while blocking write locks.'
        },
        {
          id: 'db-q4',
          question: 'A relation R(A, B, C) with FD: A -> B and B -> C is in 2NF. Why is it NOT in 3NF?',
          options: ['Partial dependency exists', 'Transitive dependency exists (A -> C via B)', 'Multivalued dependency exists', 'No primary key exists'],
          correctIndex: 1,
          explanation: 'Because B is not a superkey and C is not a prime attribute, the transitive dependency A -> B -> C violates 3NF.'
        },
        {
          id: 'db-q5',
          question: 'Which isolation level prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads?',
          options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
          correctIndex: 3,
          explanation: 'Serializable is the highest isolation level providing complete isolation against all concurrency anomalies.'
        }
      ]
    }
  ];

  // Doubts System
  const doubts = [
    {
      id: 'dbt-01',
      studentId: 'usr-stu-73',
      studentName: 'Rahul Sharma',
      studentRoll: 'CSE23B023',
      studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulSharma23',
      department: 'CSE',
      section: 'CSE-B',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      facultyId: 'usr-fac-01',
      facultyName: 'Prof. R.K. Sharma',
      question: 'Sir, I don\'t understand how the AVL tree double rotation (Left-Right) recalculates the new root and height in the code. Could you please clarify with an example?',
      attachmentUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      attachmentName: 'avl_tree_doubt_diagram.jpg',
      status: 'Answered', // 'Answered' | 'Waiting for Teacher'
      createdAt: '2026-10-06 10:15',
      replies: [
        {
          id: 'rep-01',
          authorId: 'usr-fac-01',
          authorName: 'Prof. R.K. Sharma',
          authorRole: 'faculty',
          message: 'Hello Rahul. In an LR rotation, you first perform a left rotation on the left child of the unbalanced node, which transforms the zig-zag shape into a straight left-left line. Then you execute a standard right rotation on the unbalanced parent. Look at step 2 in the Unit 2 slides (page 34). I will also demonstrate this on the blackboard in Monday\'s tutorial session.',
          createdAt: '2026-10-06 12:40'
        }
      ]
    },
    {
      id: 'dbt-02',
      studentId: 'usr-stu-73',
      studentName: 'Rahul Sharma',
      studentRoll: 'CSE23B023',
      studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulSharma23',
      department: 'CSE',
      section: 'CSE-B',
      subjectId: 'sub-dbms',
      subjectName: 'Database Management Systems',
      facultyId: 'usr-fac-02',
      facultyName: 'Dr. Priya Verma',
      question: 'Ma\'am, in BCNF decomposition, if a functional dependency X -> Y has X not as a superkey, do we always lose dependency preservation?',
      attachmentUrl: '',
      attachmentName: '',
      status: 'Waiting for Teacher',
      createdAt: '2026-10-08 09:30',
      replies: []
    },
    {
      id: 'dbt-03',
      studentId: 'usr-stu-73',
      studentName: 'Rahul Sharma',
      studentRoll: 'CSE23B023',
      studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulSharma23',
      department: 'CSE',
      section: 'CSE-B',
      subjectId: 'sub-math',
      subjectName: 'Discrete Mathematics',
      facultyId: 'usr-fac-04',
      facultyName: 'Dr. Neha Gupta',
      question: 'Ma\'am, regarding Euler formula for planar graphs V - E + R = 2: how does this hold when the graph is disconnected into k components?',
      attachmentUrl: '',
      attachmentName: '',
      status: 'Answered',
      createdAt: '2026-10-04 16:00',
      replies: [
        {
          id: 'rep-02',
          authorId: 'usr-fac-04',
          authorName: 'Dr. Neha Gupta',
          authorRole: 'faculty',
          message: 'Good observation, Rahul! For a planar graph with k connected components, the generalized formula is V - E + R = 1 + k. In a single connected component k=1, giving the familiar V - E + R = 2.',
          createdAt: '2026-10-04 18:20'
        }
      ]
    },
    {
      id: 'dbt-04',
      studentId: 'usr-stu-52',
      studentName: 'Priya Verma',
      studentRoll: 'CSE23B002',
      studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVerma2',
      department: 'CSE',
      section: 'CSE-B',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      facultyId: 'usr-fac-01',
      facultyName: 'Prof. R.K. Sharma',
      question: 'Sir, how to determine whether to use Dijkstra or Bellman-Ford when graphs have negative cycles?',
      attachmentUrl: '',
      attachmentName: '',
      status: 'Waiting for Teacher',
      createdAt: '2026-10-08 11:20',
      replies: []
    }
  ];

  // Attendance detailed for Rahul Sharma
  const studentSubjectAttendance = [
    { subjectId: 'sub-dsa', name: 'Data Structures & Algorithms', faculty: 'Prof. R.K. Sharma', total: 36, attended: 33, percentage: 92, status: 'Good' },
    { subjectId: 'sub-dbms', name: 'Database Management Systems', faculty: 'Dr. Priya Verma', total: 32, attended: 27, percentage: 84, status: 'Good' },
    { subjectId: 'sub-os', name: 'Operating Systems', faculty: 'Prof. Amit Sen', total: 34, attended: 30, percentage: 88, status: 'Good' },
    { subjectId: 'sub-math', name: 'Discrete Mathematics', faculty: 'Dr. Neha Gupta', total: 38, attended: 30, percentage: 79, status: 'Warning' },
    { subjectId: 'sub-cn', name: 'Computer Networks', faculty: 'Prof. Vikram Joshi', total: 35, attended: 32, percentage: 91, status: 'Good' }
  ];

  // Timetable
  const timetable = {
    'CSE-B': [
      { day: 'Monday', time: '09:00 - 10:00', subject: 'Data Structures & Algorithms', code: 'CS301', room: 'LHC-201', faculty: 'Prof. R.K. Sharma' },
      { day: 'Monday', time: '10:00 - 11:00', subject: 'Database Management Systems', code: 'CS302', room: 'LHC-201', faculty: 'Dr. Priya Verma' },
      { day: 'Monday', time: '11:00 - 11:30', subject: 'Break', code: 'BRK', room: 'Campus Cafeteria', faculty: '-' },
      { day: 'Monday', time: '11:30 - 12:30', subject: 'Discrete Mathematics', code: 'MA301', room: 'LHC-201', faculty: 'Dr. Neha Gupta' },
      { day: 'Monday', time: '12:30 - 01:30', subject: 'Operating Systems', code: 'CS303', room: 'LHC-201', faculty: 'Prof. Amit Sen' },
      { day: 'Monday', time: '02:30 - 04:30', subject: 'Data Structures Lab (Batch 1 & 2)', code: 'CS301P', room: 'Lab-402', faculty: 'Prof. R.K. Sharma' },

      { day: 'Tuesday', time: '09:00 - 10:00', subject: 'Operating Systems', code: 'CS303', room: 'LHC-201', faculty: 'Prof. Amit Sen' },
      { day: 'Tuesday', time: '10:00 - 11:00', subject: 'Computer Networks', code: 'CS304', room: 'LHC-201', faculty: 'Prof. Vikram Joshi' },
      { day: 'Tuesday', time: '11:30 - 12:30', subject: 'Data Structures & Algorithms', code: 'CS301', room: 'LHC-201', faculty: 'Prof. R.K. Sharma' },
      { day: 'Tuesday', time: '02:00 - 04:00', subject: 'DBMS Lab (Batch 1 & 2)', code: 'CS302P', room: 'Lab-301', faculty: 'Dr. Priya Verma' },

      { day: 'Wednesday', time: '09:00 - 10:00', subject: 'Database Management Systems', code: 'CS302', room: 'LHC-201', faculty: 'Dr. Priya Verma' },
      { day: 'Wednesday', time: '10:00 - 11:00', subject: 'Discrete Mathematics', code: 'MA301', room: 'LHC-201', faculty: 'Dr. Neha Gupta' },
      { day: 'Wednesday', time: '11:30 - 12:30', subject: 'Computer Networks', code: 'CS304', room: 'LHC-201', faculty: 'Prof. Vikram Joshi' },
      { day: 'Wednesday', time: '02:30 - 03:30', subject: 'Mentorship & Class Meeting', code: 'MENT', room: 'LHC-201', faculty: 'Prof. Kavita Nair' },

      { day: 'Thursday', time: '09:00 - 10:00', subject: 'Data Structures & Algorithms', code: 'CS301', room: 'LHC-201', faculty: 'Prof. R.K. Sharma' },
      { day: 'Thursday', time: '10:00 - 11:00', subject: 'Operating Systems', code: 'CS303', room: 'LHC-201', faculty: 'Prof. Amit Sen' },
      { day: 'Thursday', time: '11:30 - 12:30', subject: 'Discrete Mathematics', code: 'MA301', room: 'LHC-201', faculty: 'Dr. Neha Gupta' },
      { day: 'Thursday', time: '02:00 - 04:00', subject: 'Networks & Linux Lab', code: 'CS304P', room: 'Lab-202', faculty: 'Prof. Vikram Joshi' },

      { day: 'Friday', time: '09:00 - 10:00', subject: 'Computer Networks', code: 'CS304', room: 'LHC-201', faculty: 'Prof. Vikram Joshi' },
      { day: 'Friday', time: '10:00 - 11:00', subject: 'Database Management Systems', code: 'CS302', room: 'LHC-201', faculty: 'Dr. Priya Verma' },
      { day: 'Friday', time: '11:30 - 12:30', subject: 'Data Structures & Algorithms', code: 'CS301', room: 'LHC-201', faculty: 'Prof. R.K. Sharma' },
      { day: 'Friday', time: '02:30 - 04:30', subject: 'Coding Club & DPP Hackathon', code: 'ACT', room: 'Audi-1', faculty: 'Student Council' }
    ]
  };

  // Exams
  const exams = [
    {
      id: 'ex-01',
      type: 'Mid-Semester Examination',
      subject: 'Data Structures & Algorithms',
      code: 'CS301',
      date: '2026-10-15',
      time: '10:00 AM - 12:00 PM',
      room: 'Exam Hall A',
      status: 'Upcoming'
    },
    {
      id: 'ex-02',
      type: 'Mid-Semester Examination',
      subject: 'Database Management Systems',
      code: 'CS302',
      date: '2026-10-18',
      time: '10:00 AM - 12:00 PM',
      room: 'Exam Hall B',
      status: 'Upcoming'
    },
    {
      id: 'ex-03',
      type: 'Mid-Semester Examination',
      subject: 'Operating Systems',
      code: 'CS303',
      date: '2026-10-21',
      time: '10:00 AM - 12:00 PM',
      room: 'Exam Hall A',
      status: 'Upcoming'
    },
    {
      id: 'ex-04',
      type: 'Mid-Semester Examination',
      subject: 'Discrete Mathematics',
      code: 'MA301',
      date: '2026-10-24',
      time: '10:00 AM - 12:00 PM',
      room: 'Exam Hall C',
      status: 'Upcoming'
    }
  ];

  // Results for Rahul Sharma
  const results = {
    studentId: 'usr-stu-73',
    semester: 3,
    sgpa: 8.2,
    cgpa: 8.0,
    marks: [
      { subject: 'Data Structures & Algorithms', code: 'CS301', internal: 26, midSem: 28, endSem: 38, total: 92, grade: 'A+' },
      { subject: 'Database Management Systems', code: 'CS302', internal: 24, midSem: 23, endSem: 34, total: 81, grade: 'A' },
      { subject: 'Operating Systems', code: 'CS303', internal: 25, midSem: 26, endSem: 37, total: 88, grade: 'A+' },
      { subject: 'Discrete Mathematics', code: 'MA301', internal: 22, midSem: 21, endSem: 31, total: 74, grade: 'B+' },
      { subject: 'Computer Networks', code: 'CS304', internal: 27, midSem: 27, endSem: 36, total: 90, grade: 'A+' }
    ]
  };

  // Notices
  const notices = [
    {
      id: 'not-01',
      title: 'Mid-Semester Examination Schedule Published',
      content: 'The Mid-Semester Examination for 2nd and 3rd-year engineering programs starts on October 15, 2026. Hall tickets are accessible through the student portal.',
      target: 'Entire College',
      targetType: 'college',
      author: 'Office of the Controller of Examinations',
      date: '2026-10-05',
      priority: 'High'
    },
    {
      id: 'not-02',
      title: 'Hackathon 2026: Registrations Open for CSE & IT Students',
      content: 'Annual 36-Hour Hackathon sponsored by industry partners will be held on Nov 12-14. Form your teams of 4 and submit your abstract before Oct 25.',
      target: 'CSE Department',
      targetType: 'dept',
      targetValue: 'CSE',
      author: 'Dr. Arvind Swaminathan (HOD CSE)',
      date: '2026-10-06',
      priority: 'Normal'
    },
    {
      id: 'not-03',
      title: 'CSE-B Section: Mandatory Lab Evaluation on Friday',
      content: 'All students of CSE-B must submit their completed lab journals and execute program 8 in Lab-402 on Friday 2:30 PM.',
      target: 'CSE-B Section',
      targetType: 'section',
      targetValue: 'CSE-B',
      author: 'Prof. Kavita Nair (Class Coordinator)',
      date: '2026-10-07',
      priority: 'High'
    }
  ];

  // Leave Requests
  const leaveRequests = [
    {
      id: 'lev-01',
      studentId: 'usr-stu-73',
      studentName: 'Rahul Sharma',
      studentRoll: 'CSE23B023',
      section: 'CSE-B',
      fromDate: '2026-10-10',
      toDate: '2026-10-12',
      reason: 'Medical - Viral Fever and recovery advised by doctor.',
      type: 'Medical',
      status: 'Approved',
      reviewedBy: 'Prof. Kavita Nair',
      reviewNote: 'Approved. Please submit doctor medical certificate upon return.',
      appliedAt: '2026-10-07'
    },
    {
      id: 'lev-02',
      studentId: 'usr-stu-73',
      studentName: 'Rahul Sharma',
      studentRoll: 'CSE23B023',
      section: 'CSE-B',
      fromDate: '2026-10-27',
      toDate: '2026-10-29',
      reason: 'Personal - Family wedding ceremony in Jaipur.',
      type: 'Personal',
      status: 'Pending',
      reviewedBy: null,
      reviewNote: '',
      appliedAt: '2026-10-08'
    },
    {
      id: 'lev-03',
      studentId: 'usr-stu-52',
      studentName: 'Priya Verma',
      studentRoll: 'CSE23B002',
      section: 'CSE-B',
      fromDate: '2026-10-11',
      toDate: '2026-10-12',
      reason: 'Academic - Attending IEEE student conference in Bangalore.',
      type: 'Other',
      status: 'Pending',
      reviewedBy: null,
      reviewNote: '',
      appliedAt: '2026-10-08'
    }
  ];

  // Notifications
  const notifications = [
    {
      id: 'ntf-01',
      userId: 'usr-stu-73',
      title: 'Teacher Replied to your Doubt',
      message: 'Prof. R.K. Sharma replied to your doubt on "AVL tree double rotation".',
      type: 'doubt',
      time: '2 hours ago',
      read: false
    },
    {
      id: 'ntf-02',
      userId: 'usr-stu-73',
      title: 'New Study Notes Uploaded',
      message: 'Prof. R.K. Sharma uploaded "Trees & Graphs: Important Exam Questions & Solutions".',
      type: 'notes',
      time: 'Yesterday',
      read: true
    },
    {
      id: 'ntf-03',
      userId: 'usr-stu-73',
      title: 'Attendance Warning in Discrete Mathematics',
      message: 'Your attendance is at 79%, close to the minimum 75% requirement. Please attend the next 3 sessions.',
      type: 'warning',
      time: '2 days ago',
      read: false
    },
    {
      id: 'ntf-04',
      userId: 'usr-stu-73',
      title: 'Leave Request Approved',
      message: 'Class Coordinator Prof. Kavita Nair approved your leave application (10 Oct - 12 Oct).',
      type: 'leave',
      time: '1 day ago',
      read: true
    }
  ];

  return {
    departments,
    sections,
    users,
    students,
    subjects,
    notes,
    assignments,
    submissions,
    dppSets,
    doubts,
    studentSubjectAttendance,
    timetable,
    exams,
    results,
    notices,
    leaveRequests,
    notifications
  };
}

// Generate data and write to seed_data.json
const dataset = generateData();
const outputPath = path.join(__dirname, 'seed_data.json');
fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2), 'utf-8');
console.log(`Generated ${dataset.students.length} students, ${dataset.users.length} total users, ${dataset.sections.length} sections across ${dataset.departments.length} departments.`);
console.log(`Seed dataset written to ${outputPath}`);
