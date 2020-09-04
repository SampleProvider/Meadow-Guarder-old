var mongojs = require('mongojs');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/mongo')[env];
module.exports = () = {
	var envUrl = process.env.[config.use_env_variable];
	var localUrl = `mongodb://${ config.host }/${ config.database }`;
	var mongoUrl = envUrl ? envUrl : localUrl;
	return mongojs.connect(mongoUrl);
};