/**
 * ============================================================================
 * NetCare - Network Connectivity Complaint Management System
 * Deterministic Finite Automaton (DFA) Engine
 * Formal Specification: M = (Q, Σ, δ, q0, F)
 * ============================================================================
 */

// Q: Set of States
const DFA_STATES = {
  S0: {
    id: 'S0',
    name: 'Complaint Registered',
    code: 'S0',
    description: 'Initial state when a student submits a new network complaint.',
    isInitial: true,
    isAccepting: false,
    isRejected: false,
    badgeColor: '#3b82f6', // Blue
    allowedRolesForTransition: ['admin'] // S0 transitions (REVIEW, REJECT) handled by admin
  },
  S1: {
    id: 'S1',
    name: 'Under Review',
    code: 'S1',
    description: 'Complaint is being evaluated by network administrator.',
    isInitial: false,
    isAccepting: false,
    isRejected: false,
    badgeColor: '#8b5cf6', // Violet
    allowedRolesForTransition: ['admin'] // S1 transitions (ASSIGN, REJECT) handled by admin
  },
  S2: {
    id: 'S2',
    name: 'Assigned to Technician',
    code: 'S2',
    description: 'Technician has been designated to diagnose and resolve the issue.',
    isInitial: false,
    isAccepting: false,
    isRejected: false,
    badgeColor: '#f59e0b', // Amber
    allowedRolesForTransition: ['admin'] // S2 transitions (START_WORK) handled by admin
  },
  S3: {
    id: 'S3',
    name: 'Work In Progress',
    code: 'S3',
    description: 'Technician is actively working on the network hardware or configuration.',
    isInitial: false,
    isAccepting: false,
    isRejected: false,
    badgeColor: '#06b6d4', // Cyan
    allowedRolesForTransition: ['admin'] // S3 transitions (RESOLVE) handled by admin
  },
  S4: {
    id: 'S4',
    name: 'Resolved',
    code: 'S4',
    description: 'Technician has resolved the issue. Awaiting confirmation or closure.',
    isInitial: false,
    isAccepting: false,
    isRejected: false,
    badgeColor: '#10b981', // Emerald green
    allowedRolesForTransition: ['admin', 'student'] // S4 transitions (CLOSE, REOPEN) can be triggered by admin or student
  },
  S5: {
    id: 'S5',
    name: 'Closed',
    code: 'S5',
    description: 'Accepting/Final state. Complaint successfully resolved and confirmed.',
    isInitial: false,
    isAccepting: true, // Final accepting state (double circle in diagram)
    isRejected: false,
    badgeColor: '#059669', // Dark green
    allowedRolesForTransition: [] // Terminal accepting state
  },
  S6: {
    id: 'S6',
    name: 'Rejected',
    code: 'S6',
    description: 'Dead/Sink state. Complaint rejected due to invalid details or non-issue.',
    isInitial: false,
    isAccepting: false,
    isRejected: true, // Error/Sink state (red styling)
    badgeColor: '#ef4444', // Red
    allowedRolesForTransition: [] // Terminal rejected state
  }
};

// Σ: Input Alphabet
const INPUT_ALPHABET = {
  SUBMIT: {
    symbol: 'SUBMIT',
    label: 'Submit Complaint',
    description: 'Initial student submission into the system (entry to S0).'
  },
  REVIEW: {
    symbol: 'REVIEW',
    label: 'Mark Under Review',
    description: 'Administrator reviews complaint veracity and priority.'
  },
  ASSIGN: {
    symbol: 'ASSIGN',
    label: 'Assign Technician',
    description: 'Designate a specialized technician to investigate.'
  },
  START_WORK: {
    symbol: 'START_WORK',
    label: 'Start Work',
    description: 'Technician begins physical/remote diagnostic and repair work.'
  },
  RESOLVE: {
    symbol: 'RESOLVE',
    label: 'Resolve Issue',
    description: 'Network connectivity is restored and remarks are entered.'
  },
  CLOSE: {
    symbol: 'CLOSE',
    label: 'Close Complaint',
    description: 'Accepting transition. Student or admin closes the ticket.'
  },
  REJECT: {
    symbol: 'REJECT',
    label: 'Reject Complaint',
    description: 'Complaint deemed invalid or duplicate; moved to S6.'
  },
  REOPEN: {
    symbol: 'REOPEN',
    label: 'Reopen Complaint',
    description: 'Issue persists after resolution; complaint moved back to S2.'
  }
};

