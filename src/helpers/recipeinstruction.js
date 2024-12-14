import React from 'react';

const RecipeInstructions = ({ instructions }) => {
  // Function to ensure we have a proper array of instructions
  const parseInstructions = (instructionsData) => {
    if (!instructionsData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(instructionsData)) return instructionsData;
    
    // If it's a string that looks like an array, parse it
    if (typeof instructionsData === 'string' && 
        instructionsData.startsWith('[') && 
        instructionsData.endsWith(']')) {
      try {
        return JSON.parse(instructionsData);
      } catch (e) {
        // If parsing fails, split by comma and clean up
        return instructionsData
          .slice(1, -1)
          .split(', ')
          .map(item => item.trim().replace(/['"`]/g, ''));
      }
    }
    
    // If it's a simple string, split by periods
    if (typeof instructionsData === 'string') {
      return instructionsData.split('.').map(item => item.trim()).filter(item => item.length > 0);
    }
    
    return [];
  };

  const parsedInstructions = parseInstructions(instructions);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Instructions:</h2>
      {parsedInstructions.length > 0 ? (
        <ol className="list-decimal pl-6 space-y-2">
          {parsedInstructions.map((instruction, index) => (
            <li key={index} className="text-gray-700 pb-2">
              {instruction.replace(/['"]/g, '')}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-gray-500">No instructions available.</p>
      )}
    </div>
  );
};

export default RecipeInstructions;