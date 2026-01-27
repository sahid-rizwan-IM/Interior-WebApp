const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  isActive: { type: Boolean },
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
