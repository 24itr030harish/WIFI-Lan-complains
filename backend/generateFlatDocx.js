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
    spacing: { before: 260, after: 100 },
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
                    size: 16,
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

function createStyledTable(headers, rowsData, colWidths = []) {
  const tableRows = [];

  // Header Row
  const headerCells = headers.map((headerText, i) => {
    const cellConfig = {
      shading: { fill: COLOR_HEADER, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: headerText,
              font: 'Calibri',
              size: 20,
              bold: true,
              color: 'FFFFFF'
            })
          ]
        })
      ]
    };
    if (colWidths[i]) {
      cellConfig.width = { size: colWidths[i], type: WidthType.PERCENTAGE };
    }
    return new TableCell(cellConfig);
  });

  tableRows.push(new TableRow({ tableHeader: true, children: headerCells }));

  // Data Rows
  rowsData.forEach((row, rowIndex) => {
    const isAlt = rowIndex % 2 === 1;
    const cells = row.map((cellText, colIndex) => {
      const cellConfig = {
        shading: { fill: isAlt ? COLOR_ALT : 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 0, after: 0, line: 240 },
            children: [
              new TextRun({
                text: cellText,
                font: 'Calibri',
                size: 20,
                color: COLOR_PRIMARY
              })
            ]
          })
        ]
      };
      if (colWidths[colIndex]) {
        cellConfig.width = { size: colWidths[colIndex], type: WidthType.PERCENTAGE };
      }
      return new TableCell(cellConfig);
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
    },
    rows: tableRows
  });
}

