import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({ isMobile, onClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [activeItem, setActiveItem] = useState(window.location.pathname || "/home");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: "🏠", label: "Home", path: "/home" },
    { icon: "🔍", label: "Explore", path: "/explore" },
    { icon: "�", label: "Reels", path: "/reels" },
    { icon: "🎬", label: "IGTV", path: "/igtv" },
    { icon: "👥", label: "Groups", path: "/groups" },
    { icon: "🎉", label: "Events", path: "/events" },
    { icon: "📄", label: "Pages", path: "/pages" },
    { icon: "💬", label: "Messages", path: "/messages" },
    { icon: "🔔", label: "Notifications", path: "/notifications" },
    { icon: "❤️", label: "Saved", path: "/saved" },
    { icon: "🔴", label: "Live", path: "/live" },
    { icon: "🛒", label: "Orders", path: "/orders" },
    { icon: "👤", label: "Profile", path: "/profile" },
    { icon: "⚙️", label: "Settings", path: "/settings" },
  ];

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigate(path);
    if (isMobile) onClose();
  };

  return (
    <div style={styles.sidebar}>
      {/* Mobile Close Button */}
      {isMobile && (
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      )}

      {/* Premium Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoBadge}>🌾</div>
        <div>
          <div style={styles.logoText}>FarmSocial</div>
          <div style={styles.logoSubtext}>Community</div>
        </div>
      </div>

      {/* Premium Navigation */}
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            style={{
              ...styles.menuItem,
              ...(activeItem === item.path ? styles.menuItemActive : {}),
            }}
            onClick={() => handleNavigation(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
            {activeItem === item.path && <div style={styles.indicator} />}
          </button>
        ))}
      </nav>

      {/* User Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.profileAvatar}>👨‍🌾</div>
        <div style={styles.profileInfo}>
          <div style={styles.profileName}>{user?.name || "Farmer"}</div>
          <div style={styles.profileHandle}>@{user?.name?.toLowerCase().replace(" ", "") || "user"}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionSection}>
        <button style={styles.primaryBtn} onClick={() => handleNavigation("/home")}>
          ✏️ Post
        </button>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    padding: "20px 12px",
    backgroundColor: "#FFFFFF",
    borderRight: "1px solid #E8E8E8",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflowY: "auto",
    boxShadow: "0 0 1px rgba(0, 0, 0, 0.02)",
  },

  closeBtn: {
    alignSelf: "flex-end",
    padding: "8px",
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#2D2D2D",
    transition: "all 0.15s",
    marginBottom: "12px",
    borderRadius: "6px",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 8px",
    marginBottom: "24px",
    borderBottom: "1px solid #E8E8E8",
  },

  logoBadge: {
    fontSize: "32px",
  },

  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0A0A0A",
    lineHeight: "1.2",
  },

  logoSubtext: {
    fontSize: "12px",
    color: "#707070",
    fontWeight: "500",
    marginTop: "2px",
  },

  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginBottom: "24px",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 12px",
    cursor: "pointer",
    borderRadius: "12px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    color: "#505050",
    fontSize: "15px",
    fontWeight: "500",
    background: "none",
    border: "none",
    position: "relative",
    textAlign: "left",
  },

  menuItemActive: {
    color: "#FF1654",
    backgroundColor: "rgba(255, 22, 84, 0.08)",
    fontWeight: "600",
    boxShadow: "inset 0 0 0 1px rgba(255, 22, 84, 0.2)",
  },

  icon: {
    fontSize: "20px",
    minWidth: "24px",
  },

  label: {
    flex: 1,
  },

  indicator: {
    width: "3px",
    height: "20px",
    borderRadius: "2px",
    backgroundColor: "#FF1654",
    marginLeft: "auto",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 12px",
    borderRadius: "14px",
    backgroundColor: "#F8F9FA",
    marginBottom: "16px",
    border: "1px solid #E8E8E8",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  profileAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "linear-gradient(135deg, #FFF0F5, #FFE0ED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(255, 22, 84, 0.15)",
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0A0A0A",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  profileHandle: {
    fontSize: "12px",
    color: "#A0A0A0",
    marginTop: "2px",
  },

  actionSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop: "1px solid #E8E8E8",
    paddingTop: "16px",
  },

  primaryBtn: {
    padding: "12px 16px",
    backgroundColor: "#FF1654",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(255, 22, 84, 0.3)",
    background: "linear-gradient(135deg, #FF1654, #FF5B8A)",
    width: "100%",
  },

  logoutBtn: {
    padding: "12px 16px",
    backgroundColor: "#F5F5F5",
    color: "#2D2D2D",
    border: "1px solid #E8E8E8",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    width: "100%",
  },
};

export default Sidebar;
