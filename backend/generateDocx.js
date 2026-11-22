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
  ShadingType,
  TableLayoutType
} = require('./node_modules/docx');

// --- STYLING CONSTANTS ---
const FONT_BODY = 'Calibri';
const FONT_CODE = 'Consolas';
const COLOR_PRIMARY = '1E3A8A';    // Deep Navy
const COLOR_SECONDARY = '2563EB';  // Blue Accent
const COLOR_DARK = '1E293B';       // Charcoal text
const COLOR_MUTED = '64748B';      // Slate gray
const COLOR_BG_HEADER = '1E3A8A';  // Table header background
const COLOR_BG_ALT = 'F8FAFC';     // Alternating row background
const COLOR_BORDER = 'CBD5E1';     // Table border light gray
const COLOR_CODE_BG = 'F1F5F9';    // Code block background
const COLOR_CALLOUT_BG = 'EFF6FF'; // Callout box background

// --- HELPER BUILDERS ---

function createDocTitle(title, subtitle) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: title,
          font: FONT_BODY,
          size: 44, // 22pt
          bold: true,
          color: COLOR_PRIMARY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({
          text: subtitle,
          font: FONT_BODY,
          size: 26, // 13pt
          color: COLOR_SECONDARY,
          italics: true
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
      children: [
        new TextRun({
          text: 'Comprehensive Architecture, Computer Networks (CN) & Formal DFA Automata Assessment',
          font: FONT_BODY,
          size: 20,
          color: COLOR_MUTED
        })
      ]
    })
  ];
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text: text,
        font: FONT_BODY,
        size: 30, // 15pt
        bold: true,
        color: COLOR_PRIMARY
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: FONT_BODY,
        size: 24, // 12pt
        bold: true,
        color: COLOR_SECONDARY
      })
    ]
  });
}

function createParagraph(text, options = {}) {
  const children = [];
  if (typeof text === 'string') {
    children.push(
      new TextRun({
        text: text,
        font: FONT_BODY,
        size: options.size || 22,
        color: options.color || COLOR_DARK,
        bold: options.bold || false,
        italics: options.italics || false
      })
    );
  } else if (Array.isArray(text)) {
    // Array of TextRun
    children.push(...text);
  }

  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      before: options.spacingBefore || 60,
      after: options.spacingAfter !== undefined ? options.spacingAfter : 120,
      line: 276 // 1.15 line spacing
    },
    children: children
  });
}

function createBulletItem(boldPrefix, normalText) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
    children: [
      new TextRun({
        text: boldPrefix + ': ',
        font: FONT_BODY,
        size: 22,
        bold: true,
        color: COLOR_DARK
      }),
      new TextRun({
        text: normalText,
        font: FONT_BODY,
        size: 22,
        color: COLOR_DARK
      })
    ]
  });
}

