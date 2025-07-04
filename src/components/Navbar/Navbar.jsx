import * as React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart, Person } from '@mui/icons-material';
import styles from './Navbar.module.css';

function Navbar() {
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.user);

  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Seva Booking
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/cart"
            startIcon={
              <Badge badgeContent={cartItems.length} color="secondary">
                <ShoppingCart />
              </Badge>
            }
          >
            Cart
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/user"
            startIcon={<Person />}
          >
            {user ? user.name : 'User'}
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;