// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dalleRoutes from './routes/dalle.routes.js';

dotenv.config();

const app = express();
const allowedOrigins = [
  'https://project-threejs-ai-woad.vercel.app',
];

app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/dalle', dalleRoutes);
app.get('/', (_req, res) => res.json({ message: 'Server is running' }));

const PORT =  8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
