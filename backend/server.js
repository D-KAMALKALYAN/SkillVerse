const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const {google} = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Import routes
const routes = {
  auth: require('./routes/authRoutes'),
  session: require('./routes/sessionRoutes'),
  user: require('./routes/userRoutes'),
  matching: require('./routes/matchRoutes'),
  notification: require('./routes/notificationRoutes'),
  points: require('./routes/pointRoutes'),
  review: require('./routes/reviewRoutes'),
  search: require('./routes/searchRoutes'),
  assessment: require('./routes/assessmentRoutes'),
  userStatus: require('./routes/userStatusRoutes'),
  profile: require('./routes/profileRoutes'),
  skill: require('./routes/skillRoutes')
};

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Configure environment
dotenv.config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 4000;

// Initialize the application
async function initializeApp() {
  try {
    console.log('Initializing application...');
    
    // Connect to database
    await connectDB();
    console.log('Database connected successfully');
    
    const app = express();
    
    // Middleware setup
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          "img-src": ["'self'", "data:", "https:"]
        }
      }
    }));
    app.use(compression());
    app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
    
    // CORS setup
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://skillverse-frontend.onrender.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
          callback(null, true);
        } else {
          console.log(`Origin ${origin} not allowed by CORS`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With' , , 'cache-control'],
      credentials: true
    }));
    
    // Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Setup file uploads
    const setupUploads = () => {
      const uploadDir = path.join(__dirname, 'uploads');
      const directories = [
        uploadDir,
        path.join(uploadDir, 'assessments'),
        path.join(uploadDir, 'submissions')
      ];
      
      directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
      
      return multer({
        storage: multer.diskStorage({
          destination: (req, file, cb) => {
            let dest = uploadDir;
            if (req.baseUrl.includes('assessments')) {
              dest = req.path === '/upload' 
                ? path.join(uploadDir, 'assessments')
                : path.join(uploadDir, 'submissions');
            }
            cb(null, dest);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
          }
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype === 'application/pdf') {
            cb(null, true);
          } else {
            cb(new Error('Only PDF files are allowed'), false);
          }
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB
      });
    };
    
    const upload = setupUploads();
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Setup Socket.IO
    const io = require('./socket')(server);
    app.set('io', io);
    app.set('upload', upload);
    
    // Google OAuth setup
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // API Routes
    app.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'MentorMatch API is running', 
        documentation: 'Access API endpoints at /api/auth, /api/sessions, etc.',
        healthCheck: '/health'
      });
    });
    
    // Add a health check endpoint that works in both environments
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'success', environment: NODE_ENV });
    });
    
    // For backward compatibility
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'success', environment: NODE_ENV });
    });
    
    // Google OAuth routes
    app.get('/auth', (req, res) => {
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
      });
      res.redirect(url);
    });
    
    app.get('/auth/google/callback', async (req, res) => {
      try {
        const {tokens} = await oauth2Client.getToken(req.query.code);
        console.log("Google OAuth authentication successful");
        res.send('Auth successful! Check console for refresh token.');
      } catch (error) {
        console.error(`Google OAuth error: ${error.message}`);
        res.status(500).send('Authentication failed');
      }
    });
    
    // Register API routes
    app.use('/api/auth', routes.auth);
    app.use('/api/sessions', routes.session);
    app.use('/api', routes.user);
    app.use('/api/skills', routes.skill);
    app.use('/api/points', routes.points);
    app.use('/api/matches', routes.matching);
    app.use('/api/notifications', routes.notification);
    app.use('/api/reviews', routes.review);
    app.use('/api/search', routes.search);
    app.use('/api/assessments', routes.assessment);
    app.use('/api/user-status', routes.userStatus);
    app.use('/api/profile', routes.profile);
    
    // Serve static files in production
    if (NODE_ENV === 'production') {
      const clientBuildPath = path.join(__dirname, '../client/build');
      
      if (fs.existsSync(clientBuildPath)) {
        app.use(express.static(clientBuildPath));
        app.get('*', (req, res) => {
          if (!req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
            res.sendFile(path.resolve(clientBuildPath, 'index.html'));
          } else {
            next();
          }
        });
      }
    }
    
    // Handle undefined routes
    app.use((req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: `API endpoint not found: ${req.originalUrl}`
        });
      }
      next();
    });
    
    // Error handling
    if (NODE_ENV !== 'production') {
      app.use(notFound);
    }
    
    app.use(errorHandler);
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      // Don't exit the process in production to maintain uptime
      if (NODE_ENV !== 'production') {
        server.close(() => process.exit(1));
      }
    });
    
    return server;
    
  } catch (error) {
    console.error(`Failed to initialize application: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
});

// Initialize the application
const server = initializeApp();

module.exports = { app: server, initializeApp };