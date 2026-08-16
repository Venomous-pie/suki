import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupplierJoinScreen() {
  const router = useRouter();
  const loginSupplier = useAuthStore((state) => state.loginSupplier);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    setIsLoading(true);
    await loginSupplier();
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <LinkIcon size={32} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Join Our Supply Chain</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Become a trusted supplier for SUKI and manage your distribution network seamlessly.
        </Text>

        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary }, isLoading && { opacity: 0.8 }]}
          onPress={handleJoin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Join as Supplier</Text>
          )}
        </TouchableOpacity>
      </View>
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
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  primaryButton: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
