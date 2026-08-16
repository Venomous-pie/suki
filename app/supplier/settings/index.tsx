import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, RefreshControl } from 'react-native';
import { Tabs, router } from 'expo-router';
import { LogOut, ChevronRight, Store, Clock, CreditCard, Phone, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);
  
  const [minOrder, setMinOrder] = useState('1000');
  const [codEnabled, setCodEnabled] = useState(true);
  const [gcashEnabled, setGcashEnabled] = useState(true);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Tabs.Screen 
        options={{
          headerTitle: 'Settings',
        }} 
      />

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Business Profile</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Store size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Supplier Information</Text>
          </View>
          <ChevronRight size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Clock size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Batch & Delivery Schedules</Text>
          </View>
          <ChevronRight size={20} color={colors.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.menuLeft}>
            <Phone size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Contact & Support Info</Text>
          </View>
          <ChevronRight size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Order Configuration</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        
        <View style={styles.configItem}>
          <Text style={[styles.configLabel, { color: colors.text }]}>Minimum Order Value (₱)</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            value={minOrder}
            onChangeText={setMinOrder}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <CreditCard size={20} color={colors.icon} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.switchTitle, { color: colors.text }]}>Cash on Delivery</Text>
              <Text style={[styles.switchSub, { color: colors.icon }]}>Accept cash upon delivery</Text>
            </View>
          </View>
          <Switch
            value={codEnabled}
            onValueChange={setCodEnabled}
            trackColor={{ false: '#D1D5DB', true: colors.secondary + '80' }}
            thumbColor={codEnabled ? colors.secondary : '#f4f3f4'}
          />
        </View>

        <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
          <View style={styles.switchLeft}>
            <CreditCard size={20} color={colors.icon} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.switchTitle, { color: colors.text }]}>GCash</Text>
              <Text style={[styles.switchSub, { color: colors.icon }]}>Accept GCash transfers</Text>
            </View>
          </View>
          <Switch
            value={gcashEnabled}
            onValueChange={setGcashEnabled}
            trackColor={{ false: '#D1D5DB', true: colors.secondary + '80' }}
            thumbColor={gcashEnabled ? colors.secondary : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { borderColor: colors.border, backgroundColor: colors.surface }]} 
        onPress={logout}
      >
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
  },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingRight: 16,
    marginLeft: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '400',
  },
  configItem: {
    paddingVertical: 16,
    paddingRight: 16,
    marginLeft: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 16,
    marginLeft: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  switchSub: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
