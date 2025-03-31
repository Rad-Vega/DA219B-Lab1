const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  preparationSteps: [String],
  cookingTime: String,
  origin: String,
  difficulty: String
});

module.exports = mongoose.model('dish', dishSchema);
