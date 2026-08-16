import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, RefreshControl, Modal } from 'react-native';
import { Stack, router, useNavigation, useFocusEffect } from 'expo-router';
import { Search, Image as ImageIcon, Filter, Edit2, X, Plus, Minus, Upload, Truck, Logs } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = ['All', 'Rice & Grains', 'Condiments', 'Canned Goods', 'Beverages'];

// Initial Mock Data with Categories and lastUpdated
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Jasmine Rice', category: 'Rice & Grains', unit: '25kg sack', price: '₱1,250', stock: 15, isActive: true, lastUpdated: 'Updated 2h ago' },
  { id: '2', name: 'Brown Sugar', category: 'Condiments', unit: '1kg pack', price: '₱65', stock: 4, isActive: true, lowStock: true, lastUpdated: 'Updated today' },
  { id: '3', name: 'Cooking Oil', category: 'Condiments', unit: '1L bottle', price: '₱110', stock: 0, isActive: false, lastUpdated: 'Updated 2d ago' },
  { id: '4', name: 'Evaporated Milk', category: 'Canned Goods', unit: '370ml can', price: '₱35', stock: 120, isActive: true, lastUpdated: 'Updated 1w ago' },
];

export default function ProductsScreen() {
  const theme = useColorScheme();
  const colors = Colors[theme];
  
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Quick Edit Modal State
  const [quickEditProduct, setQuickEditProduct] = useState<typeof INITIAL_PRODUCTS[0] | null>(null);
  const [quickEditStock, setQuickEditStock] = useState(0);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        headerTitle: 'Products',
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Truck size={20} color={colors.primary} />
            </View>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <Upload size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '600' }}>CSV</Text>
          </TouchableOpacity>
        )
      });
    }, [navigation, colors])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleQuickEditSave = () => {
    if (quickEditProduct) {
      setProducts(products.map(p => p.id === quickEditProduct.id ? { ...p, stock: quickEditStock, lastUpdated: 'Updated just now' } : p));
    }
    setQuickEditProduct(null);
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderItem = ({ item }: { item: typeof INITIAL_PRODUCTS[0] }) => (
    <View style={[styles.listItem, { borderBottomColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.imageBtn}
        onPress={() => {
          setQuickEditProduct(item);
          setQuickEditStock(item.stock);
        }}
      >
        <View style={[styles.productImage, { backgroundColor: '#F3F4F6' }]}>
          <ImageIcon size={20} color="#9CA3AF" />
          <View style={[styles.quickEditBadge, { backgroundColor: colors.primary }]}>
            <Edit2 size={10} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.productInfo}
        onPress={() => router.push(`/supplier/products/${item.id}`)}
      >
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productMeta, { color: colors.icon }]}>{item.category} • {item.unit}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.productPrice, { color: colors.primary }]}>{item.price}</Text>
          <Text style={[styles.lastUpdated, { color: colors.icon }]}>{item.lastUpdated}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.stockColumn}>
        <Text style={[
          styles.stockNum,
          item.stock === 0 ? { color: '#EF4444' } : item.lowStock ? { color: '#F59E0B' } : { color: '#10B981' }
        ]}>
          {item.stock}
        </Text>
        <Text style={[styles.stockLabel, { color: colors.icon }]}>in stock</Text>
        {!item.isActive && (
          <View style={[styles.inactiveBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.inactiveText}>Hidden</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.headerActions, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Search size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search catalog..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.iconButton, { borderColor: colors.border }]}>
          <Filter size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: colors.surface, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                { backgroundColor: activeCategory === cat ? colors.primary : colors.background, borderColor: colors.border }
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={{ color: activeCategory === cat ? '#fff' : colors.text, fontSize: 13, fontWeight: activeCategory === cat ? '600' : '400' }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      />

      {/* Quick Edit Modal */}
      <Modal visible={!!quickEditProduct} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Adjust Stock</Text>
              <TouchableOpacity onPress={() => setQuickEditProduct(null)}>
                <X size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalItemName, { color: colors.text }]}>{quickEditProduct?.name}</Text>
            <Text style={[styles.modalItemUnit, { color: colors.icon }]}>{quickEditProduct?.unit}</Text>

            <View style={styles.stepperContainer}>
              <TouchableOpacity 
                style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setQuickEditStock(Math.max(0, quickEditStock - 1))}
              >
                <Minus size={20} color={colors.text} />
              </TouchableOpacity>
              
              <Text style={[styles.stepperValue, { color: colors.text }]}>{quickEditStock}</Text>
              
              <TouchableOpacity 
                style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setQuickEditStock(quickEditStock + 1)}
              >
                <Plus size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleQuickEditSave}
            >
              <Text style={styles.saveBtnText}>Save Stock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageBtn: {
    marginRight: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickEditBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  lastUpdated: {
    fontSize: 11,
  },
  stockColumn: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  stockNum: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  inactiveBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  inactiveText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalItemUnit: {
    fontSize: 14,
    marginBottom: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 32,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
