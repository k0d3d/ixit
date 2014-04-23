/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    encrypt = require('../../lib/commons.js').encrypt,
    _ = require('underscore'),
    uniqueValidator = require('mongoose-unique-validator');


/**
 * User Schema
 */
var UserSchema = new Schema({
    /*
    Mini profile
     */
    firstname: {type: String},
    lastname: {type: String},
    photo: {type: String, default: 'prettyme.jpg'},
    /*
    account credentials
     */
    email: {type: String, unique:true},
    username: {type: String, unique:true},
    password: String,
    type: { type: String, default: 'user' },
    /*
    loggin and audit
     */
    createdOn: { type: Date, default: Date.now },
    lastLoggedInOn: { type: Date},
    lastUpdatedOn: { type: Date },
    verifiedEmailOn: { type: Date },
    verifiedEmailAddress: { type: Boolean, default: false},
    disabledOn: { type: Date },    
    enabled: { type: Boolean, default: false }
});

/**
 *  Plugins
 */
UserSchema.plugin(uniqueValidator, {mongoose: mongoose});



/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!validatePresenceOf(this.password))
        next(new Error('Invalid password'));
    else
        next();
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return encrypt(password)
        .then(function (hash) {
          return hash;
        });
        //return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    }    
};

mongoose.model('User', UserSchema);
module.exports.UserModel = mongoose.model('User');

/**
 * [VerificationSchema description]
 * @type {Schema}
 */
var VerificationSchema = new Schema({
  userId : {type: Schema.ObjectId, ref: 'User'},
  token: {type: String},
  //Could be either new registration verifcation
  //or password reset request i.e. 
  //registeration or password-reset
  verifyType: {type: String},
  created: {type: Date, default: Date.now}
});

mongoose.model('UserVerification', VerificationSchema);
module.exports.UserVerification = mongoose.model('UserVerification');