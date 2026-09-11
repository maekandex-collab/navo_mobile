import { View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import Header from '@/components/Header'
import { router, useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import AntDesign from '@expo/vector-icons/AntDesign'
import BeneficiaryCard from '@/components/BeneficiaryCard'
import PopupModal from '@/components/PopupModal'
import Details from '@/components/Details'
import CustomButton from '@/components/CustomButton'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import displayCurrency from '@/utils/displayCurrency'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'
import * as SecureStore from 'expo-secure-store';

type accountType = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  sortCode: string;
  currency: string;
}

const USDBeneficiariesScreen = () => {

  const dispatch = useDispatch()
  const { userData } = useLocalSearchParams() as any;
  const parsedUserData = userData ? JSON.parse(userData) : null;
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const statusBarBottom = insets.bottom + 100;
  const [loading, setLoading] = useState(false)
  const [validateModal, setValidateModal] = useState(false)
  const [allAccounts, setAllAccounts] = useState<accountType[]>([])
  const [account, setAccount] = useState<accountType>({
    id: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    sortCode: "",
    currency: ""
  })
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
   const [showSuccessModal, setShowSuccessModal] = useState(false)

    const getAccounts = async () => {
        setLoading(true)
    
        try{
          const result = await axiosClient.get("/beneficiary")
      
          const allBeneficiaries = result.data?.beneficiary || []

          // Filter only USD accounts
          const usdAccounts = allBeneficiaries.filter((item: any) => item.currency === "USD")

          setAllAccounts(usdAccounts)
    
    
        } catch (error: any) {
            toast.show(error.response.data.message || error.response.data.error.message,{
                type: "danger",
            });
    
        } finally {
            setLoading(false)
        } 
    }

    useEffect(() => {
      getAccounts()
    }, [])

  const confirmDeletion = (item: accountType) => {
    setAccount(item)
    setValidateModal(true)
  }

  const deleteBeneficiary = async () => {

    setValidateModal(false)
    dispatch(showLoader());
    try{
      const result = await axiosClient.delete("/beneficiary/delete-beneficiary", {
        data: { beneficiaryId: account.id }
      })

      toast.show(result.data.message,{
        type: "success",
      });

      getAccounts()

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
  }

  const confirmSubmit = (item: accountType) => {
    setAccount(item)

    handlePresentModalPress()
  }

  const submit = async () => {

    dispatch(showLoader());

    const data = {
      recipientBankName: account.bankName,
      recipientAccountName: account.accountName,
      recipientAccountNumber: account.accountNumber,
      recipientSortCode: account.sortCode,
      conversionId: parsedUserData?.conversionId
    }

    try{
      const result = await axiosClient.post("/fx/save-recipient", data)

      await SecureStore.deleteItemAsync("conversionId");

      toast.show(result.data.message,{
        type: "success",
      });

      setShowSuccessModal(true)
      handleCloseModalPress()

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 

  }

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.replace("/(protected)/(tabs)/transactions")
  }

  const renderBeneficiary = ({item, index}: {item: any, index: number}) => {

    return (
      <BeneficiaryCard item={item} index={index} handleDelete={() => confirmDeletion(item)} handlePress={() => confirmSubmit(item)}/>
    )
  }

  return (
    <SafeAreaView className="bg-white h-full px-4">
        <Header title='Beneficiaries' showGoBack={true} onpress={() => router.back()}/>
        <View className='flex-1'>
            {allAccounts?.length > 0 && <Text className={`font-amedium text-xl my-4 text-center text-blue`}>USD Saved Accounts</Text>}
            {
                loading ? (
                    <ActivityIndicator size="large" color="#003366"/>
                ) : (
                    <View className='w-full'>
                        <FlatList
                            nestedScrollEnabled={true}
                            scrollEnabled={true}
                            data={allAccounts}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderBeneficiary}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: statusBarBottom }}
                            ListEmptyComponent={() => (
                                <View className='h-[70vh]'>
                                    <View className="w-full items-center mx-auto justify-center my-6 mt-16 max-w-60 flex-1">
                                        <View className='flex items-center justify-center size-16 rounded-full bg-orangeLight'>
                                            <FontAwesome name="bank" size={20} color="#FF6600" />
                                        </View>
                                        <Text className="text-xl text-center text-blue mt-4 font-ablack">No Beneficiaries found</Text>
                                        <Text className="text-sm text-center text-blue py-2 font-alight">No available beneficiaries for USD account found.</Text>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                )
            }        
        </View>

        <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
            <View>
            <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
                <View className='w-8'/>
                <Text className="text-sm text-center text-gray-300 font-abold">Confirm Account Details</Text>
                <TouchableOpacity onPress={handleCloseModalPress}>
                <AntDesign name="closecircleo" size={30} color="#003366" />
                </TouchableOpacity>
            </View>

            {/* <View className='flex-col w-full items-center justify-between my-3'>
              <Text className="text-sm text-center text-blue font-amedium">Amount you will Recieve</Text>
              <Text className="text-2xl text-center text-blue font-abold">{displayCurrency(Number(parsedUserData?.convertedAmount), parsedUserData?.toCurrency)}</Text>
            </View> */}

            <View>
              <Details title='Bank Name' value={account?.bankName}/>
              <Details title='Account No.' value={account?.accountNumber}/>
              <Details title='Account Name' value={account?.accountName}/>
              <Details title='Sort Code' value={account?.sortCode}/>
            </View>

            <CustomButton title="Continue" handlePress={submit} containerStyles='w-full mt-4 my-2' textStyles='text-white'/>
            </View>
        </CustomButtomSheet>

        <PopupModal visible={showSuccessModal} title='Your account details have been submitted' onClose={closeSuccessModal}>
            <View className='flex-start w-full my-3'>
            <Text className="font-abold text-center text-blue">You will recieve an alert within 24 hour, if your payment have been confirmed</Text>
            </View>
            <View className='mt-4 flex-row gap-4 items-center'>
            <TouchableOpacity className='bg-blue px-4 py-2 rounded-md w-24 items-center' onPress={closeSuccessModal}>
                <Text className='text-white text-lg font-abold'>OK</Text>
            </TouchableOpacity>
            </View>
        </PopupModal>

        <PopupModal visible={validateModal} title='Confirm Deletion' onClose={() => setValidateModal(false)}>
            <Text className="text-lg font-abold my-3 text-center">Are you sure you want to delete this beneficiary?</Text>
                <View className='mt-4 flex-row gap-4 items-center'>
                <TouchableOpacity className='bg-orange px-4 py-2 rounded-md w-24 items-center' onPress={deleteBeneficiary}>
                    <Text className='text-white text-lg font-abold'>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity className='bg-blue px-4 py-2 rounded-md w-24 items-center' onPress={() => setValidateModal(false)}>
                    <Text className='text-white text-lg font-abold'>No</Text>
                </TouchableOpacity>
            </View>
        </PopupModal>
          
        <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default USDBeneficiariesScreen