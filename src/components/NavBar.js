import React from 'react';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';
import logo from './maskable_icon-removebg-preview.png';

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
// function NavText({ href, text, isMain }) {
//   return (
//     <Typography
//       variant={isMain ? 'h5' : 'h7'}
//       noWrap
//       style={{
//         marginRight: '30px',
//         fontFamily: 'monospace',
//         fontWeight: 700,
//         letterSpacing: '.3rem',
//       }}
//     >
//       <NavLink
//         to={href}
//         style={{
//           color: 'inherit',
//           textDecoration: 'none',
//         }}
//       >
//         {text}
//       </NavLink>
//     </Typography>
//   )
// }

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          {/* <NavText href='/' text='SWIFTIFY' isMain />
          <NavText href='/albums' text='ALBUMS' />
          <NavText href='/songs' text='SONGS' /> */}

          {/* Logo Section */}
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40, marginRight: 2 }}
          />

          {/* Navigation Links */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              // fontFamily: 'monospace',
              // fontWeight: 700,
              letterSpacing: '.3rem',
              textDecoration: 'none',
              marginRight: 2,
            }}
          >
            <NavLink
              to="/"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                marginRight: '30px',
                fontFamily: 'Papyrus'
              }}
            >
              RecipeFinder
            </NavLink>
            <NavLink
              to="/albums"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                marginRight: '30px',
                fontFamily: 'Garamond'
              }}
            >
              Categories
            </NavLink>
            <NavLink
              to="/songs"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                marginRight: '30px',
                fontFamily: 'Garamond'
              }}
            >
              Ingredient
            </NavLink>
            <NavLink
              to="/songs"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                marginRight: '30px',
                fontFamily: 'Garamond'
              }}
            >
              Calculator
            </NavLink>
          </Typography>

        </Toolbar>
      </Container>
    </AppBar>
  );
}
