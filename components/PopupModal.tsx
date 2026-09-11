import { View, Text, Modal, TouchableWithoutFeedback, Pressable } from 'react-native'

interface ModalProps {
  title: string
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

const PopupModal = ({ title, visible, onClose, children }: ModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center px-7" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        {/* TouchableWithoutFeedback only around the background */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute top-0 left-0 right-0 bottom-0" />
        </TouchableWithoutFeedback>

        {/* Actual modal content */}
        <View className="bg-white rounded-xl items-center px-5 py-8 w-full">
          <Text className="text-lg text-blue font-abold mt-1 text-center">{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  )
}

export default PopupModal
