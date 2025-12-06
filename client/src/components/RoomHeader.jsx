function RoomHeader({ selectedRoom, userId, onEditRoom }) {
  return (
    <div className="room-header-section">
      <div>
        <h1 className="room-name">{selectedRoom.name}</h1>
        <p className="room-created">
          Created on: {new Date(selectedRoom.createdAt).toLocaleDateString()}
        </p>
      </div>

      {selectedRoom.owner === userId && (
        <button className="edit-room-btn" onClick={onEditRoom}>
          Edit Name
        </button>
      )}
    </div>
  );
}

export default RoomHeader;
