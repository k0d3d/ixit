/**
 * #User Model Interface#
 * @module models
 * */

var UserModel = require('./user/user.js').UserModel,
    VerificationModel = require('./user/user.js').VerificationModel,
    Q = require('q'),    
    utils = require('../lib/commons.js'),
    _ = require('underscore'),
    sendMessage = require('../lib/email/mailer.js'),
    moment = require('moment'),
    EventRegister = require('../lib/event_register.js').register,
    crypt = require('../lib/commons.js'),
    configuration = require('config'); // we generally want to load the whole config


/***
 * we want to put all of our common internal user functions here
 * **/

var userFunctions = {


    /**
     * Validates a users / email existence
     * @param  {Object} data email or username as a property to be checked for 
     * @return {Object}      Promiuse fufilled with a boolean.
     */
    validateUser: function validateUser(data) {
        console.log(data);

        var d = Q.defer();

        //Find username 
        UserModel.count({
            $or: [{
                email: data.email
            }, {
                username: data.username
            }]
        }).exec(function(err, i) {
            console.log(i);
            if (err) {
                return d.reject(err);
            }
            if (i > 0) {
                return d.resolve(false);
            }
            return d.resolve(true);
        });

        return d.promise;
    },
    prepUserVerificationToken: function prepUserVerificationToken(data) {
        console.log('Creating verification token');
        console.log(data);
        var d = Q.defer();

        var vm = new VerificationModel();
        vm.userId = data.userId;
        vm.token = utils.uid(32);
        vm.verifyType = data.verifyType || 'registration';
        vm.save(function(err, i) {
            console.log(err, i);
            if (err) {
                return d.reject(err);
            }
            else {
                data.token = i.token;
                return d.resolve(data);
            }
        });

        return d.promise;
    },

    findUser: function findUser(data) {
        console.log('Finding User');

        var d = Q.defer();

        try {

            console.log(data);
            //Check if userid exists
            //Find username 
            UserModel.findOne({
                $or: [{
                    email: data.email
                }, {
                    username: data.username
                }, {
                    _id: data.userId
                }]
            }).exec(function(err, i) {



                if (err) {
                    return d.reject(err);
                }

                if (i === null) {

                    console.log('User not found');
                    return d.reject(new Error('User not found'));

                }

                if (_.isEmpty(i)) {

                    return d.reject(new Error('User not found'));
                }

                //I wanna update the user object with the
                //existing results
                data = _.extend(i.toJSON(), data);
                console.log('user found');
                return d.resolve(data);
            });
        }
        catch (e) {
            console.log(e);
            return d.reject(e);
        }


        return d.promise;
    },

    encryptPassword: function encryptPassword(options) {
        console.log('Encrypting Password');
        var d = Q.defer();
        if (!options.password) {

            return new Error('missing password');

        }
        else {
            //encrypt password
            crypt.encrypt(options.password).then(function (p) {

                options.password = p;
                d.resolve(options);

            }).fail(function(err) {
                d.reject(err);
            });
        }

        return d.promise;
    },

    validatePassword: function validatePassword(plain, hashed) {
        console.log('on validation');
        console.log(plain, hashed);
        var d = Q.defer();

        crypt.validate(plain, hashed)
        .then(function (p) {
            console.log('Validation done');
            return d.resolve(true);

        }, function (err) {
            return d.reject(err);
        });

        return d.promise;
    },
    saveBasicProfileData: function saveBasicProfileData(data) {
        console.log('Saving basic profile...');

        var user = new UserModel(data),
            d = Q.defer();

        //user.lean();
        user.save(function(err, i) {
            if (err) {
                return d.reject(err);
            }
            else {
                data.userId = i._id;
                return d.resolve(data);
            }
        });

        return d.promise;

    },
    sendUserVerificationEmail: function sendUserVerificationEmail(data) {
        // we want to send user who has registered
        var sendTemplateEmail = sendMessage.sendTemplateEmail;

        console.log('in before send of email');
        
        var _conf = require("config");
        
        console.log(JSON.stringify(_conf));
        
        var config = _conf.users;

        console.log(config);

        var prefix = config.httpPrefix; // need to put in http:// based upon where we are (local, dev, test, prod) - can be config

        return sendTemplateEmail(data.email, config.fromDefaultEmailAddress,
        config.userVerificationEmailSubject, "views/email-templates/user-email-verification.jade", {
            verificationLink: prefix + "/email-verification?reg_key=" + data.token
        });

    },
    sendEmailAfterUserActivated: function sendEmailAfterUserActivated(data) {
        // we want to send user who has registered
        var sendTemplateEmail = sendMessage.sendTemplateEmail;

        console.log('in before send of email to admin confirming verification successful');
        
        var _conf = require("config");
        
        console.log(JSON.stringify(_conf));
        
        var config = _conf.users;

        console.log(config);
        console.log(data);
        
        var userToFind = {};
        userToFind.userId = data.userId;
        
        this.findUser(userToFind).then(function (userInfo) {

            return sendTemplateEmail(_conf.general.systemEmail, config.fromDefaultEmailAddress,
            "Successful BNC Email Verification", "views/email-templates/successful-email-verification-notice.jade", userInfo);
        
        });

    },
    findUserActivationToken : function findUserActivationToken (doc) {
        console.log(doc);
      var activate = Q.defer(), config = configuration.users;

      VerificationModel.findOne({
        token : doc.token
      })
      // .where(function () {
      //   //return this.created < moment(this.created).add('days', config.tokenExpiry);
      // })
      .exec(function (err, activationDoc) {
        if (err) {
            return activate.reject(err);
        } 

        if (activationDoc) {
            // find out if the difference between
            // the date created and today is up to 
            // 24hours or 3600 seconds
            var today = moment();
            var created = moment(activationDoc.created);

            var diff = today.diff(created, 'seconds');

            if (60 * 60 * 24 * config.tokenExpiry > diff ) {
                console.log('found activation key');
                return activate.resolve(activationDoc);
            } else {
                return activate.reject(new Error('expired activation'));
            }
            
        } else {
                return activate.reject(new Error('invalid or expired activation'));
        }
      });

      return activate.promise;
    },
    performActivationOnUser : function performActivationOnUser (activationDoc) {
        var perform = Q.defer();

        UserModel.update({
            _id : activationDoc.userId
        }, {
            verifiedEmailAddress : true,
            verifiedEmailOn : Date.now()
        }, function (err, i) {
            console.log(err, i);
            if (err) {
                return perform.reject(err);
            } 
            if (i > 0) {
                return perform.resolve(activationDoc);
            }
            if (i === 0) {
                return perform.reject(new Error('error updating user with activation'));
            };
        });

        return perform.promise;
    },
    deleteActivationKey : function deleteActivationKey (activationDoc) {
        console.log('Deleting Activation Key');
        var del = Q.defer();

        VerificationModel.remove({
            token : activationDoc.token
        }, function (err, i) {
            if (err) {
                return del.reject(err);
            } 
            if (i > 0) {
                return del.resolve(activationDoc);
            }
            if (i === 0) {
                return del.reject(new Error('error removing stale activation'));
            };
        })

        return del.promise;
    },
    sendUserRecoveryEmail : function sendUserRecoveryEmail (data) {
        console.log('Sending Recovery Email');
        // we want to send user who has registered
        var sendTemplateEmail = sendMessage.sendTemplateEmail;

        console.log('in before send of email');
        
        var _conf = require("config");
        
        //console.log(JSON.stringify(_conf));
        
        var config = _conf.users;

        //console.log(config);

        var prefix = config.httpPrefix; // need to put in http:// based upon where we are (local, dev, test, prod) - can be config

        return sendTemplateEmail(data.email, config.fromDefaultEmailAddress,
        config.userRecoveryPasswordSubject, "views/email-templates/user-recovery-email.jade", {
            verificationLink: prefix + "/new-password?reg_key=" + data.token
        });        
    },
    updateUserAccountPassword : function updateUserAccountPassword (doc) {
        console.log('Updating account password');
        console.log(doc);
        var updater = Q.defer();

        UserModel.update({
            _id : doc.userId
        }, {
            password : doc.password
        }, function (err, done) {
            if (err) {
                return updater.reject(err);
            } 
            if (done > 0) {
                return updater.resolve(doc);
            }
            if (done === 0) {
                return updater.reject(new Error('error updating password'));
            };            
        })

        return updater.promise;
    },
    findFailedLogin: function findFailedLogin (doc) {
        console.log('Finding previous failed login');
        var finder = Q.defer(), config = configuration.users;

            LoginCount.findOne({
                email: doc.userId,
                ipAddress: doc.ipAddress
            })
            .exec(function (err, i) {
                if (err) {
                    return finder.reject(err);
                }
                if (i) {
                    return finder.resolve(i);
                }
                if (!i) {
                    return finder.resolve(false);
                }
            });     
        return finder.promise;
    },
    updateLoginAttempt : function updateLoginAttempt (doc) {
        console.log('Updating Login Attempt..');
        var logger = Q.defer();
        console.log(doc);
        LoginCount.update({
            email: doc.email,
            ipAddress: doc.ipAddress
        }, {
            $set: {
                //firstAttempt: doc.firstAttempt,
                lastAttempt: doc.lastAttempt,
                count: doc.count
            }
        }, function (err, i) {
                console.log(err, i);
                if (err) {
                    return logger.reject(err);
                }
                if (i > 0) {
                    return logger.resolve(doc);
                }
                if (i === 0) {
                    return logger.reject(new Error('updating login count failed'));
                }            
        })
        
        return logger.promise;
    },
    logLoginAttempt : function logLoginAttempt (doc) {
        console.log('Loggin Attempt Recording...');
        console.log(doc);
        var logger = Q.defer();

        var l = new LoginCount(doc);
        l.email = doc.userId;
        l.count = 1;
        l.firstAttempt = Date.now(),
        l.lastAttempt = Date.now()        
        l.save(function (err, i) {
            if (err) {
                return logger.reject(err);
            }
            return logger.resolve(i);
        });

        return logger.promise;
    },
    saveFailedLoginAttempt : function saveFailedLoginAttempt (doc) {
        console.log('on failed');
        var saver = Q.defer(), 
            config = configuration.users,
            self = this;

        if (doc.verdict === 'passed') {
            saver.resolve(doc);
            return saver.promise;
        }

        //find or update a user's failed login
        //on the logincount model. always afix the time.
        //if the first of 10 failed login is within config.failedAuthWindow
        //i.e. config.failedAuthWindow = 10mins. and first failure was 
        //5mins ago. update recentfailed, if not update firstfail.
        //then update the count. 
        //when count gets to 10, within failedAuthWindow send email to errors@...
        //if updating count outside failedAuthWindow, reset firstfail to now()
        //and most recent fail to now()
        //from the same IP address
        
        self.findFailedLogin(doc)
        .then(function (foundLogin) {

            console.log(foundLogin);
            var rec = {
                email: foundLogin.email,
                ipAddress: foundLogin.ipAddress
            };

            //If a previous login attempt is found, most
            //likely a failed login event,
            //"foundLogin", is doc containing count, firstAttempt, lastAttempt
            //lets get the count, and the time 
            if (foundLogin) {
                //First we check if firstAttempt is over failedAuthWindow.
                //i.e. now is > firstAttempt + failedAuthWindow
                var firstPlusWindow = moment(foundLogin.firstAttempt).add('d', 1);
                //var firstPlusWindow = moment(foundLogin.firstAttempt).add('d', config.failedAuthWindow);
                var tooLate = moment().isAfter(firstPlusWindow);

                if (tooLate)  {

                    //Well if its too late, lets restart the 
                    //clock and count. 
                    //treat is as a first attempt
                    rec.firstAttempt = Date.now();
                    rec.lastAttempt = Date.now();
                    rec.count = 1;
                    return self.updateLoginAttempt(rec);
                } else {

                    //If its not too late,
                    //lets increase the count, leave the firstAttempt as is
                    //and update the lastAttempt to now
                    rec.lastAttempt = Date.now()
                    rec.count = foundLogin.count + 1;

                    //if out count is so far greater then 10
                    //lets send an email and inform the user 
                    //to get recover his/her password
                    if (rec.count >= 5) {
                        self.sendEmailOnFailedAuth(foundLogin)
                        .then(function () {
                            return self.updateLoginAttempt(rec);                            
                        });
                    } else {
                        return self.updateLoginAttempt(rec);                        
                    }

                }

                
                
            } else {
            //If no previous attempt is found.
            //lets create a login attempt
                return self.logLoginAttempt(doc);
            }

        })
        .then(function (doc) {
            console.log('Saver here');
            console.log(doc);
            return saver.resolve(doc);            
        }, function (err) {
            return saver.reject(err);
        });
        

        return saver.promise;
    },
    recordAttemptnAudit: function recordAttemptnAudit(doc) {
        console.log('Recording attempt and audit');
        var attempt = Q.defer();

        this.saveAuditInformation(doc)
        .then(this.saveFailedLoginAttempt)
        .then(function (r) {
            console.log('After favedd');
            console.log(r);
            return attempt.resolve(doc);
        }, function (err) {
            return attempt.reject(err);
        });

        return attempt.promise;
    },
    userAuthEvent: function userAuthEvent (props) {
        var eventRegister = new EventRegister();

        eventRegister.once('userHasLoggedIn', function (data, isDone) {
            UserModel.update({
                $or : [
                    {_id : props._id},
                    {email: props.email}
                ]
            }, {
                $set : {
                    lastLoggedInOn: Date.now()
                }
            }, function (err, i) {
                if (err) {
                    isDone(err);
                }
                if (i > 0) {
                    isDone(true);
                }
                if(i === 0 ) {
                    isDone(new Error('Error Saving lastLoggedInOn'))
                }
            })
        })

        eventRegister.queue('userHasLoggedIn')
        .onError(function (err) {
            console.log(err);
        })
        .onEnd(function (data) {
            console.log(data);
        })
        .start(props);
    },
    sendEmailOnFailedAuth: function sendEmailOnFailedAuth (props) {
        console.log('I should send an email')
        console.log(props);
        // we want to send user who has registered
        var sendTemplateEmail = sendMessage.sendTemplateEmail;

        
        
        var _conf = require("config");
        
        //console.log(JSON.stringify(_conf));
        
        var config = _conf.users;

        //console.log(config);

        console.log('in before send of email');
        return sendTemplateEmail(_conf.general.systemEmail, config.fromDefaultEmailAddress,
        config.userAuthFailureEmailSubject, "views/email-templates/user-auth-failure.jade", props);
    }

};







