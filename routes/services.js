var express = require('express'),
	bodyParser = require('body-parser'),
  request = require('request'),
 	Places = require('../models/places.js'),
  extend = require('extend');

var router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false }));

var API_KEY = 'AIzaSyAlVusxxXa10M5IA0WYYf15j3OlKTINzvk';
var API_WEATHER = 'c3440697a1704cd3f19e5b07d95229a2';
var SEARCH_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=25000&location=';
var GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
var PLACE_API = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';
//var radius = 500;
//'22.5296147,88.34662209999999&radius=500&types=hospital&key=AIzaSyAlVusxxXa10M5IA0WYYf15j3OlKTINzvk'

function compare(a, b){
  return a.pos - b.pos;
}

function sendData(res, places, contact){
  console.log("Send!!");
  places.sort(compare);
  var message = config.SMS_MESSAGE_1;
  for(var i =0; i<places.length;i++){
    message+='\n'+(i+1)+'.'+places[i].name+","+places[i].contact;
  }
  console.log(message);
  var request_url = config.MSG91_URL + "authkey=" + config.MSG91_AUTH + "&mobiles=" + contact + "&message=" + message + "&sender=" + config.SMS_SENDER + "&route=" + config.SMS_ROUTE;
  console.log(url);
  request({
    url: request_url,
      method: 'GET',

  }, function(error, response, body){
    console.log(response);
    if(error){
      console.log('ERROR_SENDING_OTP_MOBILE' + err);
      res.status(200).json(extend({data:'ERROR_SENDING_OTP_MOBILE'},{status:400}));
    }
    else if(response.statusCode == 200)
    {
      res.status(200).json(extend({data:'MSG_SENT_MOBILE'},{status:200}));
    }
    else if(response.statusCode == 207)
    {
      res.status(200).json(extend({data:'ERROR_AUTH_KEY_INVALID'},{status:400}));
    }
    else if(response.statusCode == 302)
    {
      res.status(200).json(extend({data:'ERROR_EXPIRED_USER_ACCOUNT'},{status:400}));
    }
    else if(response.statusCode == 303)
    {
      res.status(200).json(extend({data:'ERROR_BANNED_USER_ACCOUNT'},{status:400}));
    }
    else if(response.statusCode == 001)
    {
      res.status(200).json(extend({data:'ERROR_UNABLE_TO_CONNECT_DATABASE'},{status:400}));
    }
    else if(response.statusCode == 002)
    {
      res.status(200).json(extend({data: 'ERROR_UNABLE_TO_SELECT_DATABASE'},{status: 400}));
    }
  });
}

function getHospitalData(lat, long, type, res, contact){
  console.log("Getting Hospital Data");
       url = SEARCH_API + lat + ',' + long + '&types=hospital|ambulance&keyword=ambulance|hospital&key=' + API_KEY;
       request({
           url: url,
           method: 'GET',
           json: false,
       }, function(error, response, body){
           if(error) {
           console.log(error);
           res.status(200).json(extend({data: 'ERROR GETTING DATA'},{status: 400}));
           }
           else{
            console.log("Got search data!");
            var data = JSON.parse(body);
               var places = [];
               if(data.results.length === 0){
                 res.status(200).json(extend({data: 'ERROR GETTING DATA'},{status: 400}));
               }
               var count = 0;
               for(var i = 0; i<data.results.length;i++){
                   url = PLACE_API + data.results[i].place_id + '&key=' + API_KEY;
                   request({
                       url: url,
                       method: 'GET',
                       json: false,
                   }, function(error, response, body){
                       if(error) {
                         console.log(error);
                       }
                       else{
                        var place = {};
                        var d = JSON.parse(body);
                        place.name = d.result.name;
                        place.created_at = new Date().getTime();
                        place.id = d.result.id;
                        place.pos = count;
                        place.contact = d.result.international_phone_number;
                        if(place.contact){
                          places.push(place);
                          count++;
                        }
                        if( count == 5){
                            sendData(res, places, contact);
                          }
                      }
                    }
                  );
               }
               //res.status(200).json(extend({data: 'TICKET CREATED'},{status: 200}));
              }
              }
            );
       }

function getWeatherData(lat, long, type, res, contact){
  console.log("Getting Weather Data");

}

/************************* Get Info *****************************/

router.post('/', function(req, res){

    console.log("Incoming request");
    var type = req.body.type,
        address = req.body.address,
        source = req.body.source,
        destination = req.body.destination,
        days = req.body.forecast,
        contact = req.body.number;
        lat = 0,
        long = 0,
        url = '';

    if(address){
      url = GEOCODING_API + address + '&key=' + API_KEY;
      url=url.replace(' ','+');
    }

    request({
        url: url,
        method: 'GET',
        json: false,
    }, function(error, response, body){
        if(error) {
            console.log(error);
        res.status(200).json(extend({data: 'ERROR GETTING DATA'},{status: 400}));
        }
        else{
         var data = JSON.parse(body);
         lat = data.results[0].geometry.location.lat;
         long = data.results[0].geometry.location.lng;

          if(type.toLowerCase() == 'hospital'){
              getHospitalData(lat, long, type, res, contact);
          }
          else if(type.toLowerCase() == 'weather'){
            getWeatherData(lat, long, type, res, contact);
          }
      }
    }
  );
});

module.exports = router;
