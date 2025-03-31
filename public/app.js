function loadData() {
  fetch('/api/dishes')
    .then(res => res.json())
    .then(dishes => {
      console.log("click");
      console.log(dishes) // Prints dishes JSON to console
      const list = document.getElementById('dish-list');
      list.innerHTML = ''; // Clears old content
      // Create a table to display dishes
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginTop = '20px';

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

      // Table rows for each dish
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

      // Append the table to the dish-list
      list.appendChild(table);
    })
    .catch(err => {
      console.error('Error fetching dishes:', err);
    });
}