import FullScreenLoader from "@/components/FullScreenLoader";
import { useSelector } from "react-redux";

export default function LayoutLoader() {
  
  const isLoading = useSelector((state: any) => state.loader.isLoading);

  return (
    <FullScreenLoader visible={isLoading} />
  )
}