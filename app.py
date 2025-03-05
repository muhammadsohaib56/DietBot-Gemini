from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import google.generativeai as genai

app = Flask(__name__)

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Configure the generative model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Updated system instruction
system_instruction = (
    "You are a diet recommendation assistant named DietBot. "
    "Your role is to provide advice on diet, nutrition, and diet plans. "
    "You must only respond to questions related to these topics. "
    "Do not answer questions that are not related to diet or nutrition. "
    "Do not provide any code, technical explanations, or reasoning responses. "
    "If a user asks about something unrelated, politely redirect them to ask about diet-related topics."
)

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=system_instruction,
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    # Get JSON data from the request
    data = request.get_json()
    # Extract history (default to empty list if not provided) and the user's message
    history = data.get('history', [])
    user_message = data.get('message', '').strip()
    
    # Check if the message is empty or only whitespace
    if not user_message:
        return jsonify({'response': 'Please provide a question about diet or nutrition.'})
    
    # Handle model interaction with error catching
    try:
        # Start chat session with the provided history
        chat_session = model.start_chat(history=history)
        # Send the new user message and get the response
        response = chat_session.send_message(user_message)
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'response': 'Sorry, I encountered an error. Please try again later.'})

if __name__ == '__main__':
    app.run(debug=True)