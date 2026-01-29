const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    isActive: { type: Boolean },
    projectId: { type: mongoose.Schema.ObjectId, ref: 'projectlist' },
    materialName: { type: String },
    totalQuantity: { type: Number },
    usedCount: { type: Number },
    balanceCount: { type: Number },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('materialslist', materialSchema);
