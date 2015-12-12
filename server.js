var express = require('express'),
	bodyParser = require('body-parser');
	//connect = require('./config/dbConnection.js');

var earth = express();

earth.use(bodyParser.json());
earth.use(bodyParser.urlencoded({ extended: false }));


earth.use('/getInfo', require('./routes/services.js'));

module.exports = earth;
