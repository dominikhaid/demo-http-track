const express = require('express');
const router = express.Router();

const checkReqErrors = require('../includes/status').checkReqErrors;

router.get('/', (req, res) => {
  checkReqErrors({msg: 'Server alive'}, res);
});

module.exports = router;
