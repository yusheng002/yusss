const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.post('/proxy-kimi', async (req, res) => {
    const apiUrl = 'https://api.moonshot.cn/v1/chat/completions';
    const apiKey = 'sk-tMrqjOeGixfMCNmBfJOuo4AXR4m4kXsbA4XXoCfEQqGilamb';

    try {
        console.log('Received request:', req.body);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        console.log('Response from Kimi API:', data);
        res.json(data);
    } catch (error) {
        console.error('Error calling Kimi API:', error);
        res.status(500).json({ error: 'An error occurred while calling the Kimi API', details: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});