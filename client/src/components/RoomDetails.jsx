import "../../styles/roomDetails.css";
import { useEffect, useState } from "react";
import { getUser } from "../api/api";
import RoomHeader from "./RoomHeader";
import CollaboratorsSection from "./CollaboratorsSection";
import DocumentsSection from "./DocumentsSection";
import RoomModal from "./RoomModal";

function RoomDetails({ selectedRoom, setSelectedDocument }) {
  const [userId, setUserId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit-room");
  const [modalData, setModalData] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadUserId() {
      try {
        const user = await getUser(token);
        setUserId(user._id);
      } catch (err) {
        console.error("Failed to load user ID:", err);
      }
    }

    loadUserId();
  }, [token]);

  useEffect(() => {
    if (selectedRoom) {
      setCollaborators(selectedRoom.collaborators);
    }
  }, [selectedRoom]);

  if (!selectedRoom) return null;

  const openModal = (mode, data = {}) => {
    setModalMode(mode);
    setModalData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData({});
  };

  const handleModalSuccess = () => {
    window.dispatchEvent(new Event("reloadRooms"));
    closeModal();
  };

  const updateCollaborators = (newCollaborators) => {
    setCollaborators(newCollaborators);
  };


  
  return (
    <div className="room-details">
      <RoomHeader
        selectedRoom={selectedRoom}
        userId={userId}
        onEditRoom={() => openModal("edit-room", { name: selectedRoom.name })}
      />

      <CollaboratorsSection
        collaborators={collaborators}
        selectedRoom={selectedRoom}
        userId={userId}
        onInvite={() => openModal("invite")}
        onUpdateCollaborators={updateCollaborators}
      />

      <DocumentsSection
        documents={selectedRoom.documents}
        userId={userId}
        ownerId={selectedRoom.owner}
        onSelectDocument={setSelectedDocument}
        onCreateDocument={() => openModal("create-document")}
        onEditDocument={(doc) =>
          openModal("edit-document", { id: doc._id, name: doc.name })
        }
        onDeleteDocument={() => window.dispatchEvent(new Event("reloadRooms"))}
        roomId={selectedRoom._id}
      />

      {showModal && (
        <RoomModal
          mode={modalMode}
          data={modalData}
          roomId={selectedRoom._id}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

export default RoomDetails;