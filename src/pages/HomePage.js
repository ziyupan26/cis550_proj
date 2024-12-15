import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Slider, TextField } from '@mui/material';
import RecipeCard from '../components/RecipeCard';
import { useNavigate } from 'react-router-dom'; // For navigation to search results page
const config = require('../config.json');

export default function HomePage() {
  const navigate = useNavigate(); // Initialize navigation hook

  // State for Star Recipe of the Month
  const [starRecipe, setStarRecipe] = useState(null);
  const [showRecipeCard, setShowRecipeCard] = useState(false);

  // State for Search Filters and Results
  const [ingredient, setIngredient] = useState('');
  const [unwantIngredient, setUnwantIngredient] = useState('');
  const [cookTime, setCookTime] = useState([0, 120]);
  const [prepTime, setPrepTime] = useState([0, 120]);
  const [calories, setCalories] = useState([0, 1000]);
  const [rating, setRating] = useState([0, 5]);

  // State for Top Contributors
  const [topContributors, setTopContributors] = useState([]);

  // Fetch the Star Recipe of the Month
  useEffect(() => {
    if (!starRecipe) {
      fetch(`http://${config.server_host}:${config.server_port}/random`)
        .then((res) => res.json())
        .then((data) => setStarRecipe(data));
    }
  }, [starRecipe]);

  // Fetch Top Contributors
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/top_contributors`)
      .then((res) => res.json())
      .then((data) => setTopContributors(data));
  }, []);

  // Navigate to Search Results Page with Query Parameters
  const searchRecipes = () => {
    const query = new URLSearchParams({
      ingredients: ingredient,
      unwant: unwantIngredient,
      cooktime_low: cookTime[0],
      cooktime_high: cookTime[1],
      preptime_low: prepTime[0],
      preptime_high: prepTime[1],
      calories_low: calories[0],
      calories_high: calories[1],
      avg_rate_low: rating[0],
      avg_rate_high: rating[1],
    }).toString();

    navigate(`/search_results?${query}`);
  };

  return (
    <Container style={{ padding: '20px' }}>
      {/* Section 1: Search Recipes */}
      <section
        style={{
          padding: '20px',
          backgroundColor: '#FFF8E1', // Lightest section
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: '2.4rem',
            color: '#FFB74D',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
            marginBottom: '20px',
          }}
        >
          Find Your Perfect Recipe 🍴
        </h1>

        <Grid container spacing={6}>
          <Grid item xs={6}>
            <TextField
              label="Ingredient"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="e.g., chicken, egg, tomato"
              style={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Unwanted Ingredient"
              value={unwantIngredient}
              onChange={(e) => setUnwantIngredient(e.target.value)}
              placeholder="e.g., nuts, dairy"
              style={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={6}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Cook Time (mins)</p>
            <Slider
              value={cookTime}
              min={0}
              max={120}
              step={5}
              onChange={(e, newValue) => setCookTime(newValue)}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Prep Time (mins)</p>
            <Slider
              value={prepTime}
              min={0}
              max={120}
              step={5}
              onChange={(e, newValue) => setPrepTime(newValue)}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Calories</p>
            <Slider
              value={calories}
              min={0}
              max={1000}
              step={50}
              onChange={(e, newValue) => setCalories(newValue)}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Average Rating</p>
            <Slider
              value={rating}
              min={0}
              max={5}
              step={0.1}
              onChange={(e, newValue) => setRating(newValue)}
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button
            onClick={searchRecipes}
            style={{
              backgroundColor: '#FF8A65',
              color: '#fff',
              fontWeight: 'bold',
              padding: '10px 20px',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Search Recipes 🔍
          </Button>
        </div>
      </section>

      {/* Section 2: Star Recipe of the Month */}
      <section
        style={{
          padding: '20px',
          backgroundColor: '#FFE0B2', // Medium section
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8rem',
            color: '#FF9800',
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          🌟 Star Recipe of the Month 🌟
        </h1>
        {starRecipe && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={starRecipe.image}
              alt={starRecipe.name}
              style={{
                width: '100%',
                maxWidth: '400px',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '10px',
                marginBottom: '10px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              }}
            />
            <h3
              style={{
                fontFamily: "'Merriweather', serif",
                fontSize: '1.6rem',
                color: '#F57C00',
                cursor: 'pointer',
                textDecoration: 'none',
                margin: '0',
                fontWeight: 'bold',
              }}
              onClick={() => setShowRecipeCard(true)}
            >
              {starRecipe.name}
            </h3>
          </div>
        )}
      </section>

      {/* Section 3: Top Contributors */}
      <section
        style={{
          padding: '20px',
          backgroundColor: '#FFCC80', // Darkest section
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.4rem',
            color: '#FF7043',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          🏆 Top Contributors 🏆
        </h1>

        <Grid container spacing={3}>
          {topContributors.map((contributor, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <div
                style={{
                  backgroundColor: '#FFF3E0',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Merriweather', serif",
                    fontSize: '1.2rem',
                    color: '#FF7043',
                    margin: '0 0 10px 0',
                  }}
                >
                  {contributor.authorname}
                </h3>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#4E342E' }}>
                  Avg Rating: {contributor.avg_rating} ⭐
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#4E342E' }}>
                  Reviews: {contributor.review_count}
                </p>
              </div>
            </Grid>
          ))}
        </Grid>
      </section>

      {/* Modal for Star Recipe */}
      {showRecipeCard && (
        <RecipeCard
          recipe={starRecipe}
          handleClose={() => setShowRecipeCard(false)}
        />
      )}
    </Container>
  );
}