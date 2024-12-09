import { useEffect, useState } from 'react';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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

  return (
    <Container>
      {selectedIngredientName && (
        <IngredientCard
          ingredientName={selectedIngredientName}
          handleClose={() => setSelectedIngredientName(null)}
        />
      )}
      <Stack direction='column' spacing={2} style={{ marginTop: '40px' }}>
        <h1>Ingredient List</h1>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell key='Name'><strong>Name</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredientData.map((ingredient, index) => (
                <TableRow key={index}>
                  <TableCell key='Name'>
                    <Link
                      component='button'
                      onClick={() => setSelectedIngredientName(ingredient.name)}
                      underline='hover'
                      style={{ cursor: 'pointer' }}
                    >
                      {ingredient.name}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
}
