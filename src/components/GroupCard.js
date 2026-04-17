import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GroupCard.css";

const GroupCard = ({ group, isSelected, onJoin, onLeave }) => {
  const [isMember, setIsMember] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setIsMember(group.members?.includes(userId) || false);
  }, [group, userId]);

  const handleMembershipToggle = () => {
    if (isMember) {
      onLeave();
      setIsMember(false);
    } else {
      onJoin();
      setIsMember(true);
    }
  };

  if (isSelected) {
    return (
      <div className="group-card-detailed">
        <div className="group-header">
          <h2>{group.name}</h2>
          <span className={`privacy-badge ${group.isPrivate ? "private" : "public"}`}>
            {group.isPrivate ? "Private" : "Public"}
          </span>
        </div>

        <div className="group-category">
          <span className="category-tag">{group.category || "General"}</span>
        </div>

        <div className="group-description">
          {group.description || "No description provided"}
        </div>

        <div className="group-stats">
          <div className="stat">
            <span className="label">Members</span>
            <span className="value">{group.memberCount || group.members?.length || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Posts</span>
            <span className="value">{group.posts?.length || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Created</span>
            <span className="value">
              {new Date(group.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Admin/Moderator Info */}
        {group.admins && group.admins.length > 0 && (
          <div className="admin-section">
            <h4>Admins</h4>
            <div className="admin-list">
              {group.admins.map((admin) => (
                <div key={admin._id} className="admin-item">
                  <img src={admin.profileImage || ""} alt={admin.name} />
                  <span>{admin.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        {group.posts && group.posts.length > 0 && (
          <div className="recent-posts">
            <h4>Recent Posts</h4>
            <div className="posts-list">
              {group.posts.slice(0, 3).map((post, idx) => (
                <div key={post._id || idx} className="post-preview">
                  <p>{post.content?.substring(0, 100)}...</p>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className={`action-button ${isMember ? "leave" : "join"}`}
          onClick={handleMembershipToggle}
        >
          {isMember ? "Leave Group" : "Join Group"}
        </button>
      </div>
    );
  }

  return (
    <div className="group-card">
      <div className="group-card-header">
        <h3>{group.name}</h3>
        <span className={`privacy-badge-small ${group.isPrivate ? "private" : "public"}`}>
          {group.isPrivate ? "🔒" : "🌍"}
        </span>
      </div>

      {group.description && (
        <p className="group-description-short">
          {group.description.substring(0, 80)}...
        </p>
      )}

      <div className="group-info">
        <span className="member-count">👥 {group.memberCount || group.members?.length || 0} members</span>
        <span className="post-count">📝 {group.posts?.length || 0} posts</span>
      </div>

      {group.category && (
        <span className="category-tag">{group.category}</span>
      )}

      {!isSelected && (
        <button
          className={`quick-action ${isMember ? "joined" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleMembershipToggle();
          }}
        >
          {isMember ? "✓ Joined" : "Join"}
        </button>
      )}
    </div>
  );
};

export default GroupCard;
