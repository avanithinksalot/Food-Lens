const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'vendor', 'retailer'], required: true },
    location: { type: String },
    subscription_tier: { type: String, default: 'free' }
});

module.exports = mongoose.model('User', userSchema);
