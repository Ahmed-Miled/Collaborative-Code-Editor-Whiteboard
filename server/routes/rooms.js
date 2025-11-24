// rooms.js

const express = require("express"); 
const router = express.Router();
const roomController = require('../controllers/roomController');


// POST /rooms/create
router.post('/create', roomController.createRoom);

//GET /allRooms
router.get('/getRooms', roomController.getAllRooms);

// GET /rooms/:id
router.get('/:id', roomController.getRoom);

router.post('/:roomId/invite', roomController.inviteUser);


module.exports = router;
