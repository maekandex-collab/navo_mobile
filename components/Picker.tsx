import { View, Text, StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown';

type PickerItem = { label: string; value: string | number };

type formProps = {
  title: string; 
  value: string | number;
  placeholder?: any; 
  handleChangeText: (item: PickerItem) => void;
  labelStyle?: string;
  data: Array<object>;
  inputBg?: string;
  otherStyles?: string;
  [props:string]: any;
}


const Picker = ({ title, value, placeholder, data, inputBg, handleChangeText, labelStyle, otherStyles, ...props}: formProps) => {
  
    return (
    <View className={`space-y-2 w-full mt-7 ${otherStyles}`}>
        <Text className={`text-base font-amedium pb-2 ${labelStyle ? labelStyle : 'text-blue'}`}>{title}</Text>
        <Dropdown
            style={inputBg ? styles.dropdownEditProfile : styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={data}
            iconColor='#ffffff'
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={placeholder ? placeholder : "Select here"}
            value={value}
            onChange={handleChangeText}
        />
    </View>
  )
}

export default Picker

const styles = StyleSheet.create({
    dropdown: {
      height: 45,
      backgroundColor: "#F3F3F3",
      borderRadius: 7,
      paddingLeft:18,
      paddingRight: 18
    },
    dropdownEditProfile: {
      height: 45,
      backgroundColor: "#FFFFFF",
      borderRadius: 7,
      paddingLeft:18,
      paddingRight: 18
    },
    placeholderStyle: {
      fontSize: 14,
      color:"#ccc"
    },
    selectedTextStyle: {
      fontSize: 14,
    },
    iconStyle: {
      width: 20,
      height: 20,
      borderRadius: 50,
      backgroundColor: "#C3C3C3"
    }
  });