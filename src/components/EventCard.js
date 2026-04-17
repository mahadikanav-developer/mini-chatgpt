import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/EventCard.css";

const EventCard = ({ event, isSelected, onRSVP }) => {
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Check user's RSVP status
    if (event.attending?.includes(userId)) {
      setRsvpStatus("attending");
    } else if (event.interested?.includes(userId)) {
      setRsvpStatus("interested");
    } else if (event.notGoing?.includes(userId)) {
      setRsvpStatus("not-going");
    }
  }, [event, userId]);

  const handleRSVP = async (status) => {
    setIsLoading(true);
    try {
      onRSVP(event._id, status);
      setRsvpStatus(status);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isSelected) {
    const daysLeft = getDaysUntil(event.startDate);
    
    return (
      <div className="event-card-detailed">
        <div className="event-header">
          <div className="event-date-box">
            <span className="date-day">
              {new Date(event.startDate).getDate()}
            </span>
            <span className="date-month">
              {new Date(event.startDate).toLocaleDateString("en-US", {
                month: "short"
              })}
            </span>
          </div>

          <div className="event-title-section">
            <h2>{event.title}</h2>
            <p className="event-date">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </p>
            {daysLeft > 0 && (
              <p className="time-remaining">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </p>
            )}
          </div>

          <span className={`event-badge ${event.isOnline ? "online" : "offline"}`}>
            {event.isOnline ? "🌐 Online" : "📍 In-Person"}
          </span>
        </div>

        <div className="event-description">
          {event.description || "No description provided"}
        </div>

        {event.location && !event.isOnline && (
          <div className="event-location">
            <span className="icon">📍</span>
            <span>{event.location}</span>
          </div>
        )}

        {event.eventLink && event.isOnline && (
          <div className="event-link">
            <a href={event.eventLink} target="_blank" rel="noopener noreferrer">
              🔗 Join Event Online
            </a>
          </div>
        )}

        <div className="event-stats">
          <div className="stat">
            <span className="label">Attending</span>
            <span className="value">{event.attending?.length || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Interested</span>
            <span className="value">{event.interested?.length || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Not Going</span>
            <span className="value">{event.notGoing?.length || 0}</span>
          </div>
        </div>

        {event.category && (
          <p className="event-category">
            📂 <strong>Category:</strong> {event.category}
          </p>
        )}

        <div className="rsvp-buttons">
          <button
            className={`rsvp-btn attending ${rsvpStatus === "attending" ? "active" : ""}`}
            onClick={() => handleRSVP("attending")}
            disabled={isLoading}
          >
            ✓ Attending
          </button>
          <button
            className={`rsvp-btn interested ${rsvpStatus === "interested" ? "active" : ""}`}
            onClick={() => handleRSVP("interested")}
            disabled={isLoading}
          >
            ♡ Interested
          </button>
          <button
            className={`rsvp-btn not-going ${rsvpStatus === "not-going" ? "active" : ""}`}
            onClick={() => handleRSVP("not-going")}
            disabled={isLoading}
          >
            ✕ Not Going
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-card">
      <div className="event-card-date">
        <span className="day">{new Date(event.startDate).getDate()}</span>
        <span className="month">
          {new Date(event.startDate).toLocaleDateString("en-US", {
            month: "short"
          })}
        </span>
      </div>

      <div className="event-card-content">
        <h3>{event.title}</h3>
        
        <div className="event-card-location">
          {event.isOnline ? (
            <span>🌐 Online Event</span>
          ) : (
            <span>📍 {event.location || "Location TBA"}</span>
          )}
        </div>

        <div className="event-card-stats">
          <span>👥 {event.attending?.length || 0} attending</span>
          <span>♡ {event.interested?.length || 0} interested</span>
        </div>

        {rsvpStatus && (
          <span className={`rsvp-status ${rsvpStatus}`}>
            {rsvpStatus === "attending"
              ? "✓ You're attending"
              : rsvpStatus === "interested"
              ? "♡ You're interested"
              : "✕ Not going"}
          </span>
        )}
      </div>
    </div>
  );
};

export default EventCard;
