import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const checkUserExists = createAsyncThunk('user/checkUserExists', async (mobile) => {
  const response = await axios.get(`/api/users/identity-exist/${mobile}`);
  return response.data;
});

export const sendOtp = createAsyncThunk('user/sendOtp', async (mobile) => {
  await axios.post('/api/otp', { contact: mobile });
  return mobile;
});

export const verifyOtp = createAsyncThunk('user/verifyOtp', async ({ mobile, otp }) => {
  const response = await axios.post('/api/otp-verify', { contact: mobile, otp });
  if (response.data.valid) {
    const userResponse = await axios.get(`/api/users/${mobile}`);
    return userResponse.data;
  }
  throw new Error('Invalid OTP');
});

export const createUser = createAsyncThunk('user/createUser', async ({ mobile, name, email }) => {
  const response = await axios.post('/api/users', { contact: mobile, name, email });
  await axios.post('/api/otp', { contact: mobile });
  return response.data;
});

// Get user from localStorage if available
const getStoredUser = () => {
  const stored = localStorage.getItem('sevaUser');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (err) {
    localStorage.removeItem('sevaUser');
    return null;
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: getStoredUser(),
    status: 'idle',
    error: null,
    showOtp: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.showOtp = false;
      state.error = null;
      localStorage.removeItem('sevaUser');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserExists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkUserExists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.showOtp = action.payload;
        state.error = null;
      })
      .addCase(checkUserExists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(sendOtp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.showOtp = false;
        state.error = null;
        localStorage.setItem('sevaUser', JSON.stringify(action.payload));
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.showOtp = true;
        state.user = action.payload;
        state.error = null;
        localStorage.setItem('sevaUser', JSON.stringify(action.payload));
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;