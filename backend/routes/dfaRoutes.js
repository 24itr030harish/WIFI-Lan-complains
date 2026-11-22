const express = require('express');
const router = express.Router();
const {
  getStates,
  getTransitions,
  getStateTransitions
} = require('../controllers/dfaController');

router.get('/states', getStates);
router.get('/transitions', getTransitions);
router.get('/states/:stateId/allowed', getStateTransitions);

module.exports = router;
