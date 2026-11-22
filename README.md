# NetCare – Network Connectivity Complaint Management System Using DFA

NetCare is an enterprise-grade full-stack college IT support web application designed to register, monitor, assign, and resolve Wi-Fi and Ethernet LAN connectivity complaints. The entire complaint processing workflow is strictly governed by a **Deterministic Finite Automaton (DFA)**.

Every ticket transition follows formal automata theory rules $M = (Q, \Sigma, \delta, q_0, F)$, preventing arbitrary status tampering and ensuring verifiable complaint lifecycles.

---

## 1. Technology Stack

### Frontend
- **React.js 18** (SPA architecture powered by Vite)
- **HTML5 & CSS3** (Custom college IT support design system: Navy Blue, White, Cyan)
- **JavaScript (ES6+)**
- **React Router v6** (Protected client-side routing)
- **Axios** (API client with JWT request/response interceptors)
- **Lucide React** (Modern, clean icon set)
- **Mermaid.js & Interactive SVG Graph** (Dual DFA state diagram visualization)

### Backend
- **Node.js** (v20+)
- **Express.js** (REST API architecture)
- **JSON Web Tokens (JWT)** (Role-based authentication)
- **Bcrypt.js** (Password hashing)
- **CORS & Dotenv**

### Database
- **MongoDB** with **Mongoose ODM** (Persistent schemas with embedded transition histories)

---

## 2. Deterministic Finite Automaton (DFA) Specification

The complaint lifecycle is formally defined as a 5-tuple:

$$M = (Q, \Sigma, \delta, q_0, F)$$

### Set of States ($Q$)
| State Code | State Name | Type | Description |
| :--- | :--- | :--- | :--- |
| **S0** | Complaint Registered | Initial State ($q_0$) | Complaint submitted by student; awaiting administrator triage |
| **S1** | Under Review | Intermediate State | Complaint is being evaluated by network admin |
| **S2** | Assigned to Technician | Intermediate State | Technician designated to diagnose and repair |
| **S3** | Work In Progress | Intermediate State | Active hardware/wiring/configuration work underway |
| **S4** | Resolved | Intermediate State | Issue fixed; awaiting user verification |
| **S5** | Closed | Accepting State ($F$) | Verified and closed (**Double circle** in diagram) |
| **S6** | Rejected | Dead / Sink State | Invalid or out-of-scope ticket (**Terminal state**) |

### Input Alphabet ($\Sigma$)
`SUBMIT`, `REVIEW`, `ASSIGN`, `START_WORK`, `RESOLVE`, `CLOSE`, `REJECT`, `REOPEN`

### Initial State ($q_0$)
- $q_0 = \text{S0}$ (Complaint Registered)

### Accepting / Final State ($F$)
- $F = \{\text{S5}\}$ (Closed)

### Transition Function ($\delta$) Table
| Current State ($q$) | Input Symbol ($\sigma$) | Next State $\delta(q, \sigma)$ | Allowed Roles | Description |
| :---: | :---: | :---: | :---: | :--- |
| **S0** | `REVIEW` | **S1** | Admin | Admin verifies and reviews newly registered complaint |
| **S0** | `REJECT` | **S6** | Admin / Student | Immediate cancellation or rejection of initial complaint |
| **S1** | `ASSIGN` | **S2** | Admin | Admin delegates ticket to designated campus technician |
| **S1** | `REJECT` | **S6** | Admin | Complaint rejected after evaluation during review |
| **S2** | `START_WORK` | **S3** | Admin | Technician starts diagnostic or physical repair |
| **S3** | `RESOLVE` | **S4** | Admin | Network service restored and resolution remarks entered |
| **S4** | `CLOSE` | **S5** | Student / Admin | User or Admin confirms fix into **Accepting State** |
| **S4** | `REOPEN` | **S2** | Student / Admin | Issue recurs; ticket recycled back to technician handling |

> **Strict Automata Rule**: Any transition pair $(q, \sigma)$ not listed in the table above is **undefined** and strictly rejected by the backend with an **HTTP 400 Bad Request** error. Direct database tampering that bypasses the transition function is disallowed.

