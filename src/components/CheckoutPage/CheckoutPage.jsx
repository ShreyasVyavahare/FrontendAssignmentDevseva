import * as React from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, MenuItem, Modal, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { checkUserExists, sendOtp, verifyOtp, createUser } from '../../store/userSlice';
import { removeFromCart, clearCart } from '../../store/cartSlice';
import { placeOrder } from '../../store/orderSlice'; // Added correct import for placeOrder
import axios from 'axios';
import styles from './CheckoutPage.module.css';

function CheckoutPage() {
  const dispatch = useDispatch();
  const { user, status, error, showOtp } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('Fetching...');
  const [city, setCity] = useState('Fetching...');
  const [addressValid, setAddressValid] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // User Details Flow
  const validateMobile = (value) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(value);
  };

  useEffect(() => {
    if (mobile && validateMobile(mobile) && !showOtp && !user) {
      dispatch(checkUserExists(mobile));
    }
  }, [mobile, showOtp, user, dispatch]);

  const handleSendOtp = () => {
    if (user) {
      dispatch(sendOtp(mobile));
      setSnackbarMessage('OTP sent successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else if (!showOtp && name && email) {
      dispatch(createUser({ mobile, name, email }));
      setSnackbarMessage('User creation initiated, OTP sent');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleVerifyOtp = () => {
    dispatch(verifyOtp({ mobile, otp })).then(() => {
      setSnackbarMessage('User verified successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch(() => {
      setSnackbarMessage('Invalid OTP');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  // Address Details Flow
  const fetchAddressDetails = async () => {
    if (pincode.length === 6) {
      try {
        setState('Fetching...');
        setCity('Fetching...');
        const response = await axios.get(`/api/address-by-pincode/${pincode}`);
        setState(response.data.state);
        setCity(response.data.city);
        setAddressValid(true);
        setSnackbarMessage('Address validated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        setState('Invalid Pincode');
        setCity('Invalid Pincode');
        setAddressValid(false);
        setSnackbarMessage('Invalid pincode');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  useEffect(() => {
    if (pincode.length === 6) {
      fetchAddressDetails();
    } else {
      setState('Fetching...');
      setCity('Fetching...');
      setAddressValid(false);
    }
  }, [pincode]);

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
    setSnackbarMessage('Item removed from cart');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handlePayNow = () => {
    if (user && addressValid) {
      setOpenPaymentModal(true);
    } else if (!user) {
      setSnackbarMessage('Please verify user details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else if (!addressValid) {
      setSnackbarMessage('Please enter a valid address');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const validatePayment = () => {
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;

    if (!cardNumber.replace(/\s/g, '')) {
      setPaymentError('Card number is required');
      return false;
    }
    if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
      setPaymentError('Invalid card number (16 digits)');
      return false;
    }
    if (!expiry) {
      setPaymentError('Expiry date is required');
      return false;
    }
    if (!expiryRegex.test(expiry)) {
      setPaymentError('Invalid expiry (MM/YY)');
      return false;
    }
    if (!cvv) {
      setPaymentError('CVV is required');
      return false;
    }
    if (!cvvRegex.test(cvv)) {
      setPaymentError('Invalid CVV (3-4 digits)');
      return false;
    }
    setPaymentError('');
    return true;
  };

  const handlePaymentSubmit = () => {
    if (validatePayment()) {
      const address = { 
        name: user.name, 
        addrLine1, 
        addrLine2, 
        pincode: parseInt(pincode), 
        city, 
        state, 
        type: addressType === 'Home' ? 1 : addressType === 'Work' ? 2 : 3,
        verified: true
      };
      dispatch(placeOrder({ items: cartItems, address })).then((action) => {
        if (placeOrder.fulfilled.match(action)) {
          setSnackbarMessage('Order placed successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setTimeout(() => dispatch(clearCart()), 1000); // Clear cart after delay
        }
      }).catch(() => {
        setSnackbarMessage('Payment failed');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
      setOpenPaymentModal(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Container sx={{ py: 4 }} className={styles.container}>
      <Typography variant="h4" gutterBottom className={styles.title}>
        Checkout
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={styles.card}>
            <CardContent>
              <Typography variant="h6">Selected Items</Typography>
              {cartItems.length === 0 ? (
                <Typography>No items in cart</Typography>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <Typography>{item.title}</Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={styles.card}>
            <CardContent>
              <Typography variant="h6">Cart Details</Typography>
              <Typography variant="h6" gutterBottom>User Details</Typography>
              <TextField
                label="Mobile Number"
                fullWidth
                margin="normal"
                variant="outlined"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                error={!!error && !showOtp}
                helperText={error && !showOtp ? error : ''}
                className={styles.input}
              />
              {showOtp && !user && (
                <>
                  <TextField
                    label="OTP"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={styles.input}
                  />
                  <Button
                    variant="contained"
                    onClick={handleVerifyOtp}
                    className={styles.payButton}
                  >
                    Verify OTP
                  </Button>
                </>
              )}
              {!showOtp && !user && (
                <>
                  <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendOtp}
                    className={styles.payButton}
                  >
                    Create User
                  </Button>
                </>
              )}
              {user && (
                <>
                  <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={user.name}
                    InputProps={{ readOnly: true }}
                    className={styles.input}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={user.email}
                    InputProps={{ readOnly: true }}
                    className={styles.input}
                  />
                </>
              )}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address</Typography>
              <TextField
                select
                label="Type"
                fullWidth
                margin="normal"
                variant="outlined"
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
                className={styles.input}
              >
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Work">Work</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                label="Address Line 1"
                fullWidth
                margin="normal"
                variant="outlined"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                className={styles.input}
              />
              <TextField
                label="Address Line 2"
                fullWidth
                margin="normal"
                variant="outlined"
                value={addrLine2}
                onChange={(e) => setAddrLine2(e.target.value)}
                className={styles.input}
              />
              <TextField
                label="Pincode"
                fullWidth
                margin="normal"
                variant="outlined"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={styles.input}
              />
              <TextField
                label="State"
                fullWidth
                margin="normal"
                variant="outlined"
                value={state}
                InputProps={{ readOnly: true }}
                className={styles.input}
              />
              <TextField
                label="City"
                fullWidth
                margin="normal"
                variant="outlined"
                value={city}
                InputProps={{ readOnly: true }}
                className={styles.input}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePayNow}
                disabled={!user || !addressValid}
                className={styles.payButton}
                sx={{ mt: 2 }}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Modal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        className={styles.modal}
      >
        <Box className={styles.modalContent}>
          <Typography variant="h6" gutterBottom>Payment Details</Typography>
          <TextField
            label="Card Number"
            fullWidth
            margin="normal"
            variant="outlined"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            error={!!paymentError}
            helperText={paymentError}
            className={styles.input}
          />
          <TextField
            label="Expiry (MM/YY)"
            fullWidth
            margin="normal"
            variant="outlined"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            error={!!paymentError}
            helperText={paymentError}
            className={styles.input}
          />
          <TextField
            label="CVV"
            fullWidth
            margin="normal"
            variant="outlined"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            error={!!paymentError}
            helperText={paymentError}
            className={styles.input}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePaymentSubmit}
            className={styles.payButton}
            sx={{ mt: 2 }}
          >
            Submit Payment
          </Button>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {status === 'loading' && <CircularProgress />}
    </Container>
  );
}

export default CheckoutPage;