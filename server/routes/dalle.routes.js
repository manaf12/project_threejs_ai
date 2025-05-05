import express from 'express';
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi} from 'openai';

dotenv.config();

const router = express.Router();
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in environment variables');
}
const config = new Configuration({
  apiKey:"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",
});
const openai = new OpenAIApi(config);

router.route('/').get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" })
})

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.createImage({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });

    const image = response.data.data[0].b64_json;

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" })
  }
})

export default router;