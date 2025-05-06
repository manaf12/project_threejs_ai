// server/routes/dalle.routes.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Constants
const MODEL_PRIMARY   = 'dall-e-3';
const MODEL_FALLBACK  = 'dall-e-2';
const MAX_PROMPT_LEN  = 1000;
const IMAGE_COUNT     = 1;
const IMAGE_SIZE      = '1024x1024';

if (!process.env.OPENAI_API_KEY) {
  console.error('🔴 Missing OPENAI_API_KEY!');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check
router.get('/', (_req, res) => {
  res.status(200).json({ message: 'DALL·E route is live!' });
});

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  console.log('📥  Prompt received:', prompt);

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt must be a non-empty string.' });
  }

  // Build request payload
  const payload = {
    model: MODEL_PRIMARY,
    prompt: prompt.slice(0, MAX_PROMPT_LEN),
    n: IMAGE_COUNT,
    size: IMAGE_SIZE,
    response_format: 'b64_json',
  };

  try {
    console.log('➡️ Calling OpenAI with payload:', payload);
    const response = await openai.images.generate(payload);
    console.log('🧠 Raw OpenAI response:', JSON.stringify(response, null, 2));

    const imageData = response.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error('No image data returned from OpenAI.');
    }

    return res.status(200).json({ photo: imageData });

  } catch (err) {
    console.error('🔥 OpenAI primary error:', err);

    // If it was a 400 invalid_request, try fallback model
    if (err.status === 400 && MODEL_FALLBACK) {
      try {
        console.log(`🔄 Retrying with fallback model ${MODEL_FALLBACK}`);
        payload.model = MODEL_FALLBACK;
        const fallbackResp = await openai.images.generate(payload);
        console.log('🧠 Fallback response:', JSON.stringify(fallbackResp, null, 2));

        const fallbackImg = fallbackResp.data?.[0]?.b64_json;
        if (!fallbackImg) throw new Error('Fallback returned no image');

        return res.status(200).json({ photo: fallbackImg });
      } catch (fallbackErr) {
        console.error('🔥 Fallback error:', fallbackErr);
        const msg = fallbackErr.message || 'Fallback image generation failed.';
        return res.status(fallbackErr.status || 500).json({ error: msg });
      }
    }

    // Otherwise surface the original error
    const message =
      err.response?.data?.error?.message ||
      err.message ||
      'Image generation failed.';
    return res.status(err.status || 500).json({ error: message });
  }
});

export default router;
