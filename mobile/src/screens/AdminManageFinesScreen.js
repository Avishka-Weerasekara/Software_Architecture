import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { apiService } from '../services/api';
import { theme } from '../theme/theme';

const AdminManageFinesScreen = () => {
  const [citizenNic, setCitizenNic] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await apiService.issueFine({
        citizenNic,
        location,
        reasons: [{ reason, amount: Number(amount || 0) }],
      });
      Toast.show({ type: 'success', text1: 'Fine issued successfully' });
      setCitizenNic('');
      setLocation('');
      setReason('');
      setAmount('');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to issue fine', text2: error.response?.data?.message || 'Please check inputs' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Text style={{ color: theme.colors.cream, fontSize: 24, fontFamily: theme.fonts.display }}>Manage Fines</Text>
        {[
          ['Citizen NIC', citizenNic, setCitizenNic, 'default'],
          ['Location', location, setLocation, 'default'],
          ['Reason', reason, setReason, 'default'],
          ['Amount', amount, setAmount, 'numeric'],
        ].map(([label, value, setter, keyboardType], index) => (
          <React.Fragment key={index}>
            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>{label}</Text>
            <TextInput
              value={value}
              onChangeText={setter}
              keyboardType={keyboardType}
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 10, padding: 12 }}
            />
          </React.Fragment>
        ))}

        <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: theme.colors.gold, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>{loading ? 'Submitting...' : 'Issue Fine'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminManageFinesScreen;
