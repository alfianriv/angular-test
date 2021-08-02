var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({
  date: Date,
  amount: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
