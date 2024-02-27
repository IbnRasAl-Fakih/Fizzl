const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
require('dotenv').config();
const crypto = require('crypto');
const session = require("cookie-session");
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Message = require("./models/message");
const User = require("./models/users");

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set("view engine", "ejs");
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static('public'));
app.set('trust proxy', 1);

mongoose.connect(process.env.MONGO_URL).then( () => {
  console.log("Connected to db");
}).catch( (error) => {
  console.log("Error: ", error);
});

app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 36000000 }
}));

let activeUsers = [];

io.on('connection', (socket) => {
  console.log('Пользователь подключен');

  socket.on('chat message', async (msg, userId, chatId) => {
    let user = await getUser(userId);
    const message = new Message({
      chatId: chatId,
      senderId: user._id,
      senderUsername: user.username,
      text: msg,
    });
    await message.save();
    console.log("сообщения отправлено")
    io.to(chatId).emit('send message', message);
  });

  socket.on('join', async (chatId, userId) => {
    console.log("зашел в комнату")
    socket.join(chatId);
    const messages = await getMessages(chatId);
    socket.emit('load old messages', messages);
    console.log("старые сообщения загружены")
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключен');
  });
});

async function getMessages(chatId) {
  try {
      const result = await Message.find({ chatId });
      return result;
  } catch (error) {
      console.log(error);
  }
}

async function getUser(userId) {
  try {
      const user = await User.findById(userId);
      return user;
  } catch (error) {
      console.log(error);
  }
}

app.use("", require("./routes/routes"));

server.listen(PORT, () => {
  console.log(`server is started on port ${PORT}`);
});