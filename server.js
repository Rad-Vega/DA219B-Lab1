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

// PUT route for updating dish
app.put('/api/dishes/:id', async (req, res) => {
  try {
    console.log(req.body);
    // Handles collisions with DB
    if (await Dish.findOne({ id: parseInt(req.params.id) })) {
      return res.status(409).json({ error: 'Dish already exists! Update aborted' });
    }

    const updatedDish = await Dish.findOneAndUpdate({
      id: parseInt(req.params.id)
    },
      req.body, {
      new: true
    });

    console.log(updatedDish);
    if (!updatedDish) return res.status(404).json({ error: 'Dish not found' });

    res.json({ message: 'Dish updated successfully', dish: updatedDish });
  } catch (error) {
    console.error('Update operation failed:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Route for retrieving dish info & checking ID before Update
app.get('/api/dishes/id/:id', async (req, res) => {
  try {
    console.log("in ID catch. ID is " + req.params.id);
    const dish = await Dish.findOne({ id: parseInt(req.params.id) });
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    res.json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching by ID' });
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
    const { id, name, ingredients, preparationSteps, cookingTime, origin, difficulty } = req.body;

    // Validation for three essential fields, name & ingredients & preparation
    if (!id || !name || !Array.isArray(ingredients) || !Array.isArray(preparationSteps)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    // Handles collisions with DB
    if (await Dish.findOne({ id: parseInt(id) })) {
      return res.status(409).json({ error: 'Dish already exists' });
    }

    // Search by Dish name. If it already exists in DB, return function & show collision error
    // Also uses regex passed to Mongoose which converts name param in request body to lowercase
    if ((await Dish.find({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') })).length > 0) {
      return res.status(409).json({ error: 'Dish already exists' });
    }

    const newDish = new Dish({
      id,
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

// DELETE route for removing dishes from DB
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const deleteDish = await Dish.findOneAndDelete({ id: parseInt(req.params.id) });

    if (!deleteDish) {
      return res.status(404).json({ error: 'Dish not found!' });
    }
    res.json({ message: 'Dish successfully deleted!' });
  } catch (error) {
    console.error('Delete failed: ', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Small helper function to escape unsafe Regex characters from user input
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// Starts server
app.listen(port);
console.log('Server started at http://localhost:' + port);