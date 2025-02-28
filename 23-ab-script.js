const proxyUrl = "https://broken-star-6439.abrahamdw882.workers.dev/?u=";
let currentImageBlob = null;

function openImageGenerator() {
    document.getElementById("confirmationModal").style.display = "flex";
}

function proceedToGenerate() {
    closeConfirmation();
    document.getElementById("imageModal").style.display = "flex";
    document.getElementById("promptInput").focus();
}

function closeConfirmation() {
    document.getElementById("confirmationModal").style.display = "none";
}


async function generateImage() {
    const prompt = document.getElementById("promptInput").value;
    const generateButton = document.getElementById("generateButton");
    const loader = document.getElementById("loader");
    const generatedImage = document.getElementById("generatedImage");
    const downloadButton = document.getElementById("downloadButton");
    const error = document.getElementById("error");

    generatedImage.style.display = "none";
    downloadButton.style.display = "none";
    error.style.display = "none";
    error.innerText = "";
    currentImageBlob = null;

    if (!prompt) {
        error.style.display = "block";
        error.innerText = "Please enter a prompt.";
        return;
    }

    generateButton.disabled = true;
    loader.style.display = "block";

    try {
        const apiUrl = `https://bk9.fun/ai/magicstudio?prompt=${encodeURIComponent(prompt)}`;
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));

        if (!response.ok) throw new Error(`API request failed (${response.status})`);
        
        currentImageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(currentImageBlob);
        
        generatedImage.src = imageUrl;
        generatedImage.style.display = "block";
        downloadButton.style.display = "block";
    } catch (err) {
        error.style.display = "block";
        error.innerText = "Failed to generate image. Please try again.";
    } finally {
        generateButton.disabled = false;
        loader.style.display = "none";
    }
}

function downloadImage() {
    if (!currentImageBlob) return;
    const link = document.createElement("a");
    link.download = "generated-image.png";
    link.href = URL.createObjectURL(currentImageBlob);
    link.click();
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
    currentImageBlob = null;
}
document.getElementById("promptInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") generateImage();
});






const chatHistory = new Map();
let currentConversationId = null;
const MAX_HISTORY = 10;

marked.setOptions({
    breaks: true,
    highlight: function(code) {
        return hljs.highlightAuto(code).value;
    }
});

function saveChatHistory() {
    const historyArray = Array.from(chatHistory.entries());
    localStorage.setItem('chatHistory', JSON.stringify(historyArray));
}


function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        const historyArray = JSON.parse(savedHistory);
        historyArray.forEach(([id, messages]) => {
            chatHistory.set(id, messages);
        });
    }
}


function saveConversationList() {
    const conversationList = Array.from(chatHistory.keys());
    localStorage.setItem('conversationList', JSON.stringify(conversationList));
}


function loadConversationList() {
    const savedConversationList = localStorage.getItem('conversationList');
    if (savedConversationList) {
        const conversationList = JSON.parse(savedConversationList);
        conversationList.forEach(id => {
            if (!chatHistory.has(id)) {
                chatHistory.set(id, []); 
            }
        });
    }
}

function addInitialMessage() {
    const initialMessage = `
        <div class="message ai">
            <div class="message-content">
                <br> <br>
                Hello! I'm AB AI Assistant. How can I help you today? 😊
                <br><br>
                <small style="color: var(--text-secondary)">
                    I can help with programming, research, and general knowledge.
                </small>
            </div>
        </div>
    `;
    document.getElementById('chatContainer').querySelector('.message-wrapper').innerHTML = initialMessage;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.classList.remove('has-new-message');
}

function createNewConversation() {
    currentConversationId = Date.now().toString();
    chatHistory.set(currentConversationId, []);
    clearChatContainer();
    addInitialMessage();
    updateConversationList();
    document.getElementById('conversationList').style.display = 'block';
    saveChatHistory();
    saveConversationList();

    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('active');



    document.getElementById('userInput').focus();

}