//Remove properties we do not want externaly
function filterForOutput(users) {
    if (users === null) {
        return null;
    }
    var _ = require("underscore");
    var filterImpl = function(u) {
        if (u === null) {
            return u;
        }
        if (u.toJSON) {
            u = u.toJSON();
        }

        return _.omit(u, 'password', 'maximumVerificationAge', 'verificationCode', '__v', 'passwordResetMaxDate', 'authToken', 'authId');
    };
    //If it is an array then create a map of transformed objects
    if (_.isArray(users)) {
        return _.map(users, filterImpl);
    }
    return filterImpl(users);
}

/**
 * Handles UserModel documents
 * @class User
 * */
function User() {}

//generate verificationCode and extend/create maximumVerificationAge for a user's properties
//Changed to deferred because I want to do something asynchronous here
// need to fix this function
var refreshVerification = function(properties) {

    //var crypt = require("../lib/crypto/encryption.js");


    //Set the verificationCode used for activation the user
    properties.verificationCode = utils.randomString(60);

    //Add verification_limit_value to current date to get maximumVerificationAge for user account
    properties.maximumVerificationAge = require("moment")(new Date()).add(configuration.users.verification_limit_type || 'd', configuration.users.verification_limit_value).toDate();

    //deferred.resolve(properties);

    //return deferred.promise;
};

