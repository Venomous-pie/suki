import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Store, Truck } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.primary }]}>SUKI</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Choose your role to continue</Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => router.push('/auth/supplier-join')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Truck size={24} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Supplier</Text>
            <Text style={[styles.cardDesc, { color: colors.icon }]}>Manage distribution and supply chain</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => router.push('/auth/store-owner-login')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '15' }]}>
              <Store size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Store Owner</Text>
            <Text style={[styles.cardDesc, { color: colors.icon }]}>Manage your store and orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 40,
    opacity: 0.7,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
