import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, SafeAreaView, Text, View } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import Toast from 'react-native-toast-message';
import { apiService } from '../services/api';
import { theme } from '../theme/theme';

const PaymentProcessingScreen = ({ navigation, route }) => {
  const fineId = route.params?.fineId;
  const fine = route.params?.fine;
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const returnUrl = ExpoLinking.createURL('payment');
        const { data } = await apiService.initiatePayment({ fineId, returnUrl });
        setCheckoutUrl(data.checkoutSessionUrl || '');
        setSessionId(data.sessionId || '');
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to initiate payment' });
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [fineId]);

  const checkStatus = async () => {
    if (!sessionId) {
      navigation.replace('PaymentFailure');
      return;
    }

    try {
      const { data } = await apiService.getPaymentStatusBySession(sessionId);
      if (data?.status === 'SUCCESS') {
        navigation.replace('PaymentSuccess');
      } else {
        navigation.replace('PaymentFailure');
      }
    } catch {
      navigation.replace('PaymentFailure');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16, justifyContent: 'center' }}>
      <View style={{ backgroundColor: theme.colors.backgroundElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 20 }}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color={theme.colors.gold} />
            <Text style={{ color: theme.colors.cream, textAlign: 'center', marginTop: 12 }}>Preparing secure payment...</Text>
          </>
        ) : (
          <>
            <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 22, marginBottom: 10 }}>Payment Processing</Text>
            <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>Continue the payment in the secure checkout page, then verify status.</Text>

            {fine && (
              <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ color: theme.colors.goldLight, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Selected fine</Text>
                <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold, marginTop: 4 }}>{fine.referenceNumber}</Text>
                <Text style={{ color: theme.colors.muted, marginTop: 4 }}>LKR {Number(fine.totalAmount || 0).toLocaleString()} • {Array.isArray(fine.reasons) ? fine.reasons.map((item) => item.reason).join(', ') : ''}</Text>
              </View>
            )}

            {!!checkoutUrl && (
              <Pressable onPress={() => Linking.openURL(checkoutUrl)} style={{ backgroundColor: theme.colors.gold, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>Open Checkout</Text>
              </Pressable>
            )}

            <Pressable onPress={checkStatus} style={{ backgroundColor: theme.colors.success, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold }}>Check Payment Status</Text>
            </Pressable>

            <Pressable onPress={() => navigation.goBack()} style={{ backgroundColor: theme.colors.warning, borderRadius: 10, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold }}>Go Back</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PaymentProcessingScreen;