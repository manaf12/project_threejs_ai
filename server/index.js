import express from 'express';
import cors from 'cors';
import dalleRoutes from './routes/dalle.routes.js';

const app = express();

// Enhanced CORS for production
const corsOptions = {
  origin: [
    'https://project-threejs-ai-woad.vercel.app', 
   
  ],
  methods: ['POST', 'GET'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT =  8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});