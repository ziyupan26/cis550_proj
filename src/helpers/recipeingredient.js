import React from 'react';

const RecipeIngredients = ({ ingredients }) => {
  // Function to ensure we have a proper array of ingredients
  const parseIngredients = (ingredientsData) => {
    if (!ingredientsData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(ingredientsData)) return ingredientsData;
    
    // If it's a string that looks like an array, parse it
    if (typeof ingredientsData === 'string' && 
        ingredientsData.startsWith('[') && 
        ingredientsData.endsWith(']')) {
      try {
        return JSON.parse(ingredientsData);
      } catch (e) {
        // If parsing fails, split by comma and clean up
        return ingredientsData
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/['"`]/g, ''));
      }
    }
    
    // If it's a simple string, split by comma
    if (typeof ingredientsData === 'string') {
      return ingredientsData.split(',').map(item => item.trim());
    }
    
    return [];
  };

  const parsedIngredients = parseIngredients(ingredients);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ingredients:</h2>
      {parsedIngredients.length > 0 ? (
        <ul className="list-disc pl-6 space-y-2">
          {parsedIngredients.map((ingredient, index) => (
            <li key={index} className="text-gray-700">{ingredient}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No ingredients available.</p>
      )}
    </div>
  );
};

export default RecipeIngredients;