/**
 * Create a UserModel document
 * @method create
 * @param options {Object}
 * @return {Promise}
 * */
User.prototype.create = function(options) {
    var d = Q.defer();
    //TODO: Do validation here
    var userInfo = options;
    if (userInfo.username === '') userInfo.username = userInfo.email;


    var checkIfUserExists = userFunctions.validateUser(userInfo);

    checkIfUserExists.then(function(doesNotExist) {

        if (!doesNotExist) {

            // we cannot add
            d.reject(new Error('User Exists'));

        }
        else {

            userFunctions.encryptPassword(userInfo)
            .then(userFunctions.saveBasicProfileData)
            .then(userFunctions.prepUserVerificationToken)
            .then(userFunctions.sendUserVerificationEmail)
            .then(function(r) {
                if (r) {
                    userInfo.sentVerification = true;
                }
                else {
                    userInfo.sentVerification = false;
                }
                d.resolve(userInfo);
                
            }).
            catch (function(err) {

                // something went wrong with the signup - return error screen
                d.reject(err);

            });
        }

    }).
    catch (function(err) {

        // something went wrong with the signup - return error screen
        d.resolve(err);

    }

    );

    return d.promise;
};


/**
 * used only when we are creating a user through the api and not interactively - do not send email and save full profile
 * @method createSkeletonUser
 * @param options {Object}
 * @return {Promise}
 * */
