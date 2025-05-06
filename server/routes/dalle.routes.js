// server/routes/dalle.routes.js
import express from 'express';
import { Configuration, OpenAIApi } from 'openai';

const router = express.Router();

// Constants
const MAX_PROMPT_LENGTH = 1000;
const IMAGE_COUNT       = 1;
const IMAGE_SIZE        = '1024x1024';
const MODEL             = 'dall-e-3';

// Initialize OpenAI REST client
if (!process.env.OPENAI_API_KEY) {
  console.error('🔴 Missing OPENAI_API_KEY!');
  process.exit(1);
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const client = new OpenAIApi(config);

// Health check
router.get('/', (_req, res) => {
  res.status(200).json({ message: 'Hello from DALL·E routes!' });
});

// Generate image
router.post('/', async (req, res) => {
  const { prompt } = req.body;
  console.log('📥  Prompt received:', prompt);

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt must be a non-empty string.' });
  }

  try {
    const imageResponse = await client.createImage({
      model: MODEL,
      prompt: prompt.slice(0, MAX_PROMPT_LENGTH),
      n: IMAGE_COUNT,
      size: IMAGE_SIZE,
      response_format: 'b64_json',
    });

    console.log('🧠 OpenAI createImage response data keys:', Object.keys(imageResponse.data));

    const imageData = imageResponse.data.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error('No image data returned by OpenAI.');
    }

    return res.status(200).json({ photo: imageData });

  } catch (err) {
    console.error('🔥 OpenAI Error:', err);
    // If OpenAI gave a structured error, use that; otherwise fall back
    const msg =
      err.response?.data?.error?.message ||
      err.message ||
      'Image generation failed.';
    return res.status(err.response?.status || 500).json({ error: msg });
  }
});

export default router;
