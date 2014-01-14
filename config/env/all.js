var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 80,
  db: process.env.MONGO_URL,
  appID: '08E54688615982ADB5D8E3FEB8DCE2C',
  appSecret: 'xynl7HycdsRulJ3IDvzernI8fsywclxod334lRFUIcKjkNJLEH6UFgVk7epXT9O'
};