User.prototype.createSkeletonUser = function(options) {
    var d = Q.defer();
    //TODO: Do validation here
    var userInfo = options;
    var user = userFunctions.validateUser(userInfo);
    user.then(userFunctions.encryptPassword).then(userFunctions.saveBasicProfileData).then(userFunctions.saveAuditInformation).then(userFunctions.saveExtendedProfileData).then(function(r) {
        console.log('in finish');
        d.resolve(userInfo);
    }).
    catch (userFunctions.somethingWrongDuringSignup);

    return d.promise;
};



User.prototype.saveUserExtendedProfile = function(options) {
    var d = Q.defer();

    console.log(options);

    var userInfo = options;

    userFunctions.findUser(userInfo).then(userFunctions.saveExtendedProfileData).then(function(r) {
        d.resolve(r);
    }).
    catch (function(err) {
        userFunctions.somethingWrongDuringSignup.then(function(r) {
            return d.reject(r);
        });
    });

    return d.promise;
};

User.prototype.findUser = function(options) {
    var d = Q.defer();

    userFunctions.findUserWithPersonSVC(options).then(function(r) {
        return d.resolve(r);
    }, function(err) {
        return d.reject(err);
    });

    return d.promise;
};
User.prototype.findUserObject = function(options) {
    var d = Q.defer();

    userFunctions.findUser(options).then(function(r) {
        return d.resolve(r);
    }, function(err) {
        return d.reject(err);
    });

    return d.promise;
};
/**
 * this method checks if a supplied username / email address 
 * matches the password on file (db). It is used primarily to authenticate
 * user accounts.
 * If authentication passes, an userLoggedIn event is triggered which updates the
 * "lastLoggedIn" field on the data base.
 * 
 * @param  {String} usernameOrEmail A username or email
 * @param  {String} password        the password in plain text
 * @param  {String} twoFactorCode   2 factor authentication supplied in plain text
 * @param  {Object} req             the request object 
 * @return {Object}                 Promise Object
 */
