import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { amber, lightGreen } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';

import CategoryPage from './pages/CategoryPage';
import RecipePage from './pages/RecipePage';
import CategoryInfoPage from './pages/CategoryInfoPage';

import IngredientsPage from './pages/IngredientsPage.js';

import CalculatorPage from './pages/CalculatorPage.js'
import SearchResultsPage from "./pages/SearchResultsPage.js";

export const theme = createTheme({
  palette: {
    primary: amber,
    secondary: lightGreen,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search_results" element={<SearchResultsPage />} />

          <Route path="/category_tops" element={<CategoryPage />} />
          <Route path="/category_info/:recipecategory" element={<CategoryInfoPage />} />
          <Route path="/recipe/:recipeId" element={<RecipePage />} />

          <Route path="/all_ingredients" element={<IngredientsPage />} />

          <Route path="/calculator" element={<CalculatorPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}