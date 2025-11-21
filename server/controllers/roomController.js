const Room = require('../models/Room');

// Create a room
exports.createRoom = async (req, res) => {
  const { name, owner } = req.body;

  try {
    const room = await Room.create({ name, owner });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a room by ID
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
