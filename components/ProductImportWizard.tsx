import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { X, Upload, CheckCircle2, FileSpreadsheet, AlertCircle, Waypoints, ArrowRight } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductImportWizardProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess: (products: any[]) => Promise<{ added: number; updated: number }>;
}

type Step = 'upload' | 'mapping' | 'preview' | 'success';

export default function ProductImportWizard({ visible, onClose, onImportSuccess }: ProductImportWizardProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  
  const [step, setStep] = useState<Step>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawCsvRows, setRawCsvRows] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [unmappedHeaders, setUnmappedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mergeResult, setMergeResult] = useState<{ added: number; updated: number } | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setIsProcessing(true);
      setError(null);

      // In a real app, you would read the file from the URI. 
      // For web/React Native fetch can often read local file:// URIs or blob URIs.
      const response = await fetch(file.uri);
      const text = await response.text();

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file. Ensure it is formatted correctly.');
          } else if (!results.meta.fields || results.meta.fields.length === 0) {
            setError('Could not find any headers in the CSV file.');
          } else {
            const rawHeaders = results.meta.fields;
            const normalizedHeaders = rawHeaders.map(h => h.trim().toLowerCase());
            
            // Intelligent Mapping Logic
            const newMap: Record<string, string> = {
              name: '', category: '', price: '', stock: '', unit: '',
              sku: '', barcode: '', brand: '', subcategory: '', pack_size: '', description: ''
            };
            const unmapped: string[] = [];

            // Keywords for intelligent mapping
            const keywordMap: Record<string, string[]> = {
              name: ['product_name', 'item_name', 'name', 'product', 'item', 'title'],
              sku: ['sku', 'item_code', 'product_code', 'article_no'],
              barcode: ['barcode', 'upc', 'ean', 'gtin'],
              brand: ['brand', 'manufacturer', 'maker'],
              category: ['category', 'type', 'department', 'class'],
              subcategory: ['subcategory', 'sub_category', 'sub-category'],
              price: ['unit_cost', 'price', 'cost', 'msrp', 'amount'],
              stock: ['qty_ordered', 'stock', 'quantity', 'qty', 'count', 'inventory'],
              unit: ['unit_of_measure', 'unit', 'size', 'measurement', 'weight'],
              pack_size: ['pack_size', 'pack size', 'case_size', 'case size'],
              description: ['description', 'details', 'notes', 'desc']
            };

            // Map each header (Pass 1: Exact matches)
            rawHeaders.forEach((header, index) => {
              const normHeader = normalizedHeaders[index];
              for (const [appField, keywords] of Object.entries(keywordMap)) {
                if (!newMap[appField] && keywords.some(kw => normHeader === kw)) {
                  newMap[appField] = header; 
                  break;
                }
              }
            });

            // Map each header (Pass 2: Partial/Includes matches for remaining)
            rawHeaders.forEach((header, index) => {
              const normHeader = normalizedHeaders[index];
              // If already mapped in pass 1, skip
              if (Object.values(newMap).includes(header)) return;

              let matched = false;
              for (const [appField, keywords] of Object.entries(keywordMap)) {
                if (!newMap[appField] && keywords.some(kw => normHeader.includes(kw))) {
                  newMap[appField] = header;
                  matched = true;
                  break;
                }
              }

              if (!matched && header.trim() !== '') {
                unmapped.push(header);
              }
            });

            setCsvHeaders(rawHeaders);
            setColumnMap(newMap);
            setUnmappedHeaders(unmapped);
            setRawCsvRows(results.data);
            setStep('mapping');
          }
          setIsProcessing(false);
        },
        error: (err: any) => {
          setError(err.message);
          setIsProcessing(false);
        }
      });
    } catch (e: any) {
      setError(e.message || 'Failed to open document.');
      setIsProcessing(false);
    }
  };

  const handleConfirmMapping = () => {
    // Generate parsedData based on columnMap
    const mappedProducts = rawCsvRows.map((row: any, index: number) => {
      const getValue = (headerKey: string) => row[headerKey] ? String(row[headerKey]).trim() : '';

      return {
        id: `imported_${Date.now()}_${index}`,
        name: columnMap.name ? getValue(columnMap.name) || 'Unnamed Product' : 'Unnamed Product',
        sku: columnMap.sku ? getValue(columnMap.sku) : undefined,
        barcode: columnMap.barcode ? getValue(columnMap.barcode) : undefined,
        brand: columnMap.brand ? getValue(columnMap.brand) : undefined,
        category: columnMap.category ? getValue(columnMap.category) || 'Uncategorized' : 'Uncategorized',
        subcategory: columnMap.subcategory ? getValue(columnMap.subcategory) : undefined,
        unit: columnMap.unit ? getValue(columnMap.unit) || '1 pc' : '1 pc',
        pack_size: columnMap.pack_size ? getValue(columnMap.pack_size) : undefined,
        description: columnMap.description ? getValue(columnMap.description) : undefined,
        price: columnMap.price ? getValue(columnMap.price) || '₱0' : '₱0',
        stock: columnMap.stock ? parseInt(getValue(columnMap.stock) || '0', 10) : 0,
        isActive: true,
        lastUpdated: 'Just now'
      };
    }).filter(p => p.name !== 'Unnamed Product' || p.category !== 'Uncategorized');

    setParsedData(mappedProducts);
    setStep('preview');
  };

  const handleConfirmImport = async () => {
    const result = await onImportSuccess(parsedData);
    setMergeResult(result);
    setStep('success');
  };

  const handleFinish = () => {
    onClose();
    // Reset state after animation finishes
    setTimeout(() => {
      setStep('upload');
      setParsedData([]);
      setRawCsvRows([]);
      setColumnMap({});
      setUnmappedHeaders([]);
      setError(null);
      setMergeResult(null);
    }, 500);
  };

  const renderUploadStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
        <FileSpreadsheet size={48} color={colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Import Products</Text>
      <Text style={[styles.stepSubtitle, { color: colors.icon }]}>
        Upload a CSV file containing your product catalog. Your file should have columns for Name, Category, Unit, Price, and Stock.
      </Text>

      {error && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: colors.primary }, isProcessing && { opacity: 0.7 }]}
        onPress={handlePickDocument}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Upload size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Select CSV File</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderMappingStep = () => {
    const requiredFields = [
      { key: 'name', label: 'Product Name', required: true },
      { key: 'category', label: 'Category', required: true },
      { key: 'price', label: 'Price', required: true },
      { key: 'stock', label: 'Stock / Qty', required: true },
      { key: 'unit', label: 'Unit / Size', required: true },
      { key: 'sku', label: 'SKU (Optional)', required: false },
      { key: 'barcode', label: 'Barcode (Optional)', required: false },
      { key: 'brand', label: 'Brand (Optional)', required: false },
      { key: 'subcategory', label: 'Subcategory (Optional)', required: false },
      { key: 'pack_size', label: 'Pack Size (Optional)', required: false },
      { key: 'description', label: 'Description (Optional)', required: false }
    ];

    return (
      <View style={[styles.stepContainer, { flex: 1 }]}>
        <View style={styles.mappingHeader}>
          <Waypoints size={32} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.stepTitle, { color: colors.text }]}>Column Mapping</Text>
          <Text style={[styles.stepSubtitle, { color: colors.icon }]}>
            We analyzed your CSV file. Review how the columns matched our fields.
          </Text>
        </View>

        <FlatList
          data={requiredFields}
          keyExtractor={(item) => item.key}
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}

          renderItem={({ item }) => {
            const mappedHeader = columnMap[item.key];
            const isMissing = !mappedHeader;
            const isRequired = item.required;
            
            return (
              <View style={[styles.mappingRow, { borderBottomColor: colors.border }]}>
                <View style={styles.mappingField}>
                  <Text style={[styles.mappingLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                <ArrowRight size={16} color={colors.icon} style={{ marginHorizontal: 12 }} />
                <View style={[styles.mappingValue, isMissing && isRequired && styles.mappingMissing]}>
                  <Text style={[
                    styles.mappingValueText, 
                    isMissing && isRequired && styles.mappingMissingText,
                    isMissing && !isRequired && { color: colors.icon, fontStyle: 'italic' }
                  ]}>
                    {isMissing ? (isRequired ? 'Not Found' : 'Unmapped') : mappedHeader}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => setStep('upload')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.primaryButton, styles.flexButton, { backgroundColor: colors.primary }]}
            onPress={handleConfirmMapping}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPreviewStep = () => (
    <View style={[styles.stepContainer, { flex: 1 }]}>
      <Text style={[styles.stepTitle, { color: colors.text, marginBottom: 8 }]}>Review Import</Text>
      <Text style={[styles.stepSubtitle, { color: colors.icon, marginBottom: 16 }]}>
        We found {parsedData.length} products in your file. Review the first few below:
      </Text>

      <View style={[styles.previewListContainer, { borderColor: colors.border }]}>
        <FlatList
          data={parsedData.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.previewRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.previewMeta, { color: colors.icon }]}>
                  {item.brand ? `${item.brand} • ` : ''}
                  {item.category} • {item.unit}
                </Text>
                {item.sku && (
                  <Text style={[styles.previewMeta, { color: colors.icon, fontSize: 11, marginTop: 2 }]}>
                    SKU: {item.sku}
                  </Text>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.previewPrice, { color: colors.primary }]}>{item.price}</Text>
                <Text style={[styles.previewStock, { color: colors.text }]}>Stock: {item.stock}</Text>
              </View>
            </View>
          )}
        />
        {parsedData.length > 5 && (
          <Text style={[styles.previewMore, { color: colors.icon }]}>
            + {parsedData.length - 5} more products...
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => setStep('mapping')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.primaryButton, styles.flexButton, { backgroundColor: colors.primary }]}
          onPress={handleConfirmImport}
        >
          <Text style={styles.primaryButtonText}>Import {parsedData.length} Products</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconWrapper, { backgroundColor: '#10B98115' }]}>
        <CheckCircle2 size={56} color="#10B981" />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Import Successful!</Text>
      
      {mergeResult && (
        <View style={styles.mergeResultBox}>
          {mergeResult.added > 0 && (
            <View style={styles.mergeResultRow}>
              <Text style={[styles.mergeResultCount, { color: '#10B981' }]}>{mergeResult.added}</Text>
              <Text style={[styles.mergeResultLabel, { color: colors.text }]}>new products added</Text>
            </View>
          )}
          {mergeResult.updated > 0 && (
            <View style={styles.mergeResultRow}>
              <Text style={[styles.mergeResultCount, { color: colors.primary }]}>{mergeResult.updated}</Text>
              <Text style={[styles.mergeResultLabel, { color: colors.text }]}>existing products updated</Text>
            </View>
          )}
          {mergeResult.added === 0 && mergeResult.updated === 0 && (
            <Text style={[styles.stepSubtitle, { color: colors.icon, marginBottom: 0 }]}>No changes — all products already up to date.</Text>
          )}
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 16 }]}
        onPress={handleFinish}
      >
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[
          styles.modalContent, 
          { backgroundColor: colors.surface },
          (step === 'preview' || step === 'mapping') && styles.modalLarge
        ]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleFinish}>
            <X size={24} color={colors.icon} />
          </TouchableOpacity>

          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'success' && renderSuccessStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalLarge: {
    height: '70%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 16,
  },
  flexButton: {
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  previewListContainer: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 13,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewStock: {
    fontSize: 13,
  },
  previewMore: {
    padding: 12,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: '#F9FAFB',
  },
  mappingHeader: {
    alignItems: 'center',
    width: '100%',
  },
  mappingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mappingField: {
    flex: 1,
  },
  mappingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  mappingValue: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mappingMissing: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  mappingValueText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  mappingMissingText: {
    color: '#EF4444',
  },
  unmappedBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  pillText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
  },
  mergeResultBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  mergeResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mergeResultCount: {
    fontSize: 28,
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'center',
  },
  mergeResultLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
