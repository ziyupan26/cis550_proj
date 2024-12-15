import React from 'react';
import { Modal, Box, Typography, Grid, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function RecipeCard({ recipe, handleClose }) {
  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto', // Allow scrolling if the content is too long
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh', // Set a maximum height for the card
          overflowY: 'auto', // Enable scrolling inside the card
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', serif",
            color: '#FF7043',
            marginBottom: '20px',
          }}
        >
          {recipe.name}
        </Typography>

        <Grid container spacing={2}>
          {/* Recipe Image */}
          <Grid item xs={12} md={6}>
            <img
              src={recipe.image}
              alt={recipe.name}
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Grid>

          {/* Recipe Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Author:</strong> {recipe.authorname}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Category:</strong> {recipe.recipecategory}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Average Rating:</strong> {recipe.avg_rate} ⭐
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Reviews:</strong> {recipe.review_count}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Cooking Time:</strong> {recipe.cooktime} mins
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Preparation Time:</strong> {recipe.preptime} mins
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              <strong>Calories:</strong> {recipe.calories} kcal
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ marginY: '20px' }} />

        {/* Recipe Description */}
        <Typography variant="h6" sx={{ marginBottom: '10px', color: '#FF7043' }}>
          Description
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '20px' }}>
          {recipe.description}
        </Typography>

        {/* Ingredients List */}
        <Typography variant="h6" sx={{ marginBottom: '10px', color: '#FF7043' }}>
          Ingredients
        </Typography>
        <List>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ingredient, index) => (
              <ListItem key={index} sx={{ paddingY: '5px' }}>
                <ListItemText primary={ingredient} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">No ingredients listed.</Typography>
          )}
        </List>

        <Divider sx={{ marginY: '20px' }} />

        {/* Instructions Section */}
        <Typography variant="h6" sx={{ marginBottom: '10px', color: '#FF7043' }}>
          Instructions
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '20px' }}>
          {recipe.instructions || 'No instructions provided.'}
        </Typography>

        {/* Close Button */}
        <Box
          sx={{
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              backgroundColor: '#FF7043',
              color: 'white',
              fontWeight: 'bold',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </Box>
      </Box>
    </Modal>
  );
}
