/**
 * Module dependencies.
 */
var
    RequestToken = require('./oauth2/request_token'),
    AccessToken = require('./oauth2/access_token'),
    OAuthClient = require('./oauth2/oauth_client'),
    Q = require('q'),
    utils = require('../lib/commons'),
    _ = require('lodash'),

oAuthFunctions = {
    findByClientId : function (id) {
        var d = Q.defer();

        OAuthClient.findOne({ _id: id })
        // .populate('roles', null, 'roles')
        .exec(function (error, client) {
            if (error) {
                return d.reject(err);
            }
            if (client) {
                return d.resolve(client);
            } else {
                return d.resolve(false);
            }
        });

        return d.promise;
    },
    findByClientKey : function (key) {
        var d = Q.defer();

        OAuthClient.findOne({ clientKey: key }, function (error, client) {
            if (error) {
                return d.reject(err);
            }
            if (client) {
                return d.resolve(client);
            } else {
                return d.resolve(false);
            }
        });

        return d.promise;
    },
    createClient : function (options) {
        var d = Q.defer(),
            client = new OAuthClient(options);

        client.save(function (err, i) {
            if (err) {
                return d.reject(err);
            } else {
                return d.resolve(i.toJSON());
            }
        });

        return d.promise;
    },
    removeClientById : function (id) {
        var d = Q.defer();
        OAuthClient.remove({
            _id : id
        }, function (err, affectedRows) {
            if (err) {
                return d.reject(err);
            }
            if(affectedRows > 0) {
                return d.resolve(true);
            } else {
                return d.resolve(new Error ('failed to remove client'));
            }

        });

        return d.promise;
    },
    removeClientByKey : function(clientKey) {
        var d = Q.defer();

        OAuthClient.remove({
            clientKey : clientKey
        }, function (err, affectedRows) {
            if (err) {
                return d.reject(err);
            }
            if(affectedRows > 0) {
                return d.resolve(true);
            } else {
                return d.resolve(new Error ('failed to remove client'));
            }

        });
        return d.promise;
    },
    saveNewRequestToken : function (doc) {
        var d = Q.defer(),
            token = new RequestToken(doc);
        token.save(function (error, result) {
            if (error) {
                return d.reject(error);
            } else {
                return d.resolve(result);
            }
        });

        return d.promise;
    },
    /**
     * find a request token data and return a promise containing
     * the result of the operation.
     * @param  {Object} doc Object with client, code(request_token), redirtectUri
     * @return {Object}     promise object
     */
    findOneRequestToken : function (doc) {
        console.log('Searching for Request Token');
        console.log(doc);
        var d = Q.defer();

        RequestToken.findOne({
            client: doc.client,
            code: doc.code,
            redirectUri: doc.redirectUri
        }, function (error, token) {
            if (error) {
                return d.reject(error);
            }
            if (!token) {
                return d.reject(new Error('request.token not found'));
            }
            return d.resolve(token);
        });

        return d.promise;
    },
    createNewAccessToken : function (doc) {
        console.log('Creating new access token');
        console.log(doc);
        var d = Q.defer();

        var token = new AccessToken();

        token.token = utils.uid(256);
        token.user = doc.user;
        token.client = doc.client;

        token.save(function (error, result) {
            if (error) {
                return d.reject(error);
            }
            if (!token) {
                return d.reject(new Error('access.token error'));
            }

            return d.resolve(result);

        });

        return d.promise;
    },
    findOneAccessToken : function (doc) {
        console.log('Finding Access Token');
        var d = Q.defer();

        AccessToken.findOne({
            token : doc.token
        })
        .exec(function (err, token) {
            if (err) {
                return d.reject(err);
            } else {
                return d.resolve(token);
            }
        })

        return d.promise;
    },
    findAllClients : function (options) {
        var clients = Q.defer();

        options = options || {};

        OAuthClient.find(options)
        .exec(function (err, i) {
            if (err) {
                return clients.reject(err);
            }
            if (i) {
                return clients.resolve(i);
            }
        });

        return clients.promise;
    }
}

/**
 * OAuth Class
 * @return {[type]} [description]
 */
function oAuthModel () {

}

oAuthModel.prototype.listOfClients = function (options) {
    var list = Q.defer();

    oAuthFunctions.findAllClients(options)
    .then(function (result) {
        return list.resolve(result);
    }, function (err) {
        return list.reject(err);
    })

    return list.promise;
}

oAuthModel.prototype.create = function (options) {
    console.log('Creating Client');
    var d = Q.defer();

    oAuthFunctions.createClient(options)
    .then(function (result) {
        return d.resolve(result);
    }, function (err) {
        return d.reject(err);
    });

    return d.promise;
};

/**
 * finds a  by its mongoose ObjectId or by the app client
 * key.
 * @param  {object} option an Object with id or key properties
 * @return {[type]}        return a promise
 */
oAuthModel.prototype.findClient  = function (option)  {
    console.log('Searching for Client');
    var d = Q.defer();

    if(option.id) {
        oAuthFunctions.findByClientId(option.id)
        .then(function (result) {
            d.resolve(result);
        })
        .catch(function (err) {
            d.reject(err);
        });
    }

    if (option.key) {
        oAuthFunctions.findByClientKey(option.key)
        .then(function (result) {
            d.resolve(result);
        })
        .catch(function (err) {
            d.reject(err);
        });
    }

    return d.promise;
};

/**
 * creates a request token for the  / client trying to gain acecess to an authenticating user's resouces
 * @param  {String} code        generated uid / code
 * @param  {String} user        the authenticating user
 * @param  {String} client      the clientKey for the bcnApp requesting access
 * @param  {String} redirectUri the redirect uri
 * @return {Object}             a promise object
 */
oAuthModel.prototype.createRequestToken = function (code, user, client, redirectUri) {
    var d = Q.defer(),
    doc = {
        code : code,
        user: user,
        client: client.clientKey,
        redirectUri: redirectUri
    };

    oAuthFunctions.saveNewRequestToken(doc).then(function (result) {
        return d.resolve(result);
    }, function (err) {
        return d.reject(err);
    });

    return d.promise;
};

oAuthModel.prototype.switchTokens = function (client, request_token, redirectUri) {
    var d = Q.defer();

    oAuthFunctions.findOneRequestToken({
        client : client.clientKey,
        code: request_token,
        redirectUri: redirectUri
    })
    .then(function (doc) {
        oAuthFunctions.createNewAccessToken(doc)
        .then(function (r) {
            //should delete request code before proceeding
            doc.remove(function (err) {
                if(err) {
                    return d.reject(err);
                }
                //well, if no errors, resolve with r
                return d.resolve(r);
            });
        }, function (err) {
            return d.reject(err);
        });
    }, function (err) {
        return d.reject(err);
    });



    return d.promise;
}

oAuthModel.prototype.findToken = function (accessToken) {
    var d = Q.defer();

    oAuthFunctions.findOneAccessToken({
        token : accessToken
    })
    .then(function (r) {
        return d.resolve(r);
    }, function (err) {
        return d.reject(err);
    });

    return d.promise;
}

module.exports = oAuthModel;

