var mongoose = require('mongoose'),
	config = require('../config/config.js')

var dbURI = config.DB_URL;

console.log("Opening connection");
mongoose.connect(dbURI);
console.log('Mongoose default connection open to ' + dbURI);

mongoose.connection.on('error',function (err) {  
  	console.log('Mongoose default connection error: ' + err);
}); 

mongoose.connection.on('disconnected', function () {  
  	console.log('Mongoose default connection disconnected');
});