import * as React from 'react';
import { Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../../store/cartSlice';
import { Link } from 'react-router-dom';
import styles from './CartPage.module.css';

function CartPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.discountedPrice || 0), 0);

  return (
    <Container sx={{ py: 4 }} className={styles.container}>
      <Typography variant="h4" gutterBottom className={styles.title}>
        Cart
      </Typography>
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add some sevas to get started
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/"
            color="primary"
          >
            Browse Sevas
          </Button>
        </div>
      ) : (
        <>
          <Card className={styles.card}>
            <CardContent>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div>
                    <Typography variant="subtitle1">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{item.discountedPrice || 0}
                    </Typography>
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveItem(item.id)}
                    className={styles.removeButton}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ₹{totalAmount}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClearCart}
            className={styles.clearButton}
            sx={{ mt: 2 }}
          >
            Clear Cart
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/checkout"
            className={styles.checkoutButton}
            sx={{ mt: 2, ml: 2 }}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </Container>
  );
}

export default CartPage;