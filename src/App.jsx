import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HomePage from './components/HomePage/HomePage';
import CartPage from './components/CartPage/CartPage';
import CheckoutPage from './components/CheckoutPage/CheckoutPage';
import UserPage from './components/UserPage/UserPage';
import Navbar from './components/Navbar/Navbar';

function App() {
  const { user } = useSelector((state) => state.user);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/cart"
          element={<CartPage />}
        />
        <Route
          path="/checkout"
          element={user ? <CheckoutPage /> : <Navigate to="/" />}
        />
        <Route
          path="/user"
          element={<UserPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;