import { useEffect, useState } from 'react';
import { Container, Link, Stack, Grid, Box, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import IngredientCard from '../components/IngredientCard';  // Ensure this path is correct for your project

const config = require('../config.json');


export default function IngredientListPage() {
  const [ingredientData, setIngredientData] = useState([]); // ingredient list
  const [selectedIngredientName, setSelectedIngredientName] = useState(null); // select item
  const [searchTerm, setSearchTerm] = useState(''); // search item
  const [triggerSearch, setTriggerSearch] = useState(false); // state to track "Go" button click


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

  // Filter for search functionality
  const matchingIngredient = filteredIngredients.find((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search bar */}  
      <Stack direction="row" spacing={2} sx={{ paddingBottom: '40px' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for an ingredient..."
        value={searchTerm}
        onChange={(e) => {
          const input = String(e.target.value); // convert input to string
          setSearchTerm(input)}}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          // Trim the spaces between words when button is clicked
          const trimmedSearchTerm = searchTerm.trim();
          setSearchTerm(trimmedSearchTerm);
          setTriggerSearch(true)}} // Set triggerSearch to true when clicked
        disabled={!searchTerm.trim()} // Disable the button if the search term is empty
      >
        Go
      </Button>
    </Stack>

        {/* Show IngredientCard if a search term matches */}
        {triggerSearch && searchTerm && matchingIngredient && (
          <IngredientCard
            ingredientName={searchTerm}
            handleClose={() => {
              setTriggerSearch(false);
              setSearchTerm('')
            }} // Clear search when card is closed and reset trigger
          />
        )}
        
        {/* Alphabet Navigation Bar */}
        <Box
          sx={{
            paddingBottom: '60px', // Adjust space below the navigation bar
            textAlign: 'center',
            position: 'relative',
            left: '-20px', // Move the navigation bar to the left
          }}
        >
          {letters.map(letter => (
            <Link
              key={letter}
              href={`#${letter}`} // Link to the section with this letter
              sx={{
                margin: '5px',
                padding: '8px 12px',
                textDecoration: 'none',
                border: '1px solid orange',
                borderRadius: '4px',
                color: 'black',
                fontWeight: 'bold',
                fontFamily: 'Georgia, serif',
                '&:hover': {
                  backgroundColor: 'orange',
                  color: 'white',
                },
              }}
            >
              {letter}
            </Link>
          ))}
        </Box>

        {/* Grouped Ingredients */}
        {letters.map((letter) => (
          <div key={letter} id={letter} style={{ marginBottom: '40px' }}>
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
                fontFamily: 'Georgia, serif',
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
