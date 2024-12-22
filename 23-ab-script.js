async function sendMessage() {
  const userMessage = document.getElementById('userMessage').value;
  if (userMessage.trim() !== '') {
    const chatArea = document.getElementById('chatArea');

    const noChatsMessage = document.getElementById('noChats');
    if (noChatsMessage) {
      noChatsMessage.remove();
    }

    const userContainer = document.createElement('div');
    userContainer.classList.add('message-container');
    const userAvatar = document.createElement('img');
    userAvatar.src = 'https://th.bing.com/th/id/R.2cbc8fc3225622d3df650827dbb2aaa1?rik=1uznuS7Go970pA&pid=ImgRaw&r=0';
    userAvatar.classList.add('avatar');
    const newUserMessage = document.createElement('div');
    newUserMessage.classList.add('message', 'user-message');
    newUserMessage.textContent = userMessage;
    userContainer.appendChild(userAvatar);
    userContainer.appendChild(newUserMessage);
    chatArea.appendChild(userContainer);

    document.getElementById('userMessage').value = '';

    const aiContainer = document.createElement('div');
    aiContainer.classList.add('ai-message-container');
    const aiAvatar = document.createElement('img');
    aiAvatar.src = 'https://i.ibb.co/VVdrZLm/502d5d69-6535-4092-be10-cb1b81514b46.jpg';
    aiAvatar.classList.add('avatar', 'ai-avatar');
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'ai-message');
    loadingMessage.textContent = "AI: Loading your answer...";
    const clipboardBtn = document.createElement('button');
    clipboardBtn.classList.add('clipboard-btn');
    clipboardBtn.innerHTML = '<i class="fas fa-clipboard"></i>';
    clipboardBtn.addEventListener('click', () => {
      const codeBlock = loadingMessage.querySelector('pre, code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          alert('Code copied to clipboard!');
        });
      } else {
        navigator.clipboard.writeText(loadingMessage.textContent.replace(/^AI: /, '')).then(() => {
          alert('Text copied to clipboard!');
        });
      }
    });

    aiContainer.appendChild(aiAvatar);
    aiContainer.appendChild(loadingMessage);
    chatArea.appendChild(aiContainer);

    chatArea.scrollTop = chatArea.scrollHeight;

    if (userMessage.toLowerCase().includes("who are you") || userMessage.toLowerCase().includes("who created you") || userMessage.toLowerCase().includes("who made you")) {
      setTimeout(() => {
        loadingMessage.textContent = "AI: I am an AI made by AB TECH";
        clipboardBtn.style.display = 'none';
      }, 2000);
    } else if (userMessage.toLowerCase().includes("time")) {
      const currentTime = new Date().toLocaleTimeString();
      loadingMessage.textContent = "AI: The current time is " + currentTime;
      clipboardBtn.style.display = 'none';
    } else {
      try {
        const response = await generateAnswer(userMessage);
        const aiResponse = response.result;

        const htmlResponse = marked.parse(aiResponse);

        loadingMessage.innerHTML = htmlResponse;

        const codeBlock = loadingMessage.querySelector('pre, code');
        if (codeBlock) {
          clipboardBtn.style.display = 'flex'; 
        } else {
          clipboardBtn.style.display = 'none'; 
        }

        loadingMessage.appendChild(clipboardBtn);
      } catch (error) {
        console.error(error);
        loadingMessage.textContent = "AI: BAKA ASK Sensible quetions!";
        clipboardBtn.style.display = 'none'; 
        loadingMessage.appendChild(clipboardBtn);
      }
    }

    chatArea.scrollTop = chatArea.scrollHeight;
  }
}

async function generateAnswer(question) {
  const proxyUrl = "https://broken-star-6439.abrahamdw882.workers.dev/?u=";
  const apiUrl = `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(question)}`;

  const response = await axios.get(`${proxyUrl}${encodeURIComponent(apiUrl)}`);

  return response.data;
}
