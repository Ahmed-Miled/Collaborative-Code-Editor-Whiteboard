import { useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import RoomDetails from "../components/RoomDetails";
import DocumentEditor from "../components/DocumentEditor";
import "../../styles/home.css";

function HomePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div className="home">
      <NavBar />
      <SideBar selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
      {!selectedRoom && !selectedDocument &&(
      <div className="room-details empty-room">
        <p>Please select a room to see its details.</p>
      </div>
      )}
      {selectedRoom && (
        <RoomDetails
          selectedRoom={selectedRoom}
          setSelectedDocument={setSelectedDocument}
        />
      )}
      {selectedDocument && <DocumentEditor document={selectedDocument} />}
    </div>
  );
}

export default HomePage;
