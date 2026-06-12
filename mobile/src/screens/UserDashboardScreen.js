import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import FineCard from '../components/FineCard';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { theme } from '../theme/theme';

const UserDashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fines, setFines] = useState([]);

  const load = async () => {
    try {
      const { data } = await apiService.getUserFines();
      setFines(Array.isArray(data) ? data : []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to fetch fines' });
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

  const onPay = (fine) => navigation.navigate('PaymentProcessing', { fineId: fine.id });

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: theme.colors.cream, fontSize: 24, fontFamily: theme.fonts.display }}>My Fines</Text>
          <LanguageSelector />
        </View>

        {fines.length === 0 ? (
          <Text style={{ color: theme.colors.muted }}>No records found</Text>
        ) : (
          fines.map((fine) => <FineCard key={fine.id} fine={fine} onPay={onPay} />)
        )}

        <Pressable onPress={logout} style={{ marginTop: 8, backgroundColor: theme.colors.warning, borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold }}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDashboardScreen;
