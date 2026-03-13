import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useState, useEffect } from 'react';

import { API_URL } from '../../constants/Api';

type Profile = {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  isProvider: boolean;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/profile`)
      .then(r => r.json())
      .then(res => setProfile(res.data))
      .catch(console.error);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center border-b border-slate-100 p-4 justify-between bg-white z-10 w-full">
        <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100">
          <MaterialIcons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold tracking-tight text-slate-900">Profile</Text>
        <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100">
          <MaterialIcons name="settings" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 w-full bg-white">
        <View className="flex-col items-center py-8 px-4 bg-slate-50 w-full">
          {profile ? (
            <>
              <View className="relative">
                <Image source={{ uri: profile.avatarUrl }} className="w-28 h-28 rounded-full border-4 border-white shadow-sm bg-cover bg-center" />
                <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white shadow-sm z-10">
                  <MaterialIcons name="edit" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <Text className="mt-4 text-xl font-bold text-slate-900">{profile.name}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialIcons name="location-pin" size={16} color="#64748b" />
                <Text className="text-sm font-medium text-slate-500">{profile.location}</Text>
              </View>
            </>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-slate-500">Loading profile...</Text>
            </View>
          )}
        </View>

        <View className="px-4 py-8 w-full">
          <TouchableOpacity className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex-row items-center justify-between mb-8 shadow-sm">
            <View className="flex-col">
              <Text className="text-primary font-bold text-base">Switch to Provider Mode</Text>
              <Text className="text-sm text-primary/80 mt-1">Start earning by offering services</Text>
            </View>
            <MaterialIcons name="storefront" size={28} color="#1754cf" />
          </TouchableOpacity>

          <View className="flex-col w-full gap-2">
            <Text className="font-bold text-slate-900 text-lg mb-2">Account Options</Text>
            <ProfileOption icon="calendar-today" title="My Bookings" subtitle="View and manage your service orders" />
            <ProfileOption icon="payments" title="Payment Methods" subtitle="Manage cards and digital wallets" />
            <ProfileOption icon="map" title="Addresses" subtitle="Manage your saved locations" />
            <ProfileOption icon="help-center" title="Help & Support" subtitle="FAQ, contact us, and support tickets" />
            
            <TouchableOpacity className="flex-row items-center gap-4 py-4 px-4 mt-4 bg-slate-50 border border-slate-100 rounded-2xl w-full">
              <View className="w-12 h-12 rounded-xl bg-red-100 items-center justify-center">
                <MaterialIcons name="logout" size={24} color="#dc2626" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-base text-red-600">Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileOption({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) {
  return (
    <TouchableOpacity className="flex-row items-center gap-4 py-3 px-2 rounded-xl w-full">
      <View className="w-12 h-12 rounded-xl bg-slate-100 items-center justify-center shrink-0 border border-slate-200">
        {/* @ts-ignore */}
        <MaterialIcons name={icon} size={24} color="#334155" />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-base text-slate-900 leading-tight mb-1">{title}</Text>
        <Text className="text-sm font-medium text-slate-500">{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
    </TouchableOpacity>
  );
}
