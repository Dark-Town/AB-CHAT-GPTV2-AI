  const chatHistory = new Map();
        let currentConversationId = null;
        const MAX_HISTORY = 10;

        marked.setOptions({
            breaks: true,
            highlight: function(code) {
                return hljs.highlightAuto(code).value;
            }
        });

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
    let sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}




        function createNewConversation() {
            currentConversationId = Date.now().toString();
            chatHistory.set(currentConversationId, []);
            clearChatContainer();
            addInitialMessage(); 
            updateConversationList();
            toggleSidebar();
        }

        
        function updateConversationList() {
            const list = document.getElementById('conversationList');
            list.innerHTML = Array.from(chatHistory.entries()).map(([id, messages]) => `
                <div class="conversation-item" onclick="loadConversation('${id}')">
                    ${messages.length ? messages[0].content.substring(0, 30) + '...' : 'New Conversation'}
                    <small style="color: var(--text-secondary)">
                        ${new Date(parseInt(id)).toLocaleDateString()}
                    </small>
                </div>
            `).join('');
        }

        
        function loadConversation(conversationId) {
            currentConversationId = conversationId;
            const history = chatHistory.get(conversationId) || [];
            clearChatContainer();
            
            history.forEach(msg => {
                const message = createMessage(msg.content, msg.role);
                document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(message);
            });
            
            toggleSidebar();
            scrollToBottom();
        }

        function clearChatContainer() {
            document.getElementById('chatContainer').querySelector('.message-wrapper').innerHTML = '';
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

                const response = await generateAnswer(history);
                const content = response.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request.";
                const parsedContent = marked.parse(content);

                history.push({ role: 'assistant', content: content });

                loadingMessage.remove();
                const aiMessage = createMessage(parsedContent, 'ai');
                document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(aiMessage);
                addCopyButtons(aiMessage);
                scrollToBottom();

                updateConversationList();

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

        function addCopyButtons(container) {
            container.querySelectorAll('pre').forEach(pre => {
                const button = document.createElement('button');
                button.className = 'copy-btn';
                button.innerHTML = 'Copy';
                button.onclick = () => copyToClipboard(pre);
                pre.parentNode.insertBefore(button, pre.nextSibling);
            });
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
            addInitialMessage();
        });
