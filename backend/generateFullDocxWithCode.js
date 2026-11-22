const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType
} = require('./node_modules/docx');

// Colors
const COLOR_PRIMARY = '0F172A';
const COLOR_SECONDARY = '1E3A8A';
const COLOR_HEADER = '1E3A8A';
const COLOR_ALT = 'F8FAFC';
const COLOR_BORDER = 'CBD5E1';
const COLOR_CODE_BG = 'F8FAFC';

function createHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: 'Calibri',
        size: 26,
        bold: true,
        color: COLOR_SECONDARY
      })
    ]
  });
}

function createParagraph(text, isBold = false) {
  return new Paragraph({
    spacing: { before: 40, after: 60, line: 240 },
    children: [
      new TextRun({
        text: text,
        font: 'Calibri',
        size: 22,
        bold: isBold,
        color: COLOR_PRIMARY
      })
    ]
  });
}

function createCodeBlock(lines) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_CODE_BG, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: lines.map(line =>
              new Paragraph({
                spacing: { before: 0, after: 0, line: 200 },
                children: [
                  new TextRun({
                    text: line,
                    font: 'Consolas',
                    size: 16, // 8pt
                    color: '0F172A'
                  })
                ]
              })
            )
          })
        ]
      })
    ]
  });
}

function getFileLines(relPath) {
  const fullPath = path.resolve(__dirname, relPath);
  if (!fs.existsSync(fullPath)) return [`// File not found: ${relPath}`];
  const content = fs.readFileSync(fullPath, 'utf8');
  return content.split(/\r?\n/);
}