User.prototype.checkAuthCredentials = function(usernameOrEmail, password, twoFactorCode, req) {
    console.log('Checking Auth credentials');
    console.log(req);
    var d = Q.defer();

    var userInfo = {
        email: usernameOrEmail,
        username: usernameOrEmail,
        plain_password: password,
        ipAddress: req.connection.remoteAddress
    };
    userFunctions.findUser(userInfo).then(function(user) {

        userFunctions.validatePassword(userInfo.plain_password, user.password)
        .then(function(r) {
            console.log('After password validation');
            console.log(r);
            // validate two factor
            if (r.two_factor_check) {

            }
            //validatePassword returns boolean
            //send back the user document
            if (r) {
                var i = {
                    action: 'login-attempt',
                    verdict: 'passed',
                    userId: userInfo.email,
                    category: 'auth',
                    ipAddress: userInfo.ipAddress
                };
                userFunctions.recordAttemptnAudit(i)
                .then(function () {
                    console.log('Sending back user info');

                    //trigger a logged-in event fr 
                    //this user
                    try {
                        userFunctions.userAuthEvent(user);
                    } catch (e) {
                        console.log(e);
                    }
                    //return back the userInfo 
                    //which should contain the user 
                    //account data
                    d.resolve(user);
                }, function (err) {
                    //Errors with recording and 
                    //auditing 
                    d.reject(err);
                });

            } else {
                
                d.reject(r);
            }

        }, function(err) {
            console.log('Error Logging');
            console.log(err);
            //Errors with password verification
            var i = {
                action: 'login-attempt',
                verdict: 'failed',
                userId: userInfo.email,
                category: 'auth',
                error: err.message,
                ipAddress: userInfo.ipAddress                
            };
            userFunctions.recordAttemptnAudit(i)
            .then(function () {
                //Errors with validatePassword.
                //reject promise. 
                d.reject(err);
            }, function (err) {
                d.reject(err);
            });

        });

    }, function(err) {
        //Errors with findUser.
        //reject Promise
        d.reject(err);
    });

    return d.promise;
};

