import { useState, useEffect } from "react";
import { getRooms, createRoom, inviteUser, getUser } from "../api/api";

function SideBar() {
  const [rooms, setRooms] = useState([]);
  const [openRoom, setOpenRoom] = useState(null);
  const [userId, setUserId] = useState(null); // optional if you store current user info

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Failed to load rooms:", err);
      }
    }

    loadRooms();
    // Listen for invitation accepted
    const handleReload = () => {
      loadRooms();
    };

    window.addEventListener("reloadRooms", handleReload);

    return () => window.removeEventListener("reloadRooms", handleReload);
  }, []);

  const toggleRoom = (id) => {
    setOpenRoom(openRoom === id ? null : id);
  };

  const handleCreateRoom = () => {
    const roomName = prompt("Enter room name:");
    if (!roomName) return;

    createRoom(roomName)
      .then((newRoom) => {
        setRooms([...rooms, newRoom]);
        alert(`Room "${newRoom.name}" created successfully!`);
      })
      .catch((err) => {
        alert(err.message || "Failed to create room");
        console.error(err);
      });
  };

  // New: handle invite button click
  const handleInviteUser = async (room) => {
    const userId = prompt("Enter the ID of the user to invite:");
    if (!userId) return;

    try {
      const res = await inviteUser(room._id, userId);
      alert(res.message);
    } catch (err) {
      alert(err.message || "Failed to invite user");
      console.error(err);
    }
  };
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = await getUser(token);
        setUserId(user._id);
      } catch (err) {
        console.error("Failed to load user ID:", err);
      }
    };
    loadUserId();
  }, []);
  return (
    <div className="sideBar">
      <h2 className="sidebar-title">Rooms</h2>

      {rooms.length === 0 && (
        <p className="no-rooms">No rooms yet. Create one!</p>
      )}

      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room._id} className="room-item">
            <div className="room-header" onClick={() => toggleRoom(room._id)}>
              <div>
                <span
                  className={`arrow ${openRoom === room._id ? "open" : ""}`}
                >
                  ▶
                </span>
                <span className="room-name">{room.name}</span>
              </div>
              {/* Only show "+" if logged-in user is owner */}

              {room.owner === userId && (
                <button
                  className="invite-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent toggling room
                    handleInviteUser(room);
                  }}
                >
                  +
                </button>
              )}
            </div>

            {openRoom === room._id && (
              <ul className="document-list">
                {room.documents.map((doc) => (
                  <li key={doc._id} className="document-item">
                    {doc.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <button className="create-room-btn" onClick={handleCreateRoom}>
        + Create Room
      </button>
    </div>
  );
}

export default SideBar;
