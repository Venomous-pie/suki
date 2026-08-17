import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Phone } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import GoogleIcon from '@/components/GoogleIcon';

export default function StoreOwnerLoginScreen() {
  const router = useRouter();
  const requestStoreOwnerOtp = useAuthStore((state) => state.requestStoreOwnerOtp);
  const loginStoreOwner = useAuthStore((state) => state.loginStoreOwner);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!otpSent) {
      if (!phoneNumber.trim()) return;
      setIsLoading(true);
      try {
        const mockOtp = await requestStoreOwnerOtp(phoneNumber);
        setOtpSent(true);
        if (mockOtp) {
          // In a real app, this would be an SMS. For development, we alert it.
          Alert.alert('Development Mode', `Your OTP is: ${mockOtp}`);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to send OTP');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!otp.trim()) return;
      setIsLoading(true);
      try {
        await loginStoreOwner(phoneNumber, otp);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Invalid OTP');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = async () => {
    Alert.alert('Not Implemented', 'Social login is mock only.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {otpSent ? 'Enter OTP' : 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            {otpSent 
              ? 'We sent a verification code to your number'
              : 'Enter your phone number to access your store'}
          </Text>

          {!otpSent ? (
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Phone size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Phone Number"
                placeholderTextColor={colors.icon}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          ) : (
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.input, styles.otpInput, { color: colors.text }]}
                placeholder="000000"
                placeholderTextColor={colors.icon}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              { backgroundColor: colors.secondary }, 
              (isLoading || (!otpSent && !phoneNumber.trim()) || (otpSent && !otp.trim())) && { opacity: 0.8 }
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={isLoading || (!otpSent && !phoneNumber.trim()) || (otpSent && !otp.trim())}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {otpSent ? 'Verify OTP' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

          {!otpSent && (
            <>
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.icon }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity 
                style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.surface }, isLoading && { opacity: 0.8 }]}
                onPress={handleSocialLogin}
                disabled={isLoading}
              >
                <GoogleIcon size={20} />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.surface }, isLoading && { opacity: 0.8 }]}
                onPress={handleSocialLogin}
                disabled={isLoading}
              >
                <FontAwesome5 name="facebook" size={20} color="#1877F2" />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>Continue with Facebook</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
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
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});
