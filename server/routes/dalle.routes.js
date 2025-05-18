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

    // Validate prompt
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    
    console.log("Sending request to OpenAI with prompt:", prompt);
    console.log("API Key configured:", process.env.OPENAI_API_KEY ? "Yes (key exists)" : "No (key missing)");
    
    // Using the new API syntax for image generation with more explicit parameters
    // Note: We're using dall-e-2 as it's more widely available
    const response = await openai.images.generate({
      model: "dall-e-2", // Explicitly specify the model
      prompt: prompt,
      n: 1,
      size: "1024x1024", // Make sure size is a valid option
      quality: "standard", // Add quality parameter
      response_format: "b64_json"
    });
    
    console.log("OpenAI API response received");

    // The response structure has changed in the new API
    const image = response.data[0].b64_json;

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error('DALL-E API Error details:', {
      message: error.message,
      type: error.type,
      param: error.param,
      code: error.code,
      status: error.status
    });
    
    // Enhanced error response with more details
    res.status(500).json({ 
      message: "Error generating image", 
      error: error.message,
      type: error.type || null,
      param: error.param || null,
      code: error.code || null,
      status: error.status || 500
    });
  }
});

export default router;
