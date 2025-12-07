//routes/document.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const documentController = require("../controllers/documentController");


// 1. Create a document in a room
router.post("/rooms/:roomId", auth, documentController.createDocument);

// 2. Get all documents of a room
// GET /documents/rooms/:roomId
router.get("/rooms/:roomId", auth, documentController.getRoomDocuments);

// 3. Get a single document
// GET /documents/:documentId
router.get("/:documentId", auth, documentController.getDocument);

// 4. Update a document
// PUT /documents/:documentId
router.put("/:documentId", auth, documentController.updateDocument);

// 5. Delete a document
// DELETE /documents/:documentId
router.delete("/:documentId", auth, documentController.deleteDocument);

module.exports = router;
