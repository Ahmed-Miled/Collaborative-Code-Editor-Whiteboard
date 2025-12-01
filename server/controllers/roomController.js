const Room = require("../models/Room");
const User = require("../models/User");
const Document = require("../models/Document");

exports.createRoom = async (req, res) => {
  const { name } = req.body;
  const owner = req.user.id; // get owner from JWT token

  try {
    const roomExists = await Room.findOne({ name, owner });
    if (roomExists)
      return res.status(400).json({ message: "Room name already exists" });

    const room = await Room.create({ name, owner });

    // add room to owner's rooms
    const user = await User.findById(owner);
    user.rooms.push(room._id);
    await user.save();

    // add owner to collaborators
    room.collaborators.push(user._id);
    //room.collaborators.push({ user: user._id, joinedAt: new Date() });

    await room.save();

    res.json(room); // this is the object returned to frontend
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a room by ID
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room)
      return res.status(404).json({ message: "Slected Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { owner: req.user.id }, // rooms this user owns
        { collaborators: req.user.id }, // rooms this user collaborates on
        //{ "collaborators.user": req.user.id },
      ],
    })
      .populate("documents") // optional, populate document info
      .populate("collaborators", "_id username");
    //.populate("collaborators.user", "_id username");

    if (!rooms || rooms.length === 0) return res.status(200).json([]); // return empty array if none

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.owner.toString() !== req.userId)
      return res.status(403).json({ message: "Only owner can invite users" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User to invite not found" });

    // Prevent duplicate invitations
    if (user.invitations.some((inv) => inv.room.toString() === roomId)) {
      return res.status(400).json({ message: "User already invited" });
    }
    // User is already in the room
    if (
      room.collaborators.some(
        (memberId) => memberId.toString() === user._id.toString()
      )
    ) {
      return res.status(400).json({ message: "User is already in the room" });
    }

    // Add invitation to user
    user.invitations.push({ room: roomId, invitedBy: req.userId });
    await user.save();

    res.json({ message: `User ${user.username} invited to room ${room.name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoomName = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.owner.toString() !== req.userId)
      return res
        .status(403)
        .json({ message: "Only owner can update room name" });

    room.name = name;
    await room.save();

    res.json({ message: "Room name updated", room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.owner.toString() !== req.userId)
      return res.status(403).json({ message: "Only owner can delete room" });
    await User.updateMany(
      { _id: { $in: room.collaborators } },
      { $pull: { rooms: room._id } }
    );
    /*
   await User.updateMany(
     { _id: { $in: room.collaborators.map((c) => c.user) } },
     { $pull: { rooms: room._id } }
   );*/

    await room.remove();
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
