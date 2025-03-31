function loadData() {
  fetch('/api/dishes')
    .then(res => res.json())
    .then(dishes => {
      console.log("click");
      console.log(dishes)
      const list = document.getElementById('dish-list');
      list.innerHTML = ''; // Clears old content
      dishes.forEach(dish => {
        const item = document.createElement('li');
        item.textContent = `${dish.name} (${dish.origin}) - ${dish.cookingTime}`;
        list.appendChild(item);
      });
    });
}