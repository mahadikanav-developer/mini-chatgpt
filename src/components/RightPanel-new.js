import { useState, useEffect } from "react";
import api from "../services/api";

const RightPanel = () => {
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchTrending();
    fetchSuggestions();
  }, []);

  const fetchTrending = async () => {
    try {
      // Sample trending data
      setTrending([
        { tag: "FarmLife", count: 12500 },
        { tag: "CropTips", count: 8340 },
        { tag: "AgriTech", count: 6120 },
        { tag: "SustainableFarming", count: 4890 },
        { tag: "OrganicFarming", count: 3450 },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      // Sample suggestions
      setSuggestions([
        { id: 1, name: "Raj Kumar", role: "Vegetable Farmer" },
        { id: 2, name: "Priya Sharma", role: "Organic Farmer" },
        { id: 3, name: "Amit Patel", role: "Cotton Farmer" },
        { id: 4, name: "Deepak Singh", role: "Rice Farmer" },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.panel} data-right-panel-wrapper>
      {/* Sticky Search */}
      <div style={styles.search}>
        <input
          type="text"
          placeholder="🔍 Search..."
          style={styles.searchInput}
        />
      </div>

      {/* Trending Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔥 Trending Topics</h3>
        <div style={styles.trendingList}>
          {trending.map((item, idx) => (
            <div key={idx} style={styles.trendingItem}>
              <div>
                <div style={styles.trendingTag}>#{item.tag}</div>
                <div style={styles.trendingCount}>{item.count.toLocaleString()} posts</div>
              </div>
              <button style={styles.followBtn}>Follow</button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>👥 Follow Suggestions</h3>
        <div style={styles.suggestionsList}>
          {suggestions.map((user) => (
            <div key={user.id} style={styles.suggestionItem}>
              <div style={styles.suggestionAvatar}>👤</div>
              <div style={styles.suggestionInfo}>
                <div style={styles.suggestionName}>{user.name}</div>
                <div style={styles.suggestionRole}>{user.role}</div>
              </div>
              <button style={styles.followBtn}>Follow</button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div style={styles.footer}>
        <a href="#about" style={styles.link}>About</a>
        <a href="#help" style={styles.link}>Help</a>
        <a href="#privacy" style={styles.link}>Privacy</a>
        <a href="#terms" style={styles.link}>Terms</a>
        <div style={styles.copyright}>© 2026 FarmSocial</div>
      </div>
    </div>
  );
};

const styles = {
  panel: {
    width: "320px",
    padding: "20px",
    backgroundColor: "var(--white)",
    overflow: "hidden",
    display: "none",
  },

  search: {
    marginBottom: "24px",
    position: "sticky",
    top: "0",
    backgroundColor: "var(--white)",
    zIndex: "10",
  },

  searchInput: {
    width: "100%",
    padding: "10px 16px",
    border: "1px solid var(--gray-300)",
    borderRadius: "24px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "var(--gray-50)",
  },

  section: {
    marginBottom: "32px",
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--gray-900)",
    marginBottom: "16px",
    marginTop: "0",
  },

  trendingList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  trendingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "var(--gray-50)",
    borderRadius: "var(--border-radius)",
    cursor: "pointer",
    transition: "var(--transition)",
  },

  trendingTag: {
    fontWeight: "600",
    fontSize: "13px",
    color: "var(--primary)",
  },

  trendingCount: {
    fontSize: "12px",
    color: "var(--gray-500)",
    marginTop: "4px",
  },

  followBtn: {
    padding: "6px 12px",
    backgroundColor: "var(--primary)",
    color: "var(--white)",
    border: "none",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "var(--transition)",
  },

  suggestionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  suggestionItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "var(--gray-50)",
    borderRadius: "var(--border-radius)",
  },

  suggestionAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: "0",
  },

  suggestionInfo: {
    flex: "1",
  },

  suggestionName: {
    fontWeight: "600",
    fontSize: "13px",
    color: "var(--gray-900)",
  },

  suggestionRole: {
    fontSize: "12px",
    color: "var(--gray-500)",
    marginTop: "2px",
  },

  footer: {
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid var(--gray-200)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "center",
  },

  link: {
    fontSize: "12px",
    color: "var(--primary)",
    textDecoration: "none",
  },

  copyright: {
    fontSize: "11px",
    color: "var(--gray-500)",
    marginTop: "8px",
  },
};

export default RightPanel;
