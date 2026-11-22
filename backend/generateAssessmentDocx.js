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
const COLOR_CODE_BG = 'F1F5F9';

function createHeading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
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
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: lines.map(line =>
              new Paragraph({
                spacing: { before: 0, after: 0, line: 210 },
                children: [
                  new TextRun({
                    text: line,
                    font: 'Consolas',
                    size: 17,
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

async function run() {
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
            '    │   ├── components/common/ (Badge, ProtectedRoute)',
            '    │   ├── components/layout/ (Layout, Navbar, Sidebar)',
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
          createParagraph('10. Interactive Visual Dashboard & DFA Simulator: The React frontend displays live status badges, stepped timeline trackers, NOC status metrics, SVG state machine graphs, and an interactive DFA simulator with live event execution.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.resolve(__dirname, '..', 'NetCare_VCET_Assessment_Report.docx');
  const outPath2 = 'C:\\Users\\DHARUNYA G\\.gemini\\antigravity\\brain\\f32e7fb2-fb04-40f1-8ad1-d0aeee212af9\\NetCare_VCET_Assessment_Report.docx';
  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);
  console.log('Saved assessment docx to:', outPath1);
}

run().catch(console.error);
