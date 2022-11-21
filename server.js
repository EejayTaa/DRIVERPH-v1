const express = require('express');
const databaseConnect = require('./config/database');
const app = express();
const httpServer = require('http').createServer(app);
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 8000;

require('dotenv').config();

const io = require('socket.io')(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://13.212.5.204', 'http://192.168.38.23', 'http://192.168.0.107', 'http://13.229.134.213'],
  },
});



global.__basedir = __dirname;

var corsConfig = {
  origin: ['http://localhost:3000', 'http://13.212.5.204', 'http://192.168.38.23', 'http://192.168.0.107', 'http://13.229.134.213'],
};

//Connect database
databaseConnect();

//Socket IO connection
io.on('connection', socket => {
  console.log(`New user connected with id: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected.`);
  });
});

//Socket Io
app.use((req, res, next) => {
  req.io = io;
  next();
});

//Init Middleware
app.use(express.json({ extended: false }));
app.use('/logfiles',express.static(path.join(__dirname, 'logfiles')));
app.use('/documents',express.static(path.join(__dirname, 'documents')));
app.use(cors(corsConfig));


//Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/trucks', require('./routes/api/trucks'));
app.use('/api/drivers', require('./routes/api/drivers'));
app.use('/api/sensor', require('./routes/api/sensor'));

//Run server
httpServer.listen(PORT,() => {
  console.log(`Server running on port: ${PORT}`);

});

