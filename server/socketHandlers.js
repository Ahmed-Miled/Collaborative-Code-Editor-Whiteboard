//server / socketHandlers.js;
const Document = require("./models/Document");

// Store pending saves with debounce timers per document
const pendingSaves = new Map();

function setupDocumentSockets(io) {
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Join a document room
    socket.on("join-document", async (documentId) => {
      try {
        socket.join(`document:${documentId}`);
        console.log(`📄 Socket ${socket.id} joined document ${documentId}`);

        // Load current document from database
        const document = await Document.findById(documentId);

        if (document) {
          // Send the latest content to the user
          socket.emit("document-loaded", {
            documentId: document._id.toString(),
            content: document.content || "",
            language: document.language || "javascript",
          });
          console.log(`📤 Sent document content to ${socket.id}`);
        } else {
          socket.emit("error", { message: "Document not found" });
        }

        // Notify others a user joined
        socket.to(`document:${documentId}`).emit("user-joined", {
          socketId: socket.id,
          documentId,
        });
      } catch (error) {
        console.error("❌ Error joining document:", error);
        socket.emit("error", { message: "Failed to join document" });
      }
    });

    // Leave a document room
    socket.on("leave-document", async (documentId) => {
      try {
        console.log(`👋 Socket ${socket.id} leaving document ${documentId}`);

        // Save any pending changes before leaving
        if (pendingSaves.has(documentId)) {
          const { content, timer } = pendingSaves.get(documentId);
          clearTimeout(timer);

          await Document.findByIdAndUpdate(documentId, {
            content,
            updatedAt: Date.now(),
          });
          console.log(`💾 Auto-saved on leave: ${documentId}`);
          pendingSaves.delete(documentId);
        }

        socket.leave(`document:${documentId}`);

        // Notify others
        socket.to(`document:${documentId}`).emit("user-left", {
          socketId: socket.id,
          documentId,
        });
      } catch (error) {
        console.error("❌ Error leaving document:", error);
      }
    });

    // Handle real-time edits
    socket.on("document-edit", async (data) => {
      const { documentId, content } = data;

      try {
        console.log(`✏️  Edit from ${socket.id} on doc ${documentId}`);

        // Broadcast to other users immediately (real-time sync)
        socket.to(`document:${documentId}`).emit("document-change", {
          documentId,
          content,
          socketId: socket.id,
        });

        // Debounced auto-save (save 2 seconds after typing stops)
        if (pendingSaves.has(documentId)) {
          clearTimeout(pendingSaves.get(documentId).timer);
        }

        const timer = setTimeout(async () => {
          try {
            await Document.findByIdAndUpdate(documentId, {
              content,
              updatedAt: Date.now(),
            });

            console.log(`💾 Auto-saved: ${documentId}`);

            // Notify all users (including sender)
            io.to(`document:${documentId}`).emit("document-auto-saved", {
              documentId,
              timestamp: Date.now(),
            });

            pendingSaves.delete(documentId);
          } catch (error) {
            console.error("❌ Auto-save error:", error);
          }
        }, 1000); // 2 seconds debounce

        pendingSaves.set(documentId, { content, timer });
      } catch (error) {
        console.error("❌ Edit handling error:", error);
        socket.emit("error", { message: "Failed to process edit" });
      }
    });
    /*
    // Manual save (Ctrl+S)
    socket.on("save-document", async (data) => {
      const { documentId, content } = data;

      try {
        console.log(`💾 Manual save from ${socket.id} on doc ${documentId}`);

        // Clear pending auto-save
        if (pendingSaves.has(documentId)) {
          clearTimeout(pendingSaves.get(documentId).timer);
          pendingSaves.delete(documentId);
        }

        // Save immediately
        const document = await Document.findByIdAndUpdate(
          documentId,
          { content, updatedAt: Date.now() },
          { new: true }
        );

        if (!document) {
          socket.emit("error", { message: "Document not found" });
          return;
        }

        // Confirm to sender
        socket.emit("document-saved", {
          documentId,
          updatedAt: document.updatedAt,
          message: "Saved successfully",
        });

        // Notify others
        socket.to(`document:${documentId}`).emit("document-saved-by-peer", {
          documentId,
          socketId: socket.id,
          updatedAt: document.updatedAt,
        });

        console.log(`✅ Manual save complete: ${documentId}`);
      } catch (error) {
        console.error("❌ Save error:", error);
        socket.emit("error", { message: "Failed to save document" });
      }
    });
*/
    // Disconnect handler
    socket.on("disconnect", async () => {
      console.log("👋 User disconnected:", socket.id);

      // Save all pending changes
      const savePromises = [];

      for (const [documentId, { content, timer }] of pendingSaves.entries()) {
        clearTimeout(timer);
        savePromises.push(
          Document.findByIdAndUpdate(documentId, {
            content,
            updatedAt: Date.now(),
          }).catch((err) =>
            console.error(
              `❌ Save on disconnect failed for ${documentId}:`,
              err
            )
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
