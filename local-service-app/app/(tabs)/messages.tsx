import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useState, useEffect } from 'react';

import { API_URL } from '../../constants/Api';

type Message = {
  id: string;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
};

export default function MessagesScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/messages`)
      .then(r => r.json())
      .then(res => setMessages(res?.data || []))
      .catch(err => {
        console.error(err);
        setMessages([]);
      });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-slate-100 z-10">
        <View className="flex-row items-center gap-3">
          <Text className="text-xl font-bold tracking-tight text-slate-900">Messages</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity className="relative p-2 rounded-full hover:bg-slate-200 transition-colors">
            <MaterialIcons name="search" size={24} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="relative p-2 rounded-full hover:bg-slate-200 transition-colors">
            <MaterialIcons name="more-vert" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <View className="flex-row px-4 gap-6 bg-white pt-2">
        <TouchableOpacity className="pb-3 border-b-2 border-primary">
          <Text className="text-primary font-bold text-sm">All Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity className="pb-3 border-b-2 border-transparent">
          <Text className="text-slate-500 font-medium text-sm">Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity className="pb-3 border-b-2 border-transparent">
          <Text className="text-slate-500 font-medium text-sm">Archived</Text>
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <ScrollView className="flex-1 bg-white pt-2">
        {messages.map((msg) => (
          <TouchableOpacity 
            key={msg.id}
            onPress={() => router.push(`/chat/${msg.id}`)}
            className={`flex-row items-center gap-4 p-4 border-b border-slate-100 w-full ${msg.unreadCount > 0 ? 'bg-slate-50' : 'bg-white'}`}
          >
            <View className="relative shrink-0">
              <Image source={{ uri: msg.senderAvatar }} className={`w-14 h-14 rounded-full ${msg.unreadCount === 0 ? 'opacity-80' : ''}`} />
              {msg.isOnline && (
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </View>
            <View className="flex-1 min-w-0 pr-2">
              <View className="flex-row justify-between items-baseline mb-0.5">
                <Text className="font-bold text-slate-900" numberOfLines={1}>{msg.senderName}</Text>
                <Text className={`text-xs ${msg.unreadCount > 0 ? 'font-bold text-primary' : 'text-slate-500 font-medium'}`}>{msg.timestamp}</Text>
              </View>
              <View className="flex-row justify-between items-center pr-2">
                <Text className={`text-sm ${msg.unreadCount > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`} numberOfLines={1}>{msg.lastMessage}</Text>
                {msg.unreadCount > 0 && (
                  <View className="ml-2 w-5 h-5 bg-primary items-center justify-center rounded-full">
                    <Text className="text-white text-[10px] font-bold">{msg.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-2xl shadow-sm items-center justify-center z-10 border border-slate-100">
        <MaterialIcons name="edit" size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

