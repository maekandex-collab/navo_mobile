import { TouchableOpacity, Text} from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type buttonProps = {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  bgColor?: string;
  textStyles?: string;
  isLoading?: boolean;
  disableButton?: boolean;
}

const CustomAmazonButton = ({ title, handlePress, containerStyles, bgColor, textStyles, isLoading, disableButton }: buttonProps) => {
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} className={`${bgColor ? bgColor : "bg-amazonYellow"} rounded-md min-h-[48px] justify-center items-center ${containerStyles} ${isLoading || disableButton ? 'opacity-50' : ''}`} disabled={isLoading || disableButton}>
      {isLoading ? <FontAwesome5 name="circle-notch" size={20} color="black" className='animate-spin-fast'/> :
        <Text className={`font-abold text-lg ${textStyles}`} numberOfLines={1}>{title}</Text>
        }
    </TouchableOpacity>
  )
}

export default CustomAmazonButton