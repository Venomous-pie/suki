import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Home, Package, Tag, Settings, Truck, Logs, Upload, Filter } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

export default function SupplierLayout() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Truck size={20} color={colors.primary} />
            </View>
          </View>
        )
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} style={{ marginBottom: -3 }} />,
          headerTitle: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="batches"
        options={{
          title: 'Batches',
          tabBarIcon: ({ color }) => <Package size={24} color={color} style={{ marginBottom: -3 }} />,
          headerShown: true,
          headerTitle: 'Batches',
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Filter size={24} color="#fff" />
            </TouchableOpacity>
          )
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Tag size={24} color={color} style={{ marginBottom: -3 }} />,
          headerShown: true,
          headerTitle: 'Products',
          headerRight: () => (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <Upload size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '600' }}>CSV</Text>
            </TouchableOpacity>
          )
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} style={{ marginBottom: -3 }} />,
          headerTitle: 'Settings',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
          headerShown: true,
          headerTitle: 'Notifications'
        }}
      />
    </Tabs>
  );
}
