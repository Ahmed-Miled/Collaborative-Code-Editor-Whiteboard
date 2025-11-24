// rooms.js

const express = require("express"); 
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

// POST /rooms/create — only logged-in users can create a room
router.post('/create', auth, roomController.createRoom);

// GET /allRooms — only logged-in users can see rooms
router.get('/getRooms', auth, roomController.getAllRooms);

// GET /rooms/:id — only logged-in users can see a specific room
router.get('/:id', auth, roomController.getRoom);

// POST /rooms/:roomId/invite — only logged-in users can invite others
router.post('/:roomId/invite', auth, roomController.inviteUser);

module.exports = router;
