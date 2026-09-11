import { TouchableOpacity, Text} from 'react-native'

type buttonProps = {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
}

const RoundedButton = ({ title, handlePress, containerStyles, textStyles, isLoading }: buttonProps) => {
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} className={`rounded-full min-h-[40px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`} disabled={isLoading}>
        <Text className={`font-abold ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  )
}

export default RoundedButton