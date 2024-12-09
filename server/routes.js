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
  SELECT DISTINCT rc.name, rc.authorname, rc.description, rc.recipecategory,
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
 * BASIC recipe/ingredient INFO ROUTES *
 ********************************/

// ROUTE 3: GET /recipe/:recipeid
const recipe = async function(req, res) {
  // Show a recipe (e.g. 10711), including its name, ingredients, nutritional
  // information, instructions, rating, 5 most recent reviews
  // test: http://localhost:8080/recipe/10711
  connection.query(`
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
        proteincontent, AVG(rr.rating) AS avg_rate,
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
// ROUTE 4.1: GET /all_ingredients
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

// ROUTE 4: GET /ingredient_info/:ingredient
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
    WHERE im.ingredient = $1
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

// ROUTE 5: GET /category_tops/:category
// Retrieve all the highest-rated recipes in one category along with its rating and 
// review count for this category 
// --> can be implemented as a side bar allowing users to click on a category and see
// the highest-rated recipe for that category
// URL: http://localhost:8080/categories/Apple
const category_tops = async function(req, res) {
  const userInput = req.params.category;
  // pagination
  const page = req.query.page;
  const pageSize = req.query.page_size ? req.query.page_size : 10;

  if (!page) {
    connection.query(`
      WITH category_ratings AS (
        SELECT r.recipecategory, r.recipeID, CAST(AVG(re.rating) AS INT) AS AvgRating, COUNT(re.ReviewID) AS ReviewCount
        FROM recipes r
        JOIN reviews re ON r.recipeID = re.recipeID
        GROUP BY r.recipecategory, r.recipeID
      )
      SELECT cr.recipecategory AS category, r.name AS RecipeName, cr.AvgRating, cr.ReviewCount
      FROM category_ratings cr
      JOIN recipes r ON cr.recipeID = r.recipeID
      WHERE (cr.recipecategory, cr.AvgRating) IN (
        SELECT recipecategory, MAX(AvgRating)
        FROM category_ratings
        GROUP BY recipecategory)
      AND cr.recipecategory = $1
      `, [userInput], (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  } else {
    const offset = (page - 1) * pageSize;
    connection.query(`
      WITH category_ratings AS (
        SELECT r.recipecategory, r.recipeID, CAST(AVG(re.rating) AS INT) AS AvgRating, COUNT(re.ReviewID) AS ReviewCount
        FROM recipes r
        JOIN reviews re ON r.recipeID = re.recipeID
        GROUP BY r.recipecategory, r.recipeID
      )
      SELECT cr.recipecategory AS category, r.name AS RecipeName, cr.AvgRating, cr.ReviewCount
      FROM category_ratings cr
      JOIN recipes r ON cr.recipeID = r.recipeID
      WHERE (cr.recipecategory, cr.AvgRating) IN (
        SELECT recipecategory, MAX(AvgRating)
        FROM category_ratings
        GROUP BY recipecategory)
      AND cr.recipecategory = $1
      LIMIT ${pageSize}
      OFFSET ${offset}
      `, [userInput], (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  }
}



// ROUTE 6: GET /category_info/:category
// CATEGORY INFO: Display the recipes for each category in the order of 
// descending rating (like AlbumInfo page)
// URL: http://localhost:8080/category_info/Asian

const category_info = async function(req, res) {
  // pagination
  const page = req.query.page;
  const pageSize = req.query.page_size ? req.query.page_size : 10;
  const inputCategory = req.params.category;

  if(!page) {
    connection.query(`
      WITH category_ratings AS (
        SELECT
            r.recipecategory,
            r.recipeID,
            r.name AS RecipeName,
            ROUND(AVG(re.rating), 2) AS AvgRating,
            COUNT(re.ReviewID) AS ReviewCount
        FROM recipes r
        JOIN reviews re ON r.recipeID = re.recipeID
        GROUP BY r.recipecategory, r.recipeID, r.name
      )
      SELECT
        cr.recipecategory,
        cr.RecipeName,
        cr.AvgRating,
        cr.ReviewCount
      FROM category_ratings cr
      WHERE cr.recipecategory = $1
      ORDER BY cr.AvgRating DESC, cr.ReviewCount DESC
      `, [inputCategory], (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  } else {
    const offset = (page - 1) * pageSize;
    connection.query(`
      WITH category_ratings AS (
        SELECT
            r.recipecategory,
            r.recipeID,
            r.name AS RecipeName,
            AVG(re.rating) AS AvgRating,
            COUNT(re.ReviewID) AS ReviewCount
        FROM recipes r
        JOIN reviews re ON r.recipeID = re.recipeID
        GROUP BY r.recipecategory, r.recipeID, r.name
      )
      SELECT
        cr.recipecategory,
        cr.RecipeName,
        cr.AvgRating,
        cr.ReviewCount
      FROM category_ratings cr
      WHERE cr.recipecategory = $1
      ORDER BY cr.AvgRating DESC, cr.ReviewCount DESC
      LIMIT ${pageSize}
      OFFSET ${offset};
      `, [inputCategory], (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });  
  }
}

// Route 7: Get top contributors
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

//Route 8: Healthy Recipe
const getHealthyRecipes = async function (req, res) {
  const query = `
  WITH categorized_recipes AS (
    SELECT recipeid, name, calories, carbohydratecontent, fatcontent, proteincontent, 'Low-Carb' AS category
    FROM recipes
    WHERE carbohydratecontent <= 15
      AND calories <= 500
  
    UNION ALL
  
    SELECT recipeid, name, calories, carbohydratecontent, fatcontent, proteincontent, 'Vegan' AS category
    FROM recipes
    WHERE ingredients NOT ILIKE ANY (ARRAY['%meat%', '%chicken%', '%fish%', '%egg%', '%dairy%', '%honey%'])
  
    UNION ALL
  
    SELECT recipeid, name, calories, carbohydratecontent, fatcontent, proteincontent, 'Keto' AS category
    FROM recipes
    WHERE carbohydratecontent <= 10
      AND fatcontent >= 20
      AND proteincontent >= 10
  
    UNION ALL
  
    SELECT recipeid, name, calories, carbohydratecontent, fatcontent, proteincontent, 'Gluten-Free' AS category
    FROM recipes
    WHERE ingredients NOT ILIKE ANY (ARRAY['%wheat%', '%barley%', '%rye%', '%oats%'])
  ),
  ranked_recipes AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY calories ASC) AS rn
    FROM categorized_recipes
  )
  SELECT recipeid, name, calories, carbohydratecontent, fatcontent, proteincontent, category
  FROM ranked_recipes
  WHERE rn <= 20
  ORDER BY category, calories ASC;
  
  `;

  try {
    console.log('Executing query:', query);
    const data = await connection.query(query);

    if (data.rows.length === 0) {
      console.warn('No healthy recipes found');
      return res.status(404).json({ error: 'No healthy recipes found' });
    }

    console.log('Query results:', data.rows);
    res.status(200).json(data.rows);
  } catch (err) {
    console.error('Error fetching healthy recipes:', {
      query,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Route 9: Nuitrition Guide
const getNutritionGuide = async function (req, res) {
  const query = `
  WITH recent_reviews AS (
    SELECT 
      re.recipeid,
      COUNT(re.reviewid) AS recent_reviews,
      ROUND(AVG(re.rating), 2) AS avg_rating
    FROM reviews re
    WHERE re.datesubmitted >= NOW() - INTERVAL '3 months'
    GROUP BY re.recipeid
    HAVING COUNT(re.reviewid) > 10 AND AVG(re.rating) >= 4.0
  ),
  all_reviews AS (
    SELECT 
      re.recipeid,
      COUNT(re.reviewid) AS recent_reviews,
      ROUND(AVG(re.rating), 2) AS avg_rating
    FROM reviews re
    GROUP BY re.recipeid
  ),
  categorized_recipes AS (
    SELECT 
      r.recipeid,
      r.name,
      r.calories,
      r.fibercontent,
      r.proteincontent,
      r.fatcontent,
      rr.recent_reviews,
      rr.avg_rating,
      'Trending' AS category
    FROM recipes r
    JOIN recent_reviews rr ON r.recipeid = rr.recipeid
    WHERE r.calories <= 600
    
    UNION ALL
    
    SELECT 
      r.recipeid,
      r.name,
      r.calories,
      r.fibercontent,
      r.proteincontent,
      r.fatcontent,
      ar.recent_reviews,
      ar.avg_rating,
      'High-Fiber' AS category
    FROM recipes r
    JOIN all_reviews ar ON r.recipeid = ar.recipeid
    WHERE r.fibercontent >= 8 AND r.calories <= 500
    
    UNION ALL
    
    SELECT 
      r.recipeid,
      r.name,
      r.calories,
      r.fibercontent,
      r.proteincontent,
      r.fatcontent,
      ar.recent_reviews,
      ar.avg_rating,
      'Low-Calorie' AS category
    FROM recipes r
    JOIN all_reviews ar ON r.recipeid = ar.recipeid
    WHERE r.calories <= 300
    
    UNION ALL
    
    SELECT 
      r.recipeid,
      r.name,
      r.calories,
      r.fibercontent,
      r.proteincontent,
      r.fatcontent,
      ar.recent_reviews,
      ar.avg_rating,
      'High-Protein' AS category
    FROM recipes r
    JOIN all_reviews ar ON r.recipeid = ar.recipeid
    WHERE r.proteincontent >= 15 AND r.fatcontent <= 10
  )
  SELECT 
    recipeid, 
    name, 
    calories, 
    fibercontent, 
    proteincontent, 
    fatcontent, 
    recent_reviews, 
    avg_rating, 
    category
  FROM categorized_recipes
  ORDER BY category, avg_rating DESC, recent_reviews DESC;  
  `;

  try {
    const data = await connection.query(query);
    res.status(200).json(data.rows);
  } catch (err) {
    console.error('Error fetching nutrition guide:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Route 10: GET /preparation_time
const preparation_time = async function(req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10; // The query parameter names match what's being sent from the frontend (page_size instead of pageSize)

  if (!page){
    connection.query(
      `SELECT
      CASE
        WHEN r.preptime <= 30 THEN '0-30 mins'
        WHEN r.preptime BETWEEN 31 AND 60 THEN '31-60 mins'
        WHEN r.preptime BETWEEN 61 AND 90 THEN '61-90 mins'
        ELSE '90+ mins'
        END AS PrepTimeRange,
      AVG(re.rating) AS AvgRating
   FROM
      recipes r
        JOIN
      reviews re ON r.recipeid = re.recipeid
   GROUP BY
      PrepTimeRange
   ORDER BY
      PrepTimeRange
   limit 20
        `, 
      (err, data) => {
        if (err) {
          console.log(err);
          res.json({})
        } else {
          res.json(data.rows)
        }
      }
    )
  } else {
    const offset = (page - 1) * pageSize
    connection.query(
      `SELECT
      CASE
        WHEN r.preptime <= 30 THEN '0-30 mins'
        WHEN r.preptime BETWEEN 31 AND 60 THEN '31-60 mins'
        WHEN r.preptime BETWEEN 61 AND 90 THEN '61-90 mins'
        ELSE '90+ mins'
        END AS PrepTimeRange,
      AVG(re.rating) AS AvgRating
   FROM
      recipes r
        JOIN
      reviews re ON r.recipeid = re.recipeid
   GROUP BY
      PrepTimeRange
   ORDER BY
      PrepTimeRange
      LIMIT $1 OFFSET $2
      `, [pageSize, offset]
      , (err, data) => {
        if (err) {
          console.log(err)
          res.json({})
        } else {
          res.json(data.rows)
        }
      }
    )
  }
}

// ROUTE 11: GET /calculate_nutrition/:nutritionType/:ingredients
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


// Route 12: GET /seasonal_recipe
const seasonal_recipe = async function(req, res) {

  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page){
    connection.query(
      `WITH seasonal_reviews AS (
     SELECT r.recipeid, r.name, r.recipeinstructions,
        EXTRACT(MONTH FROM r.datepublished) AS month,
        COUNT(rv.reviewid) AS review_count,
        ROUND(AVG(rv.rating), 2) AS avg_rating
     FROM recipes r
     LEFT JOIN reviews rv ON r.recipeid = rv.recipeid
     GROUP BY r.recipeid, r.name, r.recipeinstructions, month
   ),
   season_category AS (
     SELECT recipeid, name, recipeinstructions,
        CASE
          WHEN month IN (3, 4, 5) THEN 'Spring'
          WHEN month IN (6, 7, 8) THEN 'Summer'
          WHEN month IN (9, 10, 11) THEN 'Fall'
          ELSE 'Winter'
        END AS season,
        review_count, avg_rating
     FROM seasonal_reviews
     WHERE avg_rating > 4.50
   ),
   ranked_recipes AS (
     SELECT recipeid, name, recipeinstructions, season, review_count, avg_rating,
        ROW_NUMBER() OVER (PARTITION BY season ORDER BY avg_rating DESC) AS rank
     FROM season_category
     WHERE review_count > 20
   )
   SELECT recipeid, name, recipeinstructions, season, avg_rating, review_count
   FROM ranked_recipes
   WHERE rank <= 100
   ORDER BY season, avg_rating DESC
   limit 20
        `, 
      (err, data) => {
        if (err) {
          console.log(err);
          res.json({})
        } else {
          res.json(data.rows)
        }
      }
    )
  } else {
    const offset = (page - 1) * pageSize
    connection.query(
      `WITH seasonal_reviews AS (
     SELECT r.recipeid, r.name, r.recipeinstructions,
        EXTRACT(MONTH FROM r.datepublished) AS month,
        COUNT(rv.reviewid) AS review_count,
        ROUND(AVG(rv.rating), 2) AS avg_rating
     FROM recipes r
     LEFT JOIN reviews rv ON r.recipeid = rv.recipeid
     GROUP BY r.recipeid, r.name, r.recipeinstructions, month
   ),
   season_category AS (
     SELECT recipeid, name, recipeinstructions,
        CASE
          WHEN month IN (3, 4, 5) THEN 'Spring'
          WHEN month IN (6, 7, 8) THEN 'Summer'
          WHEN month IN (9, 10, 11) THEN 'Fall'
          ELSE 'Winter'
        END AS season,
        review_count, avg_rating
     FROM seasonal_reviews
     WHERE avg_rating > 4.50
   ),
   ranked_recipes AS (
     SELECT recipeid, name, recipeinstructions, season, review_count, avg_rating,
        ROW_NUMBER() OVER (PARTITION BY season ORDER BY avg_rating DESC) AS rank
     FROM season_category
     WHERE review_count > 20
   )
   SELECT recipeid, name, recipeinstructions, season, avg_rating, review_count
   FROM ranked_recipes
   WHERE rank <= 100
   ORDER BY season, avg_rating DESC
      LIMIT $1 OFFSET $2
      `, [pageSize, offset]
      , (err, data) => {
        if (err) {
          console.log(err)
          res.json({})
        } else {
          res.json(data.rows)
        }
      }
    )
  }
};



  // Export the functions
  module.exports = {
    random,
    search_recipe,
    recipe,
    all_ingredients,
    ingredient_info,
    category_tops,
    category_info,
    // addToBookmark,
    // removeFromBookmark,
    getTopContributors,
    getHealthyRecipes,
    getNutritionGuide,
    preparation_time,
    calculate_nutrition,
    seasonal_recipe,
  }
