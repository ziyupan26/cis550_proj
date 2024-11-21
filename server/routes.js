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


// Route 2: GET /









  // Export the functions
  module.exports = {
    random
  }