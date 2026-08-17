import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Tabs, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Package, AlertTriangle, ArrowRight, Truck, Plus, CheckCircle, Clock, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useBatchStore, getActiveOrderCount, getBatchTotal } from '@/store/batchStore';
import { useProductStore } from '@/store/productStore';

const { width } = Dimensions.get('window');

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

  // --- Computed Data ---
  
  // 1. Active Batch
  const activeBatch = batches.find(b => b.status === 'open') ?? null;
  const activeBatchOrderCount = activeBatch ? getActiveOrderCount(activeBatch) : 0;
  const activeBatchTotal = activeBatch ? getBatchTotal(activeBatch) : '₱0';

  // Determine if batch is urgent (mocking based on string for demo)
  const isBatchUrgent = activeBatch?.cutoffTime.toLowerCase().includes('today') || false;

  // 2. Pending Actions (Orders waiting for confirmation)
  const pendingOrdersCount = batches
    .filter(b => b.status === 'open')
    .flatMap(b => b.orders)
    .filter(o => o.status === 'pending').length;

  // 3. Inventory
  const LOW_STOCK_THRESHOLD = 5;
  const lowStockProducts = products.filter(p => typeof p.stock === 'number' && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
  const outOfStockProducts = products.filter(p => typeof p.stock === 'number' && p.stock === 0);
  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  // 4. Quick Stats (Mocking "Today" by summing all open/closed for demo)
  const ordersToday = batches.flatMap(b => b.orders).filter(o => o.status !== 'cancelled').length;
  const revenueToday = batches.flatMap(b => b.orders).filter(o => o.status !== 'cancelled').reduce((sum, order) => {
    return sum + (parseFloat(order.total.replace(/[₱,]/g, '')) || 0);
  }, 0);

  // Mock Notification Count
  const unreadNotifications = 3;

  // Real Trends Calculation
  const completedBatches = batches
    .filter(b => b.status === 'closed' || b.status === 'delivered')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  let revenueGrowthStr = "Not enough data";
  let revenueGrowthColor = colors.icon;
  
  if (completedBatches.length >= 2) {
    const latestRevenue = completedBatches[0].orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (parseFloat(o.total.replace(/[₱,]/g, '')) || 0), 0);
    const previousRevenue = completedBatches[1].orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (parseFloat(o.total.replace(/[₱,]/g, '')) || 0), 0);
    
    if (previousRevenue > 0) {
      const growth = ((latestRevenue - previousRevenue) / previousRevenue) * 100;
      revenueGrowthStr = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% Revenue`;
      revenueGrowthColor = growth >= 0 ? '#10B981' : '#EF4444';
    } else if (latestRevenue > 0) {
      revenueGrowthStr = "+100% Revenue";
      revenueGrowthColor = '#10B981';
    }
  } else if (completedBatches.length === 1) {
    revenueGrowthStr = "First batch completed!";
    revenueGrowthColor = '#10B981';
  }

  // Top Selling Items (Compute from all orders in completed batches)
  const itemCounts: Record<string, { name: string, qty: number }> = {};
  completedBatches.forEach(b => {
    b.orders.filter(o => o.status !== 'cancelled').forEach(o => {
      o.items.forEach(item => {
        if (!itemCounts[item.productId]) {
          itemCounts[item.productId] = { name: item.productName, qty: 0 };
        }
        itemCounts[item.productId].qty += item.qty;
      });
    });
  });
  const topSelling = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 3);

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header Setup */}
        <Tabs.Screen
          options={{
            headerTitle: user?.name || 'Dashboard',
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerRight}
                onPress={() => router.push('/supplier/notifications')}
              >
                <Bell size={24} color="#fff" />
                {unreadNotifications > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />

        {/* 1. Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ShoppingCart size={18} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.text }]}>{ordersToday}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Orders Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <BarChart3 size={18} color="#10B981" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.text }]}>₱{revenueToday.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Revenue Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AlertTriangle size={18} color={totalAlerts > 0 ? '#EF4444' : colors.icon} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: totalAlerts > 0 ? '#EF4444' : colors.text }]}>{totalAlerts}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Stock Alerts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CheckCircle size={18} color={pendingOrdersCount > 0 ? '#F59E0B' : colors.icon} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: pendingOrdersCount > 0 ? '#F59E0B' : colors.text }]}>{pendingOrdersCount}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>To Confirm</Text>
          </View>
        </View>

        {/* 2. Needs Action Items */}
        {(isBatchUrgent || pendingOrdersCount > 0 || totalAlerts > 0) && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Needs Action</Text>
            
            {/* Urgent Batch */}
            {isBatchUrgent && activeBatch && (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                onPress={() => router.push(`/supplier/batches/${activeBatch.id}`)}
              >
                <Clock size={20} color="#DC2626" />
                <View style={styles.actionCardContent}>
                  <Text style={[styles.actionCardTitle, { color: '#991B1B' }]}>Batch Closing Soon</Text>
                  <Text style={[styles.actionCardSubtitle, { color: '#B91C1C' }]}>{activeBatch.route} closes {activeBatch.cutoffTime}</Text>
                </View>
                <ArrowRight size={20} color="#DC2626" />
              </TouchableOpacity>
            )}

            {/* Pending Orders */}
            {pendingOrdersCount > 0 && (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
                onPress={() => router.push(activeBatch ? `/supplier/batches/${activeBatch.id}` : '/supplier/batches')}
              >
                <CheckCircle size={20} color="#D97706" />
                <View style={styles.actionCardContent}>
                  <Text style={[styles.actionCardTitle, { color: '#92400E' }]}>{pendingOrdersCount} New Orders</Text>
                  <Text style={[styles.actionCardSubtitle, { color: '#B45309' }]}>Awaiting your confirmation</Text>
                </View>
                <ArrowRight size={20} color="#D97706" />
              </TouchableOpacity>
            )}

            {/* Inventory Alerts */}
            {totalAlerts > 0 && (
              <View style={[styles.inventoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.inventoryCardHeader}>
                  <Text style={[styles.inventoryCardTitle, { color: colors.text }]}>Inventory Alerts</Text>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/supplier/products', params: { filter: 'alerts' } })}>
                    <Text style={[styles.linkText, { color: colors.primary }]}>View all</Text>
                  </TouchableOpacity>
                </View>
                
                {outOfStockProducts.slice(0, 2).map((p, i) => (
                  <View key={`oos-${p.id ?? i}`} style={styles.alertRow}>
                    <View style={[styles.alertDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.alertItemName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.alertItemStatus, { color: '#EF4444' }]}>Out of stock</Text>
                  </View>
                ))}
                
                {lowStockProducts.slice(0, 3 - Math.min(2, outOfStockProducts.length)).map((p, i) => (
                  <View key={`low-${p.id ?? i}`} style={styles.alertRow}>
                    <View style={[styles.alertDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={[styles.alertItemName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.alertItemStatus, { color: '#F59E0B' }]}>Only {p.stock} left</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 3. Current Batch */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Batch</Text>
            <TouchableOpacity onPress={() => router.push('/supplier/batches')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>

          {activeBatch ? (
            <View style={[styles.batchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.batchCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.batchCardTitle, { color: colors.text }]} numberOfLines={1}>{activeBatch.route}</Text>
                  <Text style={[styles.batchCardSubtitle, { color: colors.icon }]}>Cutoff: {activeBatch.cutoffTime}</Text>
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
                <Text style={styles.primaryButtonText}>View Full Batch</Text>
                <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Truck size={36} color={colors.icon} style={{ opacity: 0.3, marginBottom: 12 }} />
              <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No Active Batch</Text>
              <Text style={[styles.emptyCardSubtitle, { color: colors.icon }]}>Create a new batch to start collecting orders.</Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, alignSelf: 'stretch' }]}
                onPress={() => router.push('/supplier/batches')}
              >
                <Plus size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryButtonText}>Start New Batch</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. Trends / Context (Below the fold) */}
        <View style={[styles.sectionContainer, { marginBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trends</Text>
          <View style={[styles.trendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.trendHeader}>
              <TrendingUp size={20} color={revenueGrowthColor} />
              <Text style={[styles.trendTitle, { color: colors.text }]}>Performance</Text>
            </View>
            <Text style={[styles.trendMainText, { color: revenueGrowthColor }]}>{revenueGrowthStr}</Text>
            <Text style={[styles.trendSubText, { color: colors.icon }]}>Compared to previous batch</Text>
            
            <View style={[styles.trendDivider, { backgroundColor: colors.border }]} />
            
            <Text style={[styles.trendListTitle, { color: colors.text }]}>Top Selling (All Time)</Text>
            {topSelling.length === 0 ? (
              <Text style={{ color: colors.icon, fontSize: 13, marginTop: 4 }}>No completed orders yet.</Text>
            ) : (
              topSelling.map((item, i) => (
                <View key={i} style={styles.trendRow}>
                  <Text style={[styles.trendItemName, { color: colors.icon }]}>{i + 1}. {item.name}</Text>
                </View>
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 16 },
  headerRight: { marginRight: 16, position: 'relative' },
  notificationBadge: { 
    position: 'absolute', top: -4, right: -4, 
    backgroundColor: '#EF4444', 
    borderRadius: 10, 
    minWidth: 20, height: 20, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0A192F' 
  },
  notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  
  // Quick Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 8 },
  statCard: { 
    width: (width - 40) / 2, 
    margin: 4, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1 
  },
  statIcon: { marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  
  // Sections
  sectionContainer: { marginTop: 16, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  linkText: { fontSize: 14, fontWeight: '600' },

  // Action Cards
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  actionCardContent: { flex: 1, marginLeft: 12, marginRight: 12 },
  actionCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  actionCardSubtitle: { fontSize: 13, fontWeight: '500' },

  // Inventory Alerts
  inventoryCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  inventoryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  inventoryCardTitle: { fontSize: 15, fontWeight: '700' },
  alertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  alertItemName: { flex: 1, fontSize: 14, fontWeight: '500' },
  alertItemStatus: { fontSize: 13, fontWeight: '600' },

  // Batch Card
  batchCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  batchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  batchCardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  batchCardSubtitle: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  batchStats: { flexDirection: 'row', borderRadius: 10, marginBottom: 16, overflow: 'hidden' },
  batchStatBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statDivider: { width: 1, marginVertical: 12 },
  batchStatValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  batchStatLabel: { fontSize: 12 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: 24, borderRadius: 12, borderWidth: 1 },
  emptyCardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  emptyCardSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 20 },

  // Trends
  trendCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  trendHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  trendTitle: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
  trendMainText: { fontSize: 24, fontWeight: '800', color: '#10B981', marginBottom: 4 },
  trendSubText: { fontSize: 13 },
  trendDivider: { height: 1, marginVertical: 16 },
  trendListTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  trendRow: { paddingVertical: 6 },
  trendItemName: { fontSize: 14 },
});
