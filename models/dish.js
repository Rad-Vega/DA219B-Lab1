const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ingredients: [String],
  preparationSteps: [String],
  cookingTime: String,
  origin: String,
  difficulty: String
});

module.exports = mongoose.model('dish', dishSchema);
