import { ReactElement } from 'react';
import { BottomModal, ModalContent, ModalPortal, SlideAnimation } from 'react-native-modals';

export default function Modal({showModal, addheight, children}: {showModal: boolean, addheight?: any, children: ReactElement}) {


  return (
    <>
        <ModalPortal/>
        <BottomModal swipeDirection={["up", "down"]} swipeThreshold={200} modalAnimation={
            new SlideAnimation({
            slideFrom: "bottom"
            })
        } modalStyle={{borderTopLeftRadius: 20, borderTopRightRadius: 20}} onHardwareBackPress={() => false} visible={showModal} onTouchOutside={() => !showModal}>
            <ModalContent style={[{width:"100%"}, addheight && {height: addheight}]}>
                {children}
            </ModalContent>
        </BottomModal>
    </>
  )
}