// rooms.js

const express = require("express"); 
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get("/test", (req, res) => res.send("Rooms route works!"));


// POST /rooms/create
router.post('/create', roomController.createRoom);

// GET /rooms/:id
router.get('/:id', roomController.getRoom);

module.exports = router;
