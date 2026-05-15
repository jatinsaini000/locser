import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { getServiceById } from '../../data/mockData';

import { API_URL } from '../../constants/Api';

const DATES = [
  { day: 'Mon', date: '12' },
  { day: 'Tue', date: '13' },
  { day: 'Wed', date: '14' },
  { day: 'Thu', date: '15' },
  { day: 'Fri', date: '16' },
  { day: 'Sat', date: '17' },
];

const TIME_SLOTS = [
  "09:00 - 10:00 AM",
  "10:00 - 11:00 AM",
  "11:00 - 12:00 PM",
  "12:00 - 01:00 PM",
  "01:00 - 02:00 PM",
  "02:00 - 03:00 PM",
  "03:00 - 04:00 PM",
  "04:00 - 05:00 PM"
];

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(DATES[0].date);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const service = getServiceById(id as string);

  useEffect(() => {
    if (service) {
      fetch(`${API_URL}/bookings/slots?serviceId=${service.id}&bookingDate=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBookedSlots(data.bookedSlots);
            // Default to first available slot if currently selected is booked
            if (data.bookedSlots.includes(selectedTime)) {
              const firstFree = TIME_SLOTS.find(t => !data.bookedSlots.includes(t));
              if (firstFree) setSelectedTime(firstFree);
            }
          }
        })
        .catch(console.error);
    }
  }, [selectedDate, service?.id]);

  if (!service) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
          <Text className="text-xl font-bold text-slate-900">Service Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </>
    );
  }

  // Calculate pricing (mock logic)
  const serviceFee = service.price;
  const taxesAndFees = serviceFee * 0.15; // 15% tax/fee
  const totalPrice = serviceFee + taxesAndFees;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white pt-12">
      <StatusBar barStyle="dark-content" />

      {/* Header Nav */}
      <View className="flex-row items-center bg-white p-4 pb-2 justify-between border-b border-primary/10">
        <TouchableOpacity 
          className="w-12 h-12 justify-center"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center" numberOfLines={1}>
          Service Details
        </Text>
        <TouchableOpacity className="w-12 h-12 justify-center items-end">
          <MaterialIcons name="share" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="w-full h-80 bg-slate-200">
          <Image 
            source={{ uri: service.imageUrl }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Service Info */}
        <View className="px-4 pt-6">
          <Text className="text-slate-900 text-3xl font-bold leading-tight text-left pb-2">
            {service.title}
          </Text>
          <Text className="text-slate-600 text-base font-normal leading-normal pb-4">
            {service.description}
          </Text>
        </View>

        {/* Provider Info */}
        <View className="flex-row items-center bg-white px-4 py-4 justify-between border-y border-primary/5">
          <View className="flex-row items-center gap-4 flex-1">
            <Image 
              source={{ uri: service.provider.avatarUrl }}
              className="h-14 w-14 rounded-full border-2 border-primary/20 bg-slate-200"
            />
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 text-base font-bold leading-normal">{service.provider.name}</Text>
              <Text className="text-primary text-sm font-medium leading-normal">
                {service.provider.isCertified ? 'Elite Certified Provider' : 'Professional Provider'}
              </Text>
            </View>
          </View>
          <View className="items-end pl-2">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="star" size={16} color="#fbbf24" />
              <Text className="text-slate-900 text-base font-bold leading-normal">{(service.provider.rating || 0).toFixed(1)}</Text>
            </View>
            <Text className="text-slate-500 text-xs mt-1">{service.provider.reviewCount} reviews</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-4 py-6 gap-3">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-xl bg-primary/10">
            <MaterialIcons name="chat-bubble-outline" size={20} color="#1754cf" />
            <Text className="text-primary font-bold">Message</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-xl bg-primary/10">
            <MaterialIcons name="call" size={20} color="#1754cf" />
            <Text className="text-primary font-bold">Call</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Section */}
        <View className="px-4 pb-8">
          <Text className="text-slate-900 text-xl font-bold mb-4">Book Your Service</Text>
          
          {/* Selection Tabs */}
          <View className="flex-row p-1 bg-slate-200 rounded-xl mb-6">
            <TouchableOpacity className="flex-1 py-2 rounded-lg bg-white items-center shadow-sm">
              <Text className="text-primary text-sm font-bold">One-time</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-2 rounded-lg items-center justify-center">
              <Text className="text-slate-500 text-sm font-medium">Recurring</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Options */}
          <View className="space-y-4 mb-4">
            <View className="mb-6">
              <Text className="text-slate-900 text-sm font-bold mb-3">Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {DATES.map((d) => {
                  const isSelected = selectedDate === d.date;
                  return (
                    <TouchableOpacity 
                      key={d.date}
                      onPress={() => setSelectedDate(d.date)}
                      className={`flex-col items-center justify-center min-w-[64px] py-3 rounded-xl border-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-slate-50'}`}
                    >
                      <Text className={`text-xs font-medium uppercase ${isSelected ? 'text-primary' : 'text-slate-500'}`}>{d.day}</Text>
                      <Text className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-slate-500'}`}>{d.date}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-slate-900 text-sm font-bold">Select Time Slot</Text>
                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <Text className="text-[10px] font-medium text-slate-500 uppercase">Available</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <Text className="text-[10px] font-medium text-slate-500 uppercase">Booked</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {TIME_SLOTS.map((t) => {
                  const isSelected = selectedTime === t;
                  const isBooked = bookedSlots.includes(t);
                  return (
                    <TouchableOpacity 
                      key={t} 
                      disabled={isBooked}
                      onPress={() => setSelectedTime(t)}
                      className={`py-3 px-4 border-2 rounded-xl items-center justify-center w-[48%] bg-slate-50
                        ${isSelected && !isBooked ? 'border-primary bg-primary/5' : 'border-transparent'}
                        ${isBooked ? 'opacity-50 line-through' : 'shadow-sm'}
                      `}
                    >
                      <Text className={`text-xs font-bold text-center
                        ${isSelected && !isBooked ? 'text-primary' : (isBooked ? 'text-slate-400' : 'text-slate-700')}
                      `}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-600">Service Fee</Text>
              <Text className="text-slate-900 font-medium">${serviceFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-600">Taxes & Fees</Text>
              <Text className="text-slate-900 font-medium">${taxesAndFees.toFixed(2)}</Text>
            </View>
            <View className="h-px bg-primary/10 my-3" />
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-900 font-bold">Total Price</Text>
              <Text className="text-primary text-2xl font-black">${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="p-4 bg-white border-t border-primary/10">
        <TouchableOpacity 
          className="w-full bg-primary h-14 rounded-xl flex items-center justify-center shadow-md shadow-primary/30"
          onPress={() => router.push({ 
            pathname: '/payment', 
            params: { 
              id: service.id, 
              date: selectedDate, 
              time: selectedTime, 
              totalPrice: totalPrice 
            } 
          })}
        >
          <Text className="text-white font-bold text-lg">Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </>
  );
}
