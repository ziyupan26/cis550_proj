import React from 'react';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';
import logo from './maskable_icon-removebg-preview.png';

export default function NavBar() {
  return (
    // <AppBar position='static'>
    <AppBar position="sticky">
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
              to="/category_tops"
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
              to="/all_ingredients"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                marginRight: '30px',
                fontFamily: 'Garamond'
              }}
            >
              Ingredients
            </NavLink>
            <NavLink
              to="/calculator"
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

