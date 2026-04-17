import { useState, useRef } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { extractMentions } from "../utils/textParser";

const CreatePost = ({ user, onPostCreated }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [type, setType] = useState("update");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only image files allowed (JPG, PNG, GIF, WebP)", "error");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be less than 10MB", "error");
      return;
    }

    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "post");

      const res = await api.post("/uploads/posts/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      showToast("Image uploaded!", "success");
      // Backend now returns full URL
      return res.data.image;
    } catch (err) {
      console.error("Image upload error:", err);
      showToast("Failed to upload image", "error");
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !image) {
      showToast("Please write something or add an image to post", "warning");
      return;
    }

    if (type === "market" && (!price || !unit || !location)) {
      showToast("Enter price, unit, and location for marketplace posts", "warning");
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = null;

      // Upload image if selected
      if (image && !imageUploading) {
        uploadedImageUrl = await uploadImage(image);
      }

      const res = await api.post("/posts", {
        userId: user._id,
        type,
        text,
        image: uploadedImageUrl,
        price: type === "market" ? Number(price) : undefined,
        unit: type === "market" ? unit : undefined,
        location: type === "market" ? location : undefined,
        contact: type === "market" ? contact : undefined
      });

      // Send mention notifications
      const mentions = extractMentions(text);
      if (mentions.length > 0) {
        for (const mentionedUser of mentions) {
          // Search for user by username pattern
          try {
            const userRes = await api.get(`/users?search=${mentionedUser}`);
            const foundUser = userRes.data?.find(u => u.name?.toLowerCase().includes(mentionedUser) || u.username?.toLowerCase() === mentionedUser);
            if (foundUser && foundUser._id !== user._id) {
              await api.post(`/notifications`, {
                recipientId: foundUser._id,
                senderId: user._id,
                type: "mention",
                text: `${user.name} mentioned you in a post`,
                postId: res.data?.post?._id
              }).catch(err => console.log("Mention notification error:", err));
            }
          } catch (err) {
            console.log("Error finding mentioned user:", err);
          }
        }
      }

      setText("");
      setImage(null);
      setImagePreview(null);
      setPrice("");
      setUnit("");
      setLocation("");
      setContact("");
      showToast("Post created successfully! 🌾", "success");
      
      // Notify parent component to refresh if callback provided
      if (onPostCreated) onPostCreated();

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to create post", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.createPostContainer} data-create-post>
      <form onSubmit={handleSubmit} style={styles.form} data-create-post-form>
        <div style={styles.formHeader} data-form-header>
          <div style={styles.userAvatar}>👨‍🌾</div>
          <div style={styles.userNameSmall}>{user?.name || "You"}</div>
        </div>

        <textarea
          placeholder={type === "market" ? "What are you selling today?" : "Share your farm update..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
          data-textarea
        />

        {/* Image Upload Section */}
        <div style={styles.imageSection}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: "none" }}
            disabled={imageUploading}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading || loading}
            style={{...styles.imageUploadBtn, opacity: imageUploading ? 0.6 : 1}}
            data-image-btn
          >
            {imageUploading ? "📸 Uploading..." : "📸 Add Photo"}
          </button>

          {/* Image Preview */}
          {imagePreview && (
            <div style={styles.imagePreview}>
              <img src={imagePreview} alt="preview" style={styles.previewImage} />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                style={styles.removeImageBtn}
                data-remove-image-btn
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div style={styles.typeSelector} data-type-selector>
          <label style={styles.typeLabel} data-type-label>
            <input type="radio" value="update" checked={type === "update"} onChange={(e) => setType(e.target.value)} />
            📋 Update
          </label>
          <label style={styles.typeLabel} data-type-label>
            <input type="radio" value="tip" checked={type === "tip"} onChange={(e) => setType(e.target.value)} />
            💡 Tip
          </label>
          <label style={styles.typeLabel} data-type-label>
            <input type="radio" value="question" checked={type === "question"} onChange={(e) => setType(e.target.value)} />
            ❓ Question
          </label>
          <label style={styles.typeLabel} data-type-label>
            <input type="radio" value="market" checked={type === "market"} onChange={(e) => setType(e.target.value)} />
            🛒 Marketplace
          </label>
        </div>

        {type === "market" && (
          <div style={styles.marketInputs}>
            <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
            <input placeholder="Unit (kg, ton, pack)" value={unit} onChange={(e) => setUnit(e.target.value)} style={styles.input} />
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={styles.input} />
            <input placeholder="Contact (phone/email)" value={contact} onChange={(e) => setContact(e.target.value)} style={styles.input} />
          </div>
        )}

        <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }} data-post-btn>
          {loading ? "Posting..." : "Post 🌾"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  createPostContainer: {
    marginBottom: "16px"
  },
  form: {
    backgroundColor: "rgba(125, 231, 4, 0.93)",
    borderRadius: "14px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    border: "1px solid rgb(232, 232, 232)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #E8E8E8"
  },
  userAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FFF0F5, #FFE0ED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    boxShadow: "0 2px 8px rgba(255, 22, 84, 0.15)",
  },
  userNameSmall: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#111827"
  },
  textarea: {
    width: "92%",
    border: "1px solid #E8E8E8",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "none",
    minHeight: "90px",
    marginBottom: "12px",
    outline: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: "#F8F9FA",
  },
  typeSelector: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    flexWrap: "wrap"
  },
  typeLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#374151",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  marketInputs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "12px"
  },
  input: {
    border: "1px solid #E8E8E8",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "13px",
    outline: "none"
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #FF1654, #FF5B8A)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(255, 22, 84, 0.3)",
  },
  imageSection: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  imageUploadBtn: {
    padding: "10px 14px",
    background: "#F3F4F6",
    border: "2px dashed #D1D5DB",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  imagePreview: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    border: "1px solid #E5E7EB",
  },
  previewImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    display: "block"
  },
  removeImageBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  }
};

export default CreatePost;
