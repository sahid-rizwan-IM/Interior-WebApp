const mongoose = require('mongoose');

const officeDetailsSchema = new mongoose.Schema({
    isActive: { type: Boolean },
    materialName: { type: String },
    balanceQuantity: { type: Number },
    perRate: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('officeDetails', officeDetailsSchema);