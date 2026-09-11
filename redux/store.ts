import { configureStore } from '@reduxjs/toolkit'
import authSlice from './AuthSlice'
import referralSlice from './ReferralSlice'
import walletSlice from './WalletSlice'
import profileSlice from './ProfileSlice'
import transactionSlice from './TransactionSlice'
import loaderSlice from './LoaderSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    referral: referralSlice,
    wallet: walletSlice,
    profile: profileSlice,
    transactions: transactionSlice,
    loader: loaderSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch