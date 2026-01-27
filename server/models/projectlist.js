const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    isActive: { type: Boolean },
    clientName: { type: String },
    projectNo: { type: Number },
    projectName: { type: String },
    description: { type: String },
    totalAmount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('projectlist', projectSchema);