---

## 3. Project Folder Structure

```
NetCare/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── adminController.js      # Admin analytics & technician assignment
│   │   ├── authController.js       # Student & Admin authentication
│   │   ├── complaintController.js  # Complaint CRUD & DFA transitions
│   │   └── dfaController.js        # Formal DFA states & transitions metadata
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & role authorization
│   │   └── errorHandler.js         # Centralized error formatting
│   ├── models/
│   │   ├── Complaint.js            # Complaint schema & subdocument history
│   │   └── User.js                 # User schema with bcrypt & JWT methods
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── dfaRoutes.js
│   ├── seed/
│   │   └── seed.js                 # Database seeder (1 admin, 5 students, 10 complaints)
│   ├── tests/
│   │   ├── testDFA.js              # Unit tests for δ transition function
│   │   ├── testAuth.js             # Authentication & role tests
│   │   ├── testComplaintModel.js   # Model validation & ID tests
│   │   ├── testAPIEndpoints.js     # REST API endpoint tests
│   │   └── testFullSystem.js       # Comprehensive 15-point E2E test suite
│   ├── utils/
│   │   └── dfa.js                  # DFA transition engine & validation logic
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Express application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx       # DFA state badges (S0-S6) & priorities
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/
│   │   │       ├── Layout.jsx      # Shell layout with responsive drawer
│   │   │       ├── Navbar.jsx      # Top header with user profile & logout
│   │   │       └── Sidebar.jsx     # Navigation sidebar with role awareness
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Session & role context
│   │   │   └── ToastContext.jsx    # Toast notification system
│   │   ├── pages/
│   │   │   ├── AdminComplaints.jsx # Admin complaints management with filters
│   │   │   ├── AdminDashboard.jsx  # Admin NOC analytics & metric charts
│   │   │   ├── ComplaintDetails.jsx# Ticket breakdown & transition controls
│   │   │   ├── ComplaintTracking.jsx # Stepped DFA timeline & audit history
│   │   │   ├── DFADiagram.jsx      # Interactive SVG graph & Mermaid diagram
│   │   │   ├── DFATable.jsx        # Transition table matrix & theory guide
│   │   │   ├── Login.jsx           # Split-screen login with demo buttons
│   │   │   ├── MyComplaints.jsx    # Student personal complaints list
│   │   │   ├── NotFound.jsx        # 404 page
│   │   │   ├── Profile.jsx         # Student credentials & activity
│   │   │   ├── Register.jsx        # Student registration form
│   │   │   └── SubmitComplaint.jsx # New ticket form with auto-filled info
│   │   ├── services/
│   │   │   └── api.js              # Axios API client with token interceptor
│   │   ├── styles/
│   │   │   ├── index.css           # Global reset & utility classes
│   │   │   └── theme.css           # Navy/Cyan design tokens
│   │   ├── App.jsx                 # Client-side router configuration
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Vite server & backend API proxy
├── .gitignore
└── README.md
```

---

## 4. Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Community Server running on `localhost:27017` or MongoDB Atlas URI)
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/NetCare.git
cd NetCare
```

---

### Step 2: Install Dependencies

#### Backend Dependencies:
```bash
cd backend
npm install
```

#### Frontend Dependencies:
```bash
cd ../frontend
npm install
```

---

### Step 3: Configure Environment Variables

In the `backend` folder, verify or copy `.env.example` to `.env`:
```bash
# Inside backend/
cp .env.example .env
```

Default configuration in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/netcare_db
JWT_SECRET=netcare_super_secret_jwt_key_2026_secure
NODE_ENV=development
```

---

### Step 4: Seed Sample Data

Run the database seeder to populate the MongoDB database with 1 Administrator, 5 Student accounts, and 10 sample complaints in various DFA states:
```bash
cd backend
npm run seed
# Or: node seed/seed.js
```

---

### Step 5: Start the Application

