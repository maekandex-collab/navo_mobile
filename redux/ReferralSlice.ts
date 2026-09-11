import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CounterState {
  refData: {
    currency: "NGN" | "GBP"
    pendingSignups: number
    referralCode: string
    referralWallet: {
      pointsExpired: string 
      pointsUsed: string
      balance: string
    }, 
    referrals: [] 
    signupsThatTransacted: number
    totalSignups: number
  },
}

const initialState: CounterState = {
  refData: {
    currency: "NGN",
    pendingSignups: 0,
    referralCode: '', 
    referralWallet: {
      pointsExpired: '0', 
      pointsUsed: '0', 
      balance: '0',
    }, 
    referrals: [], 
    signupsThatTransacted: 0, 
    totalSignups: 0
  },
}

export const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setReferralInfo: (state, action: PayloadAction<any>) => {
      state.refData = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setReferralInfo } = referralSlice.actions

export default referralSlice.reducer