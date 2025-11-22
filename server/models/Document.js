const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    default: '', // File content as a string
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room', // The room this file belongs to
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Creator of the file
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DocumentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', DocumentSchema);
