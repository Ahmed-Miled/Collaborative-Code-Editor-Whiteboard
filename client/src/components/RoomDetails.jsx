import "../../styles/roomDetails.css";
import { useEffect, useState } from "react";
import { getUser } from "../api/api";
function RoomDetails({ selectedRoom, onSelectDocument }) {
  const [userId, setUserId] = useState(null);
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

  if (!selectedRoom) return null;

  return (
    <div className="room-details">
      {/* Room header */}
      <div className="room-header-section">
        <h1 className="room-name">{selectedRoom.name}</h1>
        <p className="room-created">
          Created on: {new Date(selectedRoom.createdAt).toLocaleDateString()}
        </p>
        {selectedRoom.owner === userId && (
          <button className="edit-room-btn">Edit Name</button>
        )}
      </div>

      <div className="collaborators-section">
        <h3>
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
                {/* Only owner can remove */}
                {selectedRoom.owner === userId && (
                  <button className="remove-user-btn">Remove</button>
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
