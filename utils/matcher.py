def find_best_match(user_input, data):
    user_input = user_input.lower()

    for item in data:
        if item["symptom"] in user_input:
            return item["solution"]

    return None