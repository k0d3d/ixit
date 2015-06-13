var restler = require('restler'),
    util = require('util'),
    debug = require('debug')('dkeep-token-validator'),
    config = require('config');

function TokenRequest (userAgent) {
  this.userAgent = userAgent;
}

TokenRequest.prototype.constructor = TokenRequest;


TokenRequest.prototype.request = function (cb) {
  var self = this;
  restler.post(config.dkeep_api_url + '/request-token', {
    data: {
      clientId: config.appID,
      userAgent: self.userAgent
    }
  })
  .on('success', function (data) {
    // debug(data);
    cb(data);
  })
  .on('error', function (err) {
    cb(err);
  });
};


module.exports.TokenRequest = TokenRequest;


module.exports = function () {

  return function (req, res, next) {
    var r = new TokenRequest(req.useragent);
    r.request(function (signedToken) {
      if (util.isError(signedToken)) {
        next(signedToken);
      } else {
        res.setHeader('dkeep-agent-id-token', signedToken);
        next();
        // res.status(200).send(signedToken);
      }
    });
  };

};



