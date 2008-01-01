/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * RequestToken Schema
 */
var RequestTokenSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    code: String,
    redirectUri: String,
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    client: {
        type: String
    },
});

/**
 * Statics
 */
RequestTokenSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).exec(cb);
    }
};

mongoose.model('RequestToken', RequestTokenSchema);

module.exports = mongoose.model('RequestToken');
