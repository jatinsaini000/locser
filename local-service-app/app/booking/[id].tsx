import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { API_URL } from '../../constants/Api';

type Booking = {
  id: number;
  serviceId: string;
  userId?: string;
  bookingDate: string;
  timeSlot: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  title: string;
  providerName: string;
  imageUrl: string;
  price: number;
};

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/bookings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBooking(data.data);
        }
      })
      .catch(err => console.error("Error fetching single booking:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1754cf" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-xl font-bold">Booking Not Found</Text>
      </View>
    );
  }

  // Formatting variables matching UI 
  const serviceFeeString = (booking.price || 85.00).toFixed(2);
  const extraFees = (booking.totalPrice - (booking.price || 0));
  const taxesString = extraFees > 0 ? extraFees.toFixed(2) : '0.00';

  const handleCancelBooking = () => {
    Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          if (!booking.userId) {
            Alert.alert('Error', 'Unable to verify this booking. Please open your account on the web app to cancel.');
            return;
          }
          try {
            const res = await fetch(`${API_URL}/bookings/${booking.id}/cancel`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: booking.userId }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
              setBooking({ ...booking, status: 'CANCELLED' });
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
            } else {
              Alert.alert(
                'Could not cancel',
                typeof data.error === 'string' ? data.error : 'Please try again later.'
              );
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An error occurred while cancelling.');
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white pt-12">
        <StatusBar barStyle="dark-content" />

        {/* Header Nav */}
        <View className="flex-row items-center p-4 justify-between border-b border-slate-100">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold flex-1 text-center pr-10">
            Booking Details
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Status Message */}
          <View className="flex-row items-center gap-4 bg-primary/10 px-4 py-5 m-4 rounded-xl">
            <View className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm">
              <MaterialIcons name="check-circle" size={32} color="#1754cf" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-slate-900 text-base font-bold leading-tight flex-wrap">
                Your booking is {booking.status.toLowerCase()}
              </Text>
              <Text className="text-slate-600 text-sm font-normal mt-1">
                Confirmation #BK-{booking.id.toString().padStart(5, '0')} sent to email
              </Text>
            </View>
          </View>

          {/* Service Summary Card */}
          <View className="px-4 mb-6">
            <View className="flex-col gap-4 rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
              <View className="flex-row gap-4">
                <Image 
                  source={{ uri: booking.imageUrl }}
                  className="w-24 h-24 rounded-lg bg-slate-200"
                />
                <View className="flex-1 justify-between py-1">
                  <View>
                    <Text className="text-slate-900 text-lg font-bold leading-tight" numberOfLines={2}>
                      {booking.title}
                    </Text>
                    <Text className="text-slate-500 text-sm font-medium mt-1">
                      {booking.providerName}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="person" size={16} color="#1754cf" />
                    <Text className="text-slate-600 text-sm font-medium">Verified Provider</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity className="w-full py-3 bg-primary/10 rounded-lg flex items-center justify-center">
                <Text className="text-primary font-semibold text-sm">View Provider Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Appointment Details */}
          <View className="px-4 mb-6">
            <Text className="text-slate-900 text-lg font-bold mb-3 px-1">Appointment Details</Text>
            <View className="bg-white rounded-xl border border-slate-200">
              
              <View className="p-4 flex-row items-start gap-4 border-b border-slate-100">
                <MaterialIcons name="calendar-today" size={24} color="#1754cf" />
                <View>
                  <Text className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-0.5">Date</Text>
                  <Text className="text-slate-900 font-medium">{booking.bookingDate}</Text>
                </View>
              </View>

              <View className="p-4 flex-row items-start gap-4 border-b border-slate-100">
                <MaterialIcons name="schedule" size={24} color="#1754cf" />
                <View>
                  <Text className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-0.5">Time</Text>
                  <Text className="text-slate-900 font-medium">{booking.timeSlot}</Text>
                </View>
              </View>

              <View className="p-4 flex-row items-start gap-4">
                <MaterialIcons name="location-pin" size={24} color="#1754cf" />
                <View className="flex-1">
                  <Text className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-0.5">Address</Text>
                  <Text className="text-slate-900 font-medium leading-snug">
                    123 Marketplace Avenue, Suite 100{'\n'}Local City, ST 12345
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden ml-2">
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop' }}
                    className="w-full h-full"
                  />
                </View>
              </View>

            </View>
          </View>

          {/* Price Breakdown */}
          <View className="px-4 mb-8">
            <Text className="text-slate-900 text-lg font-bold mb-3 px-1">Price Summary</Text>
            <View className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600">{booking.title}</Text>
                <Text className="text-slate-900">${serviceFeeString}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-slate-600">Taxes & Fees</Text>
                <Text className="text-slate-900">${taxesString}</Text>
              </View>
              <View className="border-t border-slate-200 pt-3 flex-row justify-between">
                <Text className="text-slate-900 font-bold">Total Amount</Text>
                <Text className="text-primary font-bold text-xl">${booking.totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-4 pb-12 space-y-3">
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' ? (
              <>
                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl mb-3">
                    <MaterialIcons name="event" size={18} color="#0f172a" />
                    <Text className="text-slate-900 font-semibold">Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl mb-3">
                    <MaterialIcons name="chat" size={18} color="#0f172a" />
                    <Text className="text-slate-900 font-semibold">Contact</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  className="w-full flex-row items-center justify-center gap-2 py-3 rounded-xl bg-red-50 border border-red-100"
                  onPress={handleCancelBooking}
                >
                  <MaterialIcons name="cancel" size={18} color="#ef4444" />
                  <Text className="text-red-600 font-medium">Cancel Booking</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {booking.status === 'CANCELLED' && (
              <View className="w-full flex-row items-center justify-center gap-2 py-4 rounded-xl bg-slate-50 border border-slate-200 mt-2">
                <Text className="text-slate-500 font-medium">This booking is cancelled.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