// Initial State q0
const INITIAL_STATE = 'S0';

// Accepting States F
const ACCEPTING_STATES = ['S5'];

// δ: Transition Table & Mappings
// Formal Definition:
// 1. S0 + REVIEW     → S1
// 2. S0 + REJECT     → S6
// 3. S1 + ASSIGN     → S2
// 4. S1 + REJECT     → S6
// 5. S2 + START_WORK → S3
// 6. S3 + RESOLVE    → S4
// 7. S4 + CLOSE      → S5
// 8. S4 + REOPEN     → S2
const TRANSITIONS_LIST = [
  {
    fromState: 'S0',
    inputSymbol: 'REVIEW',
    toState: 'S1',
    description: 'Admin reviews the new complaint',
    allowedRoles: ['admin']
  },
  {
    fromState: 'S0',
    inputSymbol: 'REJECT',
    toState: 'S6',
    description: 'Admin rejects invalid initial complaint',
    allowedRoles: ['admin']
  },
  {
    fromState: 'S1',
    inputSymbol: 'ASSIGN',
    toState: 'S2',
    description: 'Admin assigns ticket to a technician',
    allowedRoles: ['admin']
  },
  {
    fromState: 'S1',
    inputSymbol: 'REJECT',
    toState: 'S6',
    description: 'Admin rejects complaint under review',
    allowedRoles: ['admin']
  },
  {
    fromState: 'S2',
    inputSymbol: 'START_WORK',
    toState: 'S3',
    description: 'Technician initiates repair work',
    allowedRoles: ['admin']
  },
  {
    fromState: 'S3',
    inputSymbol: 'RESOLVE',
    toState: 'S4',
    description: 'Work finished and issue resolved',
    allowedRoles: ['admin']
  },
  {
    fromState: 'S4',
    inputSymbol: 'CLOSE',
    toState: 'S5',
    description: 'User or Admin verifies and closes the complaint',
    allowedRoles: ['admin', 'student']
  },
  {
    fromState: 'S4',
    inputSymbol: 'REOPEN',
    toState: 'S2',
    description: 'Problem unresolved; reopened back to technician assignment',
    allowedRoles: ['admin', 'student']
  }
];

// Fast O(1) δ lookup table: `[fromState][inputSymbol] = toState`
const DELTA_TABLE = {};
TRANSITIONS_LIST.forEach((t) => {
  if (!DELTA_TABLE[t.fromState]) {
    DELTA_TABLE[t.fromState] = {};
  }
  DELTA_TABLE[t.fromState][t.inputSymbol] = {
    toState: t.toState,
    allowedRoles: t.allowedRoles,
    description: t.description
  };
});

/**
 * Reusable DFA Transition Function: δ(currentState, inputSymbol)
 * Returns next state and status if valid; throws error if invalid.
 *
 * @param {string} currentState - Current state ID (e.g. 'S0', 'S1', etc.)
 * @param {string} inputSymbol  - Input alphabet symbol (e.g. 'REVIEW', 'ASSIGN', etc.)
 * @returns {object} { valid: true, fromState, inputSymbol, toState, status, allowedRoles }
 * @throws {Error} Detailed error explaining why the transition is rejected by the DFA
 */
