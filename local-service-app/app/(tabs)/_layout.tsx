import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1754cf', // primary
        tabBarInactiveTintColor: '#94a3b8', // slate-400
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0', // slate-200
          paddingBottom: 24,
          paddingTop: 12,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="calendar-month" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <View>
              <MaterialIcons size={24} name="chat-bubble" color={color} />
              {/* Notification dot */}
              <View className="absolute -top-1 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
