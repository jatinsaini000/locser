import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { API_URL } from '../../constants/Api';

type MessageType = {
  id: string;
  text: string;
  isSender: boolean;
  time: string;
  type?: 'text' | 'service';
  serviceData?: {
    id: string;
    title: string;
    price: number;
    duration: string;
  }
};

const DUMMY_CHAT_MESSAGES: MessageType[] = [
  { id: '1', text: 'Hello! Thank you for reaching out. How can I help you with your home project today?', isSender: false, time: '09:41 AM' },
  { id: '2', text: 'Hi Alex! I\'d like to check your availability for a consultation this weekend. Do you have any slots on Saturday?', isSender: true, time: '09:43 AM' },
  { id: '3', text: 'I have a few slots available on Saturday morning. I can do 10:00 AM or 11:30 AM. Does either of those work for you?', isSender: false, time: '09:45 AM' },
  { id: '4', text: '', isSender: false, time: '09:46 AM', type: 'service', serviceData: { id: 's1', title: 'Interior Consultation', price: 75.00, duration: '60 mins' } },
  { id: '5', text: '11:30 AM works perfectly for me. Let\'s lock that in!', isSender: true, time: '09:48 AM' },
];

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [provider, setProvider] = useState<any>(null);
  const [messages, setMessages] = useState<MessageType[]>(DUMMY_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch provider details from the backend using the conversation/message ID
  useEffect(() => {
    fetch(`${API_URL}/messages/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setProvider({
            name: res.data.senderName,
            title: 'Service Provider',
            avatarUrl: res.data.senderAvatar,
            isOnline: res.data.isOnline,
          });
        }
      })
      .catch(() => {
        // Fallback: use safe defaults if fetch fails
        setProvider({
          name: 'Service Provider',
          title: 'Local Expert',
          avatarUrl: null,
          isOnline: false,
        });
      });
  }, [id]);

  // Auto-scroll to bottom when a new message is added
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMsg: MessageType = {
        id: Date.now().toString(),
        text: inputText,
        isSender: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMsg]);
      setInputText('');
    }
  };

  if (!provider) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-slate-50 pt-12">
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View className="flex-row items-center bg-white p-4 border-b border-slate-200 justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            
            <View className="relative">
              <Image 
                source={{ uri: provider.avatarUrl }} 
                className="w-10 h-10 rounded-full bg-slate-200 border border-slate-100" 
              />
              {provider.isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </View>
            
            <View className="flex-col">
              <Text className="text-slate-900 text-base font-bold leading-tight">{provider.name}</Text>
              <Text className="text-primary text-xs font-medium">{provider.title}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => router.push(`/service/s1`)}
          >
            <Text className="text-white text-sm font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0} // Adjust if needed
        >
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4 py-6"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center mb-6">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-200 rounded-full">
                Today
              </Text>
            </View>

            <View className="space-y-6">
              {messages.map((msg) => {
                if (msg.type === 'service') {
                  return (
                    <View key={msg.id} className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex-col gap-3 my-2">
                      <View className="flex-row items-center gap-2">
                        <MaterialIcons name="event-available" size={20} color="#1754cf" />
                        <Text className="text-sm font-semibold text-slate-900">Suggested Service</Text>
                      </View>
                      <View className="bg-white p-3 rounded-lg border border-slate-200 flex-row items-center justify-between shadow-sm">
                        <View>
                          <Text className="text-sm font-bold text-slate-900">{msg.serviceData?.title}</Text>
                          <Text className="text-xs text-slate-500">{msg.serviceData?.duration} • ${msg.serviceData?.price.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity 
                          className="bg-primary px-3 py-1.5 rounded-lg"
                          onPress={() => router.push(`/service/${msg.serviceData?.id}`)}  
                        >
                          <Text className="text-white text-xs font-bold">Select</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={msg.id} className={`flex-row items-end gap-2 max-w-[85%] ${msg.isSender ? 'self-end' : 'self-start'}`}>
                    {!msg.isSender && (
                      <Image source={{ uri: provider.avatarUrl }} className="w-8 h-8 rounded-full mb-1 bg-slate-200 shrink-0" />
                    )}
                    <View className={`flex-col gap-1 ${msg.isSender ? 'items-end' : 'items-start'}`}>
                      <View className={`p-3 rounded-2xl shadow-sm ${msg.isSender ? 'bg-primary rounded-br-none' : 'bg-white border border-slate-100 rounded-bl-none'}`}>
                        <Text className={`text-sm leading-relaxed ${msg.isSender ? 'text-white' : 'text-slate-900'}`}>{msg.text}</Text>
                      </View>
                      <View className={`flex-row items-center gap-1 ${!msg.isSender ? 'ml-1' : 'mr-1'}`}>
                        <Text className="text-[10px] text-slate-400">{msg.time}</Text>
                        {msg.isSender && <MaterialIcons name="done-all" size={14} color="#1754cf" />}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Input Area */}
          <View className="p-4 bg-white border-t border-slate-200 flex-row items-center gap-3">
            <TouchableOpacity className="p-1">
              <MaterialIcons name="add-circle-outline" size={26} color="#94a3b8" />
            </TouchableOpacity>
            
            <View className="flex-1 relative justify-center">
              <TextInput 
                className="w-full bg-slate-100 rounded-full px-4 pr-10 py-3 text-sm text-slate-900 h-11"
                placeholder="Type a message..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity className="absolute right-3">
                <MaterialIcons name="sentiment-satisfied" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="w-11 h-11 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/30"
              onPress={sendMessage}
            >
              <MaterialIcons name="send" size={20} color="white" className="ml-1" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
