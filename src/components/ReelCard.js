import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/ReelCard.css";

const ReelCard = ({ reel, onAction, isCurrent }) => {
  const [isPlaying, setIsPlaying] = useState(isCurrent);
  const [likes, setLikes] = useState(reel.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(reel.comments?.length || 0);
  const videoRef = useRef(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (isCurrent && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isCurrent]);

  useEffect(() => {
    setIsLiked(reel.likes?.includes(userId) || false);
  }, [reel, userId]);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `/api/reels/${reel._id}/like`,
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
      onAction("like", reel._id);
    } catch (err) {
      console.error("Error liking reel:", err);
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(
        `/api/reels/${reel._id}/share`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Reel shared!");
    } catch (err) {
      console.error("Error sharing reel:", err);
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
        `/api/reels/${reel._id}/comment`,
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

  return (
    <div className="reel-card">
      <div className="video-container">
        <video
          ref={videoRef}
          src={reel.videoUrl}
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

      {/* Video Info */}
      <div className="reel-info">
        <div className="user-info">
          <img
            src={reel.userId?.profileImage || ""}
            alt={reel.userId?.name}
            className="profile-pic"
          />
          <div className="user-details">
            <h4>{reel.userId?.name}</h4>
            <p>{reel.title}</p>
          </div>
        </div>

        {/* Music/Sound Info */}
        {reel.musicId && (
          <div className="music-info">
            <span>🎵 {reel.musicId.name}</span>
          </div>
        )}
      </div>

      {/* Engagement Sidebar */}
      <div className="engagement-sidebar">
        <div className="engagement-item">
          <button
            className={`action-btn like-btn ${isLiked ? "active" : ""}`}
            onClick={handleLike}
          >
            <span className="icon">❤️</span>
            <span className="count">{likes}</span>
          </button>
        </div>

        <div className="engagement-item">
          <button className="action-btn comment-btn" onClick={handleComment}>
            <span className="icon">💬</span>
            <span className="count">{comments}</span>
          </button>
        </div>

        <div className="engagement-item">
          <button className="action-btn share-btn" onClick={handleShare}>
            <span className="icon">📤</span>
          </button>
        </div>
      </div>

      {/* Hashtags */}
      {reel.hashtags && reel.hashtags.length > 0 && (
        <div className="hashtags">
          {reel.hashtags.map((tag, idx) => (
            <span key={idx} className="hashtag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReelCard;
