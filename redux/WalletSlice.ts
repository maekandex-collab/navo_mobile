import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface WalletState {
  walletData: {
    currency: string
    walletId: string
    is_active: boolean 
    paymentType: any 
    walletBalanceNGN: string
    walletBalanceGBP: string
  },
  balanceLoading: boolean
}

const initialState: WalletState = {
  walletData: {
    currency: "GBP",
    walletId: "",
    is_active: false, 
    paymentType: "",
    walletBalanceNGN: "0",
    walletBalanceGBP: "0",
  },
  balanceLoading: false
}

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalanceLoading: (state, action: PayloadAction<boolean>) => {
      state.balanceLoading = action.payload
    },
    setWalletInfo: (state, action: PayloadAction<WalletState["walletData"]>) => {
      state.walletData = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setWalletInfo, setBalanceLoading } = walletSlice.actions

export default walletSlice.reducer