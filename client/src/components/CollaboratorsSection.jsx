import { removeUser } from "../api/api";

function CollaboratorsSection({
  collaborators,
  selectedRoom,
  userId,
  onInvite,
  onUpdateCollaborators,
}) {
  const token = localStorage.getItem("token");

  const handleRemoveUser = async (userIdToRemove) => {
    try {
      await removeUser(userIdToRemove, selectedRoom._id, token);
      const updatedCollaborators = collaborators.filter(
        (u) => u._id !== userIdToRemove
      );
      onUpdateCollaborators(updatedCollaborators);
    } catch (err) {
      console.error("Failed to remove user:", err);
      alert("Failed to remove user");
    }
  };

  const members = collaborators.filter((u) => u._id !== selectedRoom.owner);

  return (
    <div className="collaborators-section">
      <div className="members-header">
        <h3>Members: {members.length}</h3>

        {selectedRoom.owner === userId && (
          <button className="invite-user-btn" onClick={onInvite}>
            + Invite
          </button>
        )}
      </div>

      <ul className="collaborators-list">
        {members.map((user) => (
          <li key={user._id} className="collaborator-item">
            {user.username}
            {selectedRoom.owner === userId && (
              <button
                className="remove-user-btn"
                onClick={() => handleRemoveUser(user._id)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CollaboratorsSection;
