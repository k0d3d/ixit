// controller for our OAuth2.0 Server
// example skeletal code taken from https://github.com/jaredhanson/oauth2orize/tree/master/examples/express2
// will need to be updated for our scenario

console.log('setting up OAuth2 server...');

var oauth2orize = require('oauth2orize');
var utils = require('../../lib/commons');
var passport = require('passport');
var oauthServer = oauth2orize.createServer();
var OAuth2 = require('../../models/oauth2');
// var login = require('connect-ensure-login');
var Q = require('q');
//var config = require('config');

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

oauthServer.serializeClient(function (client, done) {
    console.log('Serializing Client');
    return done(null, client._id);
});

oauthServer.deserializeClient(function (id, done) {
    console.log('Deserializing Client');
    console.log(id);
    var d = Q.defer(),
        oauth2 = new OAuth2();

    oauth2.findClient({id : id }).then(function (r) {
        done(null, r);
        return d.resolve();
    });

    return d.promise;

});


// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.
oauthServer.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, done) {
    var code = utils.uid(16),
        oauth2 = new OAuth2();
    console.log('Issuing Grant....');
    oauth2.createRequestToken(code, user, client, redirectUri)
    .then(function (r) {
        done(null, code);
    }, function (err) {
        done(err);
    });
}));

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

oauthServer.exchange(oauth2orize.exchange.code(function (client, request_token, redirectUri, done) {
    var oauth2 = new OAuth2();

    oauth2.switchTokens(client, request_token, redirectUri)
    .then(function (r) {
        done(null, r.token);
    }, function (err) {
        done(err);
    });


}));

var OAuth2Middleware = {
    dialog : function (req, res) {
        res.render('oauth/oauth-dialog', {
            title: 'Request for Access to Account',
            transactionId: req.oauth2.transactionID,
            user: req.user,
            oauth_client: req.oauth2.client,
        });
    },
    // user decision endpoint
    //
    // `decision` middleware processes a user's decision to allow or deny access
    // requested by a client application.  Based on the grant type requested by the
    // client, the above grant middleware configured above will be invoked to send
    // a response.
    decision : [
        passport.isAPIAuthenticated, function (req, res, next) {
            console.log(req.body);
            next();
        },
        oauthServer.decision()
    ],
    // token endpoint
    //
    // `token` middleware handles client requests to exchange authorization grants
    // for access tokens.  Based on the grant type being exchanged, the above
    // exchange middleware will be invoked to handle the request.  Clients must
    // authenticate when making requests to this endpoint.
    token : [
        passport.isClientAuthenticated,
        oauthServer.token(),
        oauthServer.errorHandler({mode: 'indirect'})
    ],
    // user authorization endpoint
    //
    // `authorization` middleware accepts a `validate` callback which is
    // responsible for validating the client making the authorization request.  In
    // doing so, is recommended that the `redirectURI` be checked against a
    // registered value, although security requirements may vary accross
    // implementations.  Once validated, the `done` callback must be invoked with
    // a `client` instance, as well as the `redirectURI` to which the user will be
    // redirected after an authorization decision is obtained.
    //
    // This middleware simply initializes a new authorization transaction.  It is
    // the application's responsibility to authenticate the user and render a dialog
    // to obtain their approval (displaying details about the client requesting
    // authorization).  We accomplish that here by routing through `ensureLoggedIn()`
    // first, and rendering the login view.

    authorization : [
        passport.isAPIAuthenticated,
        oauthServer.authorization(function (key, redirectUri, done) {
            console.log('Server Authorization');
            var oauth2 = new OAuth2();

            oauth2.findClient({ key: key })
            .then(function (client) {
                // WARNING: For security purposes, it is highly advisable to check that
                //          redirectURI provided by the client matches one registered with
                //          the server.  For simplicity, this example does not.  You have
                //          been warned.
                return done(null, client, redirectUri);
            }, function (err) {
                return done(err);
            });
        })
    ]

};




function coreOAuth(app) {

    // put in our oauth routes here

    //creates a new client
    app.route('/api/v2/clients')
    //fetches all clients
    .get(function (req, res) {
        var oauth2 = new OAuth2();
        oauth2.findClient({id : req.params.clientId})
        .then(function (r) {
            res.json(200, r);
        }, function (err) {
            console.log(err);
            res.json(400, err);
        });
    })
    .post(function (req, res, next) {
        console.log('message');
        var oauth2 = new OAuth2();
        oauth2.create(req.body)
        .then(function (r) {
            res.json(r);
        }, function (err) {
            next(err);
        });
    });


    //fetches more infomation on a client application
    app.get('/api/v2/clients/:clientId', function (req, res) {
        var oauth2 = new OAuth2();
        oauth2.findClient({id : req.params.clientId})
        .then(function (r) {
            res.json(200, r);
        }, function (err) {
            console.log(err);
            res.json(400, err);
        });
    });


    // Set up OAuth2 routes handling
    app.route('/oauth/authorize')
    .get(OAuth2Middleware.authorization, OAuth2Middleware.dialog)
    .post(OAuth2Middleware.decision);
    // app.post('/oauth/authorize/decision', OAuth2Middleware.decision);
    app.post('/oauth/token', OAuth2Middleware.token);

//

}


module.exports.routes = coreOAuth;
