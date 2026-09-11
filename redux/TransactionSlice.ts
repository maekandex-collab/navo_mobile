import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TransState {
  transactionData: [],
  transactionLoading: boolean
}

const initialState: TransState = {
    transactionData: [],
    transactionLoading: false
}

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactionLoading: (state, action: PayloadAction<boolean>) => {
      state.transactionLoading = action.payload
    },
    setTransactionInfo: (state, action: PayloadAction<[]>) => {
      state.transactionData = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const {  setTransactionInfo, setTransactionLoading} = transactionSlice.actions

export default transactionSlice.reducer