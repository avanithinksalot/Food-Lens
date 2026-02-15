const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    batch_id: { type: String },
    overall_score: { type: Number },
    risk_category: { type: String },
    createdAt: { type: Date, default: Date.now },
    scanImages: [{
        image_path: String,
        disease_detected: String,
        confidence: Number
    }]
});

module.exports = mongoose.model('Scan', scanSchema);
