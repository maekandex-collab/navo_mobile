import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  userProfile: {
    email: string;
    accountName: string;
    phoneNumber: string;
    countryOfResidence: string;
    location: {
      state: string;
      city: string;
      street: string;
      houseNo: string;
      closestLandmark: string;
    } | null;
    profilePicture: string | null;
    kycVerified: boolean;
    isPinSet: boolean;
    setPin: boolean;
    gender: string;
    isQuestionSet: boolean;
    questions: {
      id: string;
      question: string;
    }[]; 
  };
  email: string;
}

const initialState: ProfileState = {
  userProfile: {
    email: "",
    accountName: "",
    phoneNumber: "",
    countryOfResidence: "",
    location: null,
    profilePicture: null,
    kycVerified: false,
    isPinSet: false,
    setPin: false,
    gender: "",
    isQuestionSet: false,
    questions: [] 
  },
  email: "",
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<any>) {
      state.userProfile = action.payload
    },
    setEmail(state, action: PayloadAction<any>) {
      state.email = action.payload
    },
    clearProfile(state) {
      state.userProfile = {
        email: "",
        accountName: "",
        phoneNumber: "",
        countryOfResidence: "",
        location: null,
        profilePicture: null,
        kycVerified: false,
        isPinSet: false,
        setPin: false,
        gender: "",
        isQuestionSet: false,
        questions: [] 
      }
    }
  },
});

export const { setProfile, setEmail, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
