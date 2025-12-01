import "../../styles/roomDetails.css";
import { useEffect, useState } from "react";
import { getUser, updateRoomName, removeUser } from "../api/api";
function RoomDetails({ selectedRoom, onSelectDocument }) {
  const [userId, setUserId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState(selectedRoom.name);
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
      setNewName(selectedRoom.name);
    }
  }, [selectedRoom]);

  if (!selectedRoom) return null;
  const editModal = showModal && (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Edit Room Name</h2>

        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="modal-input"
        />

        <div className="modal-actions">
          <button className="modal-cancel" onClick={() => setShowModal(false)}>
            Cancel
          </button>

          <button
            className="modal-save"
            onClick={async () => {
              try {
                const response = await updateRoomName(
                  selectedRoom._id,
                  newName,
                  token
                );

                // Update UI immediately
                selectedRoom.name = newName;
                window.dispatchEvent(new Event("reloadRooms"));
                setShowModal(false);
              } catch (err) {
                console.error("Failed to update name:", err);
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
/*
  async function handleRemoveUser(userId, roomId) {
    try {
      await removeUser(userId, roomId, token);
      window.dispatchEvent(new Event("reloadRooms"));
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
  }*/

  async function handleRemoveUser(userId, roomId) {
    try {
      await removeUser(userId, roomId, token);

      // ONLY update collaborators locally
      setCollaborators((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
  }


  return (
    <div className="room-details">
      {editModal}
      {/* Room header */}
      <div className="room-header-section">
        <h1 className="room-name">{selectedRoom.name}</h1>
        <p className="room-created">
          Created on: {new Date(selectedRoom.createdAt).toLocaleDateString()}
        </p>
        {/*selectedRoom.owner === userId && (
          <button className="edit-room-btn">Edit Name</button>
        )*/}
        {selectedRoom.owner === userId && (
          <button className="edit-room-btn" onClick={() => setShowModal(true)}>
            Edit Name
          </button>
        )}
      </div>

      <div className="collaborators-section">
        <h3>
          Members:{" "}
          {collaborators.filter((u) => u._id !== selectedRoom.owner).length}
        </h3>

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

        {/*<h3>
          Members:{" "}
          {
            selectedRoom.collaborators.filter(
              (u) => u._id !== selectedRoom.owner
            ).length
          }
        </h3>
        <ul className="collaborators-list">
          {selectedRoom.collaborators
            .filter((user) => user._id !== selectedRoom.owner)
            .map((user) => (
              <li key={user._id} className="collaborator-item">
                {user.username}
                {/* Only owner can remove }
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
        </ul>*/}
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
