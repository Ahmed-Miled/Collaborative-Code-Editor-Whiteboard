import { useState, useEffect } from "react";
import { getRooms, createRoom } from "../api/api";

function SideBar() {
  const [rooms, setRooms] = useState([]);
  const [openRoom, setOpenRoom] = useState(null);

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
       console.log("rooms :", rooms);
       alert(`Room "${newRoom.name}" created successfully!`);
     })
     .catch((err) => {
       alert(err.message || "Failed to create room from client");
       console.error(err);
     });
 };


  return (
    <div className="sideBar">
      <h2 className="sidebar-title">Rooms</h2>

      {/* === No rooms message === */}
      {rooms.length === 0 && (
        <p className="no-rooms">No rooms yet. Create one!</p>
      )}

      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room._id} className="room-item">
            <div className="room-header" onClick={() => toggleRoom(room._id)}>
              <span className={`arrow ${openRoom === room._id ? "open" : ""}`}>
                ▶
              </span>
              <span className="room-name">{room.name}</span>
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
