const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/random', routes.random);
app.get('/search_recipe', routes.search_recipe)
app.get('/recipe/:recipeId', routes.recipe);

app.get('/all_ingredients', routes.all_ingredients);
app.get('/ingredient_info/:ingredient', routes.ingredient_info);

app.get('/category_tops', routes.category_tops);
app.get('/category/:recipecategory', routes.category);
app.get('/category_info/:recipecategory', routes.category_info);

app.get('/top_contributors', routes.getTopContributors);
// app.get('/healthy_recipes', routes.getHealthyRecipes);
// app.get('/nutrition_guide', routes.getNutritionGuide);
// app.get('/preparation_time', routes.preparation_time);

app.get('/calculate_nutrition/:nutritionType/:ingredients', routes.calculate_nutrition);

// app.get('/seasonal_recipe', routes.seasonal_recipe);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
