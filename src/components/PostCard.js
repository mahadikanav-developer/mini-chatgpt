import { useState } from "react";
import "../App.css";

const PostCard = ({ post, user, onLike, onComment, onSave, onViewStory, isSaved }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike(post._id);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText("");
    }
  };

  return (
    <div className="card feed-post">
      {/* Post Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="avatar">
            {post.userId?.name?.charAt(0)?.toUpperCase() || "👨‍🌾"}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {post.userId?.name || "Farmer"}
            </div>
            <div style={{ fontSize: "12px", color: "#8e8e8e" }}>
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          color: "#8e8e8e"
        }}>
          ⋯
        </button>
      </div>

      {/* Post Image */}
      {post.image && (
        <div style={{ position: "relative" }}>
          <img
            src={post.image}
            alt="Post"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "600px",
              objectFit: "cover"
            }}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="post-actions">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            className={`action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            style={{ color: liked ? "#ed4956" : "inherit" }}
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <button className="action-btn" onClick={() => setShowComments(!showComments)}>
            💬
          </button>
          <button className="action-btn">
            📤
          </button>
        </div>
        <button
          className="action-btn"
          onClick={() => onSave(post._id)}
          style={{ color: isSaved ? "#ed4956" : "inherit" }}
        >
          {isSaved ? "🔖" : "📌"}
        </button>
      </div>

      {/* Likes Count */}
      {likesCount > 0 && (
        <div style={{ padding: "0 16px", fontWeight: "600", fontSize: "14px" }}>
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </div>
      )}

      {/* Post Content */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{
          fontSize: "14px",
          lineHeight: "1.4",
          marginBottom: "8px"
        }}>
          <span style={{ fontWeight: "600", marginRight: "8px" }}>
            {post.userId?.name || "Farmer"}
          </span>
          {post.text}
        </div>

        {/* Market Info */}
        {post.type === "market" && (
          <div style={{
            background: "#f8f9fa",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>💰</span>
              <span style={{ fontWeight: "600" }}>
                {post.price} {post.unit} - {post.location}
              </span>
            </div>
            {post.contact && (
              <div style={{ fontSize: "14px", color: "#8e8e8e" }}>
                📞 {post.contact}
              </div>
            )}
          </div>
        )}

        {/* Comments Toggle */}
        {post.comments?.length > 0 && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#8e8e8e",
              fontSize: "14px",
              cursor: "pointer",
              marginTop: "8px"
            }}
            onClick={() => setShowComments(!showComments)}
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="comments-section">
            {post.comments?.slice(0, 3).map((comment, index) => (
              <div key={index} className="comment">
                <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                  {comment.userId?.name?.charAt(0)?.toUpperCase() || "👤"}
                </div>
                <div className="comment-content">
                  <div className="comment-author">
                    {comment.userId?.name || "User"}
                  </div>
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-time">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #f0f0f0"
            }}>
              <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                {user?.name?.charAt(0)?.toUpperCase() || "👤"}
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  background: "transparent"
                }}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                style={{
                  background: "none",
                  border: "none",
                  color: commentText.trim() ? "#0095f6" : "#8e8e8e",
                  fontWeight: "600",
                  cursor: commentText.trim() ? "pointer" : "default"
                }}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E8E8E8",
    marginBottom: "24px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
    transition: "all 0.25s",
  },

  header: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #E8E8E8",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#E7F3FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  userName: {
    fontWeight: "600",
    fontSize: "15px",
    color: "#0A0A0A",
  },

  timestamp: {
    fontSize: "13px",
    color: "#707070",
    marginTop: "2px",
  },

  image: {
    width: "100%",
    maxHeight: "600px",
    objectFit: "cover",
    backgroundColor: "#F5F5F5",
  },

  content: {
    padding: "16px",
  },

  text: {
    fontSize: "15px",
    lineHeight: "1.5",
    color: "#0A0A0A",
    margin: "0 0 12px 0",
  },

  marketInfo: {
    backgroundColor: "#FAFAFA",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #E8E8E8",
    fontSize: "14px",
  },

  marketRow: {
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },

  colorGray: {
    color: "#707070",
  },

  bold: {
    fontWeight: "600",
    color: "#0A0A0A",
  },

  actions: {
    display: "flex",
    gap: "16px",
    padding: "12px 16px",
    borderTop: "1px solid #E8E8E8",
  },

  actionBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "8px 4px",
    transition: "all 0.15s",
    opacity: 0.8,
  },

  actionBtnActive: {
    opacity: 1,
  },

  likeCount: {
    padding: "0 16px 8px 16px",
    fontSize: "14px",
    color: "#0A0A0A",
  },

  commentsSection: {
    padding: "16px",
    borderTop: "1px solid #E8E8E8",
    backgroundColor: "#FAFAFA",
  },

  comment: {
    marginBottom: "12px",
    fontSize: "14px",
    gap: "8px",
    display: "flex",
    flexWrap: "wrap",
  },

  commentText: {
    color: "#0A0A0A",
    marginLeft: "6px",
  },

  commentInput: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },

  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #E8E8E8",
    borderRadius: "20px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    transition: "all 0.15s",
  },

  submitBtn: {
    padding: "10px 16px",
    backgroundColor: "transparent",
    color: "#0A66C2",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s",
  },
};

export default PostCard;
