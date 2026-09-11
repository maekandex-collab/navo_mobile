import { TouchableOpacity, Text} from 'react-native'
import { ReactElement } from 'react';

type buttonProps = {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  textStyles?: string;
  icon: ReactElement;
  isLoading?: boolean;
}

const IconButton = ({ title, handlePress, containerStyles, textStyles, icon, isLoading }: buttonProps) => {
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} className={`flex-row rounded-md gap-2 px-2 min-h-[48px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`} disabled={isLoading}>
        {icon}
        <Text className={`font-amedium text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  )
}

export default IconButton