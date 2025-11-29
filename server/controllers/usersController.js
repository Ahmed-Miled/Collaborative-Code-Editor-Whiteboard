const User = require('../models/User');
const Room = require('../models/Room');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.invitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const roomId = req.params.roomId;

    // Check if invitation exists
    const inviteIndex = user.invitations.findIndex(inv => inv.room.toString() === roomId);
    if (inviteIndex === -1) return res.status(404).json({ message: 'Invitation not found' });

    // Add room to user's rooms
    user.rooms.push(roomId);

    //add user to collabporator list of room
    const room = await Room.findById(roomId);
    room.collaborators.push(user._id);
    await room.save();

    // Remove invitation
    user.invitations.splice(inviteIndex, 1);

    await user.save();
    res.json({ message: 'Invitation accepted', rooms: user.rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectInvitation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const roomId = req.params.roomId;

    // Remove the invitation if it exists
    user.invitations = user.invitations.filter(inv => inv.room.toString() !== roomId);
    await user.save();

    res.json({ message: 'Invitation rejected', invitations: user.invitations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update only provided fields
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove user from all rooms they belong to
    await Room.updateMany(
      { collaborators: user._id },
      { $pull: { collaborators: user._id } }
    );

    await user.remove();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};