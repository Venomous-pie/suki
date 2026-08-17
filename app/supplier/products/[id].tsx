import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useNavigation, useFocusEffect } from 'expo-router';
import { Image as ImageIcon, MoveLeft, Save, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useColorScheme();
  const colors = Colors[theme];
  const user = useAuthStore((s) => s.user);
  const { products, saveProducts } = useProductStore();
  const navigation = useNavigation();

  const product = products.find((p) => p.id === id);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Populate fields when product is found
  useEffect(() => {
    if (product) {
      setName(product.name ?? '');
      setUnit(product.unit ?? '');
      setPrice(product.price ?? '');
      setStock(String(product.stock ?? ''));
      setDescription(product.description ?? '');
      setBrand(product.brand ?? '');
      setSku(product.sku ?? '');
      setBarcode(product.barcode ?? '');
      setCategory(product.category ?? '');
      setIsActive(product.isActive ?? true);
    }
  }, [product]);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        headerTitle: product?.name ?? 'Product Details',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
            <MoveLeft color={colors.background} size={24} />
          </TouchableOpacity>
        ),
        headerRight: () => null
      });
    }, [navigation, colors, product?.name])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleSave = () => {
    if (!user?.id || !product) return;
    const updated = products.map((p) =>
      p.id === id
        ? {
            ...p,
            name: name.trim(),
            unit: unit.trim(),
            price: price.trim(),
            stock: parseInt(stock, 10) || 0,
            description: description.trim(),
            brand: brand.trim() || undefined,
            sku: sku.trim() || undefined,
            barcode: barcode.trim() || undefined,
            category: category.trim(),
            isActive,
            lastUpdated: 'Just updated',
          }
        : p
    );
    saveProducts(user.id, updated);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!user?.id) return;
            const updated = products.filter((p) => p.id !== id);
            saveProducts(user.id, updated);
            router.back();
          },
        },
      ]
    );
  };

  if (!product) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.notFoundText, { color: colors.icon }]}>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}>
        <ImageIcon size={64} color={colors.icon} />
        <TouchableOpacity
          style={styles.changeImageBtn}
          onPress={() => Alert.alert('Upload Photo', 'This would open the native device image picker.')}
        >
          <Text style={[styles.changeImageText, { color: colors.primary }]}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Product Information</Text>
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}>
        <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.icon }]}>Product Name</Text>
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={name} onChangeText={setName} />
        </View>

        <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.icon }]}>Category</Text>
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={category} onChangeText={setCategory} />
        </View>

        <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.icon }]}>Unit / Packaging</Text>
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={unit} onChangeText={setUnit} />
        </View>

        {(brand !== '' || sku !== '' || barcode !== '') && (
          <>
            {brand !== '' && (
              <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.icon }]}>Brand</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={brand} onChangeText={setBrand} />
              </View>
            )}
            {sku !== '' && (
              <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.icon }]}>SKU</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={sku} onChangeText={setSku} />
              </View>
            )}
            {barcode !== '' && (
              <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.icon }]}>Barcode</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={barcode} onChangeText={setBarcode} keyboardType="numeric" />
              </View>
            )}
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.icon }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Pricing & Inventory</Text>
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}>
        <View style={[styles.rowInputs, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 16 }]}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 12, marginBottom: 0 }]}>
            <Text style={[styles.label, { color: colors.icon }]}>Price (₱)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginBottom: 0 }]}>
            <Text style={[styles.label, { color: colors.icon }]}>Stock Qty</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Active in Catalog</Text>
            <Text style={[styles.switchSub, { color: colors.icon }]}>Turn off to hide from store owners</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#D1D5DB', true: colors.primary + '80' }}
            thumbColor={isActive ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.deleteBtn, { borderColor: '#FEE2E2' }]} onPress={handleDelete}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 15 },
  content: { paddingVertical: 24 },
  imageContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, marginBottom: 8 },
  changeImageBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  changeImageText: { fontWeight: '600' },
  formSection: { paddingHorizontal: 16, marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 16 },
  inputGroup: { paddingVertical: 12 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  switchLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  switchSub: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, marginHorizontal: 16 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, backgroundColor: '#fff' },
  deleteBtnText: { color: '#EF4444', fontWeight: '600', marginLeft: 8 },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});
