import { View, Text } from 'react-native'
import React from 'react'
import ShopReceiptList from './ShopReceiptList'

const Shop4MeReceipt = ({receipt}: {receipt: any}) => {
  return (
    <View className='border border-gray-100'>
        <View className='flex-row items-center justify-between'>
          <View className='bg-blue p-4 w-32 items-center justify-center'>
            <Text className="font-ablack text-lg text-orange">NAVO</Text>
            <Text className="font-aregular text-lg text-orange leading-5 -mt-2">Cargo</Text>
          </View>
          <View className='pr-2'>
            <View>
              <View>
                <Text className="font-ablack text-2xl text-orange">Invoice</Text>
              </View>
              <View className='flex-row items-center justify-between gap-4'>
                <Text className="font-abold text-xs text-blue">Invoice No:</Text>
                <Text className="font-aregular text-xs text-blue">573849</Text>
              </View>
              <View className='flex-row items-center justify-between gap-4'>
                <Text className="font-abold text-xs text-blue">Date:</Text>
                <Text className="font-aregular text-xs text-blue">10/03/2025</Text>
              </View>
            </View>
          </View>
        </View>
        <View className='px-2 py-3 bg-gray-100/60'>
            <ShopReceiptList title='Service Type' value={receipt.goods.goodsType}/>
            <ShopReceiptList title='Service Type' value={receipt.goods.itemCategory}/>
            <ShopReceiptList title='Service Type' value={receipt.goods.item}/>
            <ShopReceiptList title='Service Type' value={receipt.goods.details}/>
            <ShopReceiptList title='Service Type' value={receipt.goods.quantity}/>
            <ShopReceiptList title='Service Type' value={receipt.goods.weight}/>
            <ShopReceiptList title='Service Type' value={receipt.goods.deliveryHub}/>
        </View>
        <View className='flex-row justify-between gap-2'>
          <View className='bg-blue p-4 w-32'>
            <Text className="font-aregular text-[8px] text-white">Invoice to:</Text>
            <Text className="font-abold text-[8px] text-white mb-1 max-w-24">Ojiego Franklin</Text>
            <Text className="font-aregular text-[6px] text-white leading-[1] max-w-24 mb-1">3a, Sulaimon Shoderu Street, Aruna, Ikorodu</Text>
            <Text className="font-aregular text-[6px] text-white leading-[1] max-w-24 mb-1">dummyname@gmail.com</Text>
            <Text className="font-aregular text-[6px] text-white leading-[1] max-w-24">0801 234 5678</Text>

            <View className='border-b border-white/90 mb-1 mt-2'/>
            <Text className="font-aregular text-[7px] text-white leading-[1] max-w-24 mb-1">Terms & Conditions:</Text>
            <Text className="font-aregular text-[6px] text-white leading-[1] max-w-24 mb-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</Text>
          </View>
          <View className='pr-2 py-2'>
            <View className='align-bottom'>
              <View className='flex-row items-center justify-between gap-4'>
                <Text className="font-abold text-[9px] text-blue">Sub Total:</Text>
                <Text className="font-aregular text-[9px] text-blue">N200,000.00</Text>
              </View>
              <View className='flex-row items-center justify-between gap-4'>
                <Text className="font-abold text-[9px] text-blue">Service charge:</Text>
                <Text className="font-aregular text-[9px] text-blue">N20,000.00</Text>
              </View>
              <View className='border-b border-blue mb-1 mt-2'/>
              <View className='flex-row items-center justify-between gap-4'>
                <Text className="font-abold text-[9px] text-blue">Total Due::</Text>
                <Text className="font-aregular text-[9px] text-blue">N220,000.00</Text>
              </View>

              <View className='mt-5 -ml-5'>
                <Text className="font-abold text-[8px] text-blue">Thank you for trusting NavoCargo</Text>
                <Text className="font-abold text-[8px] text-blue mt-1">Payment Info:</Text>
                <View className='flex-row gap-2'>
                  <View>
                    <Text className="font-aregular text-[7px] text-blue">Account No:</Text>
                    <Text className="font-aregular text-[7px] text-blue">A/C Name:</Text>
                    <Text className="font-aregular text-[7px] text-blue">Bank:</Text> 
                  </View>
                  <View>
                    <Text className="font-aregular text-[7px] text-blue">1234567890</Text>
                    <Text className="font-aregular text-[7px] text-blue">Dummy Name</Text>
                    <Text className="font-aregular text-[7px] text-blue">Dummy Bank</Text>
                  </View>
                </View>
                
              </View>
            </View>
          </View>
        </View>
    </View>
  )
}

export default Shop4MeReceipt