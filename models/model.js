var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

var MiningSchema = new Schema({
    _id: Schema.Types.ObjectId,
    time: Date,
    wallet: String,
    email: String,
    passed_plots: Number,
    total_plots: Number,
    harvester: String,
    ip: String
}, {versionKey: false});
var UserSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    wallet: String,
    email: String,
    minimum_payout: Number
}, {versionKey: false});
var LedgerSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    wallet: String,
    time: Date,
    increase: Number,
    decrease: Number,
    note: String,
    tran_id: String
}, {versionKey: false});

// compile schema to model
var User = mongoose.model('user', UserSchema, "user");
var Ledger = mongoose.model('ledger', LedgerSchema, "ledger");
// Compile model from schema
var Mining = mongoose.model("minings", MiningSchema, "mining");
module.exports = { Mining, User, Ledger};

