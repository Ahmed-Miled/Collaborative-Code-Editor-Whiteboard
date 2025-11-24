// rooms.js

const express = require("express"); 
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');



router.post('/create', auth, roomController.createRoom);
router.get('/getRooms', auth, roomController.getAllRooms);
router.get('/:id', auth, roomController.getRoom);
router.post('/:roomId/invite', auth, roomController.inviteUser);

router.post('/:roomId/updateRoomName', auth, roomController.updateRoomName);
router.post('/:roomId/delete', auth, roomController.deleteRoom);

module.exports = router;