function updateConversationList() {
    const list = document.getElementById('conversationList');
    list.innerHTML = Array.from(chatHistory.entries()).map(([id, messages]) => `
        <div class="conversation-item" data-id="${id}">
            <div onclick="loadConversation('${id}')">
                ${messages.length ? messages[0].content.substring(0, 30) + '...' : 'New Conversation'}
                <small style="color: var(--text-secondary)">
                    ${new Date(parseInt(id)).toLocaleDateString()}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteConversation('${id}')">✕</button>
        </div>
    `).join('');
    saveConversationList();
}

function loadConversation(conversationId) {
    currentConversationId = conversationId;
    const history = chatHistory.get(conversationId) || [];
    clearChatContainer();
    
    history.forEach(msg => {
        const message = createMessage(msg.content, msg.role);
        document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(message);
    });
    
    scrollToBottom();
}

function clearChatContainer() {
    const messageWrapper = document.getElementById('chatContainer').querySelector('.message-wrapper');
    messageWrapper.innerHTML = ''; 
}

function deleteConversation(conversationId) {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    chatHistory.delete(conversationId);
    saveChatHistory();
    saveConversationList();

    if (currentConversationId === conversationId) {
        currentConversationId = null;
        clearChatContainer();
        addInitialMessage();
    }

    updateConversationList();
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('conversationList');
        window.location.href = '#';
    }
}

let isGenerating = false;

async function sendMessage() {
    if (isGenerating) return;

    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message) return;

    if (!currentConversationId) {
        createNewConversation();
    }

    isGenerating = true;
    userInput.disabled = true;
    document.querySelector('.send').style.color = '#3b82f6';

    try {
        const history = chatHistory.get(currentConversationId);
        history.push({ role: 'user', content: message });

        while (history.length > MAX_HISTORY) {
            history.shift();
        }

        const userMessage = createMessage(message, 'user');
        document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(userMessage);

        const loadingMessage = createLoadingIndicator();
        document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(loadingMessage);
        scrollToBottom();

        userInput.value = '';

        const menuToggle = document.querySelector('.menu-toggle');
        menuToggle.classList.add('has-new-message');

        const response = await generateAnswer(history);
        const content = response.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request.";
        const parsedContent = marked.parse(content);

        history.push({ role: 'assistant', content: content });

        loadingMessage.remove();
        const aiMessage = createMessage(parsedContent, 'ai');
        document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(aiMessage);
        aiMessage.querySelectorAll('pre, code').forEach(element => {
            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.innerHTML = '📋';
            button.onclick = () => copyToClipboard(element);
            element.parentNode.insertBefore(button, element.nextSibling);
        });
        scrollToBottom();

        updateConversationList();
        saveChatHistory();

    } catch (error) {
        console.error(error);
        const errorMessage = createMessage("Sorry, I'm experiencing technical difficulties. Please try again.", 'ai');
        document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(errorMessage);
        scrollToBottom();
    } finally {
        isGenerating = false;
        userInput.disabled = false;
        document.querySelector('.send').style.color = '';
        userInput.focus();
    }
}


function createMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    return messageDiv;
}

function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    return loadingDiv;
}

async function generateAnswer(history) {
    const apiUrl = "https://api.mistral.ai/v1/agents/completions";
    const apiKey = "PB1YjvrlGDByR0ZME7ir4zNL69cw2JXS";

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
        agent_id: "ag:d5560f88:20250218:untitled-agent:b2fe32d6",
        messages: history
    });

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: body,
    });

    if (!response.ok) throw new Error('API request failed');
    return await response.json();
}


function copyToClipboard(element) {
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = element.nextElementSibling;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    });
}

function scrollToBottom() {
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;
}

document.getElementById('userInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory(); 
    loadConversationList(); 
    updateConversationList();

    if (chatHistory.size > 0) {
      const lastConversationId = Array.from(chatHistory.keys())[chatHistory.size - 1];
        currentConversationId = lastConversationId; 
        loadConversation(lastConversationId); 
    } else {
        addInitialMessage();
    }
});
