const Document = require("./models/Document");

// Store pending saves with debounce timers per document
const pendingSaves = new Map();

// Track active users per document: { documentId: Set<socketId> }
const activeUsers = new Map();

function setupDocumentSockets(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a document room
    socket.on("join-document", async (documentId) => {
      try {
        socket.join(`document:${documentId}`);
        console.log(`Socket ${socket.id} joined document ${documentId}`);

        // Track this user
        if (!activeUsers.has(documentId)) {
          activeUsers.set(documentId, new Set());
        }
        activeUsers.get(documentId).add(socket.id);

        // Load current document from database
        const document = await Document.findById(documentId);

        if (document) {
          // Send the latest content to the user
          socket.emit("document-loaded", {
            documentId: document._id.toString(),
            content: document.content || "",
            language: document.language || "javascript",
          });
          console.log(`Sent document content to ${socket.id}`);
        } else {
          socket.emit("error", { message: "Document not found" });
        }

        // Broadcast updated user count to everyone in the room
        const userCount = activeUsers.get(documentId).size;
        io.to(`document:${documentId}`).emit("active-users-update", {
          documentId,
          count: userCount,
        });

        console.log(`Document ${documentId} now has ${userCount} active users`);
      } catch (error) {
        console.error("Error joining document:", error);
        socket.emit("error", { message: "Failed to join document" });
      }
    });

    // Leave a document room
    socket.on("leave-document", async (documentId) => {
      try {
        console.log(`Socket ${socket.id} leaving document ${documentId}`);

        // Save any pending changes before leaving
        if (pendingSaves.has(documentId)) {
          const { content, timer } = pendingSaves.get(documentId);
          clearTimeout(timer);

          await Document.findByIdAndUpdate(documentId, {
            content,
            updatedAt: Date.now(),
          });
          console.log(`Auto-saved on leave: ${documentId}`);
          pendingSaves.delete(documentId);
        }

        // Remove user from tracking
        if (activeUsers.has(documentId)) {
          activeUsers.get(documentId).delete(socket.id);

          const userCount = activeUsers.get(documentId).size;

          // Clean up if no users left
          if (userCount === 0) {
            activeUsers.delete(documentId);
          }

          // Broadcast updated count
          io.to(`document:${documentId}`).emit("active-users-update", {
            documentId,
            count: userCount,
          });
        }

        socket.leave(`document:${documentId}`);
      } catch (error) {
        console.error("Error leaving document:", error);
      }
    });

    // Handle real-time edits
    socket.on("document-edit", async (data) => {
      const { documentId, content } = data;

      try {
        console.log(`Edit from ${socket.id} on doc ${documentId}`);

        // Broadcast to other users immediately (real-time sync)
        socket.to(`document:${documentId}`).emit("document-change", {
          documentId,
          content,
          socketId: socket.id,
        });

        // Debounced auto-save (save 1 second after typing stops)
        if (pendingSaves.has(documentId)) {
          clearTimeout(pendingSaves.get(documentId).timer);
        }

        const timer = setTimeout(async () => {
          try {
            await Document.findByIdAndUpdate(documentId, {
              content,
              updatedAt: Date.now(),
            });

            console.log(`Auto-saved: ${documentId}`);

            // Notify all users (including sender)
            io.to(`document:${documentId}`).emit("document-auto-saved", {
              documentId,
              timestamp: Date.now(),
            });

            pendingSaves.delete(documentId);
          } catch (error) {
            console.error("Auto-save error:", error);
          }
        }, 1000);

        pendingSaves.set(documentId, { content, timer });
      } catch (error) {
        console.error("Edit handling error:", error);
        socket.emit("error", { message: "Failed to process edit" });
      }
    });

    // Disconnect handler
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      // Remove from all active documents
      for (const [documentId, users] of activeUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);

          const userCount = users.size;

          if (userCount === 0) {
            activeUsers.delete(documentId);
          }

          // Broadcast updated count
          io.to(`document:${documentId}`).emit("active-users-update", {
            documentId,
            count: userCount,
          });
        }
      }

      // Save all pending changes
      const savePromises = [];

      for (const [documentId, { content, timer }] of pendingSaves.entries()) {
        clearTimeout(timer);
        savePromises.push(
          Document.findByIdAndUpdate(documentId, {
            content,
            updatedAt: Date.now(),
          }).catch((err) =>
            console.error(`Save on disconnect failed for ${documentId}:`, err)
          )
        );
      }

      await Promise.all(savePromises);
      pendingSaves.clear();
    });

    socket.on("document-language-change", async ({ documentId, language }) => {
      console.log("Language changed:", language);

      await Document.findByIdAndUpdate(documentId, { language });

      io.to(`document:${documentId}`).emit("document-language-updated", {
        documentId,
        language,
      });
    });
  });
}

module.exports = setupDocumentSockets;