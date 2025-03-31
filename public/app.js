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
        <th>Name</th>
        <th>Origin</th>
        <th>Cooking Time</th>
        <th>Difficulty</th>
        <th>Ingredients</th>
        <th>Preparation Steps</th>
      `;
  table.appendChild(headerRow);

  // Table rows for each dish, iterates over fetched collection from DB
  dishes.forEach(dish => {
    const row = document.createElement('tr');

    row.innerHTML = `
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