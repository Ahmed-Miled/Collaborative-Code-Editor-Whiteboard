// Add this to your index.js or create a separate socketHandlers.js file

const Document = require("./models/Document");

function setupDocumentSockets(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a document room for real-time collaboration
    socket.on("join-document", async (documentId) => {
      try {
        socket.join(`document:${documentId}`);
        console.log(`Socket ${socket.id} joined document ${documentId}`);

        // Optionally, broadcast who joined
        socket.to(`document:${documentId}`).emit("user-joined", {
          socketId: socket.id,
          documentId,
        });
      } catch (error) {
        console.error("Error joining document:", error);
        socket.emit("error", { message: "Failed to join document" });
      }
    });

    // Leave a document room
    socket.on("leave-document", (documentId) => {
      socket.leave(`document:${documentId}`);
      console.log(`Socket ${socket.id} left document ${documentId}`);

      // Broadcast who left
      socket.to(`document:${documentId}`).emit("user-left", {
        socketId: socket.id,
        documentId,
      });
    });

    // Handle document edits in real-time
    socket.on("document-edit", async (data) => {
      const { documentId, content } = data;

      try {
        // Broadcast changes to all other users in the document room
        socket.to(`document:${documentId}`).emit("document-change", {
          documentId,
          content,
          userId: socket.userId, // Set this during authentication
        });

        // Optional: Save to database periodically or on debounce
        // For now, we'll just broadcast. You can implement auto-save separately
      } catch (error) {
        console.error("Error handling document edit:", error);
        socket.emit("error", { message: "Failed to process edit" });
      }
    });

    // Manual save document
    socket.on("save-document", async (data) => {
      const { documentId, content } = data;

      try {
        const document = await Document.findByIdAndUpdate(
          documentId,
          { content, updatedAt: Date.now() },
          { new: true }
        );

        if (!document) {
          socket.emit("error", { message: "Document not found" });
          return;
        }

        // Confirm save to the user
        socket.emit("document-saved", {
          documentId,
          updatedAt: document.updatedAt,
        });

        // Notify others that document was saved
        socket.to(`document:${documentId}`).emit("document-saved-by-peer", {
          documentId,
          userId: socket.userId,
        });

        console.log(`Document ${documentId} saved successfully`);
      } catch (error) {
        console.error("Error saving document:", error);
        socket.emit("error", { message: "Failed to save document" });
      }
    });

    // Handle cursor position updates (for showing other users' cursors)
    socket.on("cursor-position", (data) => {
      const { documentId, position, selection } = data;

      socket.to(`document:${documentId}`).emit("peer-cursor-update", {
        socketId: socket.id,
        documentId,
        position,
        selection,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Socket.io automatically handles leaving rooms on disconnect
    });
  });
}

module.exports = setupDocumentSockets;
