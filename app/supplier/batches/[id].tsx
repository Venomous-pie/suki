import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert, Modal, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Clock, CheckCircle, Store, MoveLeft, Package, XCircle, Truck, ChevronDown, PackageCheck } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useBatchStore, Order, OrderStatus, getConsolidatedItems, getActiveOrderCount, getBatchTotal } from '@/store/batchStore';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#B45309' },
  confirmed: { bg: '#DBEAFE', text: '#1D4ED8' },
  packed: { bg: '#EDE9FE', text: '#6D28D9' },
  out_for_delivery: { bg: '#FFF7ED', text: '#C2410C' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function BatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const { batches, updateBatchStatus, updateOrderStatus, deleteBatch } = useBatchStore();

  const batch = useMemo(() => batches.find(b => b.id === id), [batches, id]);

  const consolidatedItems = useMemo(() => batch ? getConsolidatedItems(batch) : [], [batch]);
  const orderCount = useMemo(() => batch ? getActiveOrderCount(batch) : 0, [batch]);
  const totalValue = useMemo(() => batch ? getBatchTotal(batch) : '₱0', [batch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        headerTitle: batch ? batch.route : 'Batch Detail',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
            <MoveLeft color="#fff" size={24} />
          </TouchableOpacity>
        ),
        headerRight: () =>
          batch?.status === 'open' ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 16 }]}>
              <Clock size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>OPEN</Text>
            </View>
          ) : null,
      });
    }, [navigation, batch])
  );

  const handleCloseBatch = () => {
    if (!user?.id || !batch) return;
    Alert.alert('Close Batch', 'This will stop accepting new orders for this batch.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Close Batch', style: 'destructive', onPress: () => updateBatchStatus(user.id!, batch.id, 'closed') },
    ]);
  };

  const handleMarkDelivered = () => {
    if (!user?.id || !batch) return;
    Alert.alert('Mark as Delivered', 'This will mark the entire batch as delivered.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateBatchStatus(user.id!, batch.id, 'delivered') },
    ]);
  };

  const handleDeleteBatch = () => {
    if (!user?.id || !batch) return;
    Alert.alert('Delete Batch', 'This will permanently delete this batch and all its orders.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteBatch(user.id!, batch.id);
        navigation.goBack();
      }},
    ]);
  };

  const handleOrderStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (!user?.id || !batch) return;
    Alert.alert(
      'Update Order Status',
      `Change "${order.storeName}" order to "${ORDER_STATUS_LABELS[newStatus]}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            updateOrderStatus(user.id!, batch.id, order.id, newStatus);
            setSelectedOrder(null);
          },
        },
      ]
    );
  };

  if (!batch) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{orderCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.icon }]}>Orders</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{totalValue}</Text>
              <Text style={[styles.summaryLabel, { color: colors.icon }]}>Total Value</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{consolidatedItems.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.icon }]}>SKUs</Text>
            </View>
          </View>
        </View>

        {/* Consolidated Items */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>To Prepare (Consolidated)</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {consolidatedItems.length === 0 ? (
            <View style={styles.sectionEmpty}>
              <Package size={32} color={colors.icon} style={{ opacity: 0.3, marginBottom: 8 }} />
              <Text style={[styles.sectionEmptyText, { color: colors.icon }]}>No items yet. Orders will appear here.</Text>
            </View>
          ) : (
            consolidatedItems.map((item, index) => (
              <View
                key={index}
                style={[styles.listItem, { borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border }]}
              >
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <View style={[styles.qtyBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.qtyText, { color: colors.primary }]}>{item.qty} {item.unit}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        {batch.status === 'open' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]} onPress={handleCloseBatch}>
              <XCircle size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.closeBtnText}>Close Batch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleMarkDelivered}>
              <Truck size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>Out for Delivery</Text>
            </TouchableOpacity>
          </View>
        )}

        {batch.status === 'closed' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleMarkDelivered}>
              <PackageCheck size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>Mark as Delivered</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Individual Orders */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Orders ({batch.orders.length})
        </Text>

        {batch.orders.length === 0 ? (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionEmpty}>
              <Store size={32} color={colors.icon} style={{ opacity: 0.3, marginBottom: 8 }} />
              <Text style={[styles.sectionEmptyText, { color: colors.icon }]}>
                No orders yet. Store owners will place orders here.
              </Text>
            </View>
          </View>
        ) : (
          batch.orders.map((order) => {
            const sc = ORDER_STATUS_COLORS[order.status];
            const transitions = STATUS_TRANSITIONS[order.status];
            return (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.orderHeader}>
                  <View style={styles.storeInfo}>
                    <Store size={18} color={colors.icon} />
                    <Text style={[styles.storeName, { color: colors.text }]}>{order.storeName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{ORDER_STATUS_LABELS[order.status]}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={[styles.orderItemsText, { color: colors.icon }]}>
                    {order.items.length} items
                  </Text>
                  <Text style={[styles.orderTotal, { color: colors.primary }]}>{order.total}</Text>
                </View>

                <Text style={[styles.orderPaymentText, { color: colors.icon }]}>{order.payment}</Text>

                {transitions.length > 0 && (
                  <View style={[styles.orderActions, { borderTopColor: colors.border }]}>
                    {transitions.map(nextStatus => (
                      <TouchableOpacity
                        key={nextStatus}
                        style={[
                          styles.transitionBtn,
                          { borderColor: ORDER_STATUS_COLORS[nextStatus].text + '40', backgroundColor: ORDER_STATUS_COLORS[nextStatus].bg }
                        ]}
                        onPress={() => handleOrderStatusChange(order, nextStatus)}
                      >
                        <Text style={[styles.transitionBtnText, { color: ORDER_STATUS_COLORS[nextStatus].text }]}>
                          → {ORDER_STATUS_LABELS[nextStatus]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Danger Zone */}
        <TouchableOpacity style={[styles.deleteBatchBtn, { borderColor: '#FEE2E2' }]} onPress={handleDeleteBatch}>
          <Text style={{ color: '#EF4444', fontWeight: '600' }}>Delete Batch</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  summaryCard: { margin: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row' },
  summaryBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  summaryDivider: { width: 1, marginVertical: 16 },
  summaryValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { fontSize: 12 },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 8, marginTop: 8 },
  section: { borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 24 },
  sectionEmpty: { alignItems: 'center', paddingVertical: 32 },
  sectionEmptyText: { fontSize: 14, textAlign: 'center' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  itemName: { fontSize: 15, fontWeight: '500', flex: 1, marginRight: 12 },
  qtyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  qtyText: { fontWeight: '700' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24, gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  closeBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  closeBtnText: { color: '#EF4444', fontWeight: '700' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  orderCard: { borderBottomWidth: StyleSheet.hairlineWidth, padding: 16, borderTopWidth: StyleSheet.hairlineWidth, marginBottom: -1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  storeName: { fontSize: 15, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderItemsText: { fontSize: 13 },
  orderTotal: { fontSize: 16, fontWeight: '700' },
  orderPaymentText: { fontSize: 13, marginBottom: 12 },
  orderActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, paddingTop: 12 },
  transitionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  transitionBtnText: { fontSize: 13, fontWeight: '700' },
  deleteBatchBtn: { marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
});
