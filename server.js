const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());


// Login route
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  
  res.cookie('username', username, { httpOnly: false });
  res.json({ success: true });
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle user joining the chat
  socket.on('join', (username) => {
    socket.username = username;
    console.log(`${username} joined`);
    io.emit('message', `${username} joined`);
  });

  // Handle chat messages
  socket.on('chatMessage', (msg) => {
    if (socket.username) {
      io.emit('message', `${socket.username}: ${msg}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      io.emit('message', `${socket.username} left`);
    }
  });
});

server.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