function createCallout(title, message) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 28, color: COLOR_SECONDARY }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_CALLOUT_BG, type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    font: FONT_BODY,
                    size: 22,
                    bold: true,
                    color: COLOR_PRIMARY
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: message,
                    font: FONT_BODY,
                    size: 20,
                    color: COLOR_DARK
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createCodeBlock(lines) {
  const content = lines.map(line =>
    new Paragraph({
      spacing: { before: 0, after: 0, line: 220 },
      children: [
        new TextRun({
          text: line,
          font: FONT_CODE,
          size: 17, // ~8.5pt
          color: '0F172A'
        })
      ]
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_CODE_BG, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: content
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
      shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: headerText,
              font: FONT_BODY,
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

  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headerCells
    })
  );

  // Data Rows
  rowsData.forEach((row, rowIndex) => {
    const isAlt = rowIndex % 2 === 1;
    const cells = row.map((cellText, colIndex) => {
      const cellConfig = {
        shading: { fill: isAlt ? COLOR_BG_ALT : 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 0, after: 0, line: 240 },
            children: [
              new TextRun({
                text: cellText,
                font: FONT_BODY,
                size: 19,
                color: COLOR_DARK
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
      right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
    },
    rows: tableRows
  });
}

// --- BUILD DOCUMENT CONTENT ---

function buildReportDocument() {
  const docChildren = [
    // Cover Header
    ...createDocTitle(
      'NetCare: Campus Network Connectivity Complaint Management System Using DFA',
      'Technical Architecture, Computer Networks (CN) & Automata Theory (DFA) Report'
    ),

    createCallout(
      'EXECUTIVE OVERVIEW',
      'NetCare is a full-stack distributed network complaint management platform that resolves campus Wi-Fi and LAN connectivity breakdowns across student hostels, academic blocks, and labs. The platform uniquely integrates modern web engineering (React, Node.js/Express, MongoDB Atlas) with theoretical computer science (Deterministic Finite Automata - DFA). Every complaint lifecycle is validated against a formal 5-tuple mathematical automaton M = (Q, Sigma, delta, q0, F) on the backend, ensuring zero unauthorized state jumps and bulletproof data integrity.'
    ),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 1
    createHeading1('1. NETWORK TOPOLOGY & DEVICE INTERCONNECTION'),
    createHeading2('1.1 Network Architecture & Topology Classification'),
    createParagraph(
      'The NetCare system implements a Hybrid Extended Star and Client-Server Distributed Topology deployed across a multi-subnet campus Local Area Network (LAN) and interconnected via optical fiber uplinks to a Wide Area Network (WAN / Public Cloud). The architecture is logically divided into three interconnected tiers:'
    ),
    createBulletItem('Edge Client Tier', 'Student personal devices (laptops, mobile phones) connected over campus Wi-Fi (IEEE 802.11ac/ax, VLAN 10), lab workstations connected via Gigabit Ethernet (IEEE 802.3, VLAN 20), and Network Operations Center (NOC) administration consoles (VLAN 99).'),
    createBulletItem('Application & DFA Logic Tier', 'An Express.js + Node.js REST API server operating on Port 5000 (0.0.0.0:5000), encapsulating the formal DFA state transition engine, input validation sanitizers, and JWT token authentication middleware.'),
    createBulletItem('Cloud Database Tier', 'A multi-region MongoDB Atlas Cloud Database Cluster (cluster0.2mjpwje.mongodb.net, primary shard host: ac-7s22o2j-shard-00-02.2mjpwje.mongodb.net) implementing a 3-node Replica Set (Primary + 2 Secondaries) communicating over secure TLS TCP sockets on Port 27017.'),

    createHeading2('1.2 Network Interconnection & Hardware Device Roles'),
    createParagraph('In this campus network architecture, dedicated physical and logical network devices work together to guarantee reliable and secure telemetry transmission:'),
    createBulletItem('Network Interface Card (NIC)', 'Operates at Physical and Data Link layers (OSI Layers 1 & 2) on student and admin endpoints to encode digital data into radio-frequency frames (Wi-Fi 802.11) or differential electrical voltages over Cat6 copper twisted pairs (Ethernet 802.3).'),
    createBulletItem('PoE Access Points & Layer 2 Access Switches', 'Supplies Power over Ethernet (802.3at) to ceiling-mounted APs and maintains MAC Address Tables (CAM tables) to forward Ethernet frames within local subnets without collisions.'),
    createBulletItem('Campus Core Layer 3 Switch', 'Interconnects campus subnets (Student VLAN 10, Lab VLAN 20, NOC Admin VLAN 99), handles high-speed hardware inter-VLAN IP packet routing, and connects to the perimeter firewall.'),
    createBulletItem('Perimeter Gateway & NAT Router', 'Serves as the campus default gateway (172.16.0.1), manages DHCP leasing, performs stateful Network Address Port Translation (NAPT) from private IPs to public routable WAN IPs, and enforces security firewall policies.'),
    createBulletItem('ISP Edge Routers & Autonomous Systems (AS)', 'Route campus traffic across the Internet backbone using Border Gateway Protocol (BGP).'),
    createBulletItem('GitHub Pages Anycast Edge CDN', 'Terminates incoming HTTPS/TLS 1.3 connections on Port 443 and serves the minified React Single Page Application (SPA) bundle using globally distributed edge caches.'),
    createBulletItem('Node.js + Express Backend Server', 'Binds to Port 5000, evaluates input symbols against the formal DFA transition matrix delta(Si, sigma), enforces role authorization, and writes state change audit logs.'),
    createBulletItem('MongoDB Atlas Replica Set Router & Nodes', 'Coordinates cloud document persistence, ensures automated master failover in under 3 seconds, and enforces replica set write concerns across distributed geographical zones.'),

    createHeading2('1.3 Topology Interconnection Diagram'),
    createCodeBlock([
      ' [Student Laptop / Wi-Fi Device]      [NOC Admin Workstation]       [Lab Desktop / Ethernet]',
      '  (172.16.12.45 : Ephemeral 51280)     (172.16.99.10 : Ephemeral)    (172.16.20.104 : Ephemeral)',
      '            │                                    │                            │',
      '            ▼                                    ▼                            ▼',
      '   [Campus Wi-Fi AP (PoE)]              [NOC Access Switch]          [Lab Edge Switch]',
      '   (VLAN 10: 172.16.10.0/20)           (VLAN 99: Admin Subnet)      (VLAN 20: 172.16.20.0/24)',
      '            │                                    │                            │',
      '            └────────────────────────────┬───────┴────────────────────────────┘',
      '                                         │ (10G SFP+ Optical Fiber Trunk)',
      '                                         ▼',
      '                            [Campus Core Layer 3 Switch]',
      '                               (Default Gateway: 172.16.0.1)',
      '                                         │',
      '                                         ▼',
      '                        [Campus Perimeter Firewall / NAT Router]',
      '                           (NAT Gateway ──> Public IP: 103.212.x.x)',
      '                                         │',
      '                  ═══════════════════════╪═══════════════════════════',
      '                              WAN / PUBLIC INTERNET (BGP)',
      '                  ═══════════════════════╪═══════════════════════════',
      '                       ┌─────────────────┴────────────────┐',
      '                       │                                  │',
      '                       ▼ (HTTPS : Port 443)               ▼ (HTTPS REST : Port 5000/443)',
      '            [GitHub Pages Anycast CDN]           [NetCare Node.js Express Server]',
      '            (185.199.108.153)                    (Express API + DFA Transition Engine)',
      '            • Serves React SPA static bundle     • Validates JWT Bearer Tokens',
      '            • Edge cached HTML/JS/CSS assets     • Evaluates Formal DFA Transitions:',
      '                       │                           (S0 -> S1 -> S2 -> S3 -> S4 -> S5)',
      '                       │                                  │',
      '                       │                                  ▼ (Secure TLS TCP Socket : Port 27017)',
      '                       │                         [MongoDB Atlas Cloud Database Cluster]',
      '                       │                         (cluster0.2mjpwje.mongodb.net)',
      '                       │                         ├── Primary Node (ac-7s22o2j-shard-00-02)',
      '                       │                         └── Secondary Nodes (Auto-Failover)',
      '                       │                                  │',
      '                       └──────────────────────────────────┘'
    ]),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 2
    createHeading1('2. IP ADDRESSING SCHEME & COMMUNICATION ANALYSIS'),
    createParagraph(
      'IP addressing provides logical identification and packet routing across campus subnets and the Internet. The table below details every entity in the NetCare platform, its assigned IP address, category, and functional role:'
    ),
    createStyledTable(
      ['Network Entity', 'Assigned IP / Domain', 'IP Class & Subnet Type', 'Functional Role in NetCare'],
      [
        ['Student Workstation (Wi-Fi)', '172.16.12.45', 'Private IPv4 (Class B, /20)', 'Files complaint; streams live DFA progress via React UI'],
        ['NOC Admin Workstation (LAN)', '172.16.99.10', 'Private IPv4 (Class B, /24)', 'Performs review, technician dispatch, and state updates'],
        ['Campus Default Gateway', '172.16.0.1', 'Private Gateway IPv4', 'Handles DHCP allocation and inter-VLAN routing'],
        ['Campus Public WAN IP', '103.212.x.x (Dynamic)', 'Public Routable IPv4', 'Identifies campus traffic across the public Internet'],
        ['GitHub Pages CDN Edge', '185.199.108.153', 'Public Anycast IPv4', 'Delivers React SPA assets via edge caching'],
        ['NetCare Express Server', '127.0.0.1 / Port 5000', 'Loopback / Cloud Container', 'Ingests REST requests, runs DFA engine, verifies JWTs'],
        ['MongoDB Atlas Primary Shard', 'ac-7s22o2j-shard-00-02.2mjpwje.mongodb.net', 'Distributed Cloud Domain', 'Stores persistent users and complaints collections']
      ],
      [22, 28, 22, 28]
    ),

    createHeading2('2.1 Network Address Translation (NAT) & Private-to-Public Mapping'),
    createParagraph(
      'Under RFC 1918, private IP addresses (such as 172.16.12.45) cannot be routed across the public Internet. When a student registers a Wi-Fi complaint, the campus perimeter router executes Network Address Port Translation (NAPT):'
    ),
    createBulletItem('Step 1: Private Packet Generation', 'The student laptop dispatches an IP packet: Source IP 172.16.12.45:51280 -> Destination IP (NetCare Server):5000.'),
    createBulletItem('Step 2: Stateful NAPT Rewriting', 'The gateway router replaces the private source IP (172.16.12.45) with its public IP (103.212.x.x) and maps client port 51280 to public translation port 62104.'),
    createBulletItem('Step 3: Translation Table Registration', 'The tuple (172.16.12.45:51280 <-> 103.212.x.x:62104) is stored in the router stateful NAT memory table.'),
    createBulletItem('Step 4: Response Demultiplexing', 'When the server responds with HTTP 201 Created, the gateway references the NAT table, translates destination 103.212.x.x:62104 back to 172.16.12.45:51280, and forwards the packet onto the campus Wi-Fi VLAN.'),

    createHeading2('2.2 Domain Name System (DNS) Resolution Process'),
    createParagraph(
      'Before transmitting data, two distinct DNS resolution stages take place across the system:'
    ),
    createBulletItem('1. Frontend Web Resolution', 'The browser queries local DNS over UDP Port 53 for 24itr030harish.github.io. The recursive resolver queries Root (.), TLD (.io), and GitHub Authoritative Name Servers, returning Anycast IP 185.199.108.153.'),
    createBulletItem('2. MongoDB Atlas SRV & TXT Resolution', 'The Node.js backend connects using connection string mongodb+srv://...cluster0.2mjpwje.mongodb.net/netcare_db. The +srv protocol triggers a DNS SRV record query (_mongodb._tcp.cluster0.2mjpwje.mongodb.net). The DNS resolver returns a list of active replica set shard hostnames and port 27017. A companion DNS TXT query retrieves replica set metadata (replicaSet=atlas-xxx&authSource=admin).'),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 3
    createHeading1('3. PROTOCOLS USED & WORKING PRINCIPLES'),
    createParagraph(
      'The NetCare platform utilizes a comprehensive protocol stack conforming to both the OSI 7-Layer Reference Model and the TCP/IP 4-Layer Architecture:'
    ),
    createStyledTable(
      ['OSI Layer', 'Protocol(s) Used', 'Role in NetCare System'],
      [
        ['Layer 7: Application', 'HTTP/1.1, HTTPS, REST, DNS, JWT', 'Transmits serialized JSON payloads (/api/complaints, /api/auth, /api/dfa); carries Bearer tokens.'],
        ['Layer 6: Presentation', 'TLS 1.3, SSL, JSON Encoding', 'Enforces 256-bit AES encryption; serializes JS objects to byte streams and parses incoming strings.'],
        ['Layer 5: Session', 'TLS Session Resumption, Express Session', 'Maintains authenticated user sessions, socket lifecycles, and persistent DB connection pools.'],
        ['Layer 4: Transport', 'TCP (Transmission Control Protocol)', 'Guarantees reliable, sequenced delivery of API requests and database queries; prevents packet loss.'],
        ['Layer 3: Network', 'IPv4, ICMP, ARP, BGP', 'End-to-end routing of packets across campus switches, NAT gateways, and WAN backbone routers.'],
        ['Layer 2: Data Link', 'Ethernet IEEE 802.3, Wi-Fi 802.11ac/ax', 'Handles MAC framing, CSMA/CD and CSMA/CA collision management, and VLAN tagging (802.1Q).'],
        ['Layer 1: Physical', 'Cat6 UTP Copper, SFP+ Optical Fiber, RF', 'Physical bit transmission: electrical voltages over copper, light pulses over fiber, 5GHz radio waves.']
      ],
      [22, 28, 50]
    ),

    createHeading2('3.1 Application Layer: RESTful Architecture & API Endpoints'),
    createParagraph(
      'Communication between the frontend client and the backend server follows strict REST conventions:'
    ),
    createBulletItem('POST /api/auth/register', 'Creates student account; hashes passwords with bcryptjs (salt rounds = 10).'),
    createBulletItem('POST /api/auth/login', 'Authenticates credentials; returns signed JWT bearer token containing { id, role }.'),
    createBulletItem('POST /api/complaints', 'Registers a new connectivity issue; initializes complaint into initial DFA state S0 (Registered).'),
    createBulletItem('GET /api/complaints/my', 'Queries student complaints with full transition history subdocuments.'),
    createBulletItem('PATCH /api/complaints/:id/transition', 'Core DFA Endpoint. Receives input symbol sigma in Sigma, verifies authorized caller role, evaluates valid transitions, updates state, and appends audit log.'),
    createBulletItem('GET /api/dfa/matrix', 'Returns formal state-transition definition and symbol definitions for interactive frontend visualization.'),
    createBulletItem('GET /api/admin/metrics', 'Aggregates NOC complaint statistics across states S0 through S6.'),
    createBulletItem('GET /api/health', 'Provides real-time server health and MongoDB connection status.'),

    createHeading2('3.2 Transport Layer: Transmission Control Protocol (TCP)'),
    createParagraph(
      'NetCare relies entirely on TCP rather than UDP because complaint lifecycles, administrative audit logs, and automata state changes demand zero packet loss, strict ordering, and guaranteed delivery:'
    ),
    createBulletItem('1. TCP 3-Way Handshake', 'Client sends SYN -> Server returns SYN-ACK -> Client returns ACK. A reliable full-duplex session is established.'),
    createBulletItem('2. Reliable Sequencing & Retransmission', 'Every byte carries a unique Sequence Number. If an access point drops a packet due to RF noise, the receiver detects the gap and sender TCP stack retransmits automatically upon timeout.'),
    createBulletItem('3. Flow & Congestion Control', 'Advertised window sizes prevent client buffer overflow, while Congestion Avoidance algorithms prevent router queue collapse.'),
    createBulletItem('4. Graceful Teardown', 'Uses a standard 4-way FIN -> ACK -> FIN -> ACK handshake to cleanly deallocate kernel socket memory.'),

    createHeading2('3.3 Security & Session Layer: TLS 1.3 & JWT Authentication'),
    createParagraph(
      'All communications are secured with Transport Layer Security (TLS 1.3). Ephemeral Elliptic Curve Diffie-Hellman (ECDHE) exchange establishes symmetric AES-256-GCM session keys, guaranteeing confidentiality and integrity.'
    ),
    createParagraph(
      'Stateless user sessions are governed by RFC 7519 JSON Web Tokens signed with HMAC-SHA256 (HS256). Clients transmit this token via the HTTP Authorization: Bearer <token> header. The backend protect middleware enforces Role-Based Access Control (RBAC):'
    ),
    createBulletItem('Student Role', 'Permitted to trigger SUBMIT (creation) and CLOSE / REOPEN on their own complaints.'),
    createBulletItem('Admin / NOC Role', 'Permitted to trigger REVIEW, ASSIGN, START_WORK, RESOLVE, and REJECT.'),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 4
    createHeading1('4. PORT NUMBERS & JUSTIFICATION'),
    createParagraph(
      'Port numbers are 16-bit unsigned integers (0 to 65535) defined at the Transport Layer to identify specific application processes on a host. The table below details every port used in NetCare along with its technical justification:'
    ),
    createStyledTable(
      ['Port No.', 'Protocol', 'Associated Service', 'Technical Justification & Role in NetCare'],
      [
        ['443', 'TCP', 'HTTPS (Secure Web)', 'Standard IANA port for encrypted web traffic between client and cloud. Prevents eavesdropping on public Wi-Fi.'],
        ['80', 'TCP', 'HTTP (Standard Web)', 'Standard unencrypted web port. Automatically issues HTTP 301/308 redirects to Port 443 to enforce HTTPS.'],
        ['5000', 'TCP', 'Express Server (Internal)', 'Backend application listener port (process.env.PORT || 5000) bound to 0.0.0.0 inside the application host.'],
        ['5173', 'TCP', 'Vite Dev Server', 'Development port for React frontend, providing fast Hot Module Replacement (HMR) during local engineering.'],
        ['27017', 'TCP', 'MongoDB Atlas Daemon', 'Standard IANA port for MongoDB Wire Protocol socket connections over TLS to the cloud database cluster.'],
        ['49152–65535', 'TCP', 'Ephemeral Client Ports', 'Dynamically allocated by client operating system to uniquely separate concurrent TCP sessions on the client.']
      ],
      [14, 14, 28, 44]
    ),

    createHeading2('4.1 Socket Pair Analysis & Multiplexing'),
    createParagraph(
      'At the transport layer, every active communication channel is uniquely identified by a 4-tuple Socket Pair:'
    ),
    createCallout(
      'SOCKET PAIR EQUATION',
      'Socket Pair = (Source IP, Source Port, Destination IP, Destination Port)\nExample: (172.16.99.10 : 52410, Backend_IP : 5000)\n\n• Destination Port 5000 directs the packet to the Node.js Express process listening in user space.\n• Source Port 52410 ensures that when Express finishes evaluating the DFA transition and emits HTTP 200 OK, the response packet is returned to the exact browser window and TCP socket on the NOC admin workstation.'
    ),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 5
    createHeading1('5. END-TO-END PACKET FLOW & LIFECYCLE'),
    createHeading2('5.1 End-to-End Sequence Diagram'),
    createCodeBlock([
      '[Student Workstation]     [Campus Gateway]        [Express API:5000]       [DFA Engine]        [MongoDB Atlas:27017]',
      '        │                         │                        │                     │                        │',
      ' 1. DNS Query (UDP 53) ─────────> │                        │                     │                        │',
      '    <── Returns IP Address ────── │                        │                     │                        │',
      '        │                         │                        │                     │                        │',
      ' 2. TCP SYN (Port 51280->5000) ──>│ (NAT Translation) ────>│                     │                        │',
      '    <── TCP SYN-ACK ───────────── │ <───────────────────── │                     │                        │',
      ' 3. TCP ACK ────────────────────> │ ─────────────────────> │                     │                        │',
      '        │                         │                        │                     │                        │',
      ' 4. TLS 1.3 Key Exchange ────────>│ ─────────────────────> │                     │                        │',
      '    <── Session Keys Derived ──── │ <───────────────────── │                     │                        │',
      '        │                         │                        │                     │                        │',
      ' 5. Encrypted HTTPS POST ────────>│                        │                     │                        │',
      '    Header: Bearer <jwt>          │                        │                     │                        │',
      '    Body: {title, location}       │ ─────────────────────> │                     │                        │',
      '        │                         │                        │ 6. Token Verified   │                        │',
      '        │                         │                        │ ── Initial State ──>│ Sets State = S0        │',
      '        │                         │                        │ <── Validated ──────│                        │',
      '        │                         │                        │                     │                        │',
      '        │                         │                        │ 7. TLS Socket Write (Port 27017) ───────────>│',
      '        │                         │                        │    Insert Complaint { status: "S0" }         │',
      '        │                         │                        │ <── DB Write Acknowledgment (w:1) ───────────│',
      '        │                         │                        │                                              │',
      '        │                         │ <── HTTP 201 Created ─ │                                              │',
      ' 8. Return HTTP 201 Created <─────│     { id: NET-2026-X,  │                                              │',
      '    Badge: S0 Registered (Blue)   │       state: "S0" }    │                                              │',
      '        │                         │                        │                                              │',
      ' 9. NOC Admin triggers REVIEW ───>│ ─────────────────────> │ ── delta(S0, REVIEW) ──> Next State: S1      │',
      '        │                         │                        │ ── Update DB ───────────────────────────────>│',
      '        │                         │                        │ <── DB Write ACK ────────────────────────────│',
      '10. Stepped Timeline Glows S1 <───│ <── HTTP 200 OK ───────│                                              │'
    ]),

    createHeading2('5.2 Detailed 10-Step Packet Traversal'),
    createBulletItem('1. Application Serialization', 'User clicks "Submit Complaint". The browser packages JSON: {"title":"Hostel 3 AP drops connections","category":"Wi-Fi","location":"Hostel 3 Block B"} and retrieves the JWT from localStorage.'),
    createBulletItem('2. DNS Resolution', 'Browser queries local DNS over UDP Port 53 to resolve the API host into an IP address.'),
    createBulletItem('3. TCP Handshake', 'Client OS dispatches a TCP SYN segment from ephemeral port 51280 to port 5000. Server replies with SYN-ACK; client returns ACK.'),
    createBulletItem('4. TLS 1.3 Negotiation', 'Digital certificate verification and ECDHE key exchange establish symmetric AES-256 session keys.'),
    createBulletItem('5. Encapsulation', 'Payload is encapsulated: JSON Data -> HTTP POST -> TLS Record -> TCP Segment -> IP Datagram -> Ethernet Frame. Radio waves transmit it to the ceiling AP.'),
    createBulletItem('6. Campus Switching & NAT', 'AP passes frame to switch -> router performs NAPT (translating private IP to public IP) -> traverses ISP backbones.'),
    createBulletItem('7. Server Middleware Execution', 'Express receives packet on Port 5000. Middleware runs: verify JWT token, check expiration, and validate complaint fields.'),
    createBulletItem('8. DFA Automata Processing', 'Backend DFA engine queries delta(S0, REVIEW). Target state S1 is validated; invalid transitions strictly return HTTP 400 Bad Request.'),
    createBulletItem('9. MongoDB Cloud Socket Write', 'Server initiates a TLS TCP socket write on Port 27017 to Atlas. The primary node commits the document and returns write acknowledgment (w: 1).'),
    createBulletItem('10. Client Response & UI Update', 'Backend emits HTTP 200 OK. Router NAT demultiplexes response to the student device, and React UI highlights the updated state on the stepped progress timeline.'),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 6
    createHeading1('6. FORMAL DFA AUTOMATA ENGINE & NETWORK SIMULATION SCENARIOS'),
    createHeading2('6.1 Mathematical DFA Specification'),
    createParagraph(
      'The complaint lifecycle is governed by a formal Deterministic Finite Automaton (DFA) defined as a 5-tuple: M = (Q, Sigma, delta, q0, F)'
    ),
    createBulletItem('Finite Set of States (Q)', 'Q = {S0, S1, S2, S3, S4, S5, S6} representing Registered (S0), Under Review (S1), Technician Assigned (S2), In Progress (S3), Resolved (S4), Closed (S5), and Rejected (S6).'),
    createBulletItem('Input Alphabet (Sigma)', 'Sigma = {SUBMIT, REVIEW, ASSIGN, START_WORK, RESOLVE, CLOSE, REJECT, REOPEN}.'),
    createBulletItem('Initial State (q0)', 'q0 = S0 (Registered).'),
    createBulletItem('Set of Accepting States (F)', 'F = {S5} (Closed / Accepted Resolution). Rendered with formal double-circle border.'),
    createBulletItem('Sink / Dead State', 'S6 (Rejected). For all sigma in Sigma, delta(S6, sigma) = empty.'),

    createHeading2('6.2 Formal Transition Table delta(Q, Sigma)'),
    createStyledTable(
      ['Current State (Q)', 'Input Symbol (Sigma)', 'Next State (delta)', 'Allowed Role', 'Operational Meaning'],
      [
        ['S0 (Registered)', 'REVIEW', 'S1', 'NOC Admin', 'NOC operator begins triage and diagnosis.'],
        ['S0 (Registered)', 'REJECT', 'S6', 'NOC Admin', 'Ticket marked as duplicate, test, or invalid.'],
        ['S1 (Review)', 'ASSIGN', 'S2', 'NOC Admin', 'Field technician dispatched to physical AP/switch.'],
        ['S1 (Review)', 'REJECT', 'S6', 'NOC Admin', 'Identified as endpoint device fault, not campus LAN.'],
        ['S2 (Assigned)', 'START_WORK', 'S3', 'Admin / Tech', 'Technician arrives at switch rack/AP and begins diagnostics.'],
        ['S3 (In Progress)', 'RESOLVE', 'S4', 'Admin / Tech', 'Cable re-crimped, AP rebooted, or port reconfigured.'],
        ['S4 (Resolved)', 'CLOSE', 'S5', 'Student / Admin', 'Student verifies ping/throughput; ticket reaches Accepting State.'],
        ['S4 (Resolved)', 'REOPEN', 'S2', 'Student / Admin', 'Connectivity remains unstable; re-dispatches technician to S2.'],
        ['S5 (Closed)', 'Any symbol', 'empty (HTTP 400)', 'None', 'Terminal accepting state. Complaint permanently locked.'],
        ['S6 (Rejected)', 'Any symbol', 'empty (HTTP 400)', 'None', 'Dead/Sink state. Cannot transition further.']
      ],
      [18, 18, 14, 18, 32]
    ),

    createHeading2('6.3 Network Simulation Scenarios in the Project'),
    createStyledTable(
      ['Simulation Action', 'Network Condition Simulated', 'Protocol Layer Behavior', 'DFA State & Database Response'],
      [
        ['Submit Valid Complaint', 'Normal user filing a ticket', 'HTTP POST to /api/complaints with valid JWT Bearer header', 'DFA initializes to S0. Document saved in MongoDB Atlas with generated ID NET-2026-XXXX.'],
        ['NOC Review & Assignment', 'Triage and technician dispatch', 'Valid authenticated PATCH request to /api/complaints/:id/transition', 'Valid delta(S0, REVIEW) -> S1, then delta(S1, ASSIGN) -> S2.'],
        ['Illegal State Jump Attempt', 'Attacker attempts to jump directly from S0 to S4 (Resolved)', 'Malicious HTTP PATCH payload', 'Intercepted by DFA engine; transition undefined in delta. Rejects with HTTP 400 Bad Request. State remains strictly S0.'],
        ['Unauthorized Role Action', 'Student attempts administrative ASSIGN transition', 'HTTP PATCH with student JWT', 'Middleware detects role violation (student !== admin). Rejects with HTTP 403 Forbidden.'],
        ['Reopen Transition', 'Issue recurs after initial resolution', 'Student clicks "Reopen" on resolved ticket (S4)', 'Valid delta(S4, REOPEN) -> S2. Re-assigns technician; logs reopen count in audit trail.'],
        ['Closed State Modification', 'Update attempt on closed ticket (S5)', 'HTTP PATCH to closed complaint', 'Engine verifies S5 in F. Rejects all transitions with HTTP 400. Preserves data integrity.'],
        ['Atlas DB Socket Disconnect', 'Network blip or connection loss', 'MongoDB TCP socket timeout on Port 27017', 'Mongoose reconnection buffer activates; server maintains internal queue and reconnects automatically without crashing.']
      ],
      [22, 24, 26, 28]
    ),

    new Paragraph({ spacing: { before: 180, after: 120 } }),

    // SECTION 7
    createHeading1('7. GITHUB REPOSITORY & DEPLOYMENT ARTIFACTS'),
    createStyledTable(
      ['Resource', 'Platform / Host', 'Access Link / Details'],
      [
        ['GitHub Repository Link', 'GitHub', 'https://github.com/24itr030harish/WIFI-Lan-complains'],
        ['Live Web App (Frontend)', 'GitHub Pages', 'https://24itr030harish.github.io/WIFI-Lan-complains/'],
        ['Local Development App', 'Localhost (Vite)', 'http://localhost:5173'],
        ['Backend REST API', 'Localhost (Express)', 'http://localhost:5000/api'],
        ['API Health & DB Status', 'Node.js / Express', 'http://localhost:5000/api/health'],
        ['Cloud Database Cluster', 'MongoDB Atlas', 'cluster0.2mjpwje.mongodb.net (Database: netcare_db)']
      ],
      [28, 22, 50]
    ),

    createHeading2('7.1 Pre-Configured Test Credentials'),
    createCodeBlock([
      '1. Administrator Account:',
      '   Email:    admin@college.edu',
      '   Password: Admin@123',
      '   Role:     admin (NOC control, review, technician assign, resolve, reject)',
      '',
      '2. Student Accounts:',
      '   Email:    arun.kumar@college.edu       Password: Student@123',
      '   Email:    priya.sharma@college.edu     Password: Student@123',
      '   Email:    karthik.raja@college.edu     Password: Student@123',
      '   Email:    divya.lakshmi@college.edu    Password: Student@123',
      '   Email:    mohammed.faizal@college.edu  Password: Student@123',
      '   Role:     student (File complaints, track progress, close, reopen)'
    ]),

    new Paragraph({ spacing: { before: 240, after: 120 } }),
    createParagraph(
      'Document compiled and generated automatically for NetCare Project Documentation, Computer Networks (CN) Laboratory Assessment, and Formal Languages and Automata Theory (FLAT/TOC) Coursework.',
      { size: 18, color: COLOR_MUTED, italics: true, alignment: AlignmentType.CENTER }
    )
  ];

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
              right: 1440   // 1 inch
            }
          }
        },
        children: docChildren
      }
    ]
  });
}

// Generate and write .docx file
async function generate() {
  console.log('Generating NetCare Technical Report DOCX...');
  const doc = buildReportDocument();
  const buffer = await Packer.toBuffer(doc);

  // Save to workspace root
  const rootPath = path.resolve(__dirname, '..', 'NetCare_Technical_Report.docx');
  fs.writeFileSync(rootPath, buffer);
  console.log('Successfully saved to:', rootPath);

  // Save to brain artifacts directory
  const artifactPath = 'C:\\Users\\DHARUNYA G\\.gemini\\antigravity\\brain\\f32e7fb2-fb04-40f1-8ad1-d0aeee212af9\\NetCare_Technical_Report.docx';
  fs.writeFileSync(artifactPath, buffer);
  console.log('Successfully saved to artifact dir:', artifactPath);
}

generate().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
