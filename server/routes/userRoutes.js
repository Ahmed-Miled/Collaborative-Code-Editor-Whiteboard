const express = require('express');
const router = express.Router();
const listUserController = require('../controllers/listUsersController');

// GET /users
router.get('/', listUserController.listAll);

module.exports = router;
