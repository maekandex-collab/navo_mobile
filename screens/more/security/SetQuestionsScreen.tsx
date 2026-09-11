import { View, Text, ScrollView, StyleSheet, Platform, KeyboardAvoidingView, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications';
import Header from '@/components/Header';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Accordion from 'react-native-collapsible/Accordion';
import Checkbox from 'expo-checkbox';
import Entypo from '@expo/vector-icons/Entypo';
import TextInputBox from '@/components/TextInputBox';
import { Skeleton } from 'moti/skeleton'
import { setProfile } from '@/redux/ProfileSlice';
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/redux/LoaderSlice';

type FormItem = {
  questionId: string;
  answer: string;
}[];

const SkeletonCommonProps = {
  colorMode: 'light',
  highlightColor: '#eaeaea',  // slightly lighter for shimmer
  transition: {
    type: 'timing',
    duration: 1500,
  },
  backgroundColor: '#f1f3f4',
} as const;

const SetQuestionsScreen = () => {

  const dispatch = useDispatch()
  const [questions, setQuestions] = useState([])
  const [form, setForm] = useState<FormItem[]>([]);
  const loadingList = new Array(10).fill(null)
  
  const [activeSections, setActiveSection] = useState([0])

  const toast = useToast()
  const [loading, setLoading] = useState(false)

  console.log(form)

  useEffect(() => {
    const questions = async () => {

      setLoading(true)

      try {

        const result = await axiosClient.get("/secure/security-questions")

        console.log(result.data)
        setQuestions(result.data)


      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setLoading(false)
      }
    }

    questions()
  }, [])

  useEffect(() => {
    if (questions.length > 0) {
      setForm(
        questions?.map(() => ({
          questionId: '',
          answer: '',
        }))
      );
    }
  }, [questions]);

  const submit = async () => {

    const answeredQuestions = form?.filter((item) => item?.answer !== "")

    console.log("a-q",answeredQuestions)

    if(answeredQuestions?.length === 0){
      return toast.show("No questions has been answered", {
        type: "warning",
      });
    }

    if(answeredQuestions?.length === 1){
      return toast.show("Answer two security questions", {
        type: "warning",
      });
    }

     try {
    
          dispatch(showLoader());

          const data = {
            questions: answeredQuestions
          }
          
          const result = await axiosClient.post("/secure/set-security-questions", data)

          const user: any = {
            isQuestionSet: true,
            questions: result.data?.questions || []
          }
          console.log('userFetched', result.data, user)
    
          await AsyncStorage.mergeItem('userProfile', JSON.stringify(user));

          const recentProfile = await AsyncStorage.getItem('userProfile');
          const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;
    
          if (updatedProfile) {
            dispatch(setProfile(updatedProfile));
          }
    
          toast.show(result.data?.message, {
            type: "success",
          });
    
          setForm([])

          router.push("/(protected)/(tabs)/more")
    
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
          console.log(error.response.data)
        } finally {
          dispatch(hideLoader());
        } 
  }

  const renderHeader = (section: any, index: number, isActive: boolean) => {
    return (
      <View className='flex-row items-start justify-between gap-2'>
        <View className='flex-row items-start gap-0.5'>
          {
            isActive ?
            (
              <Entypo name="chevron-small-up" size={26} color="#003366"/>
            ) : (
              <Entypo name="chevron-small-down" size={26} color="#003366"/>    
            )
          }
          <Text className="text-lg text-blue font-amedium w-[80%]">{section?.question}</Text>
        </View>
        <Checkbox value={form[index]?.answer?.trim() !== ''} color={form[index]?.answer.trim() !== '' ? '#FF6600' : undefined} style={{borderRadius: 5, marginTop: 5, borderColor: "#003366"}}/>
      </View>
    );
  };

   const renderContent = (section: any, index: number, isActive: boolean) => {

    const handleInputChange = (text: string) => {
      const nonEmptyAnswers = form.filter(item => item?.answer.trim() !== '');

      const isCurrentEmpty = form[index]?.answer?.trim() === '';
      const isNewEmpty = text?.trim() === '';

      const tryingToAddNew = isCurrentEmpty && !isNewEmpty;

      // Only allow adding a new answer if less than 2 are filled
      if (tryingToAddNew && nonEmptyAnswers.length >= 2) {
        return toast.show("Only 2 questions can be set", {
          type: "warning",
        });
      }

      const updatedForm = [...form]; 
      updatedForm[index].questionId = section?.id;
      updatedForm[index].answer = text;
      setForm(updatedForm);
    };

    return (
      <View className='mt-4'>
        <TextInputBox placeholder="Enter answer here" handleChangeText={handleInputChange} otherStyles='w-full'/>
      </View>
    );
  };

  const updateSections = (activeSections: any) => {
    setActiveSection(activeSections);
  };
  
  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title="Set Questions" showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!loading && questions.length !== 0 &&
            <View className="w-full justify-center my-4">
              <Text className="text-lg text-orange font-amedium text-center mb-2">Only two questions can be set!</Text>
              <Accordion
                sections={questions}
                activeSections={activeSections}
                renderHeader={renderHeader}
                renderContent={renderContent}
                onChange={updateSections}
                sectionContainerStyle={{borderBottomWidth: 1, paddingVertical: 20, borderBottomColor: "#DDDDDD"}}
                underlayColor="transparent"
              />
            </View>
          }

          {loading && 
            (
              <View className="w-full justify-center my-4">
                <Skeleton.Group show={loading}>
                  {loadingList.map((item, index) => (
                    <View className='w-full mb-4 flex-row justify-between' key={index}>
                      <Skeleton height={50} width={'100%'} {...SkeletonCommonProps} /> 
                    </View>
                  ))}
                </Skeleton.Group>
              </View>
            )
          }
        </ScrollView>
      </KeyboardAvoidingView>
      {!loading && questions?.length !== 0 &&
        <View className='w-full justify-center my-6'>
          <CustomButton title="Confirm Questions" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
        </View>
      }

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default SetQuestionsScreen