marked.setOptions({
  breaks: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

let isGenerating = false;

function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}

function showTopic(topic) {
  alert("Showing chats for " + topic);
}

async function sendMessage() {
  if (isGenerating) return;

  const userInput = document.getElementById('userInput');
  const message = userInput.value.trim();
  if (!message) return;

  isGenerating = true;
  userInput.disabled = true;
  document.querySelector('.send').innerHTML = '⌛';

  try {
    const userMessageElement = addMessage(message, 'user');
    userInput.value = '';

    userMessageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const aiMessage = addMessage('<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>', 'ai');
    const response = await generateAnswer(message);
    const content = response.choices ? response.choices[0].message.content : "I'm sorry, I couldn't understand that.";
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

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in generateAnswer:", error.message);
    throw error;
  }
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
  addMessage("Hello! I'm AB TECH ChatGPT. How can I help you today?", 'ai');
});
