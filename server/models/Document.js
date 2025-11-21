const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  content: { type: String, default: "" }
});

module.exports = mongoose.model('Document', documentSchema);
