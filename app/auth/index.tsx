import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Store, Truck, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>SUKI</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Choose your role to continue</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/auth/supplier-join')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Truck size={32} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Supplier</Text>
              <Text style={[styles.cardDesc, { color: colors.icon }]}>Manage distribution and supply chain</Text>
            </View>
            <ChevronRight size={24} color={colors.icon} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/auth/store-owner-login')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '15' }]}>
              <Store size={32} color={colors.secondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Store Owner</Text>
              <Text style={[styles.cardDesc, { color: colors.icon }]}>Manage your store and orders</Text>
            </View>
            <ChevronRight size={24} color={colors.icon} style={styles.chevron} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    opacity: 0.4,
    marginLeft: 8,
  },
});
