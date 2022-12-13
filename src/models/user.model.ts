const mongooseSchema = require('mongoose');

const userSchema = mongooseSchema.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  date: {
    type: String,
    default: new Date().toDateString(),
  },
});

module.exports = mongooseSchema.model('Users', userSchema);