User.prototype.list = function(cb) {
    UserModel.find({}).exec(function(err, i) {
        cb(i);
    });
};
/**
 * checks for an existing user name or email address
 * @param  {Object} emailOrUsername Object with email or username property
 * @return {Object}                 Promise
 */
User.prototype.emailOrUsernameChecker = function(emailOrUsername) {
    console.log('Checking email / username');
    var exist = Q.defer();

    userFunctions.validateUser(emailOrUsername).then(function(r) {
        return exist.resolve(r);
    }, function(err) {
        return exist.reject(err);
    });

    return exist.promise;
};

User.prototype.activateUserEmail = function (activationToken) {
    console.log('At activateUserEmail');
    var activate = Q.defer();

    userFunctions.findUserActivationToken(activationToken)
    .then(userFunctions.performActivationOnUser)
    .then(userFunctions.deleteActivationKey)
    .then(function (activationDoc) {
        
        // send email to BNC administrator
        
        userFunctions.sendEmailAfterUserActivated(activationDoc).done(function () {
            
            
            activate.resolve(activationDoc);
            
        });
        
    }, function (err) {
        activate.reject(err);
    });

    return activate.promise;
};

User.prototype.userRequestPWRecovery = function (emailRequested) {
    var resetPW = Q.defer(),

    options = {
        email : emailRequested
    };

    userFunctions.findUser(options)
    .then(function (userDoc) {
        console.log(userDoc);
        console.log('Continuing after searching for user');
        var step2 = Q.defer();

        options.userId = userDoc._id;
        options.verifyType = 'password-reset';

        userFunctions.prepUserVerificationToken(options)
        .then(function (done) {
            console.log('Prepped Token');
            console.log(done);
            return step2.resolve(options);
        }, function (err) {
            return step2.reject(err);
        });

        return step2.promise;
    })
    .then(userFunctions.sendUserRecoveryEmail)
    .then(function (done) {
        return resetPW.resolve(true);
    }, function (err) {
        console.log(err);
        return resetPW.reject(err);
    });


    return resetPW.promise;
};

User.prototype.validateToken = function (doc) {
    var checker = Q.defer();

    userFunctions.findUserActivationToken(doc)
    .then(function (r) {
        return checker.resolve(r);
    }, function (err){
        return checker.reject(err);
    });

    return checker.promise;
};

User.prototype.saveNewUserPassword = function (doc) {
    var saver = Q.defer(),
    options = {
        password : doc.password,
        token : doc.token
    };

    userFunctions.encryptPassword(options)
    .then(userFunctions.findUserActivationToken)
    .then(function (activationDoc) {
        var a = Q.defer(), passIn;

        passIn = activationDoc.toJSON();
        passIn.password = options.password;

        userFunctions.updateUserAccountPassword(passIn)
        .then(function (done) {
            return a.resolve(passIn);
        }, function (err) {
            return a.reject(err);
        });

        return a.promise;
    })
    .then(userFunctions.deleteActivationKey)
    .then(function (done) {
        return saver.resolve(done);
    }, function (err) {
        return saver.reject(err);
    });

    return saver.promise;
};

User.prototype.getAccessLogs = function (doc) {
    var access = Q.defer();


    return access.promise;
}

//http://underscorejs.org/#bindAll
_.bindAll(userFunctions, 'saveFailedLoginAttempt');

module.exports = User;
