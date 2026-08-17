import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Tabs, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Package, AlertTriangle, ArrowRight, Truck, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useBatchStore, getActiveOrderCount, getBatchTotal } from '@/store/batchStore';
import { useProductStore } from '@/store/productStore';

export default function SupplierDashboardScreen() {
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = React.useState(false);
  const user = useAuthStore((s) => s.user);
  const { batches, loadBatches } = useBatchStore();
  const { products, loadProducts } = useProductStore();

  useEffect(() => {
    if (user?.id) {
      loadBatches(user.id);
      loadProducts(user.id);
    }
  }, [user?.id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await Promise.all([loadBatches(user.id), loadProducts(user.id)]);
    }
    setRefreshing(false);
  }, [user?.id]);

  // Active batch = first open batch
  const activeBatch = batches.find(b => b.status === 'open') ?? null;
  const activeBatchOrderCount = activeBatch ? getActiveOrderCount(activeBatch) : 0;
  const activeBatchTotal = activeBatch ? getBatchTotal(activeBatch) : '₱0';

  // Low stock = products with stock < 5
  const LOW_STOCK_THRESHOLD = 5;
  const lowStockProducts = products.filter(p => typeof p.stock === 'number' && p.stock < LOW_STOCK_THRESHOLD && p.stock >= 0);

  // Batch stats
  const openCount = batches.filter(b => b.status === 'open').length;
  const closedCount = batches.filter(b => b.status === 'closed').length;
  const deliveredCount = batches.filter(b => b.status === 'delivered').length;

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Tabs.Screen
        options={{
          headerTitle: user?.name || 'Dashboard',
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

      {/* Batch Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{openCount}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Open</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#4B5563' }]}>{closedCount}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Closed</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#046C4E' }]}>{deliveredCount}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Delivered</Text>
        </View>
      </View>

      {/* Active Batch Card */}
      {activeBatch ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{activeBatch.route}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Cutoff: {activeBatch.cutoffTime}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[styles.statusText, { color: colors.secondary }]}>OPEN</Text>
            </View>
          </View>

          <View style={[styles.batchStats, { backgroundColor: colors.background }]}>
            <View style={styles.batchStatBox}>
              <Text style={[styles.batchStatValue, { color: colors.text }]}>{activeBatchOrderCount}</Text>
              <Text style={[styles.batchStatLabel, { color: colors.icon }]}>Orders</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.batchStatBox}>
              <Text style={[styles.batchStatValue, { color: colors.primary }]}>{activeBatchTotal}</Text>
              <Text style={[styles.batchStatLabel, { color: colors.icon }]}>Total Value</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/supplier/batches/${activeBatch.id}`)}
          >
            <Text style={styles.primaryButtonText}>View Batch</Text>
            <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Truck size={36} color={colors.icon} style={{ opacity: 0.3, marginBottom: 12 }} />
            <Text style={[styles.cardTitle, { color: colors.text, textAlign: 'center' }]}>No Active Batch</Text>
            <Text style={[styles.cardSubtitle, { color: colors.icon, textAlign: 'center', marginBottom: 16 }]}>
              Create a new batch to start collecting orders.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary, paddingHorizontal: 24 }]}
              onPress={() => router.push('/supplier/batches')}
            >
              <Plus size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>Create Batch</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Low Stock Alerts */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Inventory Alerts</Text>
          <AlertTriangle size={20} color={lowStockProducts.length > 0 ? '#F59E0B' : colors.icon} />
        </View>

        {lowStockProducts.length === 0 ? (
          <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
            {products.length === 0
              ? 'Import your product catalog to track stock levels.'
              : '✓ All products are well-stocked.'}
          </Text>
        ) : (
          lowStockProducts.slice(0, 3).map((p, i) => (
            <View key={p.id ?? i} style={[styles.alertItem, i > 0 && { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 12 }]}>
              <View style={styles.alertIconBg}>
                <Package size={16} color="#F59E0B" />
              </View>
              <View style={styles.alertTextContainer}>
                <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={1}>
                  Low Stock: {p.name}
                </Text>
                <Text style={[styles.alertSubtitle, { color: colors.icon }]}>
                  Only {p.stock} {p.unit ?? 'units'} remaining
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push(`/supplier/products/${p.id}`)}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Update</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {lowStockProducts.length > 3 && (
          <TouchableOpacity onPress={() => router.push('/supplier/products')} style={{ marginTop: 12 }}>
            <Text style={[styles.linkText, { color: colors.primary }]}>+{lowStockProducts.length - 3} more →</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 16 },
  headerRight: { marginRight: 16, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 0, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#0A192F' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, marginTop: 8, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  batchStatBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statDivider: { width: 1, marginVertical: 12 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12 },
  batchStatValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  batchStatLabel: { fontSize: 12 },
  card: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderTopWidth: 1, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  cardSubtitle: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  batchStats: { flexDirection: 'row', borderRadius: 10, marginBottom: 14, overflow: 'hidden' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  alertItem: { flexDirection: 'row', alignItems: 'center' },
  alertIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  alertSubtitle: { fontSize: 12 },
  linkText: { fontSize: 14, fontWeight: '600' },
});
