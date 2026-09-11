import { View, Text, Dimensions } from "react-native";
import ProductSkeleton from "../ProductSkeleton";
const width = Dimensions.get("window").width

const VerticalSkeleton = ({title}: {title: string}) => {

  const half = (width/2) - 21

  return (
    <View className="flex-1 px-1 py-2">
       <Text className='font-abold text-xl px-3 pb-2'>{title}</Text>
       <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 12, gap: 10 }}>
          <View style={{ width: half, marginBottom: 10 }}>
            <ProductSkeleton width={half} />
          </View>
          <View style={{ width: half, marginBottom: 10 }}>
            <ProductSkeleton width={half} />
          </View>
          <View style={{ width: half, marginBottom: 10 }}>
            <ProductSkeleton width={half} />
          </View>
          <View style={{ width: half, marginBottom: 10 }}>
            <ProductSkeleton width={half} />
          </View>
        </View>
    </View>
  );
};

export default VerticalSkeleton