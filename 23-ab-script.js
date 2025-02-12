marked.setOptions({
  breaks: true,
  highlight: function(code) {
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
  document.querySelector('.send').innerHTML = '⌛';

  try {
    addMessage(message, 'user');
    userInput.value = '';
    const aiMessage = addMessage('<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>', 'ai');
    const response = await generateAnswer(message);
    const content = response.BK9 || "I'm sorry, I couldn't understand that.";
    const parsedContent = marked.parse(content);
    aiMessage.innerHTML = parsedContent;
    

    aiMessage.querySelectorAll('pre, code').forEach(element => {
      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.innerHTML = '📋';
      button.onclick = () => copyToClipboard(element);
      element.parentNode.insertBefore(button, element.nextSibling);
    });
  } catch (error) {
    console.error(error);
    addMessage("Sorry, I'm having trouble responding. Please try again.", 'ai');
  } finally {
    isGenerating = false;
    userInput.disabled = false;
    document.querySelector('.send').innerHTML = '→';
    userInput.focus();
  }
}

function addMessage(content, type = 'ai') {
            const container = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            
            const avatarUrl = type === 'user' 
                ? 'https://th.bing.com/th/id/R.2cbc8fc3225622d3df650827dbb2aaa1?rik=1uznuS7Go970pA&pid=ImgRaw&r=0'
                : 'https://i.ibb.co/VVdrZLm/502d5d69-6535-4092-be10-cb1b81514b46.jpg';

            messageDiv.innerHTML = `
                <img class="avatar" src="${avatarUrl}" alt="${type} avatar">
                <div class="message-content">${content}</div>
            `;
            
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
            return messageDiv.querySelector('.message-content');
        }

async function generateAnswer(question) {
  const proxyUrl = "https://broken-star-6439.abrahamdw882.workers.dev/?u=";
  const apiUrl = `https://bk9.fun/ai/llama?q=${encodeURIComponent(question)}`;
  
  const response = await fetch(`${proxyUrl}${encodeURIComponent(apiUrl)}`);
  if (!response.ok) throw new Error('API request failed');
  return await response.json();
}

function copyToClipboard(element) {
  const text = element.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = element.nextElementSibling;
    btn.textContent = '✔️';
    setTimeout(() => btn.textContent = '📋', 2000);
  });
}

document.getElementById('userInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
document.addEventListener('DOMContentLoaded', () => {
  addMessage("Hello! I'm AB TECH Chatgpt. How can I help you today?", 'ai');
});
