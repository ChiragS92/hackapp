var express = require('express'),
	bodyParser = require('body-parser'),
  request = require('request'),
 	Places = require('../models/places.js'),
  extend = require('extend');

var router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false }));

var API_KEY = 'AIzaSyAlVusxxXa10M5IA0WYYf15j3OlKTINzvk';
var API_KEY2 = 'AIzaSyAKFB32mr_VXoALb1VIS5iXqjgRxVJpXG0';
var SEARCH_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=25000&location=';
var GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
var PLACE_API = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';
//var radius = 500;
//'22.5296147,88.34662209999999&radius=500&types=hospital&key=AIzaSyAlVusxxXa10M5IA0WYYf15j3OlKTINzvk'

function compare(a, b){
  return a.pos - b.pos;
}

function sendData(res, places){
  console.log("Send!!");
  places.sort(compare);
  res.json(places);
}

function getHospitalData(lat, long, type, res){
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
            console.log(body);
               var places = [];
               console.log(data.results.length);
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
                        count++;
                        if(place.contact){
                          places.push(place);
                        }
                        if( count == data.results.length - 1){
                            sendData(res,places);
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

function getWeatherData(lat, long, type, res){
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
              getHospitalData(lat, long, type, res);
          }
          else if(type.toLowerCase() == 'weather'){
            getWeatherData(lat, long, type, res);
          }
      }
    }
  );
});

module.exports = router;
