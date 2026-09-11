import { View, Text, Image, KeyboardAvoidingView, ScrollView, Platform, ActionSheetIOS } from 'react-native'
import React, { useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import CustomButton from '@/components/CustomButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import Pdf from 'react-native-pdf';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import PopupModal from '@/components/PopupModal';
import { axiosClient } from '@/globalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setProfile } from '@/redux/ProfileSlice'
import { hideLoader, showLoader } from '@/redux/LoaderSlice';

type IDType = {
  mimeType: string | undefined;
  name: string | null | undefined;
  size: number | undefined;
  uri:  string;
}

const UKDocKycScreen = () => {

    const toast = useToast();
    const dispatch = useDispatch()
    const { fileUri } = useLocalSearchParams() as any;

    // const MAX_FILE_SIZE = 10000000;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const [validateModal, setValidateModal] = useState(false)
    const [IDFile, setIDFile] = useState<IDType | null>(null)

    const validateUpload = () => {
        if(!fileUri){
            toast.show("Please take a selfie", {
                type: "danger",
            });
            router.back()
            return
        }

        if(!IDFile){
            return toast.show("Please upload your ID", {
                type: "danger",
            });
        }
        
        setValidateModal(true)
    }

    const showNativePicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', 'Photo Library', 'Take Photo', 'Choose File'],
                cancelButtonIndex: 0,
            },
            async (buttonIndex) => {
                if (buttonIndex === 1) await pickImage();
                if (buttonIndex === 2) await takePhoto();
                if (buttonIndex === 3) await pickDocument();
            }
            );
        } else {
            // Android: show a custom modal or use Alert
            Alert.alert('Choose Option', '', [
            { text: 'Photo Library', onPress: pickImage },
            { text: 'Take Photo', onPress: takePhoto },
            { text: 'Choose File', onPress: pickDocument },
            { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    const pickDocument = async () => {
    
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
            copyToCacheDirectory: true,
            multiple: false,
          });
    
          if (result.canceled) return;
    
          const file: any = result.assets[0];
    
          if (file.size > MAX_FILE_SIZE) {
            Alert.alert('File too large', 'Please select a file smaller than 10MB.');
            return;
          }
    
          console.log("file", file)
    
          if (!result.canceled) {
            setIDFile(file) 
            console.log('Picked document:', file);
          }  
          
        } catch (err) {
          console.error('Error picking document:', err);
        }
    };

    const getMimeType = (uri: string) => {
        const ext = uri.split('.').pop()?.toLowerCase();

        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        if (ext === 'png') return 'image/png';
        return 'application/octet-stream';
    };

    const submit = async () => {
    
        if(!fileUri){
            toast.show("Please take a selfie", {
                type: "danger",
            });
            router.back()
            return
        }

        if(!IDFile){
            return toast.show("Please upload your ID", {
                type: "danger",
            });
        }
    
        dispatch(showLoader());
        setValidateModal(false)
        try{
    
            const formData = new FormData();

            const mimeType = getMimeType(fileUri);

            formData.append('selfie', {
                uri: fileUri,
                type: mimeType,
                name: `IDfile_${Date.now()}${mimeType.split('/')[1]}`,
            } as any);
    
            formData.append('photoid', {
                uri: IDFile?.uri,
                name: IDFile?.name,
                type: IDFile?.mimeType
            } as any);

            console.log(formData)
    
            const result = await axiosClient.post("/upload-image/facials", formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                },
            })

            const kycStatus = {kycVerified: result.data.isKycVerified}
            await AsyncStorage.mergeItem('userProfile', JSON.stringify(kycStatus));
            
            const recentProfile = await AsyncStorage.getItem('userProfile');
            const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;
    
            if (updatedProfile) {
                dispatch(setProfile(updatedProfile));
            }
    
            console.log("v=",result.data)
            toast.show(result.data?.message,{
                type: "success",
            });
        
            router.replace("/(protected)/(tabs)/home")
    
    
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });

          console.log(error.response.data.message)
    
        } finally {
          dispatch(hideLoader());
        } 
    }

    const pickImage = async () => {

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission required", "Allow access to photos.");
          return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          aspect: [1, 1],
          quality: 0.8,
          allowsMultipleSelection: false,
        });
    
        if (!result.canceled) {
          const selectedImage = result.assets[0];
    
          // Check file size
          const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
    
          // Ensure file exists and has a size
          if (!fileInfo.exists || typeof fileInfo.size !== 'number') {
            Alert.alert("Error", "Could not retrieve file info.");
            return;
          }
    
          if (fileInfo.size > MAX_FILE_SIZE) {
            Alert.alert("File too large", "Image must be less than 10MB.");
            return;
          }
    
          // Check mime type or extension
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
          const isValidType = allowedTypes.includes(selectedImage.mimeType || '');
    
          // Fallback if mimeType is missing (use URI extension)
          const extension = selectedImage.uri.split('.').pop()?.toLowerCase();
          const isValidExtension = ['jpg', 'jpeg', 'png'].includes(extension || '');
    
          if (!isValidType && !isValidExtension) {
            Alert.alert("Invalid file type", "Only JPG, JPEG or PNG images are allowed.");
            return;
          }
          
            const file = {
                mimeType: selectedImage.mimeType,
                name:  selectedImage.fileName,
                size: selectedImage.fileSize,
                uri:  selectedImage.uri
            }

          setIDFile(file)
        }
    };

    // Camera
    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission required", "Allow access to camera.");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0];

            const file = {
                mimeType: selectedImage.mimeType,
                name:  selectedImage.fileName,
                size: selectedImage.fileSize,
                uri:  selectedImage.uri
            }
            setIDFile(file)
        }
    };
    
  return (
    <SafeAreaView className="bg-white h-full px-4">
        <Header title='Document' showGoBack={true} onpress={() => router.back()}/>

        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="w-full justify-center my-6 mt-6">
                    <Text className='text-base font-amedium pb-2 text-blue'>Upload ID (passport/Driver's License)</Text>
                    {!IDFile ? (
                        <View className='bg-inputBg p-4 min-h-44 w-full rounded-lg'>
                        <TouchableOpacity activeOpacity={0.8} className='border-2 border-dashed flex-1 border-gray-200 rounded-md' onPress={showNativePicker}>
                            <View className='items-center justify-center gap-1 my-auto'>
                            <View className={`flex items-center justify-center size-12 rounded-full bg-orangeLight `}>
                                <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#FF6600" />
                            </View>
                            <View>
                                <Text className='text-base text-center font-abold text-blue'>Tap to add</Text>
                                <Text className="font-aregular text-center text-sm text-gray-300">PNG/JPEG/PDF</Text>
                            </View>
                            </View>
                        </TouchableOpacity>
                        </View>
                    ) : IDFile?.mimeType === "application/pdf" ? (
                        <View className='h-96 w-full relative'>
                            <TouchableOpacity activeOpacity={0.8} className='w-full h-full border flex-1 border-gray-200 rounded-lg overflow-hidden' onPress={showNativePicker}>
                                <View className="absolute items-center justify-center"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: [{ translateX: -0.5 * 48 }, { translateY: -0.5 * 48 }],
                                        zIndex: 50
                                    }}>
                                    <View className={`flex items-center justify-center size-12 rounded-full bg-blue-100 `}>
                                        <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#003366" />
                                    </View>
                                </View>
                                <Pdf
                                    source={{ uri: IDFile.uri }}
                                    style={{ flex: 1, width: "100%", height: "100%" }}
                                    page={1}
                                    scale={1.0}
                                    horizontal={false}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className='h-[450px] w-full relative'>
                            <TouchableOpacity activeOpacity={0.8} className='w-full h-full border flex-1 border-gray-200 rounded-lg overflow-hidden' onPress={showNativePicker}>
                                <View className="absolute items-center justify-center"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: [{ translateX: -0.5 * 48 }, { translateY: -0.5 * 48 }],
                                        zIndex: 50
                                    }}>
                                    <View className={`flex items-center justify-center size-12 rounded-full bg-blue-100 `}>
                                        <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#003366" />
                                    </View>
                                </View>
                                <Image
                                    source={{ uri: IDFile?.uri }}
                                    className='w-full h-full'
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </View>
                        
                    )}
                    <Text className="font-amedium text-sm mt-2 mb-4 text-gray-300" numberOfLines={4}>{!IDFile ? "Less than 10MB and must be clear" : IDFile?.name}</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        <View className='w-full justify-center my-6'>
            <CustomButton title="Continue" handlePress={validateUpload} containerStyles="w-full" textStyles='text-white'/>
        </View>

        <PopupModal visible={validateModal} title='Confirm Upload' onClose={() => setValidateModal(false)}>
            <Text className="text-lg font-abold my-3 text-center">Confirm that you are uploading the right document?</Text>
            <View className='mt-4 flex-row gap-4 items-center'>
                <TouchableOpacity className='bg-orange px-4 py-2 rounded-md w-24 items-center' onPress={submit}>
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

export default UKDocKycScreen