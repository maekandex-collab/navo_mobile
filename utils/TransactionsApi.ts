import { axiosClient } from "@/globalApi"
import { setTransactionInfo, setTransactionLoading } from "@/redux/TransactionSlice";

const getTransactions = async (dispatch: any, toast: any, runOnBackground: boolean) => {
    
    if(!runOnBackground){
      dispatch(setTransactionLoading(true))
    }

    try {

      const result = await axiosClient.get("/transactions/history?limit=2")

      let transactionHistory = result.data.data || []
      transactionHistory = transactionHistory.slice(0, 2);

      console.log("transaction data", result.data )
      dispatch(setTransactionInfo(transactionHistory || []))

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      if(!runOnBackground){
       dispatch(setTransactionLoading(false))
      }
    }
  }

  export default getTransactions
