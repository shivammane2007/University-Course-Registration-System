const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Faculty can join a room based on their faculty ID
    socket.on('join_faculty_room', (facultyId) => {
      const roomName = `faculty_${facultyId}`;
      socket.join(roomName);
      console.log(`👨‍🏫 Faculty ${facultyId} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
