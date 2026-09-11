import { useEffect, useRef } from "react";
import { useToast } from "react-native-toast-notifications";
import NetInfo from "@react-native-community/netinfo";

export default function NetInfoListener() {
  const toast = useToast();
  const prevConnected = useRef<boolean | null>(null); // null means uninitialized

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable;

      // Only show toast if connection actually changed
      if (!connected) {
        toast.show("No Internet Connection", { type: "danger" });
      } else {
        if (prevConnected.current !== null && prevConnected.current !== connected) {
          toast.show("Back Online", { type: "success" });
        }
      }

      prevConnected.current = connected; // update previous state
    });

    return () => unsubscribe();
  }, []);

  return null;
}