function transition(currentState, inputSymbol) {
  // 1. Verify currentState exists in Q
  if (!DFA_STATES[currentState]) {
    const error = new Error(`DFA Error: State '${currentState}' is not in the set of states Q = {${Object.keys(DFA_STATES).join(', ')}}.`);
    error.statusCode = 400;
    error.type = 'DFA_INVALID_STATE';
    throw error;
  }

  // 2. Verify inputSymbol exists in Σ
  if (!INPUT_ALPHABET[inputSymbol]) {
    const error = new Error(`DFA Error: Input symbol '${inputSymbol}' is not in the alphabet Σ = {${Object.keys(INPUT_ALPHABET).join(', ')}}.`);
    error.statusCode = 400;
    error.type = 'DFA_INVALID_SYMBOL';
    throw error;
  }

  // 3. Evaluate δ(currentState, inputSymbol)
  const stateTransitions = DELTA_TABLE[currentState];
  const target = stateTransitions ? stateTransitions[inputSymbol] : null;

  if (!target) {
    const allowed = getAllowedTransitions(currentState);
    const allowedSymbols = allowed.map((a) => `'${a.inputSymbol}' (${a.label} -> ${a.nextState})`).join(', ');

    const error = new Error(
      `Invalid DFA Transition: δ(${currentState}, ${inputSymbol}) is undefined. Cannot transition from '${currentState}' (${DFA_STATES[currentState].name}) via '${inputSymbol}'. Allowed transitions from '${currentState}': [${allowedSymbols || 'None - Terminal state'}].`
    );
    error.statusCode = 400;
    error.type = 'DFA_UNDEFINED_TRANSITION';
    error.currentState = currentState;
    error.attemptedSymbol = inputSymbol;
    error.allowedTransitions = allowed;
    throw error;
  }

  return {
    valid: true,
    fromState: currentState,
    fromStatus: DFA_STATES[currentState].name,
    inputSymbol,
    toState: target.toState,
    toStatus: DFA_STATES[target.toState].name,
    allowedRoles: target.allowedRoles,
    isAccepting: DFA_STATES[target.toState].isAccepting,
    isRejected: DFA_STATES[target.toState].isRejected
  };
}

/**
 * Get all available transitions from a given state
 * @param {string} currentState
 * @returns {Array} List of allowed transitions with labels and next states
 */
function getAllowedTransitions(currentState) {
  if (!DELTA_TABLE[currentState]) {
    return [];
  }

  return Object.keys(DELTA_TABLE[currentState]).map((symbol) => {
    const rule = DELTA_TABLE[currentState][symbol];
    return {
      inputSymbol: symbol,
      label: INPUT_ALPHABET[symbol].label,
      nextState: rule.toState,
      nextStatus: DFA_STATES[rule.toState].name,
      description: rule.description,
      allowedRoles: rule.allowedRoles
    };
  });
}

/**
 * Export complete DFA specification object for API consumption & UI diagrams
 */
function getDFASpecification() {
  return {
    formalDefinition: {
      name: 'Complaint Processing DFA',
      notation: 'M = (Q, Σ, δ, q0, F)',
      Q: Object.values(DFA_STATES),
      Sigma: Object.values(INPUT_ALPHABET),
      q0: INITIAL_STATE,
      F: ACCEPTING_STATES,
      sinkStates: ['S6']
    },
    transitionTable: TRANSITIONS_LIST.map((t) => ({
      currentState: t.fromState,
      currentStateName: DFA_STATES[t.fromState].name,
      inputSymbol: t.inputSymbol,
      nextState: t.toState,
      nextStateName: DFA_STATES[t.toState].name,
      description: t.description,
      allowedRoles: t.allowedRoles
    })),
    rawTransitions: TRANSITIONS_LIST
  };
}

module.exports = {
  DFA_STATES,
  INPUT_ALPHABET,
  INITIAL_STATE,
  ACCEPTING_STATES,
  TRANSITIONS_LIST,
  DELTA_TABLE,
  transition,
  getAllowedTransitions,
  getDFASpecification
};
