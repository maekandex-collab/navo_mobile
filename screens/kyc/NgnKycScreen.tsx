import { View, Text, ScrollView, Platform, KeyboardAvoidingView, StyleSheet, Image, Modal, TouchableOpacity, Dimensions, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Header from '@/components/Header';
import { useToast } from 'react-native-toast-notifications';
import { images } from '@/constants';
import { axiosClient } from '@/globalApi';
import PopupModal from '@/components/PopupModal';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import CircularProgress from '@/components/CircularProgress';
import Tts from 'react-native-tts';
import FaceDetection from '@react-native-ml-kit/face-detection';
import AntDesign from '@expo/vector-icons/AntDesign';
import LottieView from 'lottie-react-native';
import { useSharedValue } from 'react-native-reanimated';
import { hideLoader, showLoader } from '@/redux/LoaderSlice';
import { useDispatch } from 'react-redux';
import * as ImageManipulator from 'expo-image-manipulator';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Step = 'center' | 'done' | 'not_face_error' | 'not_clear_error';

type formType = {
  ID: string;
  IDType: string;
};

const NgnKycScreen = () => {

  const dispatch = useDispatch()
  const toast = useToast();
  const { top, bottom } = useSafeAreaInsets();
  const [validateModal, setValidateModal] = useState(false);
  const [showBVNSuccessModal, setShowBVNSuccessModal] = useState(false);
  const [active, setActive] = useState('Nigeria');
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [captured, setCaptured] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showManualButton, setShowManualButton] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const [BVNResult, setBVNResult] = useState({ 
    name: '', 
    phoneNo: ''
  });
  const [form, setForm] = useState<formType>({ 
    ID: '', 
    IDType: '' 
  });
  const bvnRegex = /^\d{11}$/;

  const [step, setStep] = useState<Step | null>(null);

  const progress = useSharedValue(0);
  const glowTrigger = useSharedValue(0);

  const normalizeImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: 720 } },
        { rotate: 0 },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  };

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    // Tts.setDefaultRate(1.0);
  }, []);

  useEffect(() => {
    if(step){
      if (step === 'center') Tts.speak('Please look straight into the frame and keep your eyes open')
      else if (step === 'done') Tts.speak('Face captured successfully')
      else if (step === 'not_face_error') Tts.speak('No Facial detected, try again')
      else if (step === 'not_clear_error') Tts.speak('unclear detection, try again')
    }
  }, [step]);

  // Start timer when camera opens
  useEffect(() => {
    if (showCamera) {
      setShowManualButton(false); // hide manual button initially
      let timeLeft = 5; // countdown starts from 14 seconds
      setCountdown(timeLeft);

      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(timerRef.current!);
          captureSelfie(); // only capture once
        }
      }, 2000);
    } else {
      // cleanup when modal closes
      if (timerRef.current) clearInterval(timerRef.current);
      setCountdown(null);
      setShowManualButton(false);
    }
  }, [showCamera]);

  const validateBVN = () => {
    if (!form.ID) return toast.show('BVN is required', { type: 'warning' });
    if (!bvnRegex.test(form.ID)) return toast.show('BVN must be 11 digits', { type: 'warning' });
    setValidateModal(true);
  };

  const submit = async () => {
    if (!form.ID) return toast.show('BVN is required', { type: 'warning' });
    if (!bvnRegex.test(form.ID)) return toast.show('BVN must be 11 digits', { type: 'warning' });

    try {
      setValidateModal(false);
      dispatch(showLoader());
      const data = { bvn: form.ID };
      const result = await axiosClient.post('/verify/verify-details', data);

      setBVNResult({
        name: result.data.data.name,
        phoneNo: result.data.data.maskedPhone,
      });

      setShowBVNSuccessModal(true);
    } catch (error: any) {
      toast.show(error.response?.data?.message || 'Error verifying BVN', { type: 'danger' });
    } finally {
      dispatch(hideLoader());
    }
  };

  const confirmBVN = async () => {
    setShowBVNSuccessModal(false);
    dispatch(showLoader());
    try {
      await axiosClient.post('/verify/confirm-user', { isConfirmed: true });
      toast.show('OTP sent to your BVN phone No.', { type: 'success' });
      router.replace('/(protected)/(routes)/NgnBVNOTP');
    } catch (error: any) {
      toast.show(error.response?.data?.message || 'Error confirming BVN', { type: 'danger' });
    } finally {
      dispatch(hideLoader());
    }
  };

  const unConfirmBVN = async () => {
    setShowBVNSuccessModal(false);
    await axiosClient.post('/verify/confirm-user', { isConfirmed: false });
  };

  const handleOpenCamera = async () => {

    if (!hasPermission) {
      const granted = await requestPermission();

      if (!granted) {
        Alert.alert(
          'Permission required',
          'Camera permission is needed to take a selfie.'
        );
        return;
      }
    }

    setShowCamera(true);
    setStep("center")
    setCaptured(false)
    progress.value = 0;
  };

  const captureSelfie = async () => {
    if (cameraRef.current) {
      setCountdown(null)
      if (capturing) return; // prevent double press
      setCapturing(true);

      const photo = await cameraRef.current.takePhoto({ flash: 'off', enableShutterSound: true });
      console.log('Selfie captured:', photo.path);
      // Call detectFaces here
      setCaptured(true);
      setStep('done');
      await detectFaces(photo.path);
    }
  };

  const detectFaces = async (photoPath: string) => {
    try {
      console.log('Faces1:', photoPath);

      let fileUri = photoPath;

      if (!fileUri.startsWith('file://')) {
        fileUri = `file://${fileUri}`;
      }

      fileUri = await normalizeImage(fileUri);

      console.log('Faces2 :', fileUri);

      const faces = await FaceDetection.detect(fileUri, {
        landmarkMode: 'all',
        classificationMode: 'all',
        performanceMode: 'accurate',
      });

      console.log('Faces detected:', faces);
      if (!faces.length){
        setCaptured(false)
        console.log("No Facial was detected");
        setStep("not_face_error")
        setTimeout(() => {
          setStep("center")
        }, 6000)
        setShowManualButton(true); // allow retry manually
        setCapturing(false); // re-enable button after processing
        return
      }
      // if (!faces.length || step === 'done') return;
      const face = faces[0];
      const leftEye = face.leftEyeOpenProbability ?? 0;
      const rightEye = face.rightEyeOpenProbability ?? 0;
      if (leftEye > 0.7 || rightEye > 0.7) {
        console.log("Both eyes open");
        setShowCamera(false);
        setCapturing(false);
        router.replace({
          pathname: '/(protected)/(routes)/UKDocKyc',
          params: { fileUri }
        })
      } else {
        console.log("Partial blink or unclear detection");
        setCaptured(false)
        setStep("not_clear_error")
        setShowManualButton(true); // allow retry manually
        setCapturing(false); // re-enable button after processing
      }
    } catch (error: any) {
      toast.show("Face detection error", { type: 'danger' });
      setCapturing(false); // re-enable button after processing
      console.log('Face detection error:', error);
    }
  };

  if (!device) return <View className='flex-1 justify-center items-center'><Text>No camera...</Text></View>;

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title="KYC" showGoBack onpress={() => router.back()} />

      <View className="mt-5 mb-4 w-full flex-row justify-between">
        <CustomButton title="Nigeria" containerStyles="w-[48%]" bgColor={active === 'Nigeria' ? 'bg-blue' : 'bg-blue/50'} textStyles="text-white" handlePress={() => { setActive('Nigeria'); setStep(null) }} />
        <CustomButton title="UK" containerStyles="w-[48%]" bgColor={active === 'UK' ? 'bg-blue' : 'bg-blue/50'} textStyles="text-white" handlePress={() => { setActive('UK'); setShowBVNSuccessModal(false) }} />
      </View>

      {active === 'Nigeria' ? (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-4">
              <FormField title="Means of Identification" value="BVN" otherStyles="mt-4" disabled />
              <FormField title="Input BVN Number" value={form.ID} placeholder="Enter here" handleChangeText={e => setForm({ ...form, ID: e })} otherStyles="mt-7" keyboardType="number-pad" />
            </View>
          </ScrollView>
          <View className="w-full justify-center gap-2 my-4">
            <CustomButton title="Continue" handlePress={validateBVN} containerStyles="w-full" textStyles="text-white" />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full items-center justify-center mt-2 mb-8">

              <View className='items-center justify-center w-full max-w-56'>
                <Text className={`font-ablack text-2xl text-center text-blue`}>Take Selfie</Text>
                <Text className={`font-abold text-center text-gray-300 mt-1`}>To complete your KYC, We need your facial capture.</Text>
              </View>
              <Image source={images.kyc} className='mx-auto my-8'/>
              <View className='w-full max-w-60 gap-6'>
                <View className='flex-row items-start gap-3'>
                  <View className='items-center justify-center rounded-full bg-orange size-8'>
                    <Text className='text-white font-abold text-lg'>1</Text>
                  </View>
                  <View>
                    <Text className={`font-abold text-xl text-blue -mt-2`}>Good lighting</Text>
                    <Text className={`font-amedium text-sm text-gray-300 mt-1`}>Make sure you are in a well lit area and both ears are uncovered.</Text>
                  </View>
                </View>
                <View className='flex-row items-start gap-3'>
                  <View className='items-center justify-center rounded-full bg-orange size-8'>
                    <Text className='text-white font-abold text-lg'>2</Text>
                  </View>
                  <View>
                    <Text className={`font-abold text-xl text-blue -mt-2`}>Look straight</Text>
                    <Text className={`font-amedium text-sm text-gray-300 mt-1`}>Hold your phone at eye level and look straight to the cameral.</Text>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>
          <View className="w-full justify-center gap-2 my-4">
            <CustomButton title="Open Camera" handlePress={handleOpenCamera} containerStyles="w-full" textStyles="text-white" />
          </View>
        </KeyboardAvoidingView>
      )}

      {/* BVN Modals */}
      <PopupModal visible={validateModal} title="Is the digit below your Bank Verification Number (BVN)?" onClose={() => setValidateModal(false)}>
        <Text className="text-2xl font-abold my-3 text-center">{form.ID}</Text>
        <View className="mt-4 flex-row gap-4 items-center">
          <TouchableOpacity className="bg-orange px-4 py-2 rounded-md w-24 items-center" onPress={submit}>
            <Text className="text-white text-lg font-abold">Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue px-4 py-2 rounded-md w-24 items-center" onPress={() => setValidateModal(false)}>
            <Text className="text-white text-lg font-abold">No</Text>
          </TouchableOpacity>
        </View>
      </PopupModal>

      <PopupModal visible={showBVNSuccessModal} title="Confirm your BVN details below" onClose={() => setShowBVNSuccessModal(false)}>
        <Text className="text-lg font-amedium">BVN Name:</Text>
        <Text className="text-xl font-abold">{BVNResult.name}</Text>
        <Text className="text-lg font-amedium mt-2">BVN Phone No:</Text>
        <Text className="text-xl font-abold">{BVNResult.phoneNo}</Text>
        <Text className="text-sm font-abold text-blue mt-1">A one time passcode(OTP) will be sent to this phone number to confirm your BVN</Text>
        <View className="mt-4 flex-row gap-4 items-center">
          <TouchableOpacity className="bg-orange px-4 py-2 rounded-md w-24 items-center" onPress={confirmBVN}>
            <Text className="text-white text-lg font-abold">Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue px-4 py-2 rounded-md w-24 items-center" onPress={unConfirmBVN}>
            <Text className="text-white text-lg font-abold">No</Text>
          </TouchableOpacity>
        </View>
      </PopupModal>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <StatusBar hidden/>

        <View style={{marginTop: top + 10}}>
          <TouchableOpacity onPress={() => setShowCamera(false)} className='ml-auto m-4'>
            <AntDesign name="leftcircle" size={30} color="#C3C3C3"/>
          </TouchableOpacity>
        </View>

        <View className='flex-1 items-center mt-4'>
          {/* Progress Circle */}
          <CircularProgress
            size={SCREEN_WIDTH * 0.85} // outer circle a bit bigger
            strokeWidth={12}
            progress={progress}
            glowTrigger={glowTrigger}
            color={captured ? "green" : "red"}
            glowColor={captured ? "green" : "red"}
          />

          {/* Camera inside circle */}
          <View style={styles.cameraWrapper}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              device={device}
              isActive
              photo
            />
          </View>

          {/* Instruction text */}
          <Text className='text-center text-black text-base font-abold mt-5'>
            {step === "center" && "Look straight and keep your eyes open"}
            {step === "done" && "Face captured successfully!"}
            {step === "not_face_error" && "No Facial detected, Try again!"}
            {step === "not_clear_error" && "unclear detection, Try again!"}
          </Text>

          {capturing && (
            <View>
              <LottieView
                source={images.loadingBar}
                autoPlay
                loop
                style={{ width: 200, height: 60, marginHorizontal: "auto" }}
              />
            </View>
          )}

          {step === "center" && countdown !== null && (
            <Text className='text-center text-black text-base font-abold mt-2'>
              Capturing in <Text className='text-green-600 font-ablack'>{countdown}</Text>
            </Text>
          )}
        </View>

  
        {showManualButton && !capturing && (
          <View className='w-full justify-center p-4' style={{marginBottom: bottom + 10}}>
            <CustomButton title="Capture" handlePress={captureSelfie} containerStyles="w-full" textStyles='text-white'/>
          </View>
        )}
      </Modal>

      <StatusBar backgroundColor="#ffffff" style="dark" />
    </SafeAreaView>
  );
};

export default NgnKycScreen;

const styles = StyleSheet.create({
  cameraWrapper: {
    width: SCREEN_WIDTH * 0.78,
    height: SCREEN_WIDTH * 0.78,
    borderRadius: (SCREEN_WIDTH * 0.78) / 2,
    overflow: "hidden",
    position: "absolute",
    marginTop: 14
    // top: "50%",
    // left: "50%",
    // transform: [
    //   { translateX: -(SCREEN_WIDTH * 0.78) / 2 },
    //   { translateY: -(SCREEN_WIDTH * 0.78) / 2 },
    // ],
  },
  camera: {
    width: "100%",
    height: "100%",
  },
});
