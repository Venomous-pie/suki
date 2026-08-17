import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Bell, Package, AlertTriangle, ArrowRight, Truck } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupplierDashboardScreen() {
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Tabs.Screen 
        options={{
          headerTitle: 'Dashboard',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerRight}
              onPress={() => router.push('/supplier/notifications')}
            >
              <Bell size={24} color="#fff" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          )
        }} 
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
      
      {/* Active Batch Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Batch #24</Text>
            <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Closes in 3h 20m</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.secondary + '20' }]}>
            <Text style={[styles.statusText, { color: colors.secondary }]}>OPEN</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text }]}>₱4,250</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Total Value</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/supplier/batches')}
        >
          <Text style={styles.primaryButtonText}>View Batch</Text>
          <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* Alerts Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Inventory Alerts</Text>
          <AlertTriangle size={20} color="#F59E0B" />
        </View>
        
        <View style={styles.alertItem}>
          <View style={styles.alertIconBg}>
            <Package size={16} color="#F59E0B" />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={[styles.alertTitle, { color: colors.text }]}>Low Stock: Jasmine Rice 25kg</Text>
            <Text style={[styles.alertSubtitle, { color: colors.icon }]}>Only 3 sacks remaining</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/supplier/products')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    marginRight: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#0A192F', // matches primary
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // light mode hardcode for now, can be themed if needed
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  alertIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
