var _ = require('underscore');

/**
 * [_formatFileSize Formats the file size to be rendered]
 * @param  {[type]} bytes [description]
 * @return {[type]}       [description]
 */
 exports._formatFileSize = function (bytes) {
  if (typeof bytes !== 'number') {
    return '';
  }
  if (bytes >= 1000000000) {
    return (bytes / 1000000000).toFixed(2) + ' GB';
  }
  if (bytes >= 1000000) {
    return (bytes / 1000000).toFixed(2) + ' MB';
  }
  return (bytes / 1000).toFixed(2) + ' KB';
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  var buf = [], 
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 
  charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};


/**
 * Sets the headers and data properties to be sent
 * in a http request.
 * 
 * @param  {Object} params An Object containing properties like extra headers, body, etc
 * @return {[type]}        Object
 */
exports.restParams = function(params){
  params = (_.isUndefined(params)) ? {} : params;
  var headers = { 
    'Accept': '*/*', 
    'User-Agent': config.app.user_agent 
  };
  var data = {};
  if(params.headers){
    _.extend(headers, params.headers);
  }
  if(params.data){
    _.extend(data, params.data);
  }
  return {
    headers: headers,
    data: data
  };

};
