import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { NavLink } from 'react-router-dom';

import RecipeCard from '../components/RecipeCard';
// import { formatDuration, formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');

export default function CategoryInfoPage() {
  const { recipecategory } = useParams();

  const [recipeData, setRecipeData] = useState([]); // default should actually just be [], but empty object element added to avoid error in template code
  const [categoryData, setCategoryData] = useState([]);

  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/category/${recipecategory}`)
      .then(res => res.json())
      .then(resJson => setCategoryData(resJson));

    fetch(`http://${config.server_host}:${config.server_port}/category_info/${recipecategory}`)
      .then(res => res.json())
      .then(resJson => setRecipeData(resJson));
  }, [recipecategory]);

  // Update the document title when categoryData is fetched
  useEffect(() => {
    if (categoryData.recipecategory) {
        document.title = `${categoryData.recipecategory}`; // Set title dynamically based on category
    }
  }, [categoryData]);

  return (
    <Container>
      {/* {selectedRecipeId && <RecipeCard recipeId={selectedRecipeId} handleClose={() => setSelectedRecipeId(null)} />} */}
      {selectedRecipeId && (
        <RecipeCard recipeId={selectedRecipeId} handleClose={() => setSelectedRecipeId(null)} />
      )}
      <Stack direction='row' justify='center'>
        <img
          key={categoryData.recipecategory}
          src={categoryData.url}
          alt={`${categoryData.recipecategory} recipe art`}
          style={{
            marginTop: '40px',
            marginRight: '40px',
            marginBottom: '40px',
            width: '200px',     // Fixed width
            height: '200px',    // Fixed height
          }}
        />
        <Stack>
          <h1 style={{ fontSize: 64, fontFamily: 'Garamond' }}>{categoryData.recipecategory}</h1>
        </Stack>
      </Stack>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell key='#'>#</TableCell>
              <TableCell key='Recipe'>Recipe</TableCell>
              <TableCell key='AvgRating'>Average Rating</TableCell>
              <TableCell key='ReviewCount'>Review Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              recipeData.map(col=>
              <TableRow key={col.recipeid}>
                <TableCell key='#'>
                  {/* <Link onClick={() => {
                    console.log("Setting selectedRecipeId:", col.recipeid);
                    setSelectedRecipeId(col.recipeid);
                    }}>
                    {col.recipeid}
                  </Link> */}
                  <NavLink 
                    to={`/recipe/${col.recipeid}`} 
                    style={({ isActive }) => ({
                      color: "black",
                      textDecoration: "none",
                    })}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = "underline";
                      e.currentTarget.style.textDecorationColor = "red"; // Change underline color here
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                  >
                    {col.recipeid}
                  </NavLink>
                </TableCell>
                <TableCell key='Title'>
                  {col.recipename}
                </TableCell>
                <TableCell key='AvgRating'>
                  {col.avgrating}
                </TableCell>
                <TableCell key='ReviewCount'>
                  {col.reviewcount}
                </TableCell>
              </TableRow>
              )
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}