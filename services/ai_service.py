import json
import os

# Load knowledge base
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/data.json")

with open(DATA_PATH, "r") as f:
    knowledge = json.load(f)


# 🔧 Normalize text
def normalize(text):
    return text.lower().strip()


# 🔍 Simple fuzzy match (fixes "yell" → "yellow")
def fuzzy_match(word, text):
    return word in text or text in word


# 🧠 Find best match from knowledge base
def find_match(user_input):
    user_input = normalize(user_input)

    best_score = 0
    best_answer = None

    words = user_input.split()

    for item in knowledge:
        symptom = normalize(item.get("symptom", ""))
        solution = item.get("solution", "")

        score = 0

        for w in words:
            if fuzzy_match(w, symptom):
                score += 1

        # prioritize better matches
        if score > best_score:
            best_score = score
            best_answer = solution

    return best_answer


# 🤖 Main AI function
def get_ai_response(message, history=None):
    message = normalize(message)

    # 🔥 1. Try knowledge base
    answer = find_match(message)

    if answer:
        return f"🌱 Advice: {answer}"

    # ⚡ 2. Basic intelligent fallback
    if "price" in message:
        return "💰 Market prices change daily. Check local mandi or marketplace section."

    if "weather" in message:
        return "🌦 Weather info coming soon. Please check your local forecast."

    if "fertilizer" in message:
        return "🧪 Use balanced NPK fertilizer. Exact type depends on crop."

    # 🧠 3. Smart generic fallback
    return (
        "🤖 I’m not fully sure yet.\n"
        "Try asking like:\n"
        "- 'tomato leaves turning yellow'\n"
        "- 'wheat pest problem'\n"
        "- 'best fertilizer for rice'"
    )