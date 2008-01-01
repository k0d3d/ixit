/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    utils = require('../../lib/commons'),
    Schema = mongoose.Schema;

/**
 * OAuthClient Schema
 */
var OAuthClientSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    name: {type:String},
    email: {type: String},
    callbackUrl: {type: String},
    clientKey: {type: String, unique: true},
    clientSecret: String,
    deviceId: {type: String}
});

/**
 * Statics
 */
OAuthClientSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            user: id
        }).exec(cb);
    }
};

/**
 * Pre-save hook
 */
OAuthClientSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    this.clientKey = utils.uid(16);
    console.log(this.clientKey);
    this.clientSecret = utils.uid(32);
    next();
});

mongoose.model('OAuthClient', OAuthClientSchema);

module.exports = mongoose.model('OAuthClient');