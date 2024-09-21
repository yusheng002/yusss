console.log('Script is running');

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM is loaded');
	
	const chatMessages = document.getElementById('chatMessages');
	const userInput = document.getElementById('userInput');
	const sendButton = document.getElementById('sendButton');

	sendButton.addEventListener('click', sendMessage);
	userInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	});

	async function sendMessage() {
		const message = userInput.value.trim();
		if (message) {
			addMessageToChat('user', message);
			userInput.value = '';
			document.getElementById('loadingIndicator').style.display = 'block';
			await callKimiAPI(message);
		}
	}

	function addMessageToChat(role, content) {
		const messageElement = document.createElement('div');
		messageElement.classList.add('message', role);
		messageElement.textContent = content;
		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	async function callKimiAPI(userMessage) {
		console.log('Calling Kimi API with message:', userMessage);
		const apiUrl = 'http://127.0.0.1:3000/proxy-kimi';
		const apiKey = 'sk-tMrqjOeGixfMCNmBfJOuo4AXR4m4kXsbA4XXoCfEQqGilamb';

		const requestBody = {
			"model": "moonshot-v1-8k",
			"messages": [
				{
					"role": "system",
					"content": "你是一个友好的AI助手，名叫Kimi。"
				},
				{
					"role": "user",
					"content": userMessage
				}
			]
		};

		try {
			console.log('Sending request to Kimi API');
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${apiKey}`
				},
				body: JSON.stringify(requestBody)
			});

			console.log('Received response from Kimi API:', response);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('API response not OK:', response.status, response.statusText, errorText);
				throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
			}

			const data = await response.json();
			console.log('Parsed response:', data);

			if (data.choices && data.choices[0] && data.choices[0].message) {
				const kimiResponse = data.choices[0].message.content;
				addMessageToChat('assistant', kimiResponse);
			} else {
				console.error('Unexpected API response format:', data);
				throw new Error('Unexpected API response format');
			}
		} catch (error) {
			console.error('调用Kimi API时出错:', error);
			console.error('错误详情:', error.message);
			
			if (error.message.includes('Failed to fetch')) {
				console.error('可能是由于CORS策略导致的错误。请确保服务器允许跨域请求。');
				addMessageToChat('assistant', '抱歉，由于技术原因无法连接到服务器。请检查网络连接或联系管理员。');
			} else {
				addMessageToChat('assistant', '抱歉，我遇到了一些问题。请稍后再试。');
			}
		} finally {
			document.getElementById('loadingIndicator').style.display = 'none';
		}
	}
});