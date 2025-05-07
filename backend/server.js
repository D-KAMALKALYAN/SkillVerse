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
const colors = require('colors');
const morgan = require('morgan');
const compression = require('compression');

// Import routes
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const matchingRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pointsRoutes = require('./routes/pointRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const searchRoutes = require('./routes/searchRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const userStatusRoutes = require('./routes/userStatusRoutes');
const profileRoutes = require('./routes/profileRoutes');
const skillRoutes = require('./routes/skillRoutes'); // Import explicitly
const { errorHandler, notFound , AppError} = require('./middleware/errorHandler');

// Configure environment
dotenv.config();

// Set up environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 4000;

// Configure logging colors
colors.setTheme({
  info: 'cyan',
  success: 'green',
  warning: 'yellow',
  error: 'red'
});

const logInfo = (message) => console.log(`[INFO] ${message}`.info);
const logSuccess = (message) => console.log(`[SUCCESS] ${message}`.success);
const logWarning = (message) => console.log(`[WARNING] ${message}`.warning);
const logError = (message) => console.error(`[ERROR] ${message}`.error);

// Initialize the application
const initializeApp = async () => {
  try {
    logInfo('Initializing application...');
    
    // Connect to database
    await connectDB();
    logSuccess('Database connected successfully');
    
    const app = express();
    
    // Security middleware
    app.use(helmet());
    
    // Compress responses
    app.use(compression());
    
    // Request logging
    if (NODE_ENV === 'development') {
      app.use(morgan('dev'));
    } else {
      app.use(morgan('combined'));
    }
    
    // Define allowed origins for CORS
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://skillverse-frontend.onrender.com' // Add your production URL here
    ];
    
    // CORS configuration
    app.use(cors({
      origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          logWarning(`Origin ${origin} not allowed by CORS`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    }));
    
    // Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    const assessmentUploadsDir = path.join(uploadDir, 'assessments');
    const submissionUploadsDir = path.join(uploadDir, 'submissions');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    if (!fs.existsSync(assessmentUploadsDir)) {
      fs.mkdirSync(assessmentUploadsDir);
    }
    if (!fs.existsSync(submissionUploadsDir)) {
      fs.mkdirSync(submissionUploadsDir);
    }
    
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        // Determine correct destination based on file type
        if (req.baseUrl.includes('assessments') && req.path === '/upload') {
          cb(null, assessmentUploadsDir);
        } else if (req.baseUrl.includes('assessments') && req.path.includes('/submit')) {
          cb(null, submissionUploadsDir);
        } else {
          cb(null, uploadDir);
        }
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    
    // File filter to allow only PDFs
    const fileFilter = (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for assessments and submissions'), false);
      }
    };
    
    const upload = multer({ 
      storage: storage,
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
    });
    
    // Make uploads available statically (with proper security)
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Setup Socket.IO
    const setupSocketIO = require('./socket');
    const io = setupSocketIO(server);
    
    // Make io available to routes (for sending real-time notifications)
    app.set('io', io);
    
    // Providing upload middleware to be used in routes
    app.set('upload', upload);
    
    // Google OAuth setup
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    // API Routes
    app.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'MentorMatch API is running', 
        documentation: 'Access API endpoints at /api/auth, /api/sessions, etc.',
        healthCheck: '/health'
      });
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'success', environment: NODE_ENV });
    });
    
    // Google OAuth routes
    app.get('/auth', (req, res) => {
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });
      res.redirect(url);
    });
    
    app.get('/auth/google/callback', async (req, res) => {
      try {
        const {tokens} = await oauth2Client.getToken(req.query.code);
        logInfo("Google OAuth authentication successful");
        res.send('Auth successful! Check console for refresh token.');
      } catch (error) {
        logError(`Google OAuth error: ${error.message}`);
        res.status(500).send('Authentication failed');
      }
    });
    
    // Debug route to check socket.io status
    app.get('/api/socket-test', (req, res) => {
      const io = req.app.get('io');
      const connectedSockets = Array.from(io.sockets.sockets).map(socket => ({
        id: socket[0],
        handshake: {
          address: socket[1].handshake.address,
          time: socket[1].handshake.time,
          auth: socket[1].handshake.auth ? 'Present' : 'None',
          query: socket[1].handshake.query
        }
      }));
      
      res.json({
        status: 'Socket.IO is running',
        connectedClients: io.engine.clientsCount,
        socketDetails: connectedSockets,
        serverConfig: {
          path: io.path(),
          corsOrigin: process.env.CLIENT_URL || 'http://localhost:3000',
          port: PORT
        }
      });
    });
    
    // Check if all route modules export a valid Express router
    console.log('Checking route imports...');
    const routeModules = {
      'authRoutes': authRoutes,
      'sessionRoutes': sessionRoutes,
      'userRoutes': userRoutes, 
      'matchingRoutes': matchingRoutes,
      'notificationRoutes': notificationRoutes,
      'pointsRoutes': pointsRoutes,
      'reviewRoutes': reviewRoutes,
      'searchRoutes': searchRoutes,
      'assessmentRoutes': assessmentRoutes,
      'userStatusRoutes': userStatusRoutes,
      'profileRoutes': profileRoutes,
      'skillRoutes': skillRoutes
    };
    
    // Check all route modules before registering them
    for (const [name, module] of Object.entries(routeModules)) {
      if (!module || typeof module !== 'function') {
        logError(`Invalid route module: ${name} (${typeof module})`);
        throw new Error(`Route module '${name}' is not a valid Express router`);
      }
    }
    
    // Route registration - only if validation passes
    app.use('/api/auth', authRoutes);
    app.use('/api/sessions', sessionRoutes);
    app.use('/api', userRoutes);
    app.use('/api/skills', skillRoutes); // Use the imported module directly
    app.use('/api/points', pointsRoutes);
    app.use('/api/matches', matchingRoutes);
    app.use('/api/notifications', notificationRoutes); 
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/assessments', assessmentRoutes);
    app.use('/api/user-status', userStatusRoutes);
    app.use('/api/profile', profileRoutes);
    
    // Check error handler middleware
    if (typeof notFound !== 'function') {
      logError(`notFound is not a middleware function: ${typeof notFound}`);
      throw new Error('notFound handler is not properly defined');
    }
    
    if (typeof errorHandler !== 'function') {
      logError(`errorHandler is not a middleware function: ${typeof errorHandler}`);
      throw new Error('errorHandler is not properly defined');
    }
    
    // Handle undefined routes
    app.use(notFound);
    
    // Global error handler
    app.use((err, req, res, next) => {
      logError(`Error: ${err.message}`);
      next(err);
    });
    
    app.use(errorHandler);
    
    // Start server
    server.listen(PORT, () => {
      logSuccess(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logError(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
    
    return server;
    
  } catch (error) {
    logError(`Failed to initialize application: ${error.message}`);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logInfo('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      logInfo('HTTP server closed');
    });
  }
});

// Initialize the application
const server = initializeApp();

module.exports = { app: server, initializeApp }; // Export for testing