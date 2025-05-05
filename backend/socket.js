const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const colors = require('colors');

const setupSocketIO = (server) => {
  // Configure logging colors if not already configured
  if (!colors.themes || !colors.themes.info) {
    colors.setTheme({
      info: 'cyan',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    });
  }

  const logInfo = (message) => console.log(`[SOCKET][INFO] ${message}`.info);
  const logSuccess = (message) => console.log(`[SOCKET][SUCCESS] ${message}`.success);
  const logWarning = (message) => console.log(`[SOCKET][WARNING] ${message}`.warning);
  const logError = (message) => console.error(`[SOCKET][ERROR] ${message}`.error);

  // Define allowed origins for socket.io based on environment
  let allowedOrigins;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  
  if (NODE_ENV === 'production') {
    // In production, use specific origins from environment variables
    allowedOrigins = [
      process.env.PROD_CLIENT_URL,
      process.env.SECONDARY_CLIENT_URL, // Optional secondary URL if needed
    ].filter(Boolean); // Remove any undefined values
  } else {
    // In development, allow localhost with different ports
    allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite default
      process.env.DEV_CLIENT_URL,
    ].filter(Boolean);
  }
  
  logInfo(`Socket.IO CORS allowed origins: ${allowedOrigins.join(', ')}`);
  
  // Create Socket.IO server with proper CORS config matching your Express setup
  const io = socketIO(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logWarning(`Socket origin ${origin} not allowed by CORS`);
          if (NODE_ENV === 'development') {
            // In development, allow all origins but log warnings
            callback(null, true);
          } else {
            // In production, enforce CORS restrictions
            callback(null, false, new Error('Not allowed by CORS'));
          }
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io', // Ensure the path matches the default expected by client
    serveClient: false, // Don't serve client files
    pingTimeout: 30000, // Increase timeouts for better stability
    pingInterval: 25000
  });
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        logWarning(`Socket connection attempt without token`);
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        logWarning(`Socket auth failed: User not found for ID ${decoded.userId}`);
        return next(new Error('Authentication error: User not found'));
      }
      
      // Add user info to socket
      socket.userId = user._id.toString();
      socket.user = {
        _id: user._id.toString(),
        username: user.username || user.name
      };
      
      logSuccess(`Socket auth successful for user: ${socket.userId}`);
      next();
    } catch (error) {
      logError(`Socket auth error: ${error.message}`);
      next(new Error(`Authentication error: ${error.message}`));
    }
  });
  
  // Track active users
  const activeUsers = new Map();
  
  // Handle main connection event
  io.on('connection', (socket) => {
    logInfo(`User connected: ${socket.userId}`);
    
    // Add user to active users map with connection time
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      connectedAt: new Date(),
      lastActivity: new Date()
    });
    
    // Join a room with the user's ID for targeted notifications
    socket.join(socket.userId);
    
    // Join session rooms if provided in connection data
    if (socket.handshake.auth.sessions && Array.isArray(socket.handshake.auth.sessions)) {
      socket.handshake.auth.sessions.forEach(sessionId => {
        if (sessionId) {
          socket.join(`session:${sessionId}`);
          logInfo(`User ${socket.userId} joined session room: session:${sessionId}`);
        }
      });
    }
    
    // Update last activity timestamp periodically
    socket.on('activity', () => {
      const userData = activeUsers.get(socket.userId);
      if (userData) {
        userData.lastActivity = new Date();
        activeUsers.set(socket.userId, userData);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logInfo(`User disconnected: ${socket.userId}`);
      activeUsers.delete(socket.userId);
      
      // Emit user offline status to relevant parties (if needed)
      io.emit('user:status', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date()
      });
    });
    
    // Join a specific session room (for when joining a session after initial connection)
    socket.on('join:session', (sessionId) => {
      if (sessionId) {
        socket.join(`session:${sessionId}`);
        logInfo(`User ${socket.userId} joined session room: session:${sessionId}`);
      }
    });
    
    // Leave a specific session room
    socket.on('leave:session', (sessionId) => {
      if (sessionId) {
        socket.leave(`session:${sessionId}`);
        logInfo(`User ${socket.userId} left session room: session:${sessionId}`);
      }
    });
    
    // Example: Send a welcome message to confirm connection is working
    socket.emit('notification', {
      _id: Date.now().toString(),
      title: 'Connected',
      message: 'You are now connected to real-time notifications',
      read: false,
      createdAt: new Date()
    });
    
    // Emit user online status
    io.emit('user:status', {
      userId: socket.userId,
      status: 'online',
      timestamp: new Date()
    });
  });
  
  // Add a diagnostic endpoint for the io object
  io.on('connection:diagnostic', (socket) => {
    logInfo('Diagnostic connection received');
    
    // Collect active rooms data
    const rooms = [];
    for (const [roomId, roomSet] of io.sockets.adapter.rooms.entries()) {
      // Skip socket ID rooms (these are private rooms for each socket)
      if (roomId.length !== 20 && !socket.id.includes(roomId)) {
        rooms.push({
          id: roomId,
          clients: Array.from(roomSet).length
        });
      }
    }
    
    socket.emit('diagnostic:result', {
      success: true,
      socketId: socket.id,
      activeUsers: Array.from(activeUsers.keys()),
      namespaces: Object.keys(io._nsps).map(nsp => ({
        name: nsp,
        clients: io.of(nsp).sockets.size
      })),
      rooms: rooms
    });
  });
  
  // Add utility method for broadcasting notifications
  io.notifyUser = (userId, notificationType, notificationData) => {
    if (!userId) {
      logWarning(`Attempted to notify user without providing userId`);
      return false;
    }
    
    try {
      io.to(userId).emit(notificationType, {
        ...notificationData,
        _id: notificationData._id || Date.now().toString(),
        createdAt: notificationData.createdAt || new Date(),
        read: false
      });
      logInfo(`Notification sent to user ${userId}: ${notificationType}`);
      return true;
    } catch (error) {
      logError(`Failed to send notification to user ${userId}: ${error.message}`);
      return false;
    }
  };
  
  // Add utility method for broadcasting to session rooms
  io.notifySession = (sessionId, eventType, eventData) => {
    if (!sessionId) {
      logWarning(`Attempted to notify session without providing sessionId`);
      return false;
    }
    
    try {
      io.to(`session:${sessionId}`).emit(eventType, {
        ...eventData,
        sessionId,
        timestamp: eventData.timestamp || new Date()
      });
      logInfo(`Event "${eventType}" broadcast to session ${sessionId}`);
      return true;
    } catch (error) {
      logError(`Failed to broadcast to session ${sessionId}: ${error.message}`);
      return false;
    }
  };
  
  // Heartbeat to detect disconnected clients
  setInterval(() => {
    const now = new Date();
    for (const [userId, userData] of activeUsers.entries()) {
      // If last activity was more than 2 minutes ago, check connection
      if ((now - userData.lastActivity) > 120000) {
        const socket = io.sockets.sockets.get(userData.socketId);
        if (!socket || !socket.connected) {
          logWarning(`Removing stale connection for user ${userId}`);
          activeUsers.delete(userId);
          
          // Emit user offline status
          io.emit('user:status', {
            userId: userId,
            status: 'offline',
            timestamp: new Date()
          });
        }
      }
    }
  }, 60000); // Run every minute
  
  return io;
};

module.exports = setupSocketIO;