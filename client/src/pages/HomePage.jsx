import { useState } from "react";
import NavBar from "../components/NavBar";
import Workspace from "../components/Workspace";
import "../../styles/home.css";

function HomePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <div className="home">
      <NavBar />
      <Workspace
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
      />
    </div>
  );
}

export default HomePage;
