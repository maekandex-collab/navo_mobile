import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { store } from '@/redux/store';
import { login, logout } from '@/redux/AuthSlice';
import { clearProfile } from "./redux/ProfileSlice";
import { Alert } from "react-native";

// Create an Axios instance with your API base URL
const axiosClient = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_SERVER_URI}`,
    withCredentials: true
})

// Attach access token to every outgoing request
axiosClient.interceptors.request.use(async (config) => {
  // const accessToken = await SecureStore.getItemAsync("accessToken")
  const accessToken = store.getState().auth.token;
  const customValue = process.env.EXPO_PUBLIC_API_KEY;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (customValue) {
    config.headers['expo-api-key'] = customValue;
  }

  return config;
});

// Automatically refresh token on 401 and retry the original request
axiosClient.interceptors.response.use(
  (response) => response, // Just return the response if it's successful
  async (error) => {
    const originalRequest = error.config;

    // Check for NO INTERNET or NETWORK FAILURE
    if (!error.response) {
      Alert.alert("No Internet Connection", "Please check your network and try again.");
      return Promise.reject(error);
    }

    // Check if the error is due to an expired access token
    const isUnauthorized = error.response?.status === 401;
    console.log("run refresh error=", error.response?.status)
    const isFirstRetry = !originalRequest._retry;

    if (isUnauthorized && isFirstRetry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {

        // Use refresh token to get a new access token
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const refreshResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/auth/refresh-token`,
          {
            refreshToken
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        console.log("new accesstoken=",refreshResponse.data)

        // Save the new access token securely
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        store.dispatch(login(newAccessToken));

        // Update the Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request with the new token
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);

        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await AsyncStorage.removeItem('userProfile');
        store.dispatch(logout());
        store.dispatch(clearProfile());
        router.replace("/(onboarding)/SignIn")

        return Promise.reject(refreshError); // Always return this
      }
    }

    // If the error is not due to a 401 or retry fails
    return Promise.reject(error); // Always return this
  }
);


export { axiosClient }