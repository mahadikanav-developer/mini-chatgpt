import React, { useState } from "react";
import api from "../services/api";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const [postsRes, usersRes, hashtagsRes] = await Promise.all([
        api.get("/search/posts/search", {
          params: { q: query },
        }),
        api.get("/search/users/search", {
          params: { q: query },
        }),
        api.get("/search/hashtags/search", {
          params: { q: query },
        }),
      ]);

      setResults({
        posts: postsRes.data,
        users: usersRes.data,
        hashtags: hashtagsRes.data,
      });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="🔍 Search posts, users, hashtags..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        style={styles.searchInput}
      />

      {results && (
        <div style={styles.resultsContainer}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                borderBottom: activeTab === "posts" ? "2px solid #1976d2" : "none",
              }}
              onClick={() => setActiveTab("posts")}
            >
              Posts ({results.posts.length})
            </button>
            <button
              style={{
                ...styles.tab,
                borderBottom: activeTab === "users" ? "2px solid #1976d2" : "none",
              }}
              onClick={() => setActiveTab("users")}
            >
              Users ({results.users.length})
            </button>
            <button
              style={{
                ...styles.tab,
                borderBottom: activeTab === "hashtags" ? "2px solid #1976d2" : "none",
              }}
              onClick={() => setActiveTab("hashtags")}
            >
              Hashtags ({results.hashtags.length})
            </button>
          </div>

          {activeTab === "posts" && (
            <div style={styles.resultsList}>
              {results.posts.length === 0 ? (
                <p>No posts found</p>
              ) : (
                results.posts.map((post) => (
                  <div key={post._id} style={styles.resultItem}>
                    <img
                      src={post.userId.avatar || "👤"}
                      style={styles.resultAvatar}
                    />
                    <div>
                      <p style={styles.resultName}>{post.userId.name}</p>
                      <p style={styles.resultText}>
                        {post.text.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div style={styles.resultsList}>
              {results.users.length === 0 ? (
                <p>No users found</p>
              ) : (
                results.users.map((user) => (
                  <div key={user._id} style={styles.resultItem}>
                    <img
                      src={user.avatar || "👤"}
                      style={styles.resultAvatar}
                    />
                    <div>
                      <p style={styles.resultName}>{user.name}</p>
                      <p style={styles.resultText}>{user.farmName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "hashtags" && (
            <div style={styles.resultsList}>
              {results.hashtags.length === 0 ? (
                <p>No hashtags found</p>
              ) : (
                results.hashtags.map((tag) => (
                  <div key={tag._id} style={styles.resultItem}>
                    <span style={{ fontSize: "20px" }}>🏷️</span>
                    <div>
                      <p style={styles.resultName}>#{tag.tag}</p>
                      <p style={styles.resultText}>{tag.postCount} posts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "24px",
    outline: "none",
    paddingLeft: "20px",
    boxSizing: "border-box",
  },
  resultsContainer: {
    marginTop: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    maxHeight: "400px",
    overflowY: "auto",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #eee",
  },
  tab: {
    flex: 1,
    padding: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    textAlign: "center",
  },
  resultsList: {
    padding: "10px",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    gap: "10px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  resultAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    background: "#ddd",
  },
  resultName: {
    margin: "0",
    fontWeight: "bold",
    fontSize: "13px",
  },
  resultText: {
    margin: "5px 0 0 0",
    color: "#666",
    fontSize: "12px",
  },
};
