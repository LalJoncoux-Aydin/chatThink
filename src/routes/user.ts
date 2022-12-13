const router = require('express').Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const jwtToken = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const Privatemessage = require('../models/message.model');
const userAuth = require('../middlewares/auth');
require('dotenv').config();

// Cloudinary for assets likes images, video..
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'attachments',
    resource_type: 'auto',
    public_id: (req: any, file: any) => file.filename,
  },
});

const upload = multer({ storage });

// Check Connection user
router.get('/auth', userAuth, async (req: any, res: any) => {
  try {
    const user = await UserModel.findOne({ _id: req.user });
    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Register
router.post('/register', async (req: any, res: any) => {
  const emailExist = await UserModel.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).json({ message: 'Usersname/Email Already Exist' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.status(400).json(err);
  }

  return res;
});

// Login
router.post('/login', async (req: any, res: any) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: 'Email or Password is incorrect !' });
  }
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(404).json({ message: 'Email or Password is incorrect !' });
  }
  // eslint-disable-next-line no-underscore-dangle
  const token = jwtToken.sign({ id: user._id }, process.env.JWT_TOKEN);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() * 1000), httpOnly: true, secure: true,
  });
  res.json({ token, user, message: 'Login Successfully !' });

  return res;
});

// Logout for disconnect socket
router.get('/logout', userAuth, async (req: any, res:any) => {
  try {
    res.clearCookie('jwt');
    res.status(200).send('Logout Successfully');
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get users list
router.get('/users', userAuth, async (req: any, res: any) => {
  try {
    const users = await UserModel.find({});
    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get message
router.get('/getallmessages', userAuth, async (req: any, res: any) => {
  try {
    const messages = await Privatemessage.find({});
    res.status(200).json({
      messages,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get user by id
router.get('/user/:id', async (req: any, res: any) => {
  const { id } = req.params;
  if (id) {
    const foundUser = await UserModel.findById(id);
    if (foundUser) {
      res.send(foundUser);
    }
  }
});

// Get Private Conversation

router.get('/privatemessages', async (req: any, res: any) => {
  const foundMessages = await Privatemessage.find({
    $and: [
      { participants: { $in: [req.query.friendid] } },
      { participants: { $in: [req.query.userid] } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.send(foundMessages.reverse());
});

let newMessage : any;

// Send messages
router.post('/messages', upload.single('content'), async (req: any, res: any) => {
  try {
    if (req.file) {
      newMessage = new Privatemessage({
        author: req.body.author,
        authorId: req.body.authorId,
        content: req.file.path,
        receiver: req.body.receiver,
        receiverName: req.body.receiverName,
        participants: req.body.participants.split(','),
        type: req.file.mimetype,
      });
    } else {
      newMessage = new Privatemessage(req.body);
    }
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  } catch (err) {
    console.log(err.response.body);
  }
});

module.exports = router;
