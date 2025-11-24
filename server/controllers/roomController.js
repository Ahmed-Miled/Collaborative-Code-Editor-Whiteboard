const Room = require('../models/Room');
const User = require('../models/User');

// Create a room
exports.createRoom = async (req, res) => {
  const { name, owner } = req.body;

  try {
    // i have to chekc if the room already existe with that name or not ?
    const roomExists = await Room.findOne({ name });
    if (roomExists) return res.status(400).json({ message: 'Room name already exists' });
    
    const room = await Room.create({ name, owner });
    // add room to owner's rooms
    const user = await User.findById(owner);
    user.rooms.push(room._id);
    await user.save();

    // add owner to collaborators
    room.collaborators.push(user._id);
    await room.save();

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a room by ID
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Slected Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllRooms = async (req, res) =>{
  try{
    const rooms = await Room.find();
    if (!rooms) return res.status(404).json({ message: 'Rooms not found' });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.inviteUser = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Check if requester is owner
    //if (room.owner.toString() !== req.ownerId)
    //  return res.status(403).json({ message: 'Only owner can invite users' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User to invite not found' });

    // Add invitation to user
    user.invitations.push({ room: roomId, invitedBy: req.ownerId });
    await user.save();

    res.json({ message: `User ${user.username} invited to room ${room.name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
