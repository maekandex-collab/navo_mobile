import { axiosClient } from "@/globalApi"
import { setWalletInfo, setBalanceLoading } from '@/redux/WalletSlice'

const getWallet = async (dispatch: any, toast: any, changeCurrency: null | string, runOnBackground: boolean) => {
    
    if(!runOnBackground){
      dispatch(setBalanceLoading(true))
    }

    try {
      
      const result = await axiosClient.get("/wallet")

      console.log("balance data", result.data )
      dispatch(setWalletInfo({
        currency: changeCurrency === null ? result.data.wallet.currency : changeCurrency,
        walletId: result.data.wallet.id,
        is_active: result.data.wallet.isActive, 
        paymentType: result.data.wallet.paymentType,
        walletBalanceNGN: result.data.wallet.walletBalanceNGN,
        walletBalanceGBP: result.data.wallet.walletBalanceGBP,
      }))

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      if(!runOnBackground){
         dispatch(setBalanceLoading(false))
      }
    }
  }

  export default getWallet
