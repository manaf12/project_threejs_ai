// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dalleRoutes from './routes/dalle.routes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Configure allowed origins for CORS
const allowedOrigins = [
  'https://project-threejs-ai-woad.vercel.app',
  // Add localhost for development
  'http://localhost:5173',
  'http://localhost:3000'
];

// Configure middleware
app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// Increase payload limit for image data
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/v1/dalle', dalleRoutes);

// Health check endpoint
app.get('/', (_req, res) => {
  res.status(200).json({ 
    message: 'Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
