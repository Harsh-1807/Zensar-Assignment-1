const addRecipeBtn = document.getElementById('addRecipeBtn');
const recipeModal = document.getElementById('recipeModal');
const closeModal = document.getElementsByClassName('close')[0];
const saveRecipeBtn = document.getElementById('saveRecipeBtn');
const recipeList = document.getElementById('recipeList');
const searchInput = document.getElementById('searchInput');

let recipes = [];

// Open modal to add a new recipe
addRecipeBtn.onclick = function() {
    recipeModal.style.display = "block";
}

// Close modal
closeModal.onclick = function() {
    recipeModal.style.display = "none";
}

// Save the new recipe
saveRecipeBtn.onclick = function() {
    const title = document.getElementById('recipeTitle').value;
    const imageInput = document.getElementById('recipeImage');
    
	// Handle image upload
	let imageUrl = '';
	if (imageInput.files.length > 0) {
		const reader = new FileReader();
		reader.onload = function(event) {
			imageUrl = event.target.result;

			// Create a new recipe object
			const ingredients = document.getElementById('ingredients').value.split(',');
			const instructions = document.getElementById('instructions').value;

			const newRecipe = { title, imageUrl, ingredients, instructions };
			recipes.push(newRecipe);
			displayRecipes();
			clearModal();
			recipeModal.style.display = "none";
		}
		reader.readAsDataURL(imageInput.files[0]);
	}
}

// Display all recipes
function displayRecipes() {
	recipeList.innerHTML = '';
	recipes.forEach((recipe, index) => {
		const recipeCard = document.createElement('div');
		recipeCard.className = 'recipe-card';
		
		recipeCard.innerHTML = `
			<h3>${recipe.title}</h3>
			<img src="${recipe.imageUrl}" alt="${recipe.title}">
			<p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
			<p><strong>Instructions:</strong> ${recipe.instructions}</p>
			<button onclick="editRecipe(${index})">Edit</button>
			<button onclick="deleteRecipe(${index})">Delete</button>
		`;
		
		recipeList.appendChild(recipeCard);
	});
}

// Clear modal inputs
function clearModal() {
	document.getElementById('recipeTitle').value = '';
	document.getElementById('ingredients').value = '';
	document.getElementById('instructions').value = '';
	document.getElementById('recipeImage').value = '';
}

// Edit a recipe
function editRecipe(index) {
	const recipeToEdit = recipes[index];
	document.getElementById('recipeTitle').value = recipeToEdit.title;
	document.getElementById('ingredients').value = recipeToEdit.ingredients.join(', ');
	document.getElementById('instructions').value = recipeToEdit.instructions;

	const imagePreview = document.createElement('img');
	imagePreview.src = recipeToEdit.imageUrl;
	imagePreview.style.width = '100%';
	document.querySelector('.modal-content').insertBefore(imagePreview, saveRecipeBtn);
	
	saveRecipeBtn.onclick = function() {
        const title = document.getElementById('recipeTitle').value;

        const imageInput = document.getElementById('recipeImage');
        let imageUrl = '';
        if (imageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imageUrl = event.target.result;

                // Update the recipe object
                recipes[index] = { title, imageUrl, ingredients, instructions };
                displayRecipes();
                clearModal();
                recipeModal.style.display = "none";
            }
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // Update without changing the image
            recipes[index] = { title, imageUrl : recipeToEdit.imageUrl , ingredients : recipeToEdit.ingredients , instructions : recipeToEdit.instructions };
            displayRecipes();
            clearModal();
            recipeModal.style.display = "none";
        }
        
		
	};
	
	addRecipeBtn.onclick(); // Open the modal to edit the existing recipe
}

// Delete a recipe
function deleteRecipe(index) {
	if (confirm("Are you sure you want to delete this recipe?")) {
		recipes.splice(index, 1);
		displayRecipes();
	}
}

// Search functionality
searchInput.addEventListener('input', function() {
	const searchTerm = searchInput.value.toLowerCase();
	const filteredRecipes = recipes.filter(recipe => 
	    recipe.title.toLowerCase().includes(searchTerm) || 
	    recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))
	);
	
	if (filteredRecipes.length > 0) {
	    displayFilteredRecipes(filteredRecipes);
	} else {
	    displayRecipes(); // Show all if no match found
	}
});

// Display filtered recipes based on search input
function displayFilteredRecipes(filteredRecipes) {
	recipeList.innerHTML = '';
	filteredRecipes.forEach((recipe) => {
	    const recipeCard = document.createElement('div');
	    recipeCard.className = 'recipe-card';
	    
	    recipeCard.innerHTML = `
	        <h3>${recipe.title}</h3>
	        <img src="${recipe.imageUrl}" alt="${recipe.title}">
	        <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
	        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
	        <button onclick="editRecipe(${recipes.indexOf(recipe)})">Edit</button>
	        <button onclick="deleteRecipe(${recipes.indexOf(recipe)})">Delete</button>
	    `;
	    
	    recipeList.appendChild(recipeCard);
	});
}

// Close modal when clicking outside of it
window.onclick = function(event) {
	if (event.target == recipeModal) {
	    recipeModal.style.display = "none";
	    clearModal();
	    const imagePreviewElements= document.querySelectorAll('.modal-content img');
	    if (imagePreviewElements.length > 1){
	        imagePreviewElements[1].remove(); // Remove preview of old image when closing modal
	    }
	    
	}
}