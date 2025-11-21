const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { connectDB } = require('./config/db'); // use require
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const { Server } = require('socket.io');

connectDB();

const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

server.listen(3001, () => console.log('Server running on port 3001...'));
