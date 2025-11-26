require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();
const http = require('http');
const server = http.createServer(app);
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/userRoutes');
const { Server } = require('socket.io');

connectDB();


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,               
}));


const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());

app.use('/users', userRoutes);

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

server.listen(3001, () => console.log('Server running on port 3001...'));
