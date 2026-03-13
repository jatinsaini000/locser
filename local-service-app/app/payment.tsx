import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { getServiceById } from '../data/mockData';

import { API_URL } from '../constants/Api';

export default function PaymentScreen() {
  const router = useRouter();
  const { id, date, time, totalPrice: passedPrice } = useLocalSearchParams();
  const service = getServiceById(id as string);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // If directly navigated without ID, use generic fallback data
  const title = service ? service.title : "Premium Deep Cleaning";
  const subtitle = service ? service.subtitle : "Full home sanitation service.";
  const image = service ? service.imageUrl : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2670&auto=format&fit=crop";
  const serviceFee = service ? service.price : 120;
  
  const platformFee = 8.50;
  const tax = serviceFee * 0.10;
  const totalPrice = passedPrice ? parseFloat(passedPrice as string) : (serviceFee + platformFee + tax);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: id,
          userId: 'u1',
          bookingDate: date || 'ASAP',
          timeSlot: time || 'Morning',
          totalPrice,
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        setShowSuccess(true);
      } else {
        console.error("Booking Error:", json.error);
        alert(`Booking failed: ${json.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setShowSuccess(false);
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-slate-50 pt-12">
        <StatusBar barStyle="dark-content" />

        {/* Top Navigation */}
        <View className="flex-row items-center p-4 border-b border-slate-100">
          <TouchableOpacity 
            className="p-2 justify-center"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-slate-900 text-lg font-bold flex-1 text-center mr-10">
            Review and Pay
          </Text>
        </View>

      <ScrollView className="flex-1 pb-24" showsVerticalScrollIndicator={false}>
        {/* Booking Summary Header */}
        <View className="px-5 pt-6 pb-3">
          <Text className="text-slate-900 tracking-tight text-2xl font-black">Checkout</Text>
          <Text className="text-slate-500 text-sm mt-1">Review your service details before paying.</Text>
        </View>

        {/* Service Card */}
        <View className="px-5 py-2">
          <View className="flex-row gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
            <View className="flex-1 justify-center gap-1 pr-2">
              <Text className="text-primary text-[10px] font-black uppercase tracking-widest">Service Details</Text>
              <Text className="text-slate-900 text-lg font-bold leading-tight tracking-tight" numberOfLines={2}>{title}</Text>
              <Text className="text-slate-500 text-sm leading-normal mt-1" numberOfLines={1}>{subtitle}</Text>
            </View>
            <Image 
              source={{ uri: image }}
              className="w-24 h-24 rounded-xl bg-slate-200"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Schedule & Location */}
        <View className="px-5 gap-3 mt-4">
          <View className="flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <View className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10">
              <MaterialIcons name="event" size={24} color="#1754cf" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 text-base font-bold tracking-tight">Schedule</Text>
              <Text className="text-slate-500 text-sm mt-0.5">{date ? `${date}, ${time}` : 'Select a date'}</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary font-bold text-sm">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <View className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10">
              <MaterialIcons name="location-pin" size={24} color="#1754cf" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 text-base font-bold tracking-tight">Location</Text>
              <Text className="text-slate-500 text-sm mt-0.5">123 Maple Avenue, Springfield</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary font-bold text-sm">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="px-5 pt-8">
          <Text className="text-slate-900 tracking-tight text-xl font-bold mb-4">Payment Method</Text>
          <View className="gap-3">
            <TouchableOpacity 
              className={`flex-row items-center justify-between p-4 rounded-2xl border-2 shadow-sm ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-transparent bg-white'}`}
              onPress={() => setPaymentMethod('card')}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-12 h-12 rounded-xl items-center justify-center ${paymentMethod === 'card' ? 'bg-primary/20' : 'bg-slate-50 border border-slate-100'}`}>
                  <MaterialIcons name="credit-card" size={24} color={paymentMethod === 'card' ? "#1754cf" : "#64748b"} />
                </View>
                <View>
                  <Text className="text-slate-900 font-bold text-base tracking-tight mb-0.5">Credit / Debit Card</Text>
                  <Text className="text-slate-500 text-xs">•••• •••• •••• 4242</Text>
                </View>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-slate-300'}`}>
                {paymentMethod === 'card' && <View className="w-3 h-3 rounded-full bg-primary" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`flex-row items-center justify-between p-4 rounded-2xl border-2 shadow-sm ${paymentMethod === 'apple' ? 'border-primary bg-primary/5' : 'border-transparent bg-white'}`}
              onPress={() => setPaymentMethod('apple')}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-12 h-12 rounded-xl items-center justify-center ${paymentMethod === 'apple' ? 'bg-black/90' : 'bg-slate-50 border border-slate-100'}`}>
                  <MaterialIcons name="apple" size={28} color={paymentMethod === 'apple' ? "white" : "#64748b"} />
                </View>
                <Text className="text-slate-900 font-bold text-base tracking-tight">Apple Pay</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'apple' ? 'border-primary' : 'border-slate-300'}`}>
                {paymentMethod === 'apple' && <View className="w-3 h-3 rounded-full bg-primary" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`flex-row items-center justify-between p-4 rounded-xl ${paymentMethod === 'google' ? 'border-2 border-primary bg-primary/5' : 'border border-slate-200 bg-white hover:bg-slate-50'}`}
              onPress={() => setPaymentMethod('google')}
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="payments" size={24} color={paymentMethod === 'google' ? "#10b981" : "#64748b"} />
                <Text className="text-slate-900 font-bold text-sm">Google Pay</Text>
              </View>
              <View className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'google' ? 'border-primary' : 'border-slate-300'}`}>
                {paymentMethod === 'google' && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Table */}
        <View className="px-5 py-8">
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 gap-4">
            <View className="flex-row justify-between">
              <Text className="text-slate-500 font-medium">Service Fee</Text>
              <Text className="text-slate-900 font-bold tracking-tight">${serviceFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500 font-medium">Platform Fee</Text>
              <Text className="text-slate-900 font-bold tracking-tight">${platformFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500 font-medium">Local Tax</Text>
              <Text className="text-slate-900 font-bold tracking-tight">${tax.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-4 border-t border-slate-100 border-dashed mt-1">
              <Text className="text-slate-900 text-xl font-black tracking-tight">Total Price</Text>
              <Text className="text-primary text-xl font-black tracking-tight">${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View className="p-6 pb-8 border-t border-slate-100 bg-white/95 items-center">
        <TouchableOpacity 
          className="w-full bg-primary h-16 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/40"
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="lock" size={18} color="white" />
              <Text className="text-white font-bold text-lg">Confirm Payment</Text>
            </>
          )}
        </TouchableOpacity>
        <Text className="text-center text-xs text-slate-500 font-medium mt-4">Payments are secured and encrypted</Text>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="slide">
        <View className="flex-1 bg-black/40 items-center justify-end">
          <View className="bg-white px-8 pt-10 pb-12 rounded-t-[40px] shadow-2xl w-full items-center min-h-[50%]">
            <View className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white -mt-20">
              <MaterialIcons name="verified" size={56} color="#16a34a" />
            </View>
            <Text className="text-slate-900 text-3xl font-black tracking-tight text-center mb-3">Booking Confirmed!</Text>
            <Text className="text-slate-500 text-center text-base mb-10 leading-relaxed px-4">
              Your service with {title} is successfully scheduled. A receipt has been sent to your email.
            </Text>
            <TouchableOpacity 
              className="w-full bg-slate-900 h-16 rounded-2xl items-center justify-center shadow-md active:scale-95 transition-transform"
              onPress={handleFinish}
            >
              <Text className="text-white font-bold text-lg">View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    </>
  );
}
