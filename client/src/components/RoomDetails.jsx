import "../../styles/roomDetails.css";
import { useEffect, useState } from "react";
import { getUser, updateRoomName, removeUser, inviteUser } from "../api/api";

function RoomDetails({ selectedRoom, onSelectDocument }) {
  const [userId, setUserId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [modalMode, setModalMode] = useState("edit"); // "edit" | "invite"
  const [modalValue, setModalValue] = useState("");
  const [modalError, setModalError] = useState(""); // <== NEW error state

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
      setModalValue(selectedRoom.name);
    }
  }, [selectedRoom]);

  if (!selectedRoom) return null;

  // Helper to display errors inside modal
  const showError = (msg) => {
    setModalError(msg);
    setTimeout(() => setModalError(""), 3000); // fade after 3 sec
  };

  const modal = showModal && (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>
          {modalMode === "edit" ? "Edit Room Name" : "Invite User to Room"}
        </h2>

        <input
          type="text"
          value={modalValue}
          placeholder={modalMode === "edit" ? "Enter new room name" : "User ID"}
          onChange={(e) => setModalValue(e.target.value)}
          className="modal-input"
        />

        {/* Error message */}
        {modalError && <p className="modal-error">{modalError}</p>}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={() => setShowModal(false)}>
            Cancel
          </button>

          <button
            className="modal-save"
            onClick={async () => {
              try {
                if (!modalValue.trim()) {
                  showError("Field cannot be empty");
                  return;
                }

                if (modalMode === "edit") {
                  await updateRoomName(selectedRoom._id, modalValue, token);
                  selectedRoom.name = modalValue;
                } else {
                  const res = await inviteUser(selectedRoom._id, modalValue);
                  if (!res || !res.message) {
                    showError("Failed to invite user");
                    return;
                  }
                }

                window.dispatchEvent(new Event("reloadRooms"));
                setShowModal(false);
              } catch (err) {
                const msg =
                  err?.response?.data?.message ||
                  err?.message ||
                  "Action failed";

                showError(msg);
                console.error(err);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (selectedRoom) {
      setCollaborators(selectedRoom.collaborators);
    }
  }, [selectedRoom]);

  async function handleRemoveUser(userId, roomId) {
    try {
      await removeUser(userId, roomId, token);
      setCollaborators((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
  }

  return (
    <div className="room-details">
      {modal}

      {/* Room header */}
      <div className="room-header-section">
        <h1 className="room-name">{selectedRoom.name}</h1>
        <p className="room-created">
          Created on: {new Date(selectedRoom.createdAt).toLocaleDateString()}
        </p>

        {selectedRoom.owner === userId && (
          <button
            className="edit-room-btn"
            onClick={() => {
              setModalMode("edit");
              setModalValue(selectedRoom.name);
              setModalError("");
              setShowModal(true);
            }}
          >
            Edit Name
          </button>
        )}
      </div>

      {/* Members */}
      <div className="collaborators-section">
        <div className="members-header">
          <h3>
            Members:{" "}
            {collaborators.filter((u) => u._id !== selectedRoom.owner).length}
          </h3>

          {selectedRoom.owner === userId && (
            <button
              className="invite-user-btn"
              onClick={() => {
                setModalMode("invite");
                setModalValue("");
                setModalError("");
                setShowModal(true);
              }}
            >
              + Invite
            </button>
          )}
        </div>

        <ul className="collaborators-list">
          {collaborators
            .filter((user) => user._id !== selectedRoom.owner)
            .map((user) => (
              <li key={user._id} className="collaborator-item">
                {user.username}
                {selectedRoom.owner === userId && (
                  <button
                    className="remove-user-btn"
                    onClick={() => handleRemoveUser(user._id, selectedRoom._id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
        </ul>
      </div>

      {/* Documents section */}
      <div className="documents-section">
        <h3>Documents:</h3>
        {selectedRoom.documents.length === 0 ? (
          <p className="empty-docs">No documents yet. Create one!</p>
        ) : (
          <ul className="documents-list">
            {selectedRoom.documents.map((doc) => (
              <li key={doc._id} className="document-item">
                {doc.name}
                <button className="edit-doc-btn">Edit</button>
                <button className="delete-doc-btn">Delete</button>
              </li>
            ))}
          </ul>
        )}
        <button className="create-doc-btn">+ Add Document</button>
      </div>
    </div>
  );
}

export default RoomDetails;
