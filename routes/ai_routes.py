from flask import Blueprint, request, jsonify
from services.ai_service import get_ai_response

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/chat", methods=["GET", "POST"])
def chat():
    # 👉 Handle GET (browser test)
    if request.method == "GET":
        return "✅ AI server is running. Use POST to chat."

    # 👉 Handle POST (real AI)
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"reply": "Message is required"}), 400

    reply = get_ai_response(message)

    return jsonify({"reply": reply})