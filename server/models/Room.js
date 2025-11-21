const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true } // could store user ID
});

module.exports = mongoose.model('Room', roomSchema);
