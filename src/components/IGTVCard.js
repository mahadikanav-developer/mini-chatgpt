import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/IGTVCard.css";

const IGTVCard = ({ video, onAction, isSelected }) => {
  const [isPlaying, setIsPlaying] = useState(isSelected);
  const [likes, setLikes] = useState(video.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(video.comments?.length || 0);
  const videoRef = useRef(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (isSelected && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      recordView();
    }
  }, [isSelected]);

  useEffect(() => {
    setIsLiked(video.likes?.includes(userId) || false);
  }, [video, userId]);

  const recordView = async () => {
    try {
      await axios.post(
        `/api/igtv/${video._id}/view`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onAction("view", video._id);
    } catch (err) {
      console.error("Error recording view:", err);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(
        `/api/igtv/${video._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (!isLiked) {
        setLikes(likes + 1);
        setIsLiked(true);
      } else {
        setLikes(likes - 1);
        setIsLiked(false);
      }
      onAction("like", video._id);
    } catch (err) {
      console.error("Error liking video:", err);
    }
  };

  const handleComment = () => {
    const comment = prompt("Add a comment:");
    if (comment) {
      sendComment(comment);
    }
  };

  const sendComment = async (commentText) => {
    try {
      await axios.post(
        `/api/igtv/${video._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setComments(comments + 1);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handlePlayToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatViews = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  return (
    <div className={`igtv-card ${isSelected ? "selected" : ""}`}>
      {isSelected ? (
        <div className="video-player-large">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            controlsList="nodownload"
            className="video-large"
            onClick={handlePlayToggle}
          />
        </div>
      ) : (
        <div className="video-container">
          <video
            ref={videoRef}
            src={video.videoUrl}
            loop
            controls={false}
            onClick={handlePlayToggle}
            className="video"
          />
          {!isPlaying && (
            <div className="play-overlay">
              <span className="play-icon">▶</span>
            </div>
          )}
        </div>
      )}

      {isSelected && (
        <div className="video-details">
          {/* Title and Description */}
          <div className="title-section">
            <h2>{video.title}</h2>
            {video.description && <p className="description">{video.description}</p>}
          </div>

          {/* Creator Info */}
          <div className="creator-section">
            <img
              src={video.userId?.profileImage || ""}
              alt={video.userId?.name}
              className="creator-pic"
            />
            <div className="creator-info">
              <h4>{video.userId?.name}</h4>
              <p className="username">@{video.userId?.username}</p>
              <p className="follower-info">
                {video.userId?.followers?.length || 0} followers
              </p>
            </div>
            <button className="follow-btn">Follow</button>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">{formatViews(video.views?.length || 0)}</span>
              <span className="stat-label">Views</span>
            </div>
            <div className="stat">
              <span className="stat-value">{likes}</span>
              <span className="stat-label">Likes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{comments}</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className={`action-btn like-btn ${isLiked ? "active" : ""}`}
              onClick={handleLike}
            >
              <span className="icon">❤️</span> Like
            </button>
            <button className="action-btn comment-btn" onClick={handleComment}>
              <span className="icon">💬</span> Comment
            </button>
            <button className="action-btn share-btn">
              <span className="icon">📤</span> Share
            </button>
          </div>

          {/* Hashtags */}
          {video.hashtags && video.hashtags.length > 0 && (
            <div className="hashtags">
              {video.hashtags.map((tag, idx) => (
                <span key={idx} className="hashtag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IGTVCard;
