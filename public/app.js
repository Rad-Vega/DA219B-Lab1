// Conditional function, returns fetch by name route if name search parameter, fetch all if not
function fetchDishes(name = '') {
  const url = name ? `/api/dishes/${encodeURIComponent(name)}` : '/api/dishes';
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Dish not found");
      return res.json();
    });
}

function showDishes(dishes) {
  console.log("click");
  console.log(dishes) // Prints dishes JSON to console
  const list = document.getElementById('dish-list');
  list.innerHTML = ''; // Clears old content
  // Create a table to display dishes
  const table = document.createElement('table');

  // Table headers
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f4f4f4';
  headerRow.innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Origin</th>
        <th>Cooking Time</th>
        <th>Difficulty</th>
        <th>Ingredients</th>
        <th>Preparation Steps</th>
        <th>Actions</th>
      `;
  table.appendChild(headerRow);

  // Table rows for each dish, iterates over fetched collection from DB
  dishes.forEach(dish => {
    const row = document.createElement('tr');

    row.innerHTML = `
          <td>${dish.id}</td>
          <td>${dish.name}</td>
          <td>${dish.origin}</td>
          <td>${dish.cookingTime}</td>
          <td>${dish.difficulty}</td>
          <td>
            <ul>
              ${dish.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
          </td>
          <td>
            <ol>
              ${dish.preparationSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </td>
          <td>
            <button onclick="startEdit('${dish.id}')">Update</button>
          </td>
        `;

    table.appendChild(row);
  });

  // Append the table to the 'dish-list'
  list.appendChild(table);
}

// Handler to pass fetchDishes path to showDishes, shows all 
function loadAll() {
  fetchDishes()
    .then(showDishes)
    .catch(err => alert(err.message));
}

// Function used when searching for dish by name using the form
function loadByName() {
  const input = document.getElementById('search-input').value;
  if (!input.trim()) return alert('Please enter dish name');

  fetchDishes(input.trim())
    .then(dishes => {
      // In case backend returns one object instead of array
      if (!Array.isArray(dishes)) dishes = [dishes];
      showDishes(dishes);
    })
    .catch(err => alert(err.message));
}

function addDish(event) {
  event.preventDefault(); // prevents page reload

  const form = document.getElementById('add-dish-form');
  const formData = new FormData(form);
  const dishId = formData.get('dishId');

  // Convert FormData to object
  const dishData = {
    id: formData.get('id'),
    name: formData.get('name'),
    origin: formData.get('origin'),
    cookingTime: formData.get('cookingTime'),
    difficulty: formData.get('difficulty'),
    ingredients: formData.get('ingredients').split(',').map(i => i.trim()),
    preparationSteps: formData.get('preparationSteps').split(',').map(s => s.trim())
  };


  const requestMethod = dishId ? 'PUT' : 'POST';
  console.log(requestMethod);
  const route = dishId ? `/api/dishes/${dishId}` : `/api/dishes`;

  // Runs POST request to route, passing in new dish data 
  fetch(route, {
    method: requestMethod,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dishData)
  })
    .then(res => res.json())
    .then(data => {
      data.message ? alert(data.message) : alert(data.error);
      //alert(data.message);
      form.reset();
      // Reset form header & submit button text in case of update 
      document.getElementById('form-submit').textContent = 'Add Dish';
      document.getElementById('form-header').textContent = 'Add New Dish'
      document.getElementById('dish-id').value = '';

      loadAll(); // reload updated table
    })
    .catch(err => {
      console.error('Failed to add dish:', err);
      alert('Failed to add dish');
    });
}

// Handler for editing dish, populates Add form with target dish attributes fetched via GET route by ID
function startEdit(id) {
  fetch(`/api/dishes/id/${id}`)
    .then(res => res.json())
    .then(dishes => {
      const dish = Array.isArray(dishes) ? dishes[0] : dishes;
      console.log(dish);
      if (!dish || dish.length === 0) return alert("Dish not found");

      document.querySelector('[name="id"]').value = dish.id;
      document.querySelector('[name="name"]').value = dish.name;
      document.querySelector('[name="origin"]').value = dish.origin;
      document.querySelector('[name="cookingTime"]').value = dish.cookingTime;
      document.querySelector('[name="difficulty"]').value = dish.difficulty;
      document.querySelector('[name="ingredients"]').value = Array.isArray(dish.ingredients) ? dish.ingredients.join(',') : '';
      document.querySelector('[name="preparationSteps"]').value = Array.isArray(dish.preparationSteps) ? dish.preparationSteps.join(',') : '';
      document.getElementById('dish-id').value = dish.id;

      document.getElementById('form-submit').textContent = 'Update';
      document.getElementById('form-header').textContent = 'Update the Dish'
    });
}
