import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoaderState {
  isLoading: boolean;
}

const initialState: LoaderState = { isLoading: false };

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    showLoader: (state) => { state.isLoading = true },
    hideLoader: (state) => { state.isLoading = false },
    setLoader: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload },
  },
});

export const { showLoader, hideLoader, setLoader } = loaderSlice.actions;
export default loaderSlice.reducer;