import * as React from 'react';
import { useEffect } from 'react';
import { Container, Typography, Button, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice';
import { fetchUserOrders } from '../../store/orderSlice';
import { Link } from 'react-router-dom';
import styles from './UserPage.module.css';

function UserPage() {
  const { user, status, error } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [user, dispatch]);

  return (
    <Container sx={{ py: 4 }} className={styles.container}>
      <Typography variant="h4" gutterBottom className={styles.title}>
        User Profile
      </Typography>
      {status === 'loading' && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {user ? (
        <>
          <Card className={styles.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Details</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Name:</strong> {user.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Mobile:</strong> {user.contact}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => dispatch(logout())}
                className={styles.logoutButton}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
          <Card className={styles.card} sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Orders</Typography>
              <Grid container spacing={2}>
                {orders.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography color="text.secondary">No orders found</Typography>
                  </Grid>
                ) : (
                  orders.slice(0, 3).map((order, index) => (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          #{order.orderId || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          ₹{order.amountToPay || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.status || 'Completed'}
                        </Typography>
                        {order.items?.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Go to checkout to authenticate with your mobile number
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/checkout"
            color="primary"
            sx={{ mr: 2 }}
          >
            Go to Checkout
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const testUser = {
                id: 1,
                name: "Rahul Sharma",
                email: "rahul.sharma@email.com",
                contact: "9876543210"
              };
              localStorage.setItem('sevaUser', JSON.stringify(testUser));
              window.location.reload();
            }}
          >
            Quick Test
          </Button>
        </div>
      )}
    </Container>
  );
}

export default UserPage;