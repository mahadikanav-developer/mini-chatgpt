import { useState } from "react";
import api from "../services/api";

const StoryCreate = ({ onStoryCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  const bgGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    if (!text.trim() && !image) return;

    setLoading(true);
    try {
      await api.post("/stories", {
        userId: currentUser._id,
        text,
        image: image || "",
        bgColor,
        textColor,
      });

      setText("");
      setImage(null);
      setImagePreview(null);
      setShowForm(false);
      if (onStoryCreated) onStoryCreated();
    } catch (err) {
      console.log("Error creating story:", err);
    }
    setLoading(false);
  };

  if (!showForm) {
    return (
      <div>
        <div style={styles.storyCircle}>
          <div style={styles.storyContent}>
            <div style={styles.avatar}>👨‍🌾</div>
            <div style={styles.plusIcon} onClick={() => setShowForm(true)}>➕</div>
          </div>
        </div>
        <div style={styles.label}>Your Story</div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div style={styles.overlay} onClick={() => setShowForm(false)} />

      {/* Modal */}
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>Create Story</h3>
            <button
              style={styles.closeBtn}
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          {/* Story Preview */}
          <div style={styles.previewContainer}>
            <div
              style={{
                ...styles.storyPreview,
                background: imagePreview ? `url(${imagePreview}) center/cover` : bgColor,
              }}
            >
              <p style={{ ...styles.previewText, color: textColor }}>
                {text || "Your story preview"}
              </p>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening on your farm?"
            style={styles.textarea}
            autoFocus
          />

          {/* Color Picker */}
          <div style={styles.colorSection}>
            <label style={styles.sectionLabel}>🎨 Text Color:</label>
            <div style={styles.colorPicker}>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                style={styles.colorInput}
              />
              <span style={styles.colorValue}>{textColor}</span>
            </div>
          </div>

          {/* Gradient Selector */}
          <div style={styles.colorSection}>
            <label style={styles.sectionLabel}>🌈 Background:</label>
            <div style={styles.gradientGrid}>
              {bgGradients.map((gradient, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setBgColor(gradient);
                    setImagePreview(null);
                    setImage(null);
                  }}
                  style={{
                    ...styles.gradientBox,
                    background: gradient,
                    border: bgColor === gradient && !imagePreview ? "3px solid #fff" : "2px solid #ddd",
                    boxShadow: bgColor === gradient && !imagePreview ? "0 0 0 2px #3b82f6" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div style={styles.colorSection}>
            <label style={styles.sectionLabel}>📸 Upload Image:</label>
            <label style={styles.uploadLabel}>
              <input
                type="file"
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              <span style={styles.uploadBtn}>Choose Image</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                setShowForm(false);
                setText("");
                setImage(null);
                setImagePreview(null);
              }}
            >
              Cancel
            </button>
            <button
              style={styles.submitBtn}
              onClick={handleCreateStory}
              disabled={loading || (!text.trim() && !image)}
            >
              {loading ? "Posting..." : "Post Story"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  storyCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "2px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s",
  },
  storyContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatar: {
    fontSize: "48px",
  },
  plusIcon: {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    fontSize: "24px",
    backgroundColor: "#3b82f6",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: "12px",
    color: "#111827",
    textAlign: "center",
    fontWeight: "500",
    marginTop: "8px",
    maxWidth: "100px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    width: "90%",
    maxWidth: "500px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    marginBottom: "16px",
  },
  storyPreview: {
    width: "100%",
    aspectRatio: "9 / 16",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundPosition: "center",
    backgroundSize: "cover",
  },
  previewText: {
    fontSize: "18px",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: "1.4",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    margin: 0,
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "80px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "16px",
  },
  colorSection: {
    marginBottom: "16px",
  },
  sectionLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  colorPicker: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  colorInput: {
    width: "50px",
    height: "40px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    cursor: "pointer",
  },
  colorValue: {
    fontSize: "13px",
    color: "#6b7280",
  },
  gradientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "8px",
  },
  gradientBox: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  uploadLabel: {
    display: "inline-block",
  },
  uploadBtn: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    transition: "all 0.2s",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    marginTop: "20px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#111827",
    fontSize: "14px",
  },
  submitBtn: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default StoryCreate;
