// Messages.js
const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversationId: {
        type: String,
    },
    senderId: {
        type: String,
    },
    message: {  // Change 'messages' to 'message'
        type: String,
    } 
});

const Messages = mongoose.model('Message', messageSchema); 

module.exports = Messages; 
