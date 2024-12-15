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
// Given the current month, return a random recipe that is related to the month
const random = async function (req, res) {
  // Create a dictionary to map month to related keyword list
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
    12: ["Poultry", "Meat", "Holiday", "Christmas", "< 4 Hours"],
  };

  // Check the time of access and determine the month
  const currentMonth = new Date().getMonth() + 1;
  const currKeywords = monthKeyword[currentMonth];
  const conditions = currKeywords.map((k) => `keywords LIKE '%${k}%'`).join(" OR ");

  connection.query(
    `
      SELECT *
      FROM recipes rc
      LEFT JOIN (
          SELECT recipeid, ROUND(AVG(rating), 2) AS avg_rate, COUNT(review) AS review_count
          FROM reviews
          GROUP BY recipeid
      ) a ON rc.recipeid = a.recipeid
      WHERE (${conditions}) AND images IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 1
    `,
    (err, data) => {
      if (err) {
        // Log the error and return an empty object if the query fails
        console.error(err);
        res.json({});
      } else if (data.rows.length > 0) {
        // Parse `images`
        let images = data.rows[0].images || [];
        if (typeof images === "string") {
          try {
            console.log("Raw images value before parsing:", images);
            images = images.replace(/'/g, '"'); // Replace single quotes with double quotes
            images = JSON.parse(images); // Attempt to parse
          } catch (err) {
            console.error("Error parsing images JSON:", err);
            images = []; // Default to empty array
          }
        }

        // Parse `ingredients`
        let ingredients = data.rows[0].ingredients || [];
        if (typeof ingredients === "string") {
          try {
            console.log("Raw ingredients value before parsing:", ingredients);
            ingredients = ingredients.replace(/'/g, '"'); // Convert to valid JSON
            ingredients = JSON.parse(ingredients); // Attempt to parse
          } catch (err) {
            console.error("Error parsing ingredients JSON:", err);
            ingredients = []; // Fallback to an empty array
          }
        }

        // Get the last image, or set to null if images array is empty
        const lastImage = images.length > 0 ? images[images.length - 1] : null;

        res.json({
          // Return all required recipe details
          name: data.rows[0].name,
          description: data.rows[0].description,
          authorname: data.rows[0].authorname,
          recipecategory: data.rows[0].recipecategory,
          cooktime: data.rows[0].cooktime,
          preptime: data.rows[0].preptime,
          calories: data.rows[0].calories,
          ingredients: ingredients,
          instructions: data.rows[0].instructions || "No instructions provided.",
          avg_rate: data.rows[0].avg_rate || "N/A",
          review_count: data.rows[0].review_count || 0,
          image: lastImage,
        });
      } else {
        // Return an empty object if no rows are found
        res.json({});
      }
    }
  );
};


// Route 2: GET /search_recipe
const search_recipe = async function (req, res) {
  // Search recipe through ingredients, filter by cook time, prep time,
  // review rating, and show the recipe in order of descending rating, 
  // review count and submitted time
  // test: http://localhost:8080/search_recipe?ingredients=egg
  const ingredients = req.query.ingredients ?? '';
  const cooktimeLow = req.query.cooktime_low ?? 0;
  const cooktimeHigh = req.query.cooktime_high ?? 120;
  const preptimeLow = req.query.preptime_low ?? 0;
  const preptimeHigh = req.query.preptime_high ?? 120;
  const ratingLow = req.query.avg_rate_low ?? 0;
  const ratingHigh = req.query.avg_rate_high ?? 5;
  const caloriesLow = req.query.calories_low ?? 0;
  const caloriesHigh = req.query.calories_high ?? 10000;
  const unwant = req.query.unwant ?? '';

  const queryParams = [];
  let query = `
  WITH avg_rate AS (
    SELECT recipeid, TO_CHAR(datesubmitted, 'YYYY-MM-DD') date, 
    ROUND(AVG(rating),2) avg_rate, COUNT(review) review_count
    FROM reviews
    GROUP BY recipeid, datesubmitted
  )
  SELECT DISTINCT rc.recipeid, rc.name, rc.authorname, rc.description, rc.recipecategory,
  a.avg_rate, a.review_count, date
  FROM recipes rc
  JOIN avg_rate a ON rc.recipeid = a.recipeid
  WHERE 1=1
  `;

  if (ingredients){
    query += ` AND ingredients LIKE $${queryParams.length + 1}`;
    queryParams.push(`%${ingredients}%`);
  }
  if (cooktimeLow){
    query += ` AND cooktime >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(cooktimeLow));
  }
  if (cooktimeHigh){
    query += ` AND cooktime <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(cooktimeHigh));
  }
  if (preptimeLow){
    query += ` AND preptime >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(preptimeLow));
  }
  if (preptimeHigh){
    query += ` AND preptime <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(preptimeHigh));
  }
  if (ratingLow){
    query += ` AND a.avg_rate >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(ratingLow));
  }
  if (ratingHigh){
    query += ` AND a.avg_rate <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(ratingHigh));
  }
  if (caloriesLow){
    query += ` AND calories >= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(caloriesLow));
  }
  if (caloriesHigh){
    query += ` AND calories <= $${queryParams.length + 1}`;
    queryParams.push(parseFloat(caloriesHigh));
  }
  if (unwant){
    query += ` AND NOT EXISTS (
        SELECT 1
        FROM ingredients_matching im
        WHERE im.ingredient = $${queryParams.length + 1}
          AND rc.recipeingredientparts LIKE '%' || im.ingredient || '%'
    )`;
    queryParams.push(unwant);
  }

  query += ` ORDER BY a.avg_rate DESC, a.review_count DESC, a.date DESC`;

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
 * RECIPE INFO ROUTES *
 ********************************/

// ROUTE 3: GET /recipe/:recipeid
const recipe = async function(req, res) {
  // Show a recipe (e.g. 10711), including its name, ingredients, nutritional
  // information, instructions, rating, 5 most recent reviews
  // test: http://localhost:8080/recipe/10711
  connection.query(
    `
    WITH review_rank AS (
        SELECT reviewid, recipeid, authorid, authorname, review, rating,
            ROW_NUMBER() OVER (
                PARTITION BY recipeid
                ORDER BY datesubmitted DESC
            ) AS review_rank
        FROM reviews
        WHERE recipeid = $1
    )
    SELECT name, recipes.authorname, cooktime, preptime, totaltime, recipecategory,
        ingredients, recipeinstructions, calories, fatcontent, fibercontent,
        proteincontent, ROUND(AVG(rr.rating),2) AS avg_rate, 
        CASE WHEN images='[]' THEN 'https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png'
              ELSE images END AS url, 
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'reviewer', rr.authorname,
                'review', rr.review
            )
        ) FILTER (WHERE rr.review_rank <= 5) AS recent_reviews
    FROM recipes
    LEFT JOIN review_rank rr ON rr.recipeid = recipes.recipeid
    WHERE recipes.recipeid = $1
    GROUP BY recipes.recipeid, name, recipes.authorname, cooktime, preptime,
        totaltime, recipecategory, ingredients, recipeinstructions, calories, fatcontent,
        fibercontent, proteincontent
    `
    ,[req.params.recipeId]
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


/********************************
 * INGREDIENT INFO ROUTES *
 ********************************/
// ROUTE 4: GET /all_ingredients
const all_ingredients = async function(req, res) {
  // Show an ingredient (e.g. peanuts), including its energy per kcalcory,
  // protein per g, fat per g, carbon per g, fiber per mg, sugar per g, Vitamin (A, B6, B12, C, D2, E)
  // test: http://localhost:8080/all_ingredients
  connection.query(`
    SELECT UPPER(LEFT(im.ingredient, 1)) || SUBSTR(ingredient, 2) AS name
    FROM ingredients_matching im
    ORDER BY name
    `,
    (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows);
    }
  });
}

// ROUTE 5: GET /ingredient_info/:ingredient
const ingredient_info = async function(req, res) {
  // Show an ingredient (e.g. peanuts), including its energy per kcalcory,
  // protein per g, fat per g, carbon per g, fiber per mg, sugar per g, Vitamin (A, B6, B12, C, D2, E)
  // test: http://localhost:8080/ingredient_info/pork
  const ingredient = req.params.ingredient;
  connection.query(`
    SELECT im.ingredient AS name, im.descrip AS description, energykcal,
    proteing, fatg, carbg, fiberg, sugarg, vitcmg, vitb6mg, vitb12mcg,
    vitamcg, vitemg, vitd2mcg
    FROM ingredients_matching im
    JOIN ingredients i ON i.ndbno = im.ndbno
    WHERE im.ingredient ILIKE $1
    `, 
    [ingredient],
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

// ROUTE 6: GET /category_tops
// Retrieve all the highest-rated recipes in one category along with its rating and 
// review count for this category 
// --> can be implemented as a side bar allowing users to click on a category and see
// the highest-rated recipe for that category
// URL: http://localhost:8080/category_tops
// http://localhost:8080/category_tops?page=1&page_size=5
const category_tops = async function(req, res) {
  // const userInput = req.params.category;
  // pagination
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 50;;

  if (!page) {
    connection.query(
      `
      WITH category_ratings AS (
          SELECT r.recipecategory, r.recipeID, AVG(re.rating) AS AvgRating
          FROM recipes r
                  JOIN reviews re ON r.recipeID = re.recipeID
          GROUP BY r.recipecategory, r.recipeID
      ),
          image_links AS (
              SELECT recipeid,
                      trim(both '''' from split_part(
                              replace(replace(images, '[', ''), ']', ''), ', ', 1)) AS first_url
              FROM recipes
          ),
          ranked_categories AS (
              SELECT
                  cr.recipecategory,
                  i.first_url AS url,
                  ROW_NUMBER() OVER (PARTITION BY cr.recipecategory ORDER BY cr.recipeID) AS row_num
              FROM category_ratings cr
                        JOIN recipes r ON cr.recipeID = r.recipeID
                        JOIN image_links i ON cr.recipeid = i.recipeid
          )
      SELECT recipecategory,
            CASE WHEN url='' THEN 'https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png'
              ELSE url END AS url
      FROM ranked_categories
      WHERE row_num = 1;`
      , (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  } else {
    const offset = (page - 1) * pageSize;
    connection.query(
      `
      WITH category_ratings AS (
          SELECT r.recipecategory, r.recipeID, AVG(re.rating) AS AvgRating
          FROM recipes r
                  JOIN reviews re ON r.recipeID = re.recipeID
          GROUP BY r.recipecategory, r.recipeID
      ),
          image_links AS (
              SELECT recipeid,
                      trim(both '''' from split_part(
                              replace(replace(images, '[', ''), ']', ''), ', ', 1)) AS first_url
              FROM recipes
          ),
          ranked_categories AS (
              SELECT
                  cr.recipecategory,
                  i.first_url AS url,
                  ROW_NUMBER() OVER (PARTITION BY cr.recipecategory ORDER BY cr.recipeID) AS row_num
              FROM category_ratings cr
                        JOIN recipes r ON cr.recipeID = r.recipeID
                        JOIN image_links i ON cr.recipeid = i.recipeid
          )
      SELECT recipecategory,
            CASE WHEN url='' THEN 'https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png'
              ELSE url END AS url
      FROM ranked_categories
      WHERE row_num = 1
      LIMIT $1 OFFSET $2
      `
      , [pageSize, offset]
      , (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  }
}

// ROUTE 7: get a specific category
const category = async function(req, res) {
  connection.query(
    `
      WITH category_ratings AS (
          SELECT r.recipecategory, r.recipeID, AVG(re.rating) AS AvgRating
          FROM recipes r
                  JOIN reviews re ON r.recipeID = re.recipeID
          WHERE r.recipecategory = $1
          GROUP BY r.recipecategory, r.recipeID
      ),
          image_links AS (
              SELECT recipeid,
                      trim(both '''' from split_part(
                              replace(replace(images, '[', ''), ']', ''), ', ', 1)) AS first_url
              FROM recipes
          ),
          ranked_categories AS (
              SELECT
                  cr.recipecategory,
                  i.first_url AS url,
                  ROW_NUMBER() OVER (PARTITION BY cr.recipecategory ORDER BY cr.recipeID) AS row_num
              FROM category_ratings cr
                        JOIN recipes r ON cr.recipeID = r.recipeID
                        JOIN image_links i ON cr.recipeid = i.recipeid
          )
      SELECT recipecategory,
            CASE WHEN url='' THEN 'https://i.ibb.co/W5WM4v8/maskable-icon-removebg-preview.png'
              ELSE url END AS url
      FROM ranked_categories
      WHERE row_num = 1;`
    ,[req.params.recipecategory]
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

// ROUTE 8: GET /category_info/:category
// CATEGORY INFO: Display the recipes for each category in the order of 
// descending rating (like AlbumInfo page)
// URL: http://localhost:8080/category_info/Asian
const category_info = async function(req, res) {
  // pagination
  const page = parseInt(req.query.page); // Ensure it's a number
  const pageSize = parseInt(req.query.page_size ?? 10);
  const inputCategory = req.params.recipecategory;

  // Validate inputs
  if (!inputCategory) {
    return res.status(400).json({ error: 'Category is required' });
  }

  try {
    if(!page) {
      connection.query(`
        WITH category_ratings AS (
          SELECT
              r.recipecategory,
              r.recipeID,
              r.name AS recipename,
              ROUND(AVG(re.rating), 2) AS avgrating,
              COUNT(re.ReviewID) AS reviewcount
          FROM recipes r
          JOIN reviews re ON r.recipeID = re.recipeID
          GROUP BY r.recipecategory, r.recipeID, r.name
        )
        SELECT
          cr.recipecategory,
          cr.recipeid,
          cr.recipename,
          cr.avgrating,
          cr.reviewcount
        FROM category_ratings cr
        WHERE cr.recipecategory = $1
        ORDER BY cr.avgrating DESC, cr.reviewcount DESC
        `, [inputCategory], (err, data) => {
        if (err) {
          console.error('Query error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!data || !data.rows) {
          console.error('No data returned');
          return res.status(404).json({ error: 'No data found' });
        }

        console.log('Sending data:', data.rows); // Debug log
        return res.json(data.rows);
      });
    } else {
      const offset = (page - 1) * pageSize;
      
      if (offset < 0) {
        return res.status(400).json({ error: 'Invalid page number' });
      }

      connection.query(`
        WITH category_ratings AS (
          SELECT
              r.recipecategory,
              r.recipeID,
              r.name AS RecipeName,
              AVG(re.rating) AS avgrating,
              COUNT(re.ReviewID) AS reviewcount
          FROM recipes r
          JOIN reviews re ON r.recipeID = re.recipeID
          GROUP BY r.recipecategory, r.recipeID, r.name
        )
        SELECT
          cr.recipecategory,
          cr.recipeid,
          cr.recipename,
          cr.avgrating,
          cr.reviewcount
        FROM category_ratings cr
        WHERE cr.recipecategory = $1
        ORDER BY cr.avgrating DESC, cr.reviewcount DESC
        LIMIT ${pageSize}
        OFFSET ${offset};
        `, [inputCategory], (err, data) => {
        if (err) {
          console.error('Query error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!data || !data.rows) {
          console.error('No data returned');
          return res.status(404).json({ error: 'No data found' });
        }

        console.log('Sending data:', data.rows); // Debug log
        return res.json(data.rows);
      });  
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

/********************************
 * Contributor INFO ROUTES *
 ********************************/
// Route 9: Get top contributors
const getTopContributors = async function (req, res) {
  const query = `
    WITH avg_recipe_rating AS (
      SELECT r.authorid, r.authorname, ROUND(AVG(rv.rating), 2) AS avg_rating, COUNT(rv.reviewid) AS review_count
      FROM recipes r
      JOIN reviews rv ON r.recipeid = rv.recipeid
      GROUP BY r.authorid, r.authorname
    )
    SELECT u.authorid, ar.authorname, ar.avg_rating, ar.review_count
    FROM users u
    JOIN avg_recipe_rating ar ON u.authorid = ar.authorid
    ORDER BY ar.avg_rating DESC, ar.review_count DESC
    LIMIT 10;
  `;

  try {
    const data = await connection.query(query);
    res.status(200).json(data.rows);
  } catch (err) {
    console.error('Error fetching top contributors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/********************************
 * CALCULATOR ROUTES *
 ********************************/
// ROUTE 10: GET /calculate_nutrition/:ingredient
// Calculate the total value of a specific nutrition (user input) of a list of ingredients (user input)
// Test URL: http://localhost:8080/calculate_nutrition/energyKcal/egg,flour,milk
//           http://localhost:8080/calculate_nutrition/proteinG/blueberries,butter,flour,sugar

const calculate_nutrition = async function(req, res) {

  const nutritionType = req.params.nutritionType;
  const ingredients = req.params.ingredients ? req.params.ingredients.split(',') : [];

  // check if both nutrition type and ingredients are provided
  if (!Array.isArray(ingredients) || ingredients.length === 0 ||nutritionType === undefined) {
    return res.status(400).json({ error: 'Must have valid nutrition type and ingredient(s).' });
  }
  // Create an array of placeholders for the ingredients, starting with $2
  const ingredientPlaceholders = ingredients.map((_, index) => `$${index + 2}`).join(', ');

  const query = `WITH SelectedIngredients AS (
      SELECT ndbNo, descrip
      FROM INGREDIENTS_MATCHING
      WHERE ingredient IN (${ingredientPlaceholders})
    )
    SELECT SUM(
      CASE
        WHEN $1 = 'energyKcal' THEN energyKcal
        WHEN $1 = 'proteinG' THEN proteinG
        WHEN $1 = 'saturatedFatsG' THEN saturatedFatsG
        WHEN $1 = 'fatG' THEN fatG
        WHEN $1 = 'carbG' THEN carbG
        WHEN $1 = 'fiberG' THEN fiberG
        WHEN $1 = 'sugarG' THEN sugarG
        WHEN $1 = 'calciumMg' THEN calciumMg
        WHEN $1 = 'ironMg' THEN ironMg
        WHEN $1 = 'magnesiumMg' THEN magnesiumMg
        WHEN $1 = 'phosphorusMg' THEN phosphorusMg
        WHEN $1 = 'potassiumMg' THEN potassiumMg
        WHEN $1 = 'sodiumMg' THEN sodiumMg
        WHEN $1 = 'zincMg' THEN zincMg
        WHEN $1 = 'copperMcg' THEN copperMcg
        WHEN $1 = 'manganeseMg' THEN manganeseMg
        WHEN $1 = 'seleniumMcg' THEN seleniumMcg
        WHEN $1 = 'vitCMg' THEN vitCMg
        WHEN $1 = 'thiaminMg' THEN thiaminMg
        WHEN $1 = 'riboflavinMg' THEN riboflavinMg
        WHEN $1 = 'niacinMg' THEN niacinMg
        WHEN $1 = 'vitB6Mg' THEN vitB6Mg
        WHEN $1 = 'folateMcg' THEN folateMcg
        WHEN $1 = 'vitB12Mcg' THEN vitB12Mcg
        WHEN $1 = 'vitAMcg' THEN vitAMcg
        WHEN $1 = 'vitEMg' THEN vitEMg
        WHEN $1 = 'vitD2Mcg' THEN vitD2Mcg
        ELSE 0
      END
    ) AS total_nutrition_value
    FROM INGREDIENTS i
    JOIN SelectedIngredients si ON i.ndbNo = si.ndbNo
  `;

  // Combine nutritionType and ingredients into a single array for query param
  const queryParams = [nutritionType, ...ingredients];

  connection.query(query, queryParams,
   (err, data) => {
   if (err) {
     console.log(err);
     res.json({});
   } else {
     res.json({
      name: nutritionType,
      value: data.rows[0]?.total_nutrition_value || null,
     });
   }
 });
}


  // Export the functions
  module.exports = {
    random,
    search_recipe,
    recipe,
    
    all_ingredients,
    ingredient_info,

    category_tops,
    category,
    category_info,

    getTopContributors,

    calculate_nutrition,
  }
