require('dotenv').config();
const http = require('http');
const app = require('./app');
const prisma = require('./src/config/db');
const { initSocket } = require('./socket/index');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    server.listen(PORT, () => {
      console.log(`🚀 UCRS Backend running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
