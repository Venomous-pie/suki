import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Link as LinkIcon, Building2, Phone, CheckSquare, Square } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupplierJoinScreen() {
  const router = useRouter();
  const { loginSupplier, savedPhone, loadSavedPhone, savePhone, clearSavedPhone } = useAuthStore();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Joining...');

  useEffect(() => {
    loadSavedPhone().then(() => {});
  }, []);

  useEffect(() => {
    if (savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
  }, [savedPhone]);

  const handleJoin = async () => {
    if (!name.trim() || !phone.trim()) return;

    setIsLoading(true);
    setLoadingText('Joining...');
    
    const coldBootWarning = setTimeout(() => {
      setLoadingText('Waking up...');
    }, 3000);

    const longerBootWarning = setTimeout(() => {
      setLoadingText('Almost there...');
    }, 10000);

    try {
      if (rememberMe) {
        await savePhone(phone.trim());
      } else {
        await clearSavedPhone();
      }
      await loginSupplier(name, phone);
    } catch (e) {
      // Handle error if needed
    } finally {
      clearTimeout(coldBootWarning);
      clearTimeout(longerBootWarning);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            disabled={isLoading}
          >
            <ArrowLeft size={24} color={isLoading ? colors.icon : colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <LinkIcon size={32} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Join Our Supply Chain</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Become a trusted supplier for SUKI and manage your distribution network seamlessly.
          </Text>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Building2 size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Business Name"
                placeholderTextColor={colors.icon}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Phone size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Phone Number"
                placeholderTextColor={colors.icon}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              {rememberMe
                ? <CheckSquare size={20} color={colors.primary} />
                : <Square size={20} color={colors.icon} />
              }
              <Text style={[styles.rememberText, { color: colors.icon }]}>Remember my phone number</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              { backgroundColor: colors.primary }, 
              (isLoading || !name.trim() || !phone.trim()) && { opacity: 0.8 }
            ]}
            onPress={handleJoin}
            activeOpacity={0.8}
            disabled={isLoading || !name.trim() || !phone.trim()}
          >
            {isLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.primaryButtonText}>{loadingText}</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>Join as Supplier</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    paddingVertical: 4,
  },
  rememberText: {
    fontSize: 14,
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
