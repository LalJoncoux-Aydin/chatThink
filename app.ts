const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('./src/db/config');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);

// Create socket

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
const userRoutes = require('./src/routes/user');

// Add cors
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

app.use(cookieParser());
app.use(express.json());

// Add prefix /api for all routes
app.use('/api', userRoutes);

let users = [];

// Connect user socket
const addUser = (userId: any, username: any, socketId: any) => {
  const test = !users.some((user) => user.userId === userId)
    && users.push({ userId, username, socketId });

  return test;
};

// Get userId when connection socket
const getUser = (userId: any) => users.find((user) => user.userId === userId);

// Delete user connection socket
const removeUser = (socketId: any): any => {
  users = users.filter((user) => user.socketId !== socketId);
};

// Start Socket
io.on('connection', (socket: any) => {
  console.log('user connected');
  socket.on('adduser', (userId: any, username: any) => {
    addUser(userId, username, socket.id);
    io.emit('getusers', users);
  });
  socket.on('privatemsg', (message: any) => {
    try {
      const onlineFriend = getUser(message.receiver);
      io.to(onlineFriend.socketId).emit('privatemessage', message);
    } catch (error) {
      console.log('SocketId deleted');
    }
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.emit('getusers', users);
  });
  socket.on('disconnectUser', (userId: any) => {
    try {
      console.log('user disconnected');
      const filterUsers = users.filter((user) => user.userId !== userId);
      users = filterUsers;
      socket.broadcast.emit('getusers', users);
    } catch (err) {
      console.log(err);
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req: any, res: any) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
  });
}

const port = (process.env.PORT as string) || 3001;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