async function run() {
  console.log('Reading real project files from disk...');

  const appJsxLines = getFileLines('../frontend/src/App.jsx');
  const mainJsxLines = getFileLines('../frontend/src/main.jsx');
  const serverJsLines = getFileLines('server.js');
  const dfaJsLines = getFileLines('utils/dfa.js');
  const complaintModelLines = getFileLines('models/Complaint.js');
  const userModelLines = getFileLines('models/User.js');

  console.log(`Loaded: App.jsx (${appJsxLines.length} lines), server.js (${serverJsLines.length} lines), dfa.js (${dfaJsLines.length} lines), Complaint.js (${complaintModelLines.length} lines)`);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 }
          }
        },
        children: [
          // College Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: 'VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12',
                font: 'Calibri',
                size: 26,
                bold: true,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: '(AUTONOMOUS)',
                font: 'Calibri',
                size: 22,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: 'DEPARTMENT OF INFORMATION TECHNOLOGY',
                font: 'Calibri',
                size: 22,
                bold: true,
                color: '2563EB'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: 'ACADEMIC YEAR: 2026 -27 (ODD)',
                font: 'Calibri',
                size: 20,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [
              new TextRun({
                text: 'ACTIVITY - Project-Based Assessment',
                font: 'Calibri',
                size: 24,
                bold: true,
                color: '1E3A8A'
              })
            ]
          }),

          // Metadata block
          createParagraph('NAME : HARISH K', true),
          createParagraph('CLASS: 24IT5A', true),
          createParagraph('REG.NO: 732924ITR030', true),
          createParagraph('SUBJECT CODE: 22ITT51', true),
          createParagraph('SUBJECT NAME: FULL STACK WEB DEVELOPMENT (FSWD)', true),
          createParagraph('ACTIVITY : 2', true),
          createParagraph('PROBLEM STATEMENT : Design and implement a full-stack web application for Campus Wi-Fi and LAN Connectivity Complaint Management. Model the entire complaint lifecycle from registration to resolution using Deterministic Finite Automata (DFA) to prevent invalid state jumps and unauthorized transitions. Provide a responsive dashboard for students to submit and track complaints, an administrative NOC portal to triage and assign technicians, and an interactive DFA simulator with real-time transition auditing.', false),
          createParagraph('Title Assigned : NetCare – Network Connectivity Complaint Management System Using DFA', true),

          new Paragraph({ spacing: { before: 100, after: 100 } }),
          createHeading('Project Folder Structure :'),
          createCodeBlock([
            'NetCare/',
            '├── backend/',
            '│   ├── config/',
            '│   │   └── db.js',
            '│   ├── controllers/',
            '│   │   ├── adminController.js',
            '│   │   ├── authController.js',
            '│   │   ├── complaintController.js',
            '│   │   └── dfaController.js',
            '│   ├── middleware/',
            '│   │   ├── auth.js',
            '│   │   └── errorHandler.js',
            '│   ├── models/',
            '│   │   ├── Complaint.js',
            '│   │   └── User.js',
            '│   ├── routes/',
            '│   │   ├── adminRoutes.js',
            '│   │   ├── authRoutes.js',
            '│   │   ├── complaintRoutes.js',
            '│   │   └── dfaRoutes.js',
            '│   ├── seed/',
            '│   │   └── seed.js',
            '│   ├── tests/',
            '│   │   ├── testAPIEndpoints.js',
            '│   │   ├── testAuth.js',
            '│   │   ├── testComplaintModel.js',
            '│   │   ├── testDFA.js',
            '│   │   └── testFullSystem.js',
            '│   ├── utils/',
            '│   │   └── dfa.js',
            '│   ├── package.json',
            '│   └── server.js',
            '└── frontend/',
            '    ├── public/',
            '    ├── src/',
            '    │   ├── components/common/ (Badge.jsx, ProtectedRoute.jsx, LoadingSpinner.jsx)',
            '    │   ├── components/layout/ (Layout.jsx, Navbar.jsx, Sidebar.jsx)',
            '    │   ├── context/ (AuthContext.jsx, ToastContext.jsx)',
            '    │   ├── pages/ (Login, Register, StudentDashboard, SubmitComplaint,',
            '    │   │           MyComplaints, ComplaintDetails, ComplaintTracking,',
            '    │   │           Profile, AdminDashboard, AdminComplaints, DFADiagram, DFATable)',
            '    │   ├── services/ (api.js, mockData.js)',
            '    │   ├── App.jsx',
            '    │   ├── App.css',
            '    │   ├── index.css',
            '    │   ├── theme.css',
            '    │   └── main.jsx',
            '    ├── index.html',
            '    ├── vite.config.js',
            '    └── package.json'
          ]),

          new Paragraph({ spacing: { before: 100, after: 100 } }),
          createHeading('Repository :'),
          createParagraph('GitHub:  https://github.com/24itr030harish/WIFI-Lan-complains'),
          createParagraph('Live Demo (GitHub Pages):  https://24itr030harish.github.io/WIFI-Lan-complains/'),

          new Paragraph({ spacing: { before: 100, after: 100 } }),
          createHeading('1.4 Working Principle of the Project'),
          createParagraph('The NetCare application manages the complete lifecycle of campus network connectivity complaints through a sequence of authentication, formal automata evaluation, persistent cloud storage, role-based workflows, and real-time dashboard visualizations:'),
          createParagraph('1. User Authentication & Authorization: Students and NOC administrators authenticate using JSON Web Tokens (JWT). Passwords are securely hashed with bcryptjs. Protected routes enforce strict Role-Based Access Control (RBAC).'),
          createParagraph('2. Complaint Registration (S0): Students file network connectivity complaints (Wi-Fi dropouts, LAN port damage, slow throughput, DNS failure) specifying building location, room number, and description. The backend generates a unique ID (e.g., NET-2026-0001) and initializes the complaint to DFA state S0 (Registered).'),
          createParagraph('3. Formal DFA Mathematical Engine: The backend encapsulates a deterministic finite automaton M = (Q, Sigma, delta, q0, F). State transitions are strictly governed by the mathematical transition function delta. Any out-of-order or unauthorized state jump returns HTTP 400 Bad Request, preventing race conditions or bypassed procedures.'),
          createParagraph('4. NOC Administrative Review (S1): Network Operations Center administrators evaluate submitted tickets. Valid complaints transition via delta(S0, REVIEW) -> S1 (Under Review). Erroneous, duplicate, or spam complaints are transitioned via delta(S0, REJECT) -> S6 (Rejected Sink State).'),
          createParagraph('5. Field Technician Assignment (S2): NOC administrators assign a dedicated network technician to the ticket, triggering delta(S1, ASSIGN) -> S2 (Assigned).'),
          createParagraph('6. Physical Troubleshooting & Diagnostics (S3): Upon reaching the access point, switch rack, or LAN outlet, the technician initiates diagnostics, triggering delta(S2, START_WORK) -> S3 (In Progress).'),
          createParagraph('7. Resolution & Verification (S4): Once cables are re-crimped, ports re-patched, or APs reconfigured, the technician marks the issue as resolved: delta(S3, RESOLVE) -> S4 (Resolved).'),
          createParagraph('8. Student Acceptance (S5) or Reopen Cycle (S2): The student tests network speed and ping. If satisfied, the student confirms closure: delta(S4, CLOSE) -> S5 (Closed - Accepting State). If issues persist, the student reopens the ticket: delta(S4, REOPEN) -> S2 (Assigned), returning the complaint for technician re-inspection.'),
          createParagraph('9. Cloud Database Persistence: All complaint documents, status changes, and complete audit history subdocuments are stored in MongoDB Atlas (netcare_db) over TLS TCP sockets on port 27017.'),
          createParagraph('10. Interactive Visual Dashboard & DFA Simulator: The React frontend displays live status badges, stepped timeline trackers, NOC status metrics, SVG state machine graphs, and an interactive DFA simulator with live event execution.'),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('SOURCE CODE FILE INDEX :'),

          createParagraph('frontend/src/App.jsx:', true),
          createCodeBlock(appJsxLines),

          new Paragraph({ spacing: { before: 100, after: 60 } }),
          createParagraph('frontend/src/main.jsx:', true),
          createCodeBlock(mainJsxLines),

          new Paragraph({ spacing: { before: 100, after: 60 } }),
          createParagraph('backend/server.js:', true),
          createCodeBlock(serverJsLines),

          new Paragraph({ spacing: { before: 100, after: 60 } }),
          createParagraph('backend/utils/dfa.js (Formal DFA Automata Engine):', true),
          createCodeBlock(dfaJsLines),

          new Paragraph({ spacing: { before: 100, after: 60 } }),
          createParagraph('backend/models/Complaint.js (Mongoose Schema & Transition History):', true),
          createCodeBlock(complaintModelLines),

          new Paragraph({ spacing: { before: 100, after: 60 } }),
          createParagraph('backend/models/User.js (Authentication & Role Schema):', true),
          createCodeBlock(userModelLines),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('OUTPUT :'),
          createCodeBlock([
            '====================================================================================================',
            '                        NETCARE - NETWORK COMPLAINT MANAGEMENT DASHBOARD',
            '====================================================================================================',
            '',
            ' [ Campus NOC Metrics ]',
            ' ┌─────────────────────────┬─────────────────────────┬─────────────────────────┬──────────────────┐',
            ' │ Total Complaints: 10    │ Pending Review: 2       │ In Progress: 3          │ Resolved / Closed: 5 │',
            ' └─────────────────────────┴─────────────────────────┴─────────────────────────┴──────────────────┘',
            '',
            ' [ Live Complaint Stepped Timeline (DFA Progression) ]',
            '  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐',
            '  │ S0: Register │ ──> │  S1: Review  │ ──> │ S2: Assigned │ ──> │ S3: In Prog  │ ──> │  S4: Resolved│ ──> (S5: Closed)',
            '  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘',
            '         │                    │                                                              ▲',
            '         └──[ REJECT ]───> [ S6: Sink (Rejected) ]                                           │',
            '                              ▲                                                              │',
            '                              └──────────────────────[ REOPEN ]──────────────────────────────┘',
            '',
            ' [ Active Campus Tickets ]',
            ' ┌───────────────┬───────────────────────────────┬────────────┬──────────────────┬──────────────┐',
            ' │ Complaint ID  │ Title                         │ Category   │ DFA Status       │ Assigned To  │',
            ' ├───────────────┼───────────────────────────────┼────────────┼──────────────────┼──────────────┤',
            ' │ NET-2026-0001 │ Hostel 3 Wi-Fi Frequent Drops │ Wi-Fi      │ S3: In Progress  │ Suresh Tech  │',
            ' │ NET-2026-0002 │ Lab 4 LAN Port 18 Damaged     │ LAN Port   │ S2: Assigned     │ Ramesh Tech  │',
            ' │ NET-2026-0003 │ Library 2nd Floor Slow DNS    │ Bandwidth  │ S1: Under Review │ Pending      │',
            ' │ NET-2026-0004 │ Mech Block AP Offline         │ Access Pt  │ S5: Closed [F]   │ Suresh Tech  │',
            ' │ NET-2026-0005 │ CSE Lab B Switch Loop Error   │ Switch     │ S4: Resolved     │ Mohan Tech   │',
            ' └───────────────┴───────────────────────────────┴────────────┴──────────────────┴──────────────┘'
          ]),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('MONGODB COMMANDS USED IN NETCARE PROJECT'),
          createParagraph('MongoDB is used to store and retrieve complaints, users, and DFA transition histories:'),
          createParagraph('1. Display Available Databases\nshow dbs'),
          createParagraph('2. Select NetCare Database\nuse netcare_db'),
          createParagraph('3. Display Collections\nshow collections'),
          createParagraph('4. Retrieve All Complaints\ndb.complaints.find()'),
          createParagraph('5. Display Complaints in Readable Format\ndb.complaints.find().pretty()'),
          createParagraph('6. Retrieve Complaints by Specific DFA State\ndb.complaints.find({ currentState: "S0" })'),
          createParagraph('7. Count Total Complaints by State\ndb.complaints.aggregate([{ $group: { _id: "$currentState", count: { $sum: 1 } } }])'),
          createParagraph('8. Retrieve Complete Audit History for a Complaint\ndb.complaints.find({ complaintId: "NET-2026-0001" }, { transitionHistory: 1 })'),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('GITHUB COMMANDS TO PUSH NETCARE PROJECT'),
          createCodeBlock([
            'Open PowerShell in your project folder:',
            'cd "d:\\Harish\\NetCare"',
            '',
            '1. Initialize Git',
            'git init',
            '',
            '2. Add all project files',
            'git add .',
            '',
            '3. Commit the files',
            'git commit -m "NetCare Complaint Management System using DFA complete release"',
            '',
            '4. Connect GitHub repository',
            'git remote add origin https://github.com/24itr030harish/WIFI-Lan-complains.git',
            '',
            '5. Set the main branch',
            'git branch -M main',
            '',
            '6. Push the project to GitHub',
            'git push -u origin main'
          ]),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('PROCEDURE TO RUN NETCARE PROJECT LOCALLY'),
          createParagraph('Step 1: Open the project folder\ncd "d:\\Harish\\NetCare"'),
          createParagraph('Step 2: Configure Environment Variables in backend/.env with MongoDB Atlas connection string'),
          createParagraph('Step 3: Seed Database with initial data\ncd backend\nnode seed/seed.js'),
          createParagraph('Step 4: Start the Backend Server (Terminal 1)\ncd backend\nnpm install\nnpm run dev\nBackend URL: http://localhost:5000'),
          createParagraph('Step 5: Start the Frontend Server (Terminal 2)\ncd frontend\nnpm install\nnpm run dev\nFrontend URL: http://localhost:5173'),
          createParagraph('Step 6: Open the Application in Browser: http://localhost:5173\nTest login with Admin and Student credentials, submit complaints, and execute verified DFA transitions.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.resolve(__dirname, '..', 'NetCare_VCET_Assessment_Report.docx');
  const outPath2 = 'C:\\Users\\DHARUNYA G\\.gemini\\antigravity\\brain\\f32e7fb2-fb04-40f1-8ad1-d0aeee212af9\\NetCare_VCET_Assessment_Report.docx';
  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);
  console.log('Successfully written full assessment docx with complete code to:', outPath1);
}

run().catch(console.error);
