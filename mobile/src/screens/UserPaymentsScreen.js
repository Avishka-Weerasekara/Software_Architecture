import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { apiService } from '../services/api';
import { theme } from '../theme/theme';

const UserPaymentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const load = async () => {
    try {
      const { data } = await apiService.getMyPayments();
      setPayments(Array.isArray(data?.payments) ? data.payments : []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to fetch payments' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={theme.colors.gold} />}
      >
        <Text style={{ color: theme.colors.cream, fontSize: 24, fontFamily: theme.fonts.display, marginBottom: 14 }}>Payments</Text>
        {payments.length === 0 ? (
          <Text style={{ color: theme.colors.muted }}>No records found</Text>
        ) : (
          payments.map((payment, index) => (
            <View key={payment.id || payment.paymentId || `${payment.createdAt || 'payment'}-${index}`} style={{ backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 14, marginBottom: 10 }}>
              <Text style={{ color: theme.colors.cream }}>LKR {Number(payment.amount || 0).toFixed(2)}</Text>
              <Text style={{ color: payment.status === 'SUCCESS' ? theme.colors.success : theme.colors.warning }}>{payment.status}</Text>
              <Text style={{ color: theme.colors.muted }}>{payment.createdAt || payment.updatedAt || '-'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserPaymentsScreen;
