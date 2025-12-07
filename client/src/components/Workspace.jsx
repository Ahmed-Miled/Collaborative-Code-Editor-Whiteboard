import { useState, useEffect, useRef } from "react";
import SideBar from "../components/SideBar";
import RoomDetails from "../components/RoomDetails";
import DocumentEditor from "../components/DocumentEditor";
import { io } from "socket.io-client";

function Workspace({ selectedRoom, setSelectedRoom }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket after component mounts (user is already authenticated)
  useEffect(() => {
    console.log("🔌 Initializing socket connection...");

    // Create socket connection
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error);
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting socket...");
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Only run once on mount

  return (
    <>
      {/* Sidebar takes up the left column */}
      <div className="sideBar">
        <SideBar
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          setSelectedDocument={setSelectedDocument}
        />
      </div>

      {/* Main content area takes up the right column */}
      <div className="document">
        {!selectedRoom && !selectedDocument && (
          <div className="empty-room">
            <p>Please select a room to see its details.</p>
          </div>
        )}

        {selectedRoom && !selectedDocument && (
          <RoomDetails
            selectedRoom={selectedRoom}
            setSelectedDocument={setSelectedDocument}
          />
        )}

        {selectedDocument && socketRef.current && (
          <DocumentEditor
            selectedDocument={selectedDocument}
            socket={socketRef.current}
          />
        )}
      </div>
    </>
  );
}

export default Workspace;