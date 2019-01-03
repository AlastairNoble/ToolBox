var mongoose = require("mongoose");

var toolSchema = new mongoose.Schema({
   title: String,
   price: String,
   phone: String,
   email: String,
   desc: String,
   
   image: String,
   
   drop: String,
   password: String,
   place: String,
   created: {type: Date, default: Date.now},
   confirmpassword:String,
   condition:String
   });
   
//expireAfterSeconds: 15778463; //hopefully expires all posts after 6 months
var tool = mongoose.model("tool", toolSchema);
module.exports = tool;



