import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Clock, CheckCircle, Store, MoveLeft } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HeaderTitle } from '@react-navigation/elements';

const BATCH_DETAILS = {
  id: '24',
  route: 'Poblacion Route',
  status: 'open',
  closesIn: '3h 20m',
  consolidatedItems: [
    { name: 'Jasmine Rice 25kg', qty: 15, unit: 'sacks' },
    { name: 'Brown Sugar 1kg', qty: 45, unit: 'packs' },
    { name: 'Cooking Oil 1L', qty: 30, unit: 'bottles' },
  ],
  orders: [
    { id: '101', store: 'Aling Nena Sari-Sari', items: 3, total: '₱1,250', status: 'pending', payment: 'Cash on Delivery' },
    { id: '102', store: 'Mang Juan Store', items: 5, total: '₱3,000', status: 'pending', payment: 'GCash' },
  ]
};

export default function BatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        headerTitle: `Batch No. ${BATCH_DETAILS.id}`,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
            <MoveLeft color="#fff" size={24} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={[styles.badge, { backgroundColor: colors.background + '20' }]}>
            <Clock size={12} color={colors.background} style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: colors.background }]}>
              {BATCH_DETAILS.closesIn}
            </Text>
          </View>
        )
      });
    }, [navigation, id, colors])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >

      {/* Consolidated List */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>To Prepare (Consolidated)</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>Total items needed across all orders</Text>
        </View>

        {BATCH_DETAILS.consolidatedItems.map((item, index) => (
          <View key={index} style={[styles.listItem, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            </View>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{item.qty} {item.unit}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]}>
          <Text style={styles.closeBtnText}>Close Batch Early</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.primaryBtnText}>Mark Out for Delivery</Text>
        </TouchableOpacity>
      </View>

      {/* Individual Orders */}
      <Text style={[styles.sectionHeading, { color: colors.text }]}>Individual Orders ({BATCH_DETAILS.orders.length})</Text>

      <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
        {BATCH_DETAILS.orders.map((order) => (
          <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.orderHeader}>
              <View style={styles.storeInfo}>
                <Store size={18} color={colors.icon} />
                <Text style={[styles.storeName, { color: colors.text }]}>{order.store}</Text>
              </View>
              <Text style={[styles.orderTotal, { color: colors.text }]}>{order.total}</Text>
            </View>

            <View style={styles.orderDetails}>
              <Text style={[styles.orderItemsText, { color: colors.icon }]}>{order.items} items</Text>
              <Text style={[styles.orderPaymentText, { color: colors.icon }]}>{order.payment}</Text>
            </View>

            <View style={[styles.orderActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.secondaryActionBtn, { borderColor: colors.border }]}>
                <Text style={[styles.secondaryActionText, { color: colors.text }]}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: '#DEF7EC' }]}>
                <CheckCircle size={20} color="#046C4E" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 16,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  qtyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qtyText: {
    fontWeight: '700',
    color: '#374151',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: '#FEE2E2',
  },
  closeBtnText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 12,
  },
  orderCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderItemsText: {
    fontSize: 14,
  },
  orderPaymentText: {
    fontSize: 14,
  },
  orderActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 12,
  },
  secondaryActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontWeight: '600',
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
