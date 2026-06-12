import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { theme } from '../theme/theme';

const AdminDashboardScreen = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = async () => {
    try {
      const [dashboardRes, monitoringRes] = await Promise.all([apiService.getAdminDashboard(), apiService.getAdminMonitoring()]);
      setData({ ...dashboardRes.data, monitoring: monitoringRes.data });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </SafeAreaView>
    );
  }

  const stats = [
    ['Total Users', data?.totalUsers],
    ['Total Fines', data?.totalFines],
    ['Paid', data?.paidFines],
    ['Pending', data?.pendingFines],
    ['Revenue (LKR)', Number(data?.totalRevenue || 0).toFixed(2)],
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.colors.gold} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: theme.colors.cream, fontSize: 24, fontFamily: theme.fonts.display }}>Admin Dashboard</Text>
          <LanguageSelector />
        </View>

        {stats.map(([label, value]) => (
          <View key={label} style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <Text style={{ color: theme.colors.muted }}>{label}</Text>
            <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 22 }}>{value ?? 0}</Text>
          </View>
        ))}

        <Pressable onPress={logout} style={{ marginTop: 6, backgroundColor: theme.colors.warning, borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold }}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;