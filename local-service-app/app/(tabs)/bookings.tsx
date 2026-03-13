import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { API_URL } from '../../constants/Api';

type Booking = {
  id: number;
  serviceId: string;
  userId: string;
  bookingDate: string;
  timeSlot: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  title: string;
  providerName: string;
  imageUrl: string;
};

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookings(data.data);
        }
      })
      .catch(err => console.error("Error fetching bookings:", err));
  }, []);

  const renderBookingCard = (b: Booking) => {
    let statusClass = "bg-green-100 text-green-700";
    if (b.status === 'PENDING') statusClass = "bg-amber-100 text-amber-700";
    if (b.status === 'IN_PROGRESS') statusClass = "bg-blue-100 text-blue-700";

    return (
      <View key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
        <TouchableOpacity className="p-4" onPress={() => router.push(`/booking/${b.id}`)}>
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row gap-3 flex-1">
              <Image source={{ uri: b.imageUrl }} className="w-12 h-12 rounded-lg bg-slate-200" />
              <View className="flex-1">
                <Text className="font-bold text-slate-900" numberOfLines={1}>{b.title}</Text>
                <Text className="text-sm text-slate-500">by {b.providerName}</Text>
              </View>
            </View>
            <View className={`px-2.5 py-1 rounded-full ${statusClass}`}>
              <Text className="text-xs font-bold" style={{ color: statusClass.replace(/bg-.* text-(.*)/, '$1') }}>
                {b.status}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-4 py-3 border-y border-slate-100 mb-4">
            <View className="flex-row items-center gap-2 flex-1">
              <MaterialIcons name="calendar-today" color="#1754cf" size={16} />
              <Text className="text-sm text-slate-600">{b.bookingDate}</Text>
            </View>
            <View className="flex-row items-center gap-2 flex-1">
              <MaterialIcons name="schedule" color="#1754cf" size={16} />
              <Text className="text-sm text-slate-600">{b.timeSlot}</Text>
            </View>
          </View>
          
          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-primary rounded-lg">
              <MaterialIcons name="chat-bubble-outline" size={14} color="white" />
              <Text className="text-white text-sm font-semibold">Message</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg">
              <Text className="text-slate-600 text-sm font-semibold">Reschedule</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Upcoming') return b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS';
    if (activeTab === 'Completed') return b.status === 'COMPLETED';
    if (activeTab === 'Cancelled') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pt-12">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="bg-white border-b border-slate-200">
        <View className="flex-row items-center px-4 py-3 justify-center">
          <Text className="text-lg font-bold text-slate-900">My Bookings</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row border-t border-slate-100">
          {['Upcoming', 'Completed', 'Cancelled'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              className={`flex-1 py-3 items-center border-b-2 ${activeTab === tab ? 'border-primary' : 'border-transparent'}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-sm font-bold ${activeTab === tab ? 'text-primary' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {filteredBookings.length === 0 ? (
          <Text className="text-slate-500 text-center mt-10">No {activeTab.toLowerCase()} bookings found.</Text>
        ) : (
          filteredBookings.map(renderBookingCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
