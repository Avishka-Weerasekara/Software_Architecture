import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../theme/theme';

const FineCard = ({ fine, onPay }) => {
  const pending = fine.status === 'PENDING';

  return (
    <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 14, marginBottom: 12 }}>
      <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.bodySemiBold, marginBottom: 4 }}>
        {fine.referenceNumber || fine.id}
      </Text>
      <Text style={{ color: theme.colors.muted, marginBottom: 2 }}>{fine.location}</Text>
      <Text style={{ color: pending ? theme.colors.warning : theme.colors.success, marginBottom: 8 }}>
        {fine.status} • LKR {Number(fine.totalAmount || 0).toFixed(2)}
      </Text>
      {pending && !!onPay && (
        <Pressable
          onPress={() => onPay(fine)}
          style={{ backgroundColor: theme.colors.gold, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>Pay Now</Text>
        </Pressable>
      )}
    </View>
  );
};

export default FineCard;