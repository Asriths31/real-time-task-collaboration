const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const routes = require('./routes');
const dns = require('dns');  // or 'node:dns' if using ESM/modules
dns.setServers(['1.1.1.1', '1.0.0.1']);  // Cloudflare – very reliable for SRV
// Alternative: Google's ['8.8.8.8', '8.8.4.4']
        console.log('MongoDB STring',process.env.MONGODB_URI);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
}); 

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_board', (boardId) => {
    socket.join(`board_${boardId}`);
    console.log(`Socket ${socket.id} joined board ${boardId}`);
  });

  socket.on('leave_board', (boardId) => {
    socket.leave(`board_${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
