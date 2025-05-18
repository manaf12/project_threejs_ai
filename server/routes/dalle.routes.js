import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const router = express.Router();

// Initialize the OpenAI client with the new API syntax
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.route('/').get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Using the new API syntax for image generation
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });

    // The response structure has changed in the new API
    const image = response.data[0].b64_json;

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error('DALL-E API Error:', error);
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error.message 
    });
  }
});

export default router;
