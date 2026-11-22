const {
  DFA_STATES,
  INPUT_ALPHABET,
  TRANSITIONS_LIST,
  transition,
  getAllowedTransitions,
  getDFASpecification
} = require('../utils/dfa');

function runDFATests() {
  console.log('\n========================================');
  console.log('   PHASE 5: DFA AUTOMATON ENGINE TESTS ');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Verify Formal Specification
  const spec = getDFASpecification();
  assert(spec.formalDefinition.q0 === 'S0', 'Initial state q0 is S0');
  assert(spec.formalDefinition.F.includes('S5'), 'Accepting state F contains S5');
  assert(spec.formalDefinition.sinkStates.includes('S6'), 'Sink state contains S6');
  assert(spec.transitionTable.length === 8, 'Transition table contains exactly 8 valid rules');

  // 2. Test All 8 Valid Transitions
  console.log('\n--- Testing All 8 Valid Transitions ---');
  const validCases = [
    { from: 'S0', input: 'REVIEW', expected: 'S1' },
    { from: 'S0', input: 'REJECT', expected: 'S6' },
    { from: 'S1', input: 'ASSIGN', expected: 'S2' },
    { from: 'S1', input: 'REJECT', expected: 'S6' },
    { from: 'S2', input: 'START_WORK', expected: 'S3' },
    { from: 'S3', input: 'RESOLVE', expected: 'S4' },
    { from: 'S4', input: 'CLOSE', expected: 'S5' },
    { from: 'S4', input: 'REOPEN', expected: 'S2' }
  ];

  validCases.forEach(({ from, input, expected }) => {
    try {
      const result = transition(from, input);
      assert(
        result.toState === expected && result.valid === true,
        `δ(${from}, ${input}) → ${result.toState} (${result.toStatus})`
      );
    } catch (err) {
      assert(false, `δ(${from}, ${input}) threw unexpected error: ${err.message}`);
    }
  });

  // 3. Test Invalid / Undefined Transitions (must fail with statusCode 400)
  console.log('\n--- Testing Undefined / Invalid Transitions ---');
  const invalidCases = [
    { from: 'S0', input: 'START_WORK', desc: 'Directly starting work on new complaint' },
    { from: 'S0', input: 'RESOLVE', desc: 'Resolving registered complaint without review/work' },
    { from: 'S0', input: 'CLOSE', desc: 'Closing newly registered complaint' },
    { from: 'S1', input: 'RESOLVE', desc: 'Resolving complaint under review' },
    { from: 'S2', input: 'CLOSE', desc: 'Closing ticket while assigned before resolution' },
    { from: 'S3', input: 'ASSIGN', desc: 'Assigning while already in progress' },
    { from: 'S5', input: 'REVIEW', desc: 'Attempting transition from terminal accepted state S5' },
    { from: 'S6', input: 'REOPEN', desc: 'Attempting transition from terminal rejected state S6' }
  ];

  invalidCases.forEach(({ from, input, desc }) => {
    try {
      transition(from, input);
      assert(false, `Expected δ(${from}, ${input}) to fail (${desc}), but it passed!`);
    } catch (err) {
      assert(
        err.statusCode === 400 && err.type === 'DFA_UNDEFINED_TRANSITION',
        `Correctly rejected δ(${from}, ${input}) [${desc}] with HTTP 400: ${err.message}`
      );
    }
  });

  // 4. Test Invalid State and Invalid Alphabet Symbol
  console.log('\n--- Testing Boundary / Malformed Input Checks ---');
  try {
    transition('S99_UNKNOWN', 'REVIEW');
    assert(false, 'Should fail on invalid state');
  } catch (err) {
    assert(err.type === 'DFA_INVALID_STATE', `Correctly caught invalid state: ${err.message}`);
  }

  try {
    transition('S0', 'NON_EXISTENT_SYMBOL');
    assert(false, 'Should fail on invalid symbol');
  } catch (err) {
    assert(err.type === 'DFA_INVALID_SYMBOL', `Correctly caught invalid symbol: ${err.message}`);
  }

  // 5. Test Full Complaint Lifecycles
  console.log('\n--- Testing Full End-to-End Complaint Processing Paths ---');
  // Happy Path: S0 -> S1 -> S2 -> S3 -> S4 -> S5
  let state = 'S0';
  const happyPath = ['REVIEW', 'ASSIGN', 'START_WORK', 'RESOLVE', 'CLOSE'];
  happyPath.forEach((sym) => {
    const res = transition(state, sym);
    state = res.toState;
  });
  assert(state === 'S5', `Happy Path completed successfully reaching accepting state ${state}`);

  // Reopen Path: S0 -> S1 -> S2 -> S3 -> S4 -> S2 -> S3 -> S4 -> S5
  state = 'S0';
  const reopenPath = ['REVIEW', 'ASSIGN', 'START_WORK', 'RESOLVE', 'REOPEN', 'START_WORK', 'RESOLVE', 'CLOSE'];
  reopenPath.forEach((sym) => {
    const res = transition(state, sym);
    state = res.toState;
  });
  assert(state === 'S5', `Reopen Cycle Path completed reaching accepting state ${state}`);

  console.log(`\n========================================`);
  console.log(`   DFA TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runDFATests();