async function run() {
  const dfaJsContent = fs.readFileSync(path.resolve(__dirname, 'utils/dfa.js'), 'utf8');
  const dfaJsLines = dfaJsContent.split(/\r?\n/);

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
                text: 'ACTIVITY- Project-Based Assessment',
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
          createParagraph('SUBJECT CODE: 22ITT53', true),
          createParagraph('SUBJECT NAME: FORMAL LANGUAGES AND AUTOMATA THEORY (FLAT)', true),
          createParagraph('PROBLEM STATEMENT : Build a web application that manages campus network connectivity complaints (Wi-Fi and LAN) using finite automata. Model the complaint lifecycle from registration to resolution using Deterministic Finite Automata (DFA) to prevent invalid state jumps and unauthorized transitions. Display complaint tracking progress, status transitions, NOC administrative metrics, and a live automata simulator on a web dashboard.', false),
          createParagraph('Title Assigned : NetCare – Network Connectivity Complaint Management System Using DFA', true),

          new Paragraph({ spacing: { before: 100, after: 100 } }),
          createHeading('1. STATE DIAGRAM'),
          createHeading('1.1 Introduction'),
          createParagraph('A Deterministic Finite Automaton (DFA) is used in the NetCare project to manage and enforce the lifecycle of campus Wi-Fi and LAN network connectivity complaints. It guarantees that every complaint progresses strictly according to formal network engineering protocols without skipping intermediate stages or permitting unauthorized state transitions.'),
          createParagraph('The automaton starts from the initial state S0 (Complaint Registered). When an administrator evaluates the issue, the DFA transitions to S1 (Under Review). As a technician is assigned and work commences, it moves through S2 and S3. Once the physical network issue is resolved, it enters S4. If the student confirms resolution, it reaches the final accepting state S5 (Closed). If the ticket is invalid or duplicate, it transitions to the dead/sink state S6 (Rejected).'),

          createHeading('1.2 States of the DFA'),
          createStyledTable(
            ['State', 'Description'],
            [
              ['S0', 'Initial state; Complaint Registered by student.'],
              ['S1', 'Under Review by Network Operations Center (NOC) administrator.'],
              ['S2', 'Technician Assigned to diagnose and troubleshoot physical/configuration issue.'],
              ['S3', 'Work In Progress; technician actively repairing cables, switches, or APs.'],
              ['S4', 'Resolved; network connectivity restored, awaiting confirmation.'],
              ['S5', 'Closed; Final accepting state verified by student or administrator.'],
              ['S6', 'Rejected; Dead/sink state for invalid, duplicate, or non-issue tickets.']
            ],
            [20, 80]
          ),

          createHeading('1.3 State Diagram Representation :'),
          createParagraph('NetCare – DFA-Based Complaint Lifecycle Management', true),
          createParagraph('The DFA contains seven states Q = {S0, S1, S2, S3, S4, S5, S6}. It enforces valid operational transitions and prevents illegal state jumps across the complaint lifecycle.'),
          createCodeBlock([
            '                     [ S0: Registered ] (Initial State q0)',
            '                         │         │',
            '                  REVIEW │         │ REJECT',
            '                         ▼         ▼',
            '                [ S1: Review ]    [ S6: Rejected ] (Sink State)',
            '                         │         ▲',
            '                  ASSIGN │         │ REJECT',
            '                         ▼         │',
            '                [ S2: Assigned ] ──┘',
            '                         │',
            '              START_WORK │',
            '                         ▼',
            '                [ S3: In Progress ]',
            '                         │',
            '                 RESOLVE │',
            '                         ▼',
            '                [ S4: Resolved ]',
            '                   │          │',
            '             CLOSE │          │ REOPEN',
            '                   ▼          ▼',
            '            (( S5: Closed ))  [ S2: Assigned ]',
            '           (Accepting State F)'
          ]),

          new Paragraph({ spacing: { before: 80, after: 60 } }),
          createParagraph('State Description:', true),
          createParagraph('S0 – Initial state; Complaint registered by student.'),
          createParagraph('S1 – Under review by network administrator.'),
          createParagraph('S2 – Technician assigned to inspect hardware/cables.'),
          createParagraph('S3 – Work in progress; technician performing physical repairs.'),
          createParagraph('S4 – Resolved; connectivity restored, pending student verification.'),
          createParagraph('S5 – Closed; Final accepting state (Double circle).'),
          createParagraph('S6 – Rejected; Dead/sink state; no further transitions allowed.'),

          createHeading('1.4 Formal Definition of DFA'),
          createParagraph('A DFA is represented by the 5-tuple:'),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 80 },
            children: [
              new TextRun({
                text: 'M = (Q, Σ, δ, q0, F)',
                font: 'Calibri',
                size: 26,
                bold: true,
                color: COLOR_SECONDARY
              })
            ]
          }),
          createParagraph('Where:'),
          createParagraph('Q: Set of states = {S0, S1, S2, S3, S4, S5, S6}'),
          createParagraph('Σ: Input alphabet = {SUBMIT, REVIEW, ASSIGN, START_WORK, RESOLVE, CLOSE, REJECT, REOPEN}'),
          createParagraph('δ: Transition function that determines the next state δ: Q × Σ → Q'),
          createParagraph('q0: Initial state = S0'),
          createParagraph('F: Final / Accepting state = {S5}'),
          createParagraph('The DFA accepts the input sequence when a complaint successfully transitions from S0 through valid actions and terminates in the accepting state S5.'),

          new Paragraph({ spacing: { before: 100, after: 100 } }),
          createHeading('2. TRANSITION DIAGRAM'),
          createParagraph('The transition diagram represents the movement of the DFA from one state to another based on incoming management and operational events.'),
          createCodeBlock([
            '   +--------+      REVIEW      +--------+      ASSIGN      +--------+',
            '-->|   S0   | ---------------->|   S1   | ---------------->|   S2   |',
            '   +--------+                  +--------+                  +--------+',
            '        | REJECT                    | REJECT                    |',
            '        |                           |                           | START_WORK',
            '        +------------+--------------+                           v',
            '                     |                                     +--------+',
            '                     v                                     |   S3   |',
            '                +========+                                 +--------+',
            '                |   S6   |                                      |',
            '                | (Sink) |                                      | RESOLVE',
            '                +========+                                      v',
            '                                                           +--------+',
            '                                                REOPEN     |   S4   |<---+',
            '                                     +---------------------|        |    |',
            '                                     |                     +--------+    |',
            '                                     |                          |        |',
            '                                     |                    CLOSE |        |',
            '                                     v                          v        |',
            '                                +--------+                 +((====))+    |',
            '                                |   S2   |                 ||  S5  ||    |',
            '                                +--------+                 +((====))+----+',
            '                                                           (Accepting)'
          ]),

          createHeading('2.1 Transition Table :'),
          createStyledTable(
            ['Current State', 'Input Symbol', 'Next State', 'Allowed Role', 'Real-World Operational Meaning'],
            [
              ['S0', 'REVIEW', 'S1', 'Admin', 'Admin begins triage and evaluates ticket.'],
              ['S0', 'REJECT', 'S6', 'Admin', 'Initial ticket deemed spam, duplicate, or invalid.'],
              ['S1', 'ASSIGN', 'S2', 'Admin', 'Technician designated for physical examination.'],
              ['S1', 'REJECT', 'S6', 'Admin', 'Issue identified as student device fault, not campus LAN.'],
              ['S2', 'START_WORK', 'S3', 'Admin / Tech', 'Technician arrives at switch/AP and initiates repair.'],
              ['S3', 'RESOLVE', 'S4', 'Admin / Tech', 'Cable crimped, port replaced, or AP reconfigured.'],
              ['S4', 'CLOSE', 'S5', 'Student / Admin', 'Student tests ping/speed and confirms resolution.'],
              ['S4', 'REOPEN', 'S2', 'Student / Admin', 'Issue recurs; re-routes ticket back to technician.'],
              ['S5', 'Any Symbol', 'Rejected (HTTP 400)', 'None', 'Terminal accepting state; ticket permanently locked.'],
              ['S6', 'Any Symbol', 'Rejected (HTTP 400)', 'None', 'Dead/sink state; ticket permanently closed as invalid.']
            ],
            [14, 16, 14, 18, 38]
          ),

          new Paragraph({ spacing: { before: 80, after: 60 } }),
          createParagraph('Special Conditions:', true),
          createParagraph('1. Any transition not defined in δ (such as S0 → RESOLVE) is strictly rejected with HTTP 400 Bad Request.'),
          createParagraph('2. S5 is the terminal accepting state (F = {S5}). No further transitions are permitted once accepted.'),
          createParagraph('3. S6 is the dead/sink state. Once rejected, the complaint cannot be transitioned to any other state.'),
          createParagraph('4. If the connectivity problem re-occurs after being resolved (S4), triggering the REOPEN symbol cycles the automaton back to S2 (Assigned).'),
          createParagraph('5. All valid transitions append an immutable audit log to transitionHistory in MongoDB Atlas.'),

          createHeading('2.2 Example of State Transitions :'),
          createParagraph('Consider complaint ticket NET-2026-0001 filed for "Hostel 3 Wi-Fi Frequent Disconnection":'),
          createStyledTable(
            ['Step', 'Complaint ID', 'Action Executed', 'DFA State', 'State Description'],
            [
              ['Initial', 'NET-2026-0001', 'SUBMIT', 'S0', 'Complaint Registered'],
              ['1', 'NET-2026-0001', 'REVIEW', 'S1', 'Under Review by NOC'],
              ['2', 'NET-2026-0001', 'ASSIGN', 'S2', 'Assigned to Technician (Suresh)'],
              ['3', 'NET-2026-0001', 'START_WORK', 'S3', 'Work In Progress (Troubleshooting AP)'],
              ['4', 'NET-2026-0001', 'RESOLVE', 'S4', 'Resolved (AP Firmware Restored)'],
              ['5', 'NET-2026-0001', 'CLOSE', 'S5', 'Closed [Accepting State F]']
            ],
            [12, 22, 18, 18, 30]
          ),

          new Paragraph({ spacing: { before: 80, after: 60 } }),
          createParagraph('Result: After executing the valid sequence {SUBMIT, REVIEW, ASSIGN, START_WORK, RESOLVE, CLOSE}, the DFA enters accepting state S5 and the complaint lifecycle is successfully accepted and archived.', true),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('CODE:'),
          createParagraph('File Name: dfa.js', true),
          createCodeBlock(dfaJsLines),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('Output:'),
          createCodeBlock([
            'Complaint ID: NET-2026-0001',
            'Title: Hostel 3 Block B Wi-Fi Frequent Drops',
            'Action: SUBMIT',
            'DFA State: S0 (Complaint Registered)',
            '',
            'Action: REVIEW',
            'DFA State: S1 (Under Review)',
            '',
            'Action: ASSIGN (Technician: Suresh)',
            'DFA State: S2 (Assigned to Technician)',
            '',
            'Action: START_WORK',
            'DFA State: S3 (Work In Progress)',
            '',
            'Action: RESOLVE',
            'DFA State: S4 (Resolved)',
            '',
            'Action: CLOSE',
            'DFA State: S5 (Closed)',
            '',
            'STATUS: Complaint Lifecycle Completed Successfully in Final Accepting State S5!'
          ]),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('PROCEDURE STEPS :'),
          createParagraph('1. Start MongoDB database service or connect to MongoDB Atlas cluster0.2mjpwje.mongodb.net.'),
          createParagraph('2. Open the NetCare project folder in Visual Studio Code.'),
          createParagraph('3. Open the backend folder in the terminal and install the required Node.js dependencies using npm install.'),
          createParagraph('4. Configure the MongoDB Atlas connection URI and JWT_SECRET in the backend/.env file.'),
          createParagraph('5. Seed the database with administrative and student accounts by executing node seed/seed.js.'),
          createParagraph('6. Start the backend Express server using npm run dev on port 5000.'),
          createParagraph('7. Open another terminal and navigate to the frontend folder.'),
          createParagraph('8. Install frontend dependencies with npm install and start the Vite development server with npm run dev on port 5173.'),
          createParagraph('9. Open the NetCare web application in Google Chrome using http://localhost:5173.'),
          createParagraph('10. Log in with student credentials (arun.kumar@college.edu / Student@123) and submit a Wi-Fi connectivity complaint.'),
          createParagraph('11. Observe the DFA initialize the complaint into state S0 (Registered).'),
          createParagraph('12. Log in with administrator credentials (admin@college.edu / Admin@123) and navigate to the Admin Dashboard.'),
          createParagraph('13. Execute sequential state transitions: REVIEW -> S1, ASSIGN -> S2, START_WORK -> S3, RESOLVE -> S4.'),
          createParagraph('14. Log back in as the student, verify network ping and speed, and click Close Complaint to trigger CLOSE -> S5 (Final Accepting State).'),
          createParagraph('15. Navigate to the DFA Automata Diagram & Simulator page to verify the state graph and confirm illegal transition rejections (HTTP 400).'),

          new Paragraph({ spacing: { before: 140, after: 100 } }),
          createHeading('ADVANTAGES OF USING FLAT CONCEPT IN NETCARE :'),
          createParagraph('1. Formal State Validation: Guarantees that complaint status follows mathematically proven transition pathways, preventing skipped stages.'),
          createParagraph('2. Prevention of Invalid Transitions: Immediately intercepts out-of-order calls (e.g. attempting to resolve S0 tickets directly) and returns HTTP 400 Bad Request.'),
          createParagraph('3. Deterministic Behavior: Given the current state and input event, the next state is uniquely and unambiguously determined with zero race conditions.'),
          createParagraph('4. Role Authorization Enforcement: Automata transition logic binds specific input symbols to authorized user roles (e.g., student vs. admin).'),
          createParagraph('5. Complete Lifecycle Auditability: Every state transition is recorded as an immutable subdocument in MongoDB Atlas, creating a verifiable audit trail.'),
          createParagraph('6. Terminal State Security: Enforces that closed complaints (S5) and rejected tickets (S6) are permanently locked against unauthorized tampering.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.resolve(__dirname, '..', 'NetCare_FLAT_Assessment_Report.docx');
  const outPath2 = 'C:\\Users\\DHARUNYA G\\.gemini\\antigravity\\brain\\f32e7fb2-fb04-40f1-8ad1-d0aeee212af9\\NetCare_FLAT_Assessment_Report.docx';
  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);
  console.log('Successfully saved FLAT assessment docx to:', outPath1);
}

run().catch(console.error);
