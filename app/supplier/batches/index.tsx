import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, router, useNavigation, useFocusEffect } from 'expo-router';
import { Filter, Calendar, MapPin, Package, ChevronRight, Truck, Logs } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BATCHES = [
  { id: '24', route: 'Poblacion Route', cutoff: 'Today, 5:00 PM', delivery: 'Tomorrow', orders: 12, value: '₱4,250', status: 'open' },
  { id: '23', route: 'San Jose Route', cutoff: 'Yesterday, 5:00 PM', delivery: 'Today', orders: 18, value: '₱6,100', status: 'closed' },
  { id: '22', route: 'Poblacion Route', cutoff: 'Oct 12, 5:00 PM', delivery: 'Oct 13', orders: 15, value: '₱5,320', status: 'delivered' },
];

export default function BatchesScreen() {
  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'delivered'>('open');
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        headerTitle: 'Batches',
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Truck size={20} color={colors.primary} />
            </View>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Filter size={24} color="#fff" />
          </TouchableOpacity>
        )
      });
    }, [navigation, colors])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredBatches = BATCHES.filter(b => b.status === activeTab);

  const renderItem = ({ item }: { item: typeof BATCHES[0] }) => (
    <TouchableOpacity 
      style={[styles.listItem, { borderBottomColor: colors.border }]}
      onPress={() => router.push(`/supplier/batches/${item.id}`)}
    >
      <View style={styles.listContentLeft}>
        <View style={styles.headerRow}>
          <Text style={[styles.batchId, { color: colors.text }]}>Batch #{item.id}</Text>
          <View style={[styles.statusBadge, 
            item.status === 'open' ? { backgroundColor: colors.secondary + '20' } :
            item.status === 'closed' ? { backgroundColor: '#F3F4F6' } :
            { backgroundColor: '#DEF7EC' }
          ]}>
            <Text style={[styles.statusText, 
              item.status === 'open' ? { color: colors.secondary } :
              item.status === 'closed' ? { color: '#4B5563' } :
              { color: '#046C4E' }
            ]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <MapPin size={14} color={colors.icon} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.icon }]}>{item.route}</Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={14} color={colors.icon} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.icon }]}>Cutoff: {item.cutoff}</Text>
            </View>
          </View>
          
          <View style={styles.statsCol}>
            <Text style={[styles.valueText, { color: colors.primary }]}>{item.value}</Text>
            <View style={styles.infoRow}>
              <Package size={14} color={colors.icon} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.icon }]}>{item.orders} Orders</Text>
            </View>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Custom Segmented Control */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['open', 'closed', 'delivered'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.icon, fontWeight: activeTab === tab ? '600' : '500' }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBatches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
  },
  listContentLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchId: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoCol: {
    flex: 1,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  }
});
