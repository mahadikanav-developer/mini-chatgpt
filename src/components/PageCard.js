import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/PageCard.css";

const PageCard = ({ page, isSelected, onFollow }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviews, setReviews] = useState(page.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, text: "" });
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setIsFollowing(page.followers?.includes(userId) || false);
  }, [page, userId]);

  const handleFollowToggle = () => {
    onFollow();
    setIsFollowing(!isFollowing);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/pages/${page._id}/review`,
        reviewData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setReviews([...reviews, response.data]);
      setReviewData({ rating: 5, text: "" });
      setShowReviewForm(false);
      alert("Review added successfully!");
    } catch (err) {
      console.error("Error adding review:", err);
      alert(err.response?.data?.message || "Failed to add review");
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  if (isSelected) {
    return (
      <div className="page-card-detailed">
        <div className="page-header">
          <div className="page-info">
            <h2>
              {page.name}
              {page.isVerified && <span className="verified-badge">✓</span>}
            </h2>
            <p className="category">{page.category}</p>
          </div>
          <button
            className={`follow-button ${isFollowing ? "following" : ""}`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        <div className="page-description">
          {page.description || "No description provided"}
        </div>

        {/* Stats */}
        <div className="page-stats">
          <div className="stat">
            <span className="label">Followers</span>
            <span className="value">{page.followers?.length || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Rating</span>
            <span className="value">
              ⭐ {averageRating}
              {reviews.length > 0 && <small>({reviews.length} reviews)</small>}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="contact-section">
          <h4>Contact</h4>
          {page.phone && (
            <p>
              📞 <a href={`tel:${page.phone}`}>{page.phone}</a>
            </p>
          )}
          {page.email && (
            <p>
              ✉️ <a href={`mailto:${page.email}`}>{page.email}</a>
            </p>
          )}
          {page.link && (
            <p>
              🔗 <a href={page.link} target="_blank" rel="noopener noreferrer">Visit Website</a>
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        {page.ctaButtons && page.ctaButtons.length > 0 && (
          <div className="cta-buttons">
            {page.ctaButtons.map((btn, idx) => (
              <a
                key={idx}
                href={btn.buttonLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                {btn.buttonAction}
              </a>
            ))}
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h4>Reviews</h4>
            <button
              className="add-review-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              + Add Review
            </button>
          </div>

          {showReviewForm && (
            <form className="review-form" onSubmit={handleAddReview}>
              <div className="form-group">
                <label>Rating</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, rating: parseInt(e.target.value) })
                  }
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                  <option value={3}>⭐⭐⭐ 3 Stars</option>
                  <option value={2}>⭐⭐ 2 Stars</option>
                  <option value={1}>⭐ 1 Star</option>
                </select>
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Write your review..."
                  value={reviewData.text}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, text: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Submit Review
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {reviews.slice(0, 5).map((review, idx) => (
              <div key={idx} className="review-item">
                <div className="review-header">
                  <img
                    src={review.userId?.profileImage || ""}
                    alt={review.userId?.name}
                    className="reviewer-pic"
                  />
                  <div className="reviewer-info">
                    <p className="reviewer-name">{review.userId?.name}</p>
                    <p className="review-rating">{"⭐".repeat(review.rating)}</p>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="page-card-header">
        <h3>
          {page.name}
          {page.isVerified && <span className="verified-badge">✓</span>}
        </h3>
        <span className="category-badge">{page.category}</span>
      </div>

      {page.description && (
        <p className="page-description-short">
          {page.description.substring(0, 80)}...
        </p>
      )}

      <div className="page-card-info">
        <span className="followers">👥 {page.followers?.length || 0}</span>
        <span className="rating">⭐ {averageRating}</span>
      </div>

      <button
        className={`follow-button-small ${isFollowing ? "following" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleFollowToggle();
        }}
      >
        {isFollowing ? "✓ Following" : "Follow"}
      </button>
    </div>
  );
};

export default PageCard;
