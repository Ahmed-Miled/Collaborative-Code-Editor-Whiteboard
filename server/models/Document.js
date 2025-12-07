const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    default: "javascript",
    trim: true,
  },
  content: {
    type: String,
    default: "",
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
DocumentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Also update updatedAt when using findByIdAndUpdate
DocumentSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model("Document", DocumentSchema);