import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router, useNavigation, useFocusEffect } from 'expo-router';
import { Filter, Calendar, MapPin, Package, ChevronRight, Truck, Plus, X, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useBatchStore, Batch, getActiveOrderCount, getBatchTotal } from '@/store/batchStore';

export default function BatchesScreen() {
  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'delivered'>('open');
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const { batches, loadBatches, createBatch } = useBatchStore();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newRoute, setNewRoute] = useState('');
  const [newCutoff, setNewCutoff] = useState('');
  const [newDelivery, setNewDelivery] = useState('');

  useEffect(() => {
    if (user?.id) loadBatches(user.id);
  }, [user?.id]);

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
          <TouchableOpacity
            style={{ marginRight: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 }}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Plus size={22} color="#fff" />
          </TouchableOpacity>
        )
      });
    }, [navigation, colors])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (user?.id) loadBatches(user.id).finally(() => setRefreshing(false));
    else setRefreshing(false);
  }, [user?.id]);

  const filteredBatches = useMemo(
    () => batches.filter(b => b.status === activeTab),
    [batches, activeTab]
  );

  const handleCreateBatch = async () => {
    if (!newRoute.trim() || !newCutoff.trim() || !newDelivery.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (!user?.id) return;
    await createBatch(user.id, newRoute.trim(), newCutoff.trim(), newDelivery.trim());
    setIsCreateModalVisible(false);
    setNewRoute('');
    setNewCutoff('');
    setNewDelivery('');
    setActiveTab('open');
  };

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    open: { bg: colors.secondary + '20', text: colors.secondary },
    closed: { bg: '#F3F4F6', text: '#4B5563' },
    delivered: { bg: '#DEF7EC', text: '#046C4E' },
  };

  const renderItem = ({ item }: { item: Batch }) => {
    const sc = STATUS_COLORS[item.status];
    const orderCount = getActiveOrderCount(item);
    const totalValue = getBatchTotal(item);

    return (
      <TouchableOpacity
        style={[styles.listItem, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => router.push(`/supplier/batches/${item.id}`)}
      >
        <View style={styles.listContentLeft}>
          <View style={styles.headerRow}>
            <Text style={[styles.batchId, { color: colors.text }]}>
              {item.route}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.text }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <View style={styles.infoRow}>
                <Calendar size={14} color={colors.icon} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: colors.icon }]} numberOfLines={1}>
                  Cutoff: {item.cutoffTime}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Truck size={14} color={colors.icon} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: colors.icon }]}>
                  Delivery: {item.deliveryDate}
                </Text>
              </View>
            </View>

            <View style={styles.statsCol}>
              <Text style={[styles.valueText, { color: colors.primary }]}>{totalValue}</Text>
              <View style={styles.infoRow}>
                <Package size={14} color={colors.icon} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: colors.icon }]}>{orderCount} Orders</Text>
              </View>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color={colors.border} />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Package size={48} color={colors.icon} style={{ marginBottom: 16, opacity: 0.4 }} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No {activeTab} batches
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        {activeTab === 'open'
          ? 'Tap the + button to create your first batch.'
          : `No batches have been ${activeTab} yet.`}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['open', 'closed', 'delivered'] as const).map((tab) => {
          const count = batches.filter(b => b.status === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.icon, fontWeight: activeTab === tab ? '700' : '500' }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: activeTab === tab ? colors.primary : colors.border }]}>
                  <Text style={{ color: activeTab === tab ? '#fff' : colors.text, fontSize: 10, fontWeight: '700' }}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredBatches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContainer, filteredBatches.length === 0 && { flex: 1 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />

      {/* Create Batch Modal */}
      <Modal visible={isCreateModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Batch</Text>
                <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                  <X size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                <MapPin size={18} color={colors.icon} />
                <TextInput
                  style={[styles.modalInput, { color: colors.text }]}
                  placeholder="Route name (e.g. Poblacion Route)"
                  placeholderTextColor={colors.icon}
                  value={newRoute}
                  onChangeText={setNewRoute}
                />
              </View>

              <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                <Clock size={18} color={colors.icon} />
                <TextInput
                  style={[styles.modalInput, { color: colors.text }]}
                  placeholder="Cutoff (e.g. Today, 5:00 PM)"
                  placeholderTextColor={colors.icon}
                  value={newCutoff}
                  onChangeText={setNewCutoff}
                />
              </View>

              <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                <Calendar size={18} color={colors.icon} />
                <TextInput
                  style={[styles.modalInput, { color: colors.text }]}
                  placeholder="Delivery date (e.g. Tomorrow)"
                  placeholderTextColor={colors.icon}
                  value={newDelivery}
                  onChangeText={setNewDelivery}
                />
              </View>

              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateBatch}
              >
                <Text style={styles.createBtnText}>Create Batch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14 },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  listContainer: { paddingBottom: 24 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  listContentLeft: { flex: 1, marginRight: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  batchId: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoCol: { flex: 1 },
  statsCol: { alignItems: 'flex-end' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoIcon: { marginRight: 6 },
  infoText: { fontSize: 13 },
  valueText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, gap: 10 },
  modalInput: { flex: 1, fontSize: 15 },
  createBtn: { height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
