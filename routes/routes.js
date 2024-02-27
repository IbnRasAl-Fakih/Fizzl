const express = require("express");
const router = express.Router();
const https = require("https");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const User = require("../models/users");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Post = require("../models/post");
const axios = require('axios');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.render("login", { error: "Please log in" });
    }
};

async function getUser(userId) {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        console.log(error);
    }
}

router.get("/", (req, res) => {
    res.render("login", { error: "" });
});

router.get("/home/:userId", isAuthenticated, async (req, res) => {
    res.render("main", { posts: await getPosts(), userId: req.params.userId });
});

router.get("/admin/users", isAuthenticated, async (req, res) => {
    res.render("users", { error: "", users: await getUsers() });
});

router.get("/admin/post", isAuthenticated, async (req, res) => {
    res.render("post", { posts: await getPosts() });
});

router.get("/chat/:userId", isAuthenticated, async (req, res) => {
    res.render("chat", { chats: await getChats(req.params.userId), users: await getUsers(), userId: req.params.userId, chat: false});
});

async function getChats(userId) {
    try {
        const user = await getUser(userId);
        const chats = await Chat.find({ members: { $in: [user]}});
        return chats;
    } catch (error) {
        console.log(error);
    }
}

async function getUsers() {
    try {
        let users = await User.find();
        return users;
    } catch (error) {
        console.log(error);
    }
}

router.post("/signIn", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.name });
        if (user) {
        const result = await bcrypt.compare(req.body.password, user.password);
        if (result) {
            req.session.user = user;
            if (user.adminStatus == true) {
                res.redirect(`/admin/users`);
            } else {
                res.redirect(`/chat/${user._id}`);
            }
        } else {
            res.render("login", { error: "Password doesn't match" });
        }
        } else {
            res.render("login", { error: "User doesn't exist" });
        }
    } catch (error) {
        res.json(error);
    }
});

router.post("/signUp", async (req, res) => {
    try {
        let user = new User({
        username: req.body.name,
        password: await bcrypt.hash(req.body.password, 10),
        adminStatus: false
        });
        const isExists = await User.findOne({ username: user.username });
        if (isExists) {
            res.render("login", { error: "This username is already registered" });
        } else {
            if (user.username == "Rasul") {
                user.adminStatus = true;
                await user.save();
                req.session.user = user;
                res.redirect(`/admin/users`);
            } else {
                await user.save();
                req.session.user = user;
                res.redirect(`/chat/${user._id}`);
            }
        }
    } catch (error) {
        res.json(error);
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send({message: "Success"});
});

router.post('/chat/createChat', isAuthenticated, async (req, res) => {
    const newChat = new Chat({ members: [await getUser(req.body.senderId), await getUser(req.body.receiverId)] });
    try {
        await newChat.save();
        res.send(newChat._id);
    } catch (error) {
        res.json(error);
    }
});

router.get('/chat/:userId/:chatId', isAuthenticated, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        res.render("chat", { chats: await getChats(req.params.userId), users: await getUsers(), userId: req.params.userId, chat: chat });
    } catch (error) {
        res.json(error);
    }
});

router.post('/chat/addMessage', isAuthenticated, async (req, res) => {
    const { chatId, senderId, text } = req.body;
    const message = new Message({ chatId, senderId, text });
    try {
        const result = await message.save();
    } catch (error) {
        res.json(error);
    }
});

router.post('/chat/getImage', isAuthenticated, async (req, res) => {
    let title = req.body.title;
    console.log(title);
    const options = {
        method: 'GET',
        url: `https://free-images-api.p.rapidapi.com/images/${title}`,
        headers: {
            'X-RapidAPI-Key': 'ae0b858e67mshd4695cf662991dap1b67d6jsneae088262f1a',
            'X-RapidAPI-Host': 'free-images-api.p.rapidapi.com'
        }
    };
    try {
        const response = await axios.request(options);
        res.json(response.data.results[1].image);
    } catch (error) {
        console.log(error);
    }
});

router.post('/chat/getJoke', isAuthenticated, async (req, res) => {
    let title = req.body.title;
    console.log(title);
    const options = {
        method: 'GET',
        url: 'https://dad-joke-creator.p.rapidapi.com/',
        params: {query: `${title}`},
        headers: {
          'X-RapidAPI-Key': 'ae0b858e67mshd4695cf662991dap1b67d6jsneae088262f1a',
          'X-RapidAPI-Host': 'dad-joke-creator.p.rapidapi.com'
        }
    };
    try {
    const response = await axios.request(options);
    res.json(response.data.response);
    } catch (error) {
    console.error(error);
    }
});

router.post('/chat/getQuestion', isAuthenticated, async (req, res) => {
    let title = req.body.title;
    console.log(title);
    const options = {
        method: 'GET',
        url: `https://api.api-ninjas.com/v1/trivia?category=${title}`,
        headers: {
          'X-Api-Key': 'vd7B4qiaGODsP4wkSrYfLA==8641558GjR2cknAb',
        }
    };
    try {
        const response = await axios.request(options);
        res.json(response.data[0].question);
    } catch (error) {
        console.error(error);
    }
});

router.delete('/deleteUser/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        await User.findByIdAndDelete(id);
        res.render("users", { error: "User successfully deleted", users: await getUsers() });
    } catch (error) {
        res.json(error);
    }
});

router.post('/admin/updateUser', upload.fields([{ name: 'image', maxCount: 1 }]), isAuthenticated, async (req, res) => {
    try {
        const chats = await getChats(req.body.userId);


        await User.updateOne({ _id: req.body.userId }, { $set: {username: req.body.username, password: await bcrypt.hash(req.body.password, 10), email: req.body.email, country: req.body.country, adminStatus: req.body.adminStatus, profilePicture: req.files['image'][0].filename } });

        
        
        for (let i = 0; i < chats.length; i++) {
            let members = chats[i].members;

            let otheruser = members[0];
            if (members[0]._id = req.body.userId) {
                otheruser = members[1];
            }
            chats[i].members = [await getUser(req.body.userId), otheruser];
            await chats[i].save();
            console.log(otheruser._id)
        }

        res.render("users", { error: "User data successfully edited", users: await getUsers() });
    } catch (error) {
        res.json(error);
    }
});

router.post('/admin/post', isAuthenticated, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
  ]), async (req, res) => {
    try {
        const newPost = new Post({
            images: [
                req.files['image1'][0].filename,
                req.files['image2'][0].filename,
                req.files['image3'][0].filename,
            ],
            description: req.body.description,
        });
        await newPost.save();
    
        res.render("post", { posts: await getPosts() });
    } catch (error) {
        res.json(error);
    }
});

router.post('/admin/post/:id', isAuthenticated, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
  ]), async (req, res) => {
    try {
        const id = req.params.id;

        await Post.updateOne({ _id: id }, { $set: {images: [req.files['image1'][0].filename, req.files['image2'][0].filename, req.files['image3'][0].filename], description: req.body.description}});
        res.redirect('/admin/post');
    } catch (error) {
        res.json(error);
    }
});

router.delete('/admin/post/:id', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        await Post.findByIdAndDelete(id);
        res.redirect('/admin/post');
    } catch (error) {
        res.json(error);
    }
});

async function getPosts() {
    try {
        const posts = await Post.find();
        return posts;
    } catch (error) {
        console.log(error);
    }
}

module.exports = router;