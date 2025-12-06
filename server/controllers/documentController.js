const Document = require("../models/Document");
const Room = require("../models/Room");

// Create a new document in a room
exports.createDocument = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, language, content } = req.body;
    const userId = req.user.id;

    // Validate room exists and user has access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user is a member of the room
    const isMember = room.collaborators.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a room member." });
    }

    // Create document
    const document = new Document({
      name,
      language: language || "js",
      content: content || "",
      room: roomId,
      createdBy: userId,
    });

    await document.save();

    room.documents.push(document._id);
    await room.save();

    res.status(201).json({
      message: "Document created successfully",
      document,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all documents in a room
exports.getRoomDocuments = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Validate room exists and user has access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user is a member of the room
    const isMember = room.collaborators.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a room member." });
    }

    // Get all documents in the room
    const documents = await Document.find({ room: roomId })
      .populate("createdBy", "username email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Error fetching room documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single document by ID
exports.getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    // Find document and populate room
    const document = await Document.findById(documentId)
      .populate("createdBy", "username email")
      .populate("room");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user is a member of the room
    const isMember = document.room.collaborators.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a room member." });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { name, language, content } = req.body;
    const userId = req.user.id;

    // Find document and populate room
    const document = await Document.findById(documentId).populate("room");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user is a member of the room
    const isMember = document.room.collaborators.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a room member." });
    }

    // Update fields if provided
    if (name !== undefined) document.name = name;
    if (language !== undefined) document.language = language;
    if (content !== undefined) document.content = content;

    await document.save();

    res.status(200).json({
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    // Find document and populate room
    const document = await Document.findById(documentId).populate("room");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user is a member of the room or the creator
    const isMember = document.room.collaborators.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a room member." });
    }

    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
      message: "Document deleted successfully",
      documentId,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
