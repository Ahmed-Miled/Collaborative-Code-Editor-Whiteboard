import { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import RoomDetails from "../components/RoomDetails";
import DocumentEditor from "../components/DocumentEditor";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function Workspace({ selectedRoom, setSelectedRoom }) {
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* Sidebar takes up the left column */}
        <SideBar
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          setSelectedDocument={setSelectedDocument}
        />

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
          />
        )}

        {selectedDocument && (
          <DocumentEditor selectedDocument={selectedDocument} socket={socket} />
        )}
      </div>
    </>
  );
}

export default Workspace;