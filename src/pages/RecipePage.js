import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Divider, Container, Stack, Grid } from '@mui/material';
import RecipeIngredients from '../helpers/recipeingredient'
import RecipeInstructions from '../helpers/recipeinstruction'
import RecipeImages from '../helpers/recipeimages.js'
// import { NavLink } from 'react-router-dom';
const config = require('../config.json');

export default function RecipePage() {
  const { recipeId } = useParams();
  const [recipeData, setRecipeData] = useState({});
  // const [categoryData, setCategoryData] = useState({});
  const [barRadar, setBarRadar] = useState(true);

  useEffect(() => {        

      fetch(`http://${config.server_host}:${config.server_port}/recipe/${recipeId}`)
      .then(res => res.json())
      .then(recipeResJson => {
          console.log("Recipe Data:", recipeResJson); // Debug log
          setRecipeData(recipeResJson);
      });
  }, [recipeId]);
  


  // Update the document title when categoryData is fetched
  useEffect(() => {
    if (recipeData.name) {
        document.title = `${recipeData.name}`; // Set title dynamically based on category
    }
  }, [recipeData]);

  const chartData = [
      // { name: 'Calories', value: recipeData.calories},
      { name: 'Fat', value: recipeData.fatcontent},
      { name: 'Fiber', value: recipeData.fibercontent },
      { name: 'Protein', value: recipeData.proteincontent },
    ];
  
  const handleGraphChange = () => setBarRadar(!barRadar);

  return (
    <Container style={{marginTop:30, marginBottom: 50}}>
      <Stack direction="row" justifyContent="center" spacing={2}>
      {/* <Stack direction="row" spacing={2}> */}
        {/* Display recipe name */}
        <Stack>
          <Typography variant="h3" style={{fontFamily: 'Garamond'}}>
            {recipeData.name || 'Unknown Recipe'}
          </Typography>
          {/* <Typography variant="h6" color="textSecondary">{categoryData.recipecategory || 'Unknown Category'}</Typography> */}
        </Stack>
      </Stack>

      {/* Recipe details */}
      <Stack direction="row" spacing={4} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop:20 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Author: </strong>
          {recipeData.authorname || 'Unknown'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Cooktime: </strong>
          {recipeData.cooktime ? `${recipeData.cooktime} min` : 'Unknown'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Preptime: </strong>
          {recipeData.preptime ? `${recipeData.preptime} min` : 'Unknown'}
        </Typography>
        <Typography variant="body1" gutterBottom >
          <strong>Average Rating: </strong>
          {recipeData.avg_rate ? `${recipeData.avg_rate}` : 'Unknown'}
        </Typography>
      </Stack>

      <Divider style={{ marginTop: 20, marginBottom: 20 }} />

      <RecipeImages images={recipeData.url} />

      {/* <Stack direction="row" spacing={4} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop:20 }}>
        <RecipeIngredients ingredients={recipeData.ingredients} />
        <RecipeInstructions instructions={recipeData.recipeinstructions} />
      </Stack> */}
      {/* <RecipeIngredients ingredients={recipeData.ingredients} />
      <RecipeInstructions instructions={recipeData.recipeinstructions} /> */}

      <Grid container spacing={4} style={{ marginTop: 20 }}>
        <Grid item xs={12} md={6}>
          <RecipeIngredients ingredients={recipeData.ingredients} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecipeInstructions instructions={recipeData.recipeinstructions} />
        </Grid>
      </Grid>


      <Divider style={{ marginTop: 20, marginBottom: 20 }} />

      <Typography variant="body1" gutterBottom>
        <h2>Nutrition Facts:</h2>
      </Typography>
      <ButtonGroup variant="contained" color="primary" aria-label="Graph Toggle" style={{justifyContent: "center" }}>
        <Button disabled={barRadar} onClick={handleGraphChange}>Bar</Button>
        <Button disabled={!barRadar} onClick={handleGraphChange}>Radar</Button>
      </ButtonGroup>

      <div style={{ marginTop: 20, width: "90%", justifyContent: "center" }}>
        {barRadar ? (

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" />
              <Bar dataKey="value" stroke="#BFD641" fill="#BFD641" />
              <Tooltip cursor={{ fill: 'transparent' }} />
            </BarChart>
          </ResponsiveContainer>

        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              {/* <PolarRadiusAxis /> */}
              <Radar dataKey="value" stroke="#BFD641" fill="#BFD641" />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <Divider style={{ marginTop: 20, marginBottom: 20 }} />

      {recipeData.recent_reviews && Array.isArray(recipeData.recent_reviews) && (
        <div>
          <Typography variant="body1" gutterBottom>
            <h2>Recent Reviews:</h2>
          </Typography>
          {recipeData.recent_reviews.map((reviewItem, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <div>{reviewItem.reviewer}:</div> {/* Reviewer on a separate row */}
              <div style={{fontFamily: "cursive", marginLeft:20, color: "grey"}}>{reviewItem.review}</div> {/* Review content on a separate row */}
            </div>
          ))}
        </div>
      )}


    </Container>
  );
}
