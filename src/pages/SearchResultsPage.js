import React, { useState, useEffect } from 'react';
import { Container, Link, Typography, Box, Modal } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RecipeCard from '../components/RecipeCard'; // Import the RecipeCard component
const config = require('../config.json');

export default function SearchResultsPage() {
  const [recipesData, setRecipesData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // State to track the selected recipe
  const [openModal, setOpenModal] = useState(false); // State to track modal visibility

  const queryParams = new URLSearchParams(window.location.search);

  // Fetch search results based on query parameters
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_recipe?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const recipesWithId = data.map((recipe, index) => ({
          id: index, // Add a unique ID for the DataGrid
          ...recipe,
        }));
        setRecipesData(recipesWithId);
      });
  }, [queryParams]);

  const handleRowClick = (recipe) => {
    setSelectedRecipe(recipe); // Set the clicked recipe as the selected one
    setOpenModal(true); // Open the modal
  };

  const closeModal = () => {
    setOpenModal(false); // Close the modal
    setSelectedRecipe(null); // Clear the selected recipe
  };

  const recipeColumns = [
    {
      field: 'name',
      headerName: 'Recipe Name',
      width: 300,
      renderCell: (params) => (
        <Link
          onClick={() => handleRowClick(params.row)} // Open the modal when clicking on the name
          style={{ cursor: 'pointer', color: '#FF7043' }}
        >
          {params.value}
        </Link>
      ),
    },
    { field: 'authorname', headerName: 'Author', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'recipecategory', headerName: 'Category', width: 200 },
    { field: 'avg_rate', headerName: 'Rating', width: 150 },
    { field: 'review_count', headerName: 'Reviews', width: 150 },
  ];

  return (
    <Container>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2.4rem',
          color: '#FF7043',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        Search Results
      </Typography>
      <DataGrid
        rows={recipesData}
        columns={recipeColumns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
      {selectedRecipe && (
        <Modal open={openModal} onClose={closeModal}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              height: '100vh',
              overflowY: 'auto', // Enable scrolling for long content
            }}
          >
            <RecipeCard recipe={selectedRecipe} handleClose={closeModal} />
          </Box>
        </Modal>
      )}
    </Container>
  );
}
