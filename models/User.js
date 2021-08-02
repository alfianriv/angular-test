var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transactions'
  }]
});

module.exports = mongoose.model('User', UserSchema);
