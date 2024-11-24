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
app.get('/recipe/:recipeid', routes.recipe);
app.get('/ingredient_info/:ingredient', routes.ingredient_info)
app.get('/category_tops/:category', routes.category_tops);
app.get('/category_info/:category', routes.category_info);





app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
