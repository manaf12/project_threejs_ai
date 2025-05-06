// server/routes/dalle.routes.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Constants
const MAX_PROMPT_LENGTH = 1000;
const IMAGE_COUNT       = 1;
const IMAGE_SIZE        = '1024x1024';
const MODEL             = 'dall-e-3';

// Validate API key on startup
if (!process.env.OPENAI_API_KEY) {
  console.error('🔴 Missing OPENAI_API_KEY!');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper for sending errors
function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// Health check
router.get('/', (_req, res) => {
  res.status(200).json({ message: 'Hello from DALL·E routes!' });
});

// Generate image
router.post('/', async (req, res) => {
  const { prompt } = req.body;
  console.log('📥  Prompt received:', prompt);

  if (!prompt || typeof prompt !== 'string') {
    return sendError(res, 400, 'Prompt must be a non-empty string.');
  }

  try {
    const response = await openai.images.generate({
      model: MODEL,
      prompt: prompt.slice(0, MAX_PROMPT_LENGTH),
      n: IMAGE_COUNT,
      size: IMAGE_SIZE,
      response_format: 'b64_json',
    });

    console.log('🧠 OpenAI response OK');
    const imageData = response.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error('No image data returned by OpenAI.');
    }

    res.status(200).json({ photo: imageData });

  } catch (err) {
    console.error('🔥 OpenAI Error:', err);
    // Prefer the OpenAI message if available
    const msg = err.response?.data?.error?.message || err.message || 'Image generation failed.';
    return sendError(res, err.status || 500, msg);
  }
});

export default router;
