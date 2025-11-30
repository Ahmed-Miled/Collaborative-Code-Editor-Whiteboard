import { useState, useEffect } from "react";
import {
  getUser,
  getNotifications,
  acceptInvitation,
  rejectInvitation,
  getRooms,
} from "../api/api";

function NavBar() {
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  async function handleNotifications() {
    const token = localStorage.getItem("token");
    console.log(token);
    if (token) {
      try {
        const data = await getNotifications(token);
        setNotifications(data);
        console.log(data);
        setOpenNotif(!openNotif); // toggle dropdown
      } catch (err) {
        console.log("Failed to load notifications", err);
      }
    }
  }
  // Load username
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
      }
    }
    loadUserName();
  }, []);
  async function handleRejectInvitation(roomId) {
    try {
      await rejectInvitation(roomId);

      // Remove the rejected invitation locally
      setNotifications((prev) => prev.filter((n) => n.room?._id !== roomId));
    } catch (err) {
      console.log("Failed to reject invitation", err);
    }
  }

  async function handleAcceptInvitation(roomId) {
    try {
      await acceptInvitation(roomId);
      setNotifications((prev) => prev.filter((n) => n.room?._id !== roomId));
      window.dispatchEvent(new Event("reloadRooms"));
    } catch (err) {
      console.log("Failed to accept invitation:", err);
    }
  }

  return (
    <div className="navBar">
      <div className="left">
        <p className="logo">Logo</p>
        <p className="welcome">Hello {username}</p>
      </div>

      <div className="right">
        {/* Toggle menu on click */}
        <button className="btn-outline" onClick={handleNotifications}>
          Notifications
        </button>

        {/* Dropdown menu */}
        {openNotif && (
          <div className="notif-dropdown">
            {notifications.length === 0 ? (
              <p className="empty-msg">No notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-info">
                    <h4 className="notif-room">{n.room?.name}</h4>
                    <p className="notif-meta">
                      Invited by <span>{n.invitedBy?.username}</span>
                    </p>
                    <p className="notif-date">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="notif-actions">
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectInvitation(n.room._id)}
                    >
                      Reject
                    </button>

                    <button
                      className="btn-accept"
                      onClick={() => handleAcceptInvitation(n.room._id)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button className="btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default NavBar;
