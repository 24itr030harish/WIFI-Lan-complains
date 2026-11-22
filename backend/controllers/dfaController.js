const {
  DFA_STATES,
  INPUT_ALPHABET,
  getDFASpecification,
  getAllowedTransitions
} = require('../utils/dfa');

/**
 * @desc    Get all DFA states metadata
 * @route   GET /api/dfa/states
 * @access  Public
 */
exports.getStates = (req, res) => {
  res.status(200).json({
    success: true,
    count: Object.keys(DFA_STATES).length,
    states: Object.values(DFA_STATES)
  });
};

/**
 * @desc    Get full DFA transition table and formal 5-tuple specification
 * @route   GET /api/dfa/transitions
 * @access  Public
 */
exports.getTransitions = (req, res) => {
  const spec = getDFASpecification();
  res.status(200).json({
    success: true,
    specification: spec
  });
};

/**
 * @desc    Get allowed transitions from a specific state
 * @route   GET /api/dfa/states/:stateId/allowed
 * @access  Public
 */
exports.getStateTransitions = (req, res) => {
  const { stateId } = req.params;
  const stateUpper = stateId.toUpperCase();

  if (!DFA_STATES[stateUpper]) {
    return res.status(404).json({
      success: false,
      message: `State '${stateId}' does not exist in DFA state set Q.`
    });
  }

  const allowed = getAllowedTransitions(stateUpper);

  res.status(200).json({
    success: true,
    state: DFA_STATES[stateUpper],
    allowedTransitions: allowed
  });
};
