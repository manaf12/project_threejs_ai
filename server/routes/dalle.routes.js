import express from 'express';
import OpenAI from 'openai'; // Using v4+ SDK
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Validate API key on startup
if (!process.env.OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY missing in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.route('/').get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: "Invalid or missing prompt" });
    }

    // Call DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt.slice(0, 1000), // Truncate long prompts
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const image = response.data[0].b64_json;

    if (!image) {
      throw new Error("No image data received from OpenAI");
    }

    res.status(200).json({ photo: image });

  } catch (error) {
    console.error('🔥 OpenAI API Error:', {
      status: error.response?.status,
      error: error.response?.data?.error || error.message,
    });

    res.status(500).json({
      error: error.response?.data?.error?.message || "Image generation failed",
    });
  }
});

export default router;