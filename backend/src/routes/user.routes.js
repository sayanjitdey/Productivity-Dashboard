const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth');

const { getProfile, userLogin, userSignup } = require('../controllers/user.controller');

router.get('/profile', authMiddleware, getProfile);

router.post('/login', userLogin);

router.post('/signup', userSignup);

module.exports = router;