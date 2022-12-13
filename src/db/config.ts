const mongoose = require('mongoose');
require('dotenv').config();

// Connect DB
mongoose.connect(
  process.env.MONGODB_URL as string,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  () => {
    console.log('Connected to MONGODB');
  },
);