#### Start the Backend Server:
```bash
cd backend
npm run dev
# Server will run at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

#### Start the Frontend Client (in a separate terminal):
```bash
cd frontend
npm run dev
# Frontend will run at: http://localhost:5173
```

Now open **http://localhost:5173** in your web browser.

---

## 5. Sample Login Credentials

For testing and demonstration, use the following credentials (also accessible via one-click **"Quick Fill"** buttons on the Login page):

### 1. Network Administrator
- **Email**: `admin@college.edu`
- **Password**: `Admin@123`
- **Role**: `admin`
- **Privileges**: Access to Admin Dashboard, All Complaints, Technician Assignment, and Administrative State Transitions.

### 2. Student Accounts
| Student Name | Register Number | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Arun Kumar** | `710021104001` | `arun.kumar@college.edu` | `Student@123` | Computer Science & Eng. |
| **Priya Sharma** | `710021104002` | `priya.sharma@college.edu` | `Student@123` | Information Technology |
| **Karthik Raja** | `710021104003` | `karthik.raja@college.edu` | `Student@123` | Electronics & Comm. |
| **Divya Lakshmi** | `710021104004` | `divya.lakshmi@college.edu` | `Student@123` | AI & Data Science |
| **Mohammed Faizal** | `710021104005` | `mohammed.faizal@college.edu` | `Student@123` | Cyber Security |

---

## 6. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student account |
| `POST` | `/api/auth/login` | Public | Authenticate student or administrator |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |

### Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Private | Register new complaint (enters DFA at $S_0$) |
| `GET` | `/api/complaints/my` | Private (Student) | Retrieve personal complaints |
| `GET` | `/api/complaints` | Private (Admin) | Retrieve all complaints with query filters |
| `GET` | `/api/complaints/:id` | Private | Retrieve single complaint by ID or complaintId |
| `POST` | `/api/complaints/:id/transition` | Private | Execute verified DFA transition |
| `GET` | `/api/complaints/:id/history` | Private | Retrieve chronological DFA transition history |
| `POST` | `/api/complaints/:id/cancel` | Private (Student) | Cancel newly registered ticket ($S_0 \xrightarrow{\text{REJECT}} S_6$) |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin Only | Get real-time stats & distribution charts |
| `GET` | `/api/admin/complaints` | Admin Only | Filtered complaints list for admin operations |
| `PUT` | `/api/admin/complaints/:id/assign` | Admin Only | Assign campus technician and transition $S_1 \xrightarrow{\text{ASSIGN}} S_2$ |

### DFA Engine (`/api/dfa`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dfa/states` | Public | List all 7 DFA states and metadata |
| `GET` | `/api/dfa/transitions` | Public | Formal 5-tuple specification and transition table |
| `GET` | `/api/dfa/states/:stateId/allowed` | Public | Candidate transitions for a specific state |

---

## 7. Running Automated Test Suites

NetCare includes an exhaustive suite of automated tests verifying every aspect of the application:

### 1. Test DFA Transition Function
Tests all 8 valid transitions, 8 illegal transition attempts, boundary errors, and multi-step lifecycle paths:
```bash
node backend/tests/testDFA.js
# Output: 24 PASSED, 0 FAILED
```

### 2. Test Authentication & Role Authorization
Tests student registration, duplicate prevention, password hashing, valid/invalid login, and token protection:
```bash
node backend/tests/testAuth.js
# Output: All 6 test suites passed
```

### 3. Test Mongoose Complaint Model
Tests document creation, automatic ID generation (`NET-2026-XXXX`), schema defaults, and validation rules:
```bash
node backend/tests/testComplaintModel.js
# Output: All tests passed
```

### 4. Test REST API Endpoints
Exercises all 14 REST endpoints, role guards, and complaint transition execution:
```bash
node backend/tests/testAPIEndpoints.js
# Output: All 14 API tests passed
```

### 5. Run Comprehensive 15-Point End-to-End Test Suite
Tests all 15 project specification requirements from student registration through DFA lifecycle loops and MongoDB persistence:
```bash
node backend/tests/testFullSystem.js
# Output: 17 PASSED, 0 FAILED
```

---

## 8. Author & License

- **System**: NetCare – Network Connectivity Complaint Management System Using DFA
- **Institution**: Campus Network Operations Center (NOC)
- **License**: ISC License
