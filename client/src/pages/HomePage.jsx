import { useState } from "react";
import NavBar from "../components/NavBar";
import Workspace from "../components/Workspace";
import "../../styles/home.css";

function HomePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);

  return (
    <div className="home">
      <NavBar activeUsers={activeUsers} />
      <Workspace
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        onActiveUsersChange={setActiveUsers}
      />
    </div>
  );
}

export default HomePage;