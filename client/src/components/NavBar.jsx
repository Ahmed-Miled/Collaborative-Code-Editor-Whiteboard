import { useState, useEffect } from "react";
import {
  getUser,
  getNotifications,
  acceptInvitation,
  rejectInvitation,
} from "../api/api";

function NavBar({ activeUsers = 0 }) {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (!token) return;

    async function loadNotifications() {
      try {
        const data = await getNotifications(token);
        setNotifications(data);
        setHasUnread(data.length > 0);
      } catch (err) {
        console.log("Failed to load notifications", err);
      }
    }

    loadNotifications();

    // poll every 1/2 sec for new notifications
    const interval = setInterval(loadNotifications, 500);
    return () => clearInterval(interval);
  }, []);

  async function handleNotifications() {
    setOpenNotif(!openNotif);

    // If opening, mark notifications as read
    if (!openNotif) {
      setHasUnread(false);
    }
  }

  // Load username and user ID
  useEffect(() => {
    async function loadUserName() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getUser(token);
          setUsername(data.username);
          setUserId(data._id);
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
        <div className="user-info">
          <p className="welcome">Hello {username}</p>
          <p className="user-id">ID: {userId}</p>
        </div>
      </div>

      <div className="right">
        {/* 🔥 NEW → Active Users Indicator */}
        {activeUsers > 0 && (
          <div className="active-users-indicator">
            <span className="active-dot"></span>
            <span className="active-count">
              {activeUsers} {activeUsers === 1 ? "user" : "users"} viewing
            </span>
          </div>
        )}

        <div className="notif-btn-wrapper">
          <button
            className={`btn-outline ${openNotif ? "active" : ""}`}
            onClick={handleNotifications}
          >
            Notifications
          </button>

          {/* New notifications indicator */}
          {hasUnread && <span className="notif-indicator"></span>}
        </div>

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
