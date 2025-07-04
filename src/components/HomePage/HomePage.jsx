import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSevas, incrementPage } from '../../store/sevasSlice';
import { addToCart } from '../../store/cartSlice';
import { Container, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './HomePage.module.css';

function HomePage() {
  const dispatch = useDispatch();
  const { sevas, status, page, hasMore, error } = useSelector((state) => state.sevas);
  const cartItems = useSelector((state) => state.cart.items);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSevas({ page, limit: 10 }));
    }
  }, [dispatch, status, page]);

  const handleViewMore = () => {
    dispatch(incrementPage());
    dispatch(fetchSevas({ page: page + 1, limit: 10 }));
  };

  const handleAddToCart = (seva) => {
    dispatch(addToCart(seva));
    setSnackbarMessage(`${seva.title} added to cart!`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Container sx={{ py: 4 }} className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" className={styles.title}>
          Seva Listings
        </Typography>
        {cartItems.length > 0 && (
          <Typography variant="body2" color="primary">
            Cart ({cartItems.length})
          </Typography>
        )}
      </div>
      {status === 'loading' && <CircularProgress />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      <div className={styles.sliderContainer}>
        <Typography variant="h5" gutterBottom>
          Featured
        </Typography>
        <Slider {...sliderSettings}>
          {sevas.slice(0, Math.min(5, sevas.length)).map((seva) => (
            <div key={seva.id} className={styles.slide}>
              <div className={styles.card}>
                <img src={seva.media} alt={seva.title} className={styles.media} />
                <div className={styles.cardContent}>
                  <Typography variant="h6">{seva.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {seva.description}
                  </Typography>
                  <Typography variant="body1">
                    ₹{seva.discountedPrice} <s>₹{seva.marketPrice}</s>
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleAddToCart(seva)}
                    className={styles.addButton}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className={styles.gridContainer}>
        {sevas.map((seva) => (
          <div key={seva.id} className={styles.gridItem}>
            <div className={styles.card}>
              <img src={seva.media} alt={seva.title} className={styles.media} />
              <div className={styles.cardContent}>
                <Typography variant="h6">{seva.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {seva.description}
                </Typography>
                <Typography variant="body1">
                  ₹{seva.discountedPrice} <s>₹{seva.marketPrice}</s>
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleAddToCart(seva)}
                  className={styles.addButton}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && status !== 'loading' && (
        <Button
          variant="outlined"
          onClick={handleViewMore}
          className={styles.viewMoreButton}
          sx={{ mt: 4 }}
        >
          View More
        </Button>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default HomePage;