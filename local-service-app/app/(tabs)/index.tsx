import React from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type Category, type Service } from '../../data/mockData';
import { useState, useEffect } from 'react';

import { API_URL } from '../../constants/Api';

export default function DiscoveryFeedScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/categories`).then(r => r.json()),
      fetch(`${API_URL}/services`).then(r => r.json())
    ]).then(([catRes, servRes]) => {
      setCategories(catRes.data);
      setServices(servRes.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View className="px-4 py-3 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="explore" size={32} color="#1754cf" />
            <Text className="text-xl font-bold tracking-tight text-slate-900">Discover</Text>
          </View>
          <TouchableOpacity className="relative p-2 rounded-full hover:bg-slate-200 transition-colors">
            <MaterialIcons name="notifications" size={24} color="#64748b" />
            <View className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary"></View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="relative flex-row items-center w-full">
          <MaterialIcons name="search" size={24} color="#94a3b8" className="absolute left-4 z-10" />
          <TextInput 
            className="flex-1 bg-slate-200 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900"
            placeholder="Search for plumbing, cleaning..."
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      <ScrollView className="flex-1 pb-24" showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View className="py-6">
          <View className="flex-row items-center justify-between px-4 mb-4">
            <Text className="text-lg font-bold text-slate-900">Categories</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4" contentContainerStyle={{ gap: 16 }}>
            {categories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* Featured Services */}
        <View className="px-4 py-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-900">Featured Services</Text>
            <MaterialIcons name="tune" size={24} color="#94a3b8" />
          </View>

          {/* Service Feed */}
          <View className="flex-col gap-6">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })} 
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryItem({ category }: { category: Category }) {
  return (
    <TouchableOpacity className="flex-col items-center gap-2">
      <View className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        {/* @ts-ignore Ignore dynamic icon name type */}
        <MaterialIcons name={category.icon} size={32} color="#1754cf" />
      </View>
      <Text className="text-xs font-medium text-slate-900">{category.name}</Text>
    </TouchableOpacity>
  );
}

function ServiceCard({ service, onPress }: { service: Service, onPress: () => void }) {
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View className="relative h-48 w-full">
          <Image source={{ uri: service.imageUrl }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute top-3 right-3 bg-white/90 py-1 px-2 rounded-lg flex-row items-center gap-1 shadow-sm">
            <MaterialIcons name="star" size={14} color="#eab308" />
            <Text className="text-xs font-bold text-slate-900">{service.provider.rating.toFixed(1)}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View className="p-4">
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-4">
              <Text className="font-bold text-lg leading-tight text-slate-900" numberOfLines={1}>{service.title}</Text>
              <Text className="text-slate-500 text-sm">{service.subtitle}</Text>
            </View>
            <View className="items-end">
              <Text className="text-primary font-bold text-lg">${service.price}</Text>
              <Text className="text-slate-400 text-xs">/ hour</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <TouchableOpacity 
            className="flex-1 bg-primary py-3 rounded-lg flex-row justify-center items-center"
            onPress={onPress}
          >
            <Text className="text-white font-bold">Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-lg">
            <MaterialIcons name="favorite-border" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
