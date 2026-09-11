import { RootState } from "@/redux/store";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function _layout() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)/SignIn" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
