const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkout_date:    { type: Date, required: true, default: Date.now },
  return_date:      { type: Date, default: null },
  condition_rating: { type: Number, default: null, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);