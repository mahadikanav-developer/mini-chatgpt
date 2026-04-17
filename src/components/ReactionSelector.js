import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/ReactionSelector.css";

const ReactionSelector = ({ postId, onReact, currentReaction }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const selectorRef = useRef(null);

  const reactions = [
    { type: "like", emoji: "👍", label: "Like", color: "#0a66c2" },
    { type: "love", emoji: "❤️", label: "Love", color: "#e74c3c" },
    { type: "haha", emoji: "😂", label: "Haha", color: "#f39c12" },
    { type: "wow", emoji: "😮", label: "Wow", color: "#f1c40f" },
    { type: "sad", emoji: "😢", label: "Sad", color: "#95a5a6" },
    { type: "angry", emoji: "😠", label: "Angry", color: "#e67e22" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReaction = async (reactionType) => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/reactions/${postId}/react`,
        { type: reactionType },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onReact(reactionType);
      setShowReactions(false);
    } catch (err) {
      console.error("Error reacting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentReactionData = reactions.find((r) => r.type === currentReaction);

  return (
    <div className="reaction-selector" ref={selectorRef}>
      {/* Main Button */}
      {currentReaction ? (
        <button
          className="reaction-button active"
          onClick={() => setShowReactions(!showReactions)}
          disabled={isLoading}
          title={currentReactionData?.label || "React"}
        >
          <span className="emoji">{currentReactionData?.emoji}</span>
          <span className="label">{currentReactionData?.label}</span>
        </button>
      ) : (
        <button
          className="reaction-button"
          onClick={() => setShowReactions(!showReactions)}
          disabled={isLoading}
          title="React to this post"
        >
          <span className="emoji">👍</span>
          <span className="label">Like</span>
        </button>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className="reaction-picker">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              className={`reaction-option ${
                currentReaction === reaction.type ? "selected" : ""
              }`}
              onClick={() => handleReaction(reaction.type)}
              disabled={isLoading}
              title={reaction.label}
              style={
                currentReaction === reaction.type
                  ? { backgroundColor: reaction.color, opacity: 0.2 }
                  : {}
              }
            >
              <span className="reaction-emoji">{reaction.emoji}</span>
              <span className="reaction-label">{reaction.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionSelector;
