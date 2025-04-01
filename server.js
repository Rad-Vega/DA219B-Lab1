require('dotenv').config()
const express = require('express')
const path = require('path')
const port = process.env.PORT;

const Dish = require('./models/dish');
const connectDb = require('./config/db.js')

const app = express()
// app.set('view engine', 'ejs')

connectDb()

app.use(express.json())
app.use(express.urlencoded())

// Serves static files in ./public 
app.use(express.static(path.join(__dirname, 'public')));

// Route for fetching dishes from MongoDB
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find({});
    res.json(dishes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something has gone wrong' });
  }
});

// Route for fetching dish by name from MongoDB
app.get('/api/dishes/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const safeName = escapeRegex(name);

    // Regex passed to Mongoose which converts param to
    // lowercase & looks for dish by name
    const dish = await Dish.find({ name: new RegExp(safeName, 'i') });

    if (!dish || dish.length === 0) {
      return res.status(404).json({ message: 'Dish does not exist' });
    }
    res.json(dish)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something has gone wrong' });
  }
});

// POST route for adding new dishes to DB
app.post('/api/dishes', async (req, res) => {
  try {
    const { name, ingredients, preparationSteps, cookingTime, origin, difficulty } = req.body;

    // Validation for three essential fields, name & ingredients & preparation
    if (!name || !Array.isArray(ingredients) || !Array.isArray(preparationSteps)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    // Search by Dish name. If it already exists in DB, return function & show collision error
    // Also uses regex passed to Mongoose which converts name param in request body to lowercase
    if ((await Dish.find({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') })).length > 0) {
      return res.status(409).json({ error: 'Dish already exists' });
    }

    const newDish = new Dish({
      name,
      ingredients,
      preparationSteps,
      cookingTime,
      origin,
      difficulty,
    });

    await newDish.save();
    res.status(201).json({ message: 'Dish added successfully', dish: newDish });
    console.log(newDish);
  } catch (error) {
    console.error('Error saving dish: ', error);
    res.status(500).json({ error: 'Internal error' });
  }
});


// Small helper function to escape unsafe Regex characters from user input
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// Starts server
app.listen(port);
console.log('Server started at http://localhost:' + port);