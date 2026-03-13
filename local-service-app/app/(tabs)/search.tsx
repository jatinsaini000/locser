import React from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useState, useEffect } from 'react';
import { type Category as CategoryType, type Service } from '../../data/mockData';

import { API_URL } from '../../constants/Api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [results, setResults] = useState<Service[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(r => r.json())
      .then(res => setCategories(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url = query 
      ? `${API_URL}/services?query=${encodeURIComponent(query)}`
      : `${API_URL}/services`;
      
    const delayDebounceFn = setTimeout(() => {
      fetch(url)
        .then(r => r.json())
        .then(res => setResults(res.data || []))
        .catch(console.error);
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <StatusBar barStyle="dark-content" />
      {/* Header & Search Bar */}
      <View className="p-4 bg-white z-10">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <MaterialIcons name="arrow-back" size={24} color="#475569" />
            </TouchableOpacity>
            <Text className="text-xl font-bold tracking-tight text-slate-900">Find Services</Text>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="tune" size={24} color="#1754cf" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-slate-200 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={24} color="#94a3b8" className="mr-3" />
          <TextInput 
            className="flex-1 text-base text-slate-900" 
            placeholder="Plumbing, cleaning, AC repair..." 
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 bg-white">
        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2 flex-row gap-2">
          <TouchableOpacity className="flex-row items-center gap-1 bg-primary px-4 py-2 rounded-full h-9 justify-center mr-2">
            <Text className="text-white text-sm font-medium">Price: Any</Text>
            <MaterialIcons name="expand-more" size={16} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1 bg-slate-200 px-4 py-2 rounded-full h-9 justify-center mr-2">
            <Text className="text-slate-700 text-sm font-medium">Rating: 4.5+</Text>
            <MaterialIcons name="expand-more" size={16} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1 bg-slate-200 px-4 py-2 rounded-full h-9 justify-center mr-2">
            <Text className="text-slate-700 text-sm font-medium">Distance</Text>
            <MaterialIcons name="expand-more" size={16} color="#334155" />
          </TouchableOpacity>
        </ScrollView>

        {/* ... rest of the file ... */}
        {/* Recent Searches */}
        <View className="mt-6 px-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-slate-900">Recent Searches</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-medium">Clear All</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-col">
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="history" size={24} color="#94a3b8" />
                <Text className="text-slate-600">Emergency Plumber</Text>
              </View>
              <MaterialIcons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-3 border-t border-slate-100">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="history" size={24} color="#94a3b8" />
                <Text className="text-slate-600">House Cleaning</Text>
              </View>
              <MaterialIcons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Categories */}
        {!query && (
          <View className="mt-8 px-4">
            <Text className="text-base font-bold text-slate-900 mb-4">Trending Categories</Text>
            <View className="flex-row flex-wrap gap-x-4 gap-y-4">
              {categories.slice(0, 8).map(c => (
                <Category key={c.id} name={c.icon} label={c.name} />
              ))}
            </View>
          </View>
        )}

        {/* Search Results / Recommended */}
        <View className="mt-8 px-4 mb-8">
          <Text className="text-base font-bold text-slate-900 mb-4">
            {query ? 'Search Results' : 'Recommended for You'}
          </Text>
          <View className="flex-col gap-6">
            {results.map(service => (
              <RecommendationCard 
                key={service.id}
                title={service.title} 
                rating={service.provider.rating.toString()} 
                reviews={service.provider.reviewCount.toString()} 
                price={`$${service.price}`} 
                image={service.imageUrl}
              />
            ))}
            {results.length === 0 && (
              <Text className="text-slate-500 text-center py-8">No services found.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Category({ name, label }: { name: string, label: string }) {
  return (
    <TouchableOpacity className="flex-col items-center gap-2 w-[22%]">
      <View className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        {/* @ts-ignore */}
        <MaterialIcons name={name} size={24} color="#1754cf" />
      </View>
      <Text className="text-xs font-medium text-slate-900 text-center">{label}</Text>
    </TouchableOpacity>
  );
}

function RecommendationCard({ title, rating, reviews, price, image }: { title: string, rating: string, reviews: string, price: string, image: string }) {
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-4 flex-row gap-4 w-full">
      <Image source={{ uri: image }} className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0" />
      <View className="flex-col justify-between py-1 flex-1">
        <View>
          <Text className="font-bold text-base text-slate-900 leading-tight">{title}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MaterialIcons name="star" size={14} color="#eab308" />
            <Text className="text-xs font-bold text-slate-900">{rating} <Text className="font-normal text-slate-500">({reviews} reviews)</Text></Text>
          </View>
        </View>
        <View className="flex-row justify-between items-end mt-2">
          <Text className="text-primary font-bold text-lg">From {price}</Text>
          <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
            <Text className="text-white text-sm font-bold">Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
