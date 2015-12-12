var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var placeSchema = new Schema({
  id: String,
  phone_no: String,
  name: String,
  created_at: String
});

var Places = mongoose.model('PlaceDetails', placeSchema);
module.exports = Places;
