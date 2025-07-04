import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchSevas = createAsyncThunk('sevas/fetchSevas', async ({ page = 1, limit = 10 }) => {
  const response = await axios.get(`/api/sevas?page=${page}&limit=${limit}`);
  return response.data;
});

const sevasSlice = createSlice({
  name: 'sevas',
  initialState: {
    sevas: [],
    status: 'idle',
    error: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    incrementPage: (state) => {
      state.page += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSevas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSevas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.page === 1) {
          state.sevas = action.payload;
        } else {
          state.sevas = [...state.sevas, ...action.payload];
        }
        state.hasMore = action.payload.length === 10;
      })
      .addCase(fetchSevas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { incrementPage } = sevasSlice.actions;
export default sevasSlice.reducer;