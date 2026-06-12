import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { theme } from '../theme/theme';

const PaymentSuccessScreen = ({ navigation }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16, justifyContent: 'center' }}>
    <View style={{ backgroundColor: theme.colors.backgroundElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 24, alignItems: 'center' }}>
      <Text style={{ color: theme.colors.success, fontSize: 28, marginBottom: 10 }}>✓</Text>
      <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 24, marginBottom: 10 }}>Payment Successful</Text>
      <Text style={{ color: theme.colors.muted, textAlign: 'center', marginBottom: 16 }}>Your payment has been confirmed.</Text>
      <Pressable onPress={() => navigation.navigate('UserTabs')} style={{ backgroundColor: theme.colors.gold, borderRadius: 10, padding: 12, minWidth: 200, alignItems: 'center' }}>
        <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>Return to Dashboard</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);

export default PaymentSuccessScreen;