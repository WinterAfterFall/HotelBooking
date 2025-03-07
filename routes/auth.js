const express = require('express');

const {register, login, promoteUser , getMe, logout} = require('../controllers/auth');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.put('/promote/:UserId',protect, authorize(['admin']),promoteUser);

module.exports = router;