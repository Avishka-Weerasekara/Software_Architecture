import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '../theme/theme';

const FineCard = ({ fine, onPay }) => {
  const pending = fine?.status === 'PENDING';
  const reasons = Array.isArray(fine?.reasons) ? fine.reasons : [];

  return (
    <View style={{ backgroundColor: theme.colors.backgroundElevated, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, padding: 16, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.goldLight, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, marginBottom: 4 }}>
            Fine Reference
          </Text>
          <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 20 }}>
            {fine?.referenceNumber || fine?.id}
          </Text>
        </View>
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: pending ? theme.colors.terracottaDim || 'rgba(193, 80, 46, 0.14)' : theme.colors.sageDim || 'rgba(92, 138, 106, 0.14)' }}>
          <Text style={{ color: pending ? theme.colors.terracottaLight || theme.colors.warning : theme.colors.sageLight || theme.colors.success, fontFamily: theme.fonts.bodySemiBold, fontSize: 12 }}>
            {fine?.status || 'UNKNOWN'}
          </Text>
        </View>
      </View>

      <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
        {fine?.location || 'Location unavailable'}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {reasons.map((item, index) => (
          <View key={`${item.reason || 'reason'}-${index}`} style={{ backgroundColor: theme.colors.surface, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: theme.colors.cream, fontSize: 12 }}>
              {item.reason} · LKR {Number(item.amount || 0).toFixed(0)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: theme.colors.textMuted || theme.colors.muted, fontSize: 13 }}>Total</Text>
        <Text style={{ color: theme.colors.goldLight, fontFamily: theme.fonts.bodySemiBold, fontSize: 18 }}>
          LKR {Number(fine?.totalAmount || 0).toLocaleString()}
        </Text>
      </View>

      {pending && !!onPay && (
        <Pressable
          onPress={() => onPay(fine)}
          style={{
            backgroundColor: theme.colors.gold,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>
            Pay Now
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default FineCard;