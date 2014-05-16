var errors = require('errors'),
    _ = require('lodash');


function createError (args) {
  errors.create(args);
}

module.exports.init = function () {
  errors.stacks(true);
  return function (req, res, next) {
    var jsondata = require('../config/errors.json');
    
    _.invoke(jsondata, createError);

    next(); 
  };
};

/**
 * creates a new error object using the
 * errortype as an argument. Errors can be defined
 * in /config/errors.json file
 * @param  {[type]} errorType the name of the error 
 * to be thrown
 * @return {object}           Error Object
 */
module.exports.nounce = function (errorType) {
  var E = errors[errorType];
  return new E().toString();
};

/**
 * creates a new error using a http response 
 * status code as an argument
 * @param  {Number | String} statusCode http response status code
 * @param {string} message optional message
 * @return {object}            error object
 */
module.exports.httpError = function httpError (statusCode, message) {
  var code = 'Http' + statusCode + 'Error';
  return new errors[code](message);
};