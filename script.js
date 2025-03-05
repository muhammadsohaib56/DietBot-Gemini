document.addEventListener("DOMContentLoaded", () => {
    // Initialize conversation history
    let history = [];

    // Initialize theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        updateThemeButtons("dark");
    }

    // Theme button handlers
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const theme = btn.getAttribute("data-theme");
            document.body.classList.toggle("dark-mode", theme === "dark");
            localStorage.setItem("theme", theme);
            updateThemeButtons(theme);
        });
    });

    // Color swatch handlers
    document.querySelectorAll(".swatch").forEach(swatch => {
        swatch.addEventListener("click", () => {
            const color = swatch.getAttribute("data-color");
            const parent = swatch.closest(".color-options");
            parent.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
            swatch.classList.add("selected");

            if (parent.querySelector("label").textContent === "Accent color") {
                document.body.style.setProperty("--accent-color", color === "gradient" ? "#28a745" : color);
            } else {
                document.body.style.setProperty("--bot-message-color", color === "gradient" ? "#e9ecef" : color);
            }
        });
    });

    // Chat send handlers
    document.getElementById("send-btn").addEventListener("click", sendMessage);
    document.getElementById("user-input").addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const userInput = document.getElementById("user-input");
        const message = userInput.value.trim();
        if (!message) return;

        // Display the user's message in the chat
        appendMessage("user", message);
        userInput.value = "";

        // Prepare data to send: current history and the new message
        const dataToSend = {
            history: history,
            message: message
        };

        // Send the request to the server
        fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        })
        .then(response => response.json())
        .then(data => {
            const responseText = data.response;
            // Display the bot's response in the chat
            appendMessage("bot", responseText);
            // Update the history with the user's message and the bot's response
            history.push({ role: "user", parts: [message] });
            history.push({ role: "model", parts: [responseText] });
        })
        .catch(error => {
            console.error("Error:", error);
            appendMessage("bot", "Sorry, something went wrong.");
        });
    }

    function appendMessage(sender, text) {
        const chatBox = document.getElementById("chat-box");
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        const content = sender === "bot" ? marked.parse(text) : `<p>${text}</p>`;
        messageDiv.innerHTML = `<div class="message-bubble">${content}</div>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function updateThemeButtons(theme) {
        document.querySelectorAll(".theme-btn").forEach(btn => {
            btn.classList.toggle("selected", btn.getAttribute("data-theme") === theme);
        });
    }
});