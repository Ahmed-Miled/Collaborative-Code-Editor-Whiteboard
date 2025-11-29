import { useState, useEffect } from "react";
import { getUser } from "../api/api";
// lazem nraka7 el get user fel api bch najeùm nesta3malha
function NavBar() {
  const [username, setUsername] = useState("");
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    async function loadUserName() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getUser(token);
          setUsername(data.username);
        } catch (err) {
          console.log("Failed to load username", err);
        }
      } else {
        setUsername("cannot get username");
      }
    }
    loadUserName();
  }, []);

  return (
    <div className="navBar">
      <div className="left">
        <p className="logo">Logo</p>
        <p className="welcome">Hello {username}</p>
      </div>

      <div className="right">
        <button className="btn-outline">Notification</button>
        <button className="btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default NavBar;
