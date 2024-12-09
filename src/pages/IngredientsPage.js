import { useEffect, useState } from 'react';
import { Container, Link, Stack, Grid, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import IngredientCard from '../components/IngredientCard';  // Ensure this path is correct for your project

const config = require('../config.json');


export default function IngredientListPage() {
  const [ingredientData, setIngredientData] = useState([]);
  const [selectedIngredientName, setSelectedIngredientName] = useState(null);

  useEffect(() => {
    // Fetch ingredients list from the backend route
    fetch(`http://${config.server_host}:${config.server_port}/all_ingredients`)
      .then(res => res.json())
      .then(data => setIngredientData(data));
  }, []);

  // Filter out ingredients that start with '&'
  const filteredIngredients = ingredientData.filter(ingredient => {
    const firstChar = ingredient.name.charAt(0);
    return firstChar !== '&';
  });

  // store numeric-starting ingredients separately
  const numericGroup = [];

  // group alphabetical ingredients by first letter, and separate numeric ones
  const groupedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    const firstChar = ingredient.name.charAt(0);
    if (/\d/.test(firstChar)) {
      // this is a digit, push it into the numeric group
      numericGroup.push(ingredient);
    } else {
      // alphabetical character, uppercase for consistency
      const letter = firstChar.toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(ingredient);
    }
    return acc;
  }, {});

    // Sort the letters alphabetically
    const letters = Object.keys(groupedIngredients).sort();

  return (
    <Container>
      {/* If specific ingredient is selected, display the IngredientCard */}
      {selectedIngredientName && (
        <IngredientCard
          ingredientName={selectedIngredientName}
          handleClose={() => setSelectedIngredientName(null)}
        />
      )}
      <Stack direction='column' spacing={2} style={{ marginTop: '40px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '40px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}>
          Ingredients A-Z</h1>
        <p style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: 'gray',
          marginBottom: '25px',
        }}>
          Click on an ingredient to view details.</p>
        
        {letters.map((letter) => (
          <div key={letter} style={{ marginBottom: '40px' }}>
            {/* Box for the letter */}
            <Box
              sx={{
                display: 'inline-block',
                backgroundColor: 'black',
                color: 'white',
                padding: '5px 13px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textAlign: 'center',
                width: 'fit-content',
                marginBottom: '20px',
                fontFamily: 'Georgia, serif', // Change the font family
                fontSize: '24px', // Change the font size
              }}
            >
              {letter}
            </Box>
            <Grid container spacing={2} alignItems="flex-start">
              {groupedIngredients[letter].map((ingredient, index) => (
                <Grid item xs={12} sm={6} md={3} key={index} style={{ textAlign: 'left' }}>
                  <Link
                    component='button'
                    onClick={() => setSelectedIngredientName(ingredient.name)}
                    sx={{
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'block',
                      transition: 'color 0.1s',
                      '&:hover': {
                        color: 'orange', // hover color
                      },
                      '&:active': {
                        color: '#D2691E', // clicked color
                      },
                    }}
                  >
                    {ingredient.name}
                  </Link>
                </Grid>
              ))}
            </Grid>
          </div>
        ))}
      </Stack>
    </Container>
  );
}
