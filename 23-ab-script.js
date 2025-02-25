   marked.setOptions({
            breaks: true,
            highlight: function (code) {
                return hljs.highlightAuto(code).value;
            }
        });

        let isGenerating = false;

        async function sendMessage() {
            if (isGenerating) return;

            const userInput = document.getElementById('userInput');
            const message = userInput.value.trim();
            if (!message) return;

            isGenerating = true;
            userInput.disabled = true;
            document.querySelector('.send').style.color = '#3b82f6';

            try {
              
                const userMessage = createMessage(message, 'user');
                document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(userMessage);

               
                const loadingMessage = createLoadingIndicator();
                document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(loadingMessage);
                scrollToBottom();

                userInput.value = '';

                
                const response = await generateAnswer(message);
                const content = response.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request.";
                const parsedContent = marked.parse(content);

               
                loadingMessage.remove();
                const aiMessage = createMessage(parsedContent, 'ai');
                document.getElementById('chatContainer').querySelector('.message-wrapper').appendChild(aiMessage);
                addCopyButtons(aiMessage);
                scrollToBottom();

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

        async function generateAnswer(question) {
            const apiUrl = "https://api.mistral.ai/v1/agents/completions";
            const apiKey = "PB1YjvrlGDByR0ZME7ir4zNL69cw2JXS";

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            };

            const body = JSON.stringify({
                agent_id: "ag:d5560f88:20250218:untitled-agent:b2fe32d6",
                messages: [{ role: "user", content: question }],
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

        scrollToBottom();
