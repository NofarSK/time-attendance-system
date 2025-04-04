const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');

router.get('/stream', timeController.timeStream);

module.exports = router;