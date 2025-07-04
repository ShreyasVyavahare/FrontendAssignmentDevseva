import { configureStore } from '@reduxjs/toolkit';
import sevasReducer from './sevasSlice';
import cartReducer from './cartSlice';
import userReducer from './userSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    sevas: sevasReducer,
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
  },
});