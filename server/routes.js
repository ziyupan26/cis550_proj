const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));


/********************************
 * HOMEPAGE ROUTES *
 ********************************/
// Route 1: GET /random
const random = async function(req, res) {

    // create a dictionary to map month to related keyword list
    const monthKeyword = {
        1: ["Winter", "Snow", "New Year", "Family"],
        2: ["Winter", "Valentine", "Love", "Snow"],
        3: ["Spring", "Grow", "Flowers", "Green"],
        4: ["Spring", "Flowers", "Growth", "Healthy"],
        5: ["Spring", "Flowers", "Warm", "Blossom", "Healthy"],
        6: ["Summer", "Sun", "Chill", "Vacation", "Cool", "< 60 Mins"],
        7: ["Summer", "Cool", "Holiday", "Vacation", "Healthy"],
        8: ["Summer", "Vacation", "Sunshine", "Relax"],
        9: ["Autumn", "Fruit", "Soup", "Apple", "Oven", "Easy"],
        10: ["Autumn", "Pumpkin", "Healthy", "Halloween", "Grains"],
        11: ["Autumn", "Thanksgiving", "< 60 Mins", "Oven"],
        12: ["Poultry", "Meat", "Holiday", "Christmas", "< 4 Hours"]
    };

    // check the time of access and determine the month
    // Get the current month and corresponding keywords
    const currentMonth = new Date().getMonth() + 1;
    const currKeywords = monthKeyword[currentMonth];
    const conditions = currKeywords.map(k => `keywords LIKE '%${k}%'`).join(' OR ');
    
    // connection.query() function takes three main parameters: 
        // query string;
        // an array of values to replace the placeholders in the query string, each value corresponds to a placeholder (e.g., $1, $2);
        // a callback Function (optional): A function that handles the results of the query.
    connection.query(`
        SELECT *
        FROM recipes
        WHERE ${conditions}
        ORDER BY RANDOM()
        LIMIT 1
    `, (err, data) => {
      if (err) {
        // If there is an error for some reason, print the error message and
        // return an empty object instead
        console.log(err);
        // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
        // return type you may need to return an empty array [] instead.
        res.json({});
      } else {
        // log the row
        console.log(data.rows[0]);
        let images = data.rows[0].images || [];
        // Convert stringified array to an actual array
        if (typeof images === 'string') {
        images = images.replace(/'/g, '"'); // Replace single quotes with double quotes
        try {
            images = JSON.parse(images); // Parse the modified string as JSON
        } catch (error) {
            console.error('Error parsing images:', error);
            images = []; // Default to an empty array if parsing fails
        }
        }

        // Get the last image, or set to null if images array is empty
        const lastImage = images && images.length > 0 ? images[images.length - 1] : null;
        res.json({
            // return the recipe name, picture, and description of the recipe
            name: data.rows[0].name,
            description: data.rows[0].description,
            // last image in the images array
            // image: data.rows[0].images[data.rows[0].images.length - 1],
            image: lastImage 
        });
      }
    });
  }


// Route 2: GET /search_recipe
const search_recipe = async function (req, res) {
  // Search recipe through ingredients, filter by cook time, prep time,
  // review rating, and show the recipe in order of descending rating, 
  // review count and submitted time
  const ingredients = req.query.ingredients ?? '';
  const cooktimeLow = req.query.cooktime_low ?? 0;
  const cooktimeHigh = req.query.cooktime_high ?? 120;
  const preptimeLow = req.query.preptime_low ?? 0;
  const preptimeHigh = req.query.preptime_high ?? 120;
  const ratingLow = req.query.avg_rate_low ?? 0;
  const ratingHigh = req.query.avg_rate_high ?? 5;
  const caloriesLow = req.query.calories_low ?? 0;
  const caloriesHigh = req.query.calories_high ?? 10000; 

  const queryParams = [];
  let query = `
  WITH avg_rate AS (
    SELECT recipeid, TO_CHAR(datesubmitted, 'YYYY-MM-DD') date, 
    ROUND(AVG(rating),2) avg_rate, COUNT(review) review_count
    FROM reviews
    GROUP BY recipeid, datesubmitted
  )
  SELECT DISTINCT rc.name, rc.authorname, rc.description, rc.recipecategory,
  a.avg_rate, a.review_count, date
  FROM recipes rc
  JOIN avg_rate a ON rc.recipeid = a.recipeid
  WHERE 1=1
  `;

  if (ingredients){
    query += `AND ingredients LIKE $${queryParams.length + 1}`;
    queryParams.push(`%${ingredients}%`);
  }
  if (cooktimeLow){
    query += `AND cooktime >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(cooktimeLow));
  }
  if (cooktimeHigh){
    query += `AND cooktime <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(cooktimeHigh));
  }
  if (preptimeLow){
    query += `AND preptime >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(preptimeLow));
  }
  if (preptimeHigh){
    query += `AND preptime <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(preptimeHigh));
  }
  if (ratingLow){
    query += `AND a.avg_rate >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(ratingLow));
  }
  if (ratingHigh){
    query += `AND a.avg_rate <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(ratingHigh));
  }
  if (caloriesLow){
    query += `AND calories >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(caloriesLow));
  }
  if (caloriesHigh){
    query += `AND calories <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(caloriesHigh));
  }

  query += `ORDER BY a.avg_rate DESC, a.review_count DESC, date DESC`;

  connection.query(query, queryParams, (err,data)=>{
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows);
    }
  })
}

