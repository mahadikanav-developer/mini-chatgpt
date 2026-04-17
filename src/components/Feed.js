import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { parsePostText } from "../utils/textParser";
import { useToast } from "../context/ToastContext";

const Feed = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [viewingStory, setViewingStory] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});
  const [shareModal, setShareModal] = useState(null);
  const [shareCaption, setShareCaption] = useState("");
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    api.get("/posts")
      .then(res => {
        // Filter out posts without userId to prevent undefined errors
        const validPosts = (res.data || []).filter(post => post && post.userId);
        setPosts(validPosts);

        // Sync saved-state map by saved document id for reliable unsave
        if (user?._id) {
          api.get(`/saved/${user._id}`)
            .then((savedRes) => {
              const mapping = {};
              (savedRes.data || []).forEach((item) => {
                if (item?.postId?._id && item?._id) {
                  mapping[item.postId._id] = item._id;
                }
              });
              setSavedPosts(mapping);
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.log("Feed error:", err);
        showToast("Failed to load posts", "error");
      })
      .finally(() => setLoading(false));
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comment`, {
        userId: user._id,
        text: newComment[postId]
      });

      // Send notification to post owner
      const post = posts.find(p => p._id === postId);
      if (post?.userId?._id && post.userId._id !== user._id) {
        await api.post(`/notifications`, {
          recipientId: post.userId._id,
          senderId: user._id,
          type: "comment",
          text: `${user.name} commented on your post`,
          postId: postId
        }).catch(err => console.log("Notification error:", err));
      }

      setNewComment({ ...newComment, [postId]: "" });
      setExpandedComments({ ...expandedComments, [postId]: true });
      fetchPosts();
      showToast("Comment added!", "success");
    } catch (err) {
      console.log("Comment error:", err);
      showToast("Failed to add comment", "error");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/${postId}/like`, {
        userId: user._id
      });

      // Send notification to post owner
      const post = posts.find(p => p._id === postId);
      if (post?.userId?._id && post.userId._id !== user._id) {
        await api.post(`/notifications`, {
          recipientId: post.userId._id,
          senderId: user._id,
          type: "like",
          text: `${user.name} liked your post`,
          postId: postId
        }).catch(err => console.log("Notification error:", err));
      }

      fetchPosts();
      showToast("Post liked! ❤️", "success");
    } catch (err) {
      console.log("Like error:", err);
      showToast("Failed to like post", "error");
    }
  };

  const handleSavePost = async (postId) => {
    if (!user?._id) {
      showToast("Please log in to save posts", "error");
      return;
    }
    try {
      if (savedPosts[postId]) {
        // Unsave the post
        await api.delete(`/saved/${savedPosts[postId]}`);
        const next = { ...savedPosts };
        delete next[postId];
        setSavedPosts(next);
        showToast("Post removed from saved", "info");
      } else {
        // Save the post
        const saveRes = await api.post(`/saved`, {
          userId: user._id,
          postId: postId,
          collectionName: "Saved"
        });
        if (saveRes.data?._id) {
          setSavedPosts({ ...savedPosts, [postId]: saveRes.data._id });
        }
        showToast("Post saved! 📌", "success");
      }
    } catch (err) {
      console.log("Save error:", err);
      showToast("Failed to save post", "error");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`, {
        data: { userId: user._id }
      });
      fetchPosts();
      showToast("Post deleted", "info");
    } catch (err) {
      console.log("Delete error:", err);
      showToast("Failed to delete post", "error");
    }
  };

  const handleRepost = async (postId) => {
    if (!shareCaption && !window.confirm("Repost without a caption?")) return;
    try {
      await api.post(`/reposts`, {
        originalPostId: postId,
        userId: user._id,
        caption: shareCaption
      });
      showToast("Post reposted successfully! 🔄", "success");
      setShareModal(null);
      setShareCaption("");
      fetchPosts();
    } catch (err) {
      console.log("Repost error:", err);
      showToast("Failed to repost", "error");
    }
  };

  const handleReportPost = async () => {
    try {
      await api.post("/reports", {
        reporterId: user._id,
        postId: reportModal,
        reason: reportReason,
        description: reportDescription
      });
      showToast("Post reported successfully", "success");
      setReportModal(null);
      setReportReason("spam");
      setReportDescription("");
    } catch (err) {
      console.log("Report error:", err);
      showToast("Failed to report post", "error");
    }
  };

  return (
    <>
      {/* Full-screen story viewer for posts */}
      {viewingStory && (
        <div 
          style={styles.fullscreenStory}
          onClick={() => setViewingStory(null)}
        >
          <button
            style={styles.closeStoryBtn}
            onClick={(e) => {
              e.stopPropagation();
              setViewingStory(null);
            }}
          >
            ✕
          </button>

          <div style={styles.storyViewerContainer}>
            <div
              style={{
                ...styles.storyViewerContent,
                background: viewingStory.bgColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <p style={{ color: viewingStory.textColor || "#fff" }}>
                {viewingStory.text}
              </p>
            </div>
          </div>

          <button
            style={{...styles.navBtnStory, left: "20px"}}
            onClick={() => {
              const idx = posts.findIndex(p => p._id === viewingStory._id);
              if (idx > 0) setViewingStory(posts[idx - 1]);
            }}
          >
            ‹
          </button>
          <button
            style={{...styles.navBtnStory, right: "20px"}}
            onClick={() => {
              const idx = posts.findIndex(p => p._id === viewingStory._id);
              if (idx < posts.length - 1) setViewingStory(posts[idx + 1]);
            }}
          >
            ›
          </button>
        </div>
      )}

      <div style={styles.feed} data-feed>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>📭 No posts yet. Start following farmers to see their updates!</p>
          </div>
        ) : (
          posts.map((post) => (
          <div key={post._id} style={styles.postCard} data-post-card>
          {/* Post Header */}
          <div style={styles.postHeader}>
            <div 
              style={{ ...styles.userInfo, cursor: "pointer" }} 
              onClick={() => post.userId && navigate(`/profile/${post.userId._id}`)}
            >
              <div style={styles.avatar}>👨‍🌾</div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{post.userId ? post.userId.name : "Farmer"}</div>
                <div style={styles.timestamp}>2 hours ago</div>
              </div>
            </div>
            <span style={{ ...styles.postTag, backgroundColor: "#FF1654" }}>
              {(post.type || "update").toUpperCase()}
            </span>
          </div>

          {/* Post Content */}
          <div style={styles.postContent}>
            <p style={styles.postText}>
              {parsePostText(post.text, (tag) => navigate(`/hashtag/${tag}`), (user) => navigate(`/search?q=@${user}`))}
            </p>
            
            {post.type === "market" && (
              <div style={styles.marketBox}>
                <div style={styles.marketField}>
                  <span style={styles.marketLabel}>💰 Price:</span>
                  <span style={styles.marketValue}>{post.price} / {post.unit}</span>
                </div>
                <div style={styles.marketField}>
                  <span style={styles.marketLabel}>📍 Location:</span>
                  <span style={styles.marketValue}>{post.location}</span>
                </div>
                {post.contact && (
                  <div style={styles.marketField}>
                    <span style={styles.marketLabel}>📞 Contact:</span>
                    <span style={styles.marketValue}>{post.contact}</span>
                  </div>
                )}
              </div>
            )}

            {post.image && (
              <img src={post.image} alt="post" style={styles.postImage} data-post-image />
            )}
          </div>

          {/* Post Actions */}
          <div style={styles.postActions} data-post-actions>
            <button style={styles.actionBtn} data-action-btn onClick={() => handleLike(post._id)}>
              ❤️ {post.likes?.length || 0}
            </button>
            <button 
              style={styles.actionBtn}
              data-action-btn
              onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })}
            >
              💬 {post.comments?.length || 0}
            </button>
            <button 
              style={styles.actionBtn} 
              data-action-btn
              onClick={() => setShareModal(post._id)}
            >
              📤 Share
            </button>
            <button 
              style={{ ...styles.actionBtn, backgroundColor: savedPosts[post._id] ? "#FF1654" : "#f3f4f6", color: savedPosts[post._id] ? "#fff" : "#6b7280" }}
              data-action-btn
              onClick={() => handleSavePost(post._id)}
              title={savedPosts[post._id] ? "Unsave post" : "Save post"}
            >
              {savedPosts[post._id] ? "🔖 Saved" : "🔖 Save"}
            </button>
            {post.userId && user && post.userId._id === user._id && (
              <button 
                style={{ ...styles.actionBtn, backgroundColor: "#f3f4f6", color: "#d32f2f" }}
                data-action-btn
                onClick={() => handleDeletePost(post._id)}
                title="Delete post"
              >
                🗑️ Delete
              </button>
            )}
            <button 
              style={{ ...styles.actionBtn, backgroundColor: "#FF1654", color: "#fff" }}
              data-action-btn
              onClick={() => setViewingStory(post)}
            >
              📖 Story View
            </button>
            {post.type === "market" && (
              <button 
                style={{ ...styles.actionBtn, ...styles.buyBtn }} 
                data-action-btn
                onClick={() => navigate(`/checkout/${post._id}`)}
              >
                🛒 Buy Now
              </button>
            )}
            <button 
              style={{ ...styles.actionBtn, backgroundColor: "#f3f4f6", color: "#666" }}
              data-action-btn
              onClick={() => setReportModal(post._id)}
              title="Report post"
            >
              🚩 Report
            </button>
          </div>

          {/* Comments Section */}
          {expandedComments[post._id] && (
            <div style={styles.commentsSection}>
              <div style={styles.commentsList}>
                {post.comments?.map((comment) => (
                  <div key={comment._id} style={styles.comment}>
                    <div style={styles.commentAvatar}>👤</div>
                    <div style={styles.commentContent}>
                      <div style={styles.commentName}>{comment.userId?.name || "User"}</div>
                      <div style={styles.commentText}>{comment.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div style={styles.addCommentBox}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment[post._id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                  style={styles.commentInput}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment(post._id)}
                />
                <button 
                  style={styles.commentBtn}
                  onClick={() => handleAddComment(post._id)}
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      )))}
    </div>

      {/* Share Modal */}
      {shareModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Share Post</h2>
              <button 
                style={styles.modalClose}
                onClick={() => {
                  setShareModal(null);
                  setShareCaption("");
                }}
              >
                ✕
              </button>
            </div>
            
            <textarea
              placeholder="Add a caption to share..."
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              style={styles.shareTextarea}
            />

            <div style={styles.modalActions}>
              <button 
                style={{...styles.actionBtn, backgroundColor: "#f3f4f6"}}
                onClick={() => {
                  setShareModal(null);
                  setShareCaption("");
                }}
              >
                Cancel
              </button>
              <button 
                style={{...styles.actionBtn, backgroundColor: "#FF1654", color: "#fff"}}
                onClick={() => handleRepost(shareModal)}
              >
                Repost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Report Post</h2>
              <button 
                style={styles.modalClose}
                onClick={() => {
                  setReportModal(null);
                  setReportReason("spam");
                  setReportDescription("");
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
              Tell us why you're reporting this post
            </p>

            <label style={styles.modalLabel}>Reason</label>
            <select
              style={styles.modalSelect}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="hate_speech">Hate speech</option>
              <option value="violence">Violence</option>
              <option value="sexual_content">Sexual content</option>
              <option value="misinformation">Misinformation</option>
              <option value="copyright">Copyright</option>
              <option value="other">Other</option>
            </select>

            <label style={styles.modalLabel}>Additional details (optional)</label>
            <textarea
              placeholder="Describe the issue..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              style={{...styles.shareTextarea, minHeight: 100}}
            />

            <div style={styles.modalActions}>
              <button 
                style={{...styles.actionBtn, backgroundColor: "#f3f4f6"}}
                onClick={() => {
                  setReportModal(null);
                  setReportReason("spam");
                  setReportDescription("");
                }}
              >
                Cancel
              </button>
              <button 
                style={{...styles.actionBtn, backgroundColor: "#FF1654", color: "#fff"}}
                onClick={handleReportPost}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  fullscreenStory: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    zIndex: 5000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  closeStoryBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 5001,
  },

  storyViewerContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  storyViewerContent: {
    width: "100%",
    maxWidth: "400px",
    aspectRatio: "9 / 16",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: "1.5",
  },

  navBtnStory: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    border: "none",
    color: "#fff",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    fontSize: "28px",
    cursor: "pointer",
    zIndex: 5001,
    transition: "all 0.2s",
  },

  feed: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    backgroundColor: "#fff"
  },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    border: "1px solid #E8E8E8",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },

  postCardHover: {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderColor: "#D3D3D3",
  },

  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #E8E8E8"
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FFF0F5, #FFE0ED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 2px 8px rgba(255, 22, 84, 0.15)",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column"
  },
  userName: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111827"
  },
  timestamp: {
    fontSize: "12px",
    color: "#6b7280"
  },
  postTag: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#fff"
  },
  postContent: {
    marginBottom: "12px"
  },
  postText: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.5",
    margin: "0 0 12px 0"
  },
  marketBox: {
    backgroundColor: "#FFF0F5",
    border: "1px solid #FFD6E0",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "12px"
  },
  marketField: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "13px"
  },
  marketLabel: {
    fontWeight: "600",
    color: "#FF1654"
  },
  marketValue: {
    color: "#C41238"
  },
  postImage: {
    width: "100%",
    height: "250px",
    borderRadius: "8px",
    objectFit: "cover"
  },
  postActions: {
    display: "flex",
    gap: "8px",
    borderTop: "1px solid #E8E8E8",
    paddingTop: "14px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  actionBtn: {
    flex: 1,
    minWidth: "72px",
    padding: "9px 12px",
    border: "1px solid #E8E8E8",
    borderRadius: "8px",
    backgroundColor: "#F8F9FA",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  actionBtnHover: {
    backgroundColor: "#EFF1F3",
    borderColor: "#D3D3D3",
    transform: "translateY(-1px)",
  },

  buyBtn: {
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
  },
  commentsSection: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb"
  },
  commentsList: {
    maxHeight: "200px",
    overflowY: "auto",
    marginBottom: "12px"
  },
  comment: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    padding: "8px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px"
  },
  commentAvatar: {
    fontSize: "18px",
    minWidth: "30px"
  },
  commentContent: {
    flex: 1
  },
  commentName: {
    fontWeight: "600",
    fontSize: "12px",
    color: "#111827"
  },
  commentText: {
    fontSize: "13px",
    color: "#374151",
    marginTop: "4px"
  },
  addCommentBox: {
    display: "flex",
    gap: "8px"
  },
  commentInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "13px",
    outline: "none"
  },
  commentBtn: {
    padding: "8px 16px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer"
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
    color: "#111827"
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280"
  },
  shareTextarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    marginBottom: "16px",
    resize: "vertical"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    gap: "16px"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #FF1654",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    color: "#666",
    fontSize: "16px",
    fontWeight: "500"
  },
  emptyState: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px 20px",
    textAlign: "center"
  },
  emptyText: {
    color: "#999",
    fontSize: "16px",
    maxWidth: "400px"
  },
  modalLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  modalSelect: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
    fontFamily: "inherit",
    backgroundColor: "#fff",
    color: "#111827",
    cursor: "pointer"
  }
};

export default Feed;
