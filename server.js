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


// Small helper function to escape unsafe Regex characters from user input
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// Starts server
app.listen(port);
console.log('Server started at http://localhost:' + port);