/********************************
 * BASIC recipe/ingredient INFO ROUTES *
 ********************************/

// ROUTE 3: GET /recipe/:recipeid
const recipe = async function(req, res) {
  // Show a recipe (e.g. 10711), including its name, ingredients, nutritional
  // information, instructions, rating, 5 most recent reviews
  connection.query(`
    WITH review_rank AS (
        SELECT reviewid, recipeid, authorid, authorname, review,
        ROW_NUMBER() OVER (
        PARTITION BY recipeid
        ORDER BY datesubmitted DESC
        ) as review_rank
        FROM reviews
        WHERE recipeid = $1
    )
    SELECT name, recipes.authorname, cooktime, preptime,
    totaltime, recipecategory, ingredients, recipeinstructions,
    calories, fatcontent, fibercontent, proteincontent, avg(rating)
    avg_rate,
    JSON_AGG(
    JSON_BUILD_OBJECT(
        'reviewer', rr.authorname,
        'review', rr.review
        )
      ) FILTER (WHERE rr.review_rank <= 5) as recent_reviews
    FROM recipes
    JOIN review_rank rr ON rr.recipeid=recipes.recipeid
    JOIN reviews rv ON rv.recipeid=recipes.recipeid
    WHERE recipes.recipeid = $1
    GROUP BY recipes.recipeid,name, recipes.authorname,
    cooktime, preptime, totaltime, recipecategory,
    ingredients, recipeinstructions,
    calories, fatcontent, fibercontent, proteincontent
    `,[req.params.recipeid]
    , (err, data) => {
      if (err){
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows[0]);
      }
    }
  )
}

// ROUTE 4: GET /ingredient_info/:ingredient
const ingredient_info = async function(req, res) {
  // Show an ingredient (e.g. peanuts), including its energy per kcalcory,
  // protein per g, fat per g, carbon per g, fiber per mg, sugar per g, Vitamin (A, B6, B12, C, D2, E)

  connection.query(`
    SELECT im.ingredient AS name, im.descrip AS description, energykcal,
    proteing, fatg, carbg, fiberg, sugarg, vitcmg, vitb6mg, vitb12mcg,
    vitamcg, vitemg, vitd2mcg
    FROM ingredients_matching im
    JOIN ingredients i ON i.ndbno = im.ndbno
    WHERE im.ingredient = $1
    `, 
    [req.params.ingredient],
    (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}

/********************************
 * CATEGORY INFO ROUTES *
 ********************************/

// ROUTE 5: GET /









  // Export the functions
  module.exports = {
    random,
    search_recipe,
    recipe,
    ingredient_info
  }
