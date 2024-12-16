import React, { useState, useEffect } from "react";
import { Container, Link, Typography, Box, Modal } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RecipeCard from "../components/RecipeCard";
import { useNavigate } from "react-router-dom";
const config = require("../config.json");

export default function SearchResultsPage() {
  const [recipesData, setRecipesData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // const queryParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate(); // Use the navigate hook for redirection

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    fetch(`http://${config.server_host}:${config.server_port}/search_recipe?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const recipesWithId = data.map((recipe, index) => ({
          id: index,
          ...recipe,
        }));
        setRecipesData(recipesWithId);
      });
  }, []);

  const handleRowClick = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedRecipe(null);
  };

  const handleClosePage = () => {
    navigate("/"); // Redirect to the home page
  };

  const recipeColumns = [
    {
      field: "name",
      headerName: "Recipe Name",
      width: 300,
      renderCell: (params) => (
        <Link onClick={() => handleRowClick(params.row)} style={{ cursor: "pointer", color: "#FF7043" }}>
          {params.value}
        </Link>
      ),
    },
    { field: "authorname", headerName: "Author", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "recipecategory", headerName: "Category", width: 200 },
    { field: "avg_rate", headerName: "Rating", width: 150 },
    { field: "review_count", headerName: "Reviews", width: 150 },
  ];

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Typography
          variant="h4"
          sx={{//stylish title
            color: "#FF7043",
            fontWeight: "bold",
            fontSize: "2rem",
            textAlign: "center",
            flex: 1,
          }}
        >
          Search Results
        </Typography>
        <button
          onClick={handleClosePage}
          style={{//close tab
            color: "#FF7043",
            fontWeight: "bold",
            fontSize: "1.2rem",
            border: "none",
            background: "none",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          X
        </button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <DataGrid
          rows={recipesData}
          columns={recipeColumns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
          sx={{
            width: "100%",
            maxWidth: "800px",
          }}
        />
      </Box>
      {selectedRecipe && (
        <Modal open={openModal} onClose={closeModal}>
          <Box>
            <RecipeCard recipe={selectedRecipe} handleClose={closeModal} />
          </Box>
        </Modal>
      )}
    </Container>
  );
}
