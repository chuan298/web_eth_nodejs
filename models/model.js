var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

var PostModelSchema = new Schema({
    month: String,
    number_of_posts: Number
});

var MiningSchema = new Schema({
    _id: Schema.Types.ObjectId,
    time: Date,
    wallet: String,
    email: String,
    passed_plots: Number,
    total_plots: Number,
    harvester: String,
    ip: String
});
var UserSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    wallet: String,
    email: String,
    minimum_payout: Number,
    telegramID: String,
});
var LedgerSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    wallet: String,
    time: Date,
    increase: Number,
    decrease: Number,
    note: String,
    tran_id: String
});

// compile schema to model
var User = mongoose.model('user', UserSchema, "user");
var Ledger = mongoose.model('ledger', LedgerSchema, "ledger");
// Compile model from schema
var PostModel = mongoose.model('blogmodels', PostModelSchema );
var Mining = mongoose.model("minings", MiningSchema, "mining");
module.exports = {PostModel, Mining, User, Ledger};

