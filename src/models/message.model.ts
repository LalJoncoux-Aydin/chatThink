const mongooseMessage = require('mongoose');

const privateMessageSchema = mongooseMessage.Schema(
  {

    author: { type: String, required: true },
    authorId: { type: String, required: true },
    content: { type: String },
    receiver: { type: String, required: true },
    receiverName: { type: String, required: true },
    participants: [String],
    type: { type: String },
  },
  { timestamps: true },
);

module.exports = mongooseMessage.model('PrivateMessages', privateMessageSchema);
