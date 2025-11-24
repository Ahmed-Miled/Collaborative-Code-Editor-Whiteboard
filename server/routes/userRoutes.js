const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// GET /users
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.get('/:id/getInvitations', usersController.getInvitations);
router.post('/:id/invitations/:roomId/accept', usersController.acceptInvitation);
router.post('/:id/invitations/:roomId/reject', usersController.rejectInvitation);



module.exports = router;
