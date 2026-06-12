import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
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
  const [referenceNumber, setReferenceNumber] = useState('');
  const [categoryIdentifier, setCategoryIdentifier] = useState('');

  const pendingFines = useMemo(() => fines.filter((fine) => fine.status === 'PENDING'), [fines]);
  const paidFines = useMemo(() => fines.filter((fine) => fine.status === 'PAID'), [fines]);

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

  const onQuickPay = () => {
    const normalizedReference = referenceNumber.trim().toUpperCase();
    const normalizedCategory = categoryIdentifier.trim().toLowerCase();

    if (!normalizedReference || !normalizedCategory) {
      Toast.show({ type: 'error', text1: 'Enter ticket details', text2: 'Please add the fine reference number and category identifier.' });
      return;
    }

    const matchedFine = fines.find((fine) => {
      const fineReference = String(fine.referenceNumber || '').trim().toUpperCase();
      const reasons = Array.isArray(fine.reasons) ? fine.reasons : [];
      const hasCategory = reasons.some((item) => String(item.reason || '').trim().toLowerCase() === normalizedCategory);
      return fineReference === normalizedReference && hasCategory;
    });

    if (!matchedFine) {
      Toast.show({ type: 'error', text1: 'Fine not found', text2: 'Check the reference number and category identifier again.' });
      return;
    }

    if (matchedFine.status !== 'PENDING') {
      Toast.show({ type: 'info', text1: 'Already paid', text2: 'This fine is no longer pending.' });
      return;
    }

    navigation.navigate('PaymentProcessing', { fineId: matchedFine.id, fine: matchedFine });
  };

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
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={theme.colors.gold} />}
      >
        <View style={{ backgroundColor: theme.colors.backgroundElevated, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, padding: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: theme.colors.goldLight, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 11, marginBottom: 6 }}>Sri Lanka Police</Text>
              <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 26, lineHeight: 30 }}>On-the-spot fine payment</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 20 }}>
                Enter the fine reference number and category identifier from the ticket to pay immediately.
              </Text>
            </View>
            <LanguageSelector />
          </View>

          <View style={{ marginTop: 8, gap: 10 }}>
            <View>
              <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>Fine Reference Number</Text>
              <TextInput
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                autoCapitalize="characters"
                placeholder="TF-123456789"
                placeholderTextColor={theme.colors.muted}
                style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border }}
              />
            </View>

            <View>
              <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>Category Identifier</Text>
              <TextInput
                value={categoryIdentifier}
                onChangeText={setCategoryIdentifier}
                autoCapitalize="words"
                placeholder="Speeding"
                placeholderTextColor={theme.colors.muted}
                style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border }}
              />
            </View>

            <Pressable onPress={onQuickPay} style={{ backgroundColor: theme.colors.gold, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 2 }}>
              <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>Find Fine & Pay</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: theme.colors.cream, fontSize: 22, fontFamily: theme.fonts.display }}>Pending fines</Text>
          <LanguageSelector />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <View style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, padding: 12 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4 }}>Pending</Text>
            <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 24 }}>{pendingFines.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, padding: 12 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4 }}>Paid</Text>
            <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 24 }}>{paidFines.length}</Text>
          </View>
        </View>

        {pendingFines.length === 0 ? (
          <Text style={{ color: theme.colors.muted }}>No pending fines found</Text>
        ) : (
          pendingFines.map((fine) => <FineCard key={fine.id} fine={fine} onPay={onPay} />)
        )}

        {paidFines.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: theme.colors.cream, fontSize: 18, fontFamily: theme.fonts.display, marginBottom: 10 }}>Recent paid fines</Text>
            {paidFines.slice(0, 3).map((fine) => (
              <FineCard key={fine.id} fine={fine} />
            ))}
          </View>
        )}

        <Pressable onPress={logout} style={{ marginTop: 8, backgroundColor: theme.colors.warning, borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold }}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDashboardScreen;