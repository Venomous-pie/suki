import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router, useNavigation, useFocusEffect } from 'expo-router';
import { Image as ImageIcon, MoveLeft, Save, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRODUCT_DETAILS = {
  id: '1',
  name: 'Jasmine Rice',
  unit: '25kg sack',
  price: '1250',
  stock: '15',
  inStock: true,
  description: 'Premium fragrant jasmine rice from Nueva Ecija.'
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme();
  const colors = Colors[theme];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const [price, setPrice] = useState(PRODUCT_DETAILS.price);
  const [stock, setStock] = useState(PRODUCT_DETAILS.stock);
  const [inStock, setInStock] = useState(PRODUCT_DETAILS.inStock);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        headerTitle: PRODUCT_DETAILS.name,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
            <MoveLeft color={colors.background} size={24} />
          </TouchableOpacity>
        ),
        headerRight: () => null
      });
    }, [navigation, colors])
  );

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
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            defaultValue={PRODUCT_DETAILS.name}
          />
        </View>

        <View style={[styles.inputGroup, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.icon }]}>Unit / Packaging</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            defaultValue={PRODUCT_DETAILS.unit}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.icon }]}>Description (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            defaultValue={PRODUCT_DETAILS.description}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Pricing & Inventory</Text>
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}>
        
        <View style={[styles.rowInputs, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 16 }]}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 12, marginBottom: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <Text style={[styles.label, { color: colors.icon, marginBottom: 0 }]}>Price (₱)</Text>
              <Text style={{ fontSize: 10, color: colors.icon }}>(Last changed 1w ago)</Text>
            </View>
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
            value={inStock}
            onValueChange={setInStock}
            trackColor={{ false: '#D1D5DB', true: colors.secondary + '80' }}
            thumbColor={inStock ? colors.secondary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.deleteBtn, { borderColor: '#FEE2E2' }]}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
      
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
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 8,
  },
  changeImageBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  changeImageText: {
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  inputGroup: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchSub: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginHorizontal: 16,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  }
});
