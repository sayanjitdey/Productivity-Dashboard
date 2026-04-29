const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getDashboardData } = require('../controllers/dashboard.controller');

router.get('/', auth, getDashboardData);

module.exports = router;