import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    role: 'USER',
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    address: '',
    province: 'Western',
    district: 'Colombo',
    nic: '',
    telephone: '',
    policeId: '',
    jobPosition: '',
    workStation: '',
  });

  const userMode = state.role === 'USER';

  const payload = useMemo(
    () => ({
      ...state,
      age: Number(state.age),
    }),
    [state],
  );

  const onSubmit = async () => {
    const ageNumber = Number(state.age);
    if (!Number.isFinite(ageNumber) || ageNumber < 18 || ageNumber > 120) {
      Toast.show({ type: 'error', text1: 'Invalid age', text2: 'Please enter an age between 18 and 120.' });
      return;
    }
    setLoading(true);
    await register(payload);
    setLoading(false);
  };

  const setField = (key, value) => setState((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 24 }}>{t('register')}</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {['USER', 'ADMIN'].map((role) => (
            <Pressable
              key={role}
              onPress={() => setField('role', role)}
              style={{
                flex: 1,
                backgroundColor: state.role === role ? theme.colors.gold : theme.colors.surface,
                borderRadius: 8,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: state.role === role ? theme.colors.background : theme.colors.cream }}>
                {role === 'USER' ? t('citizen') : t('police')}
              </Text>
            </Pressable>
          ))}
        </View>

        {[
          ['fullName', t('full_name')],
          ['email', t('email')],
          ['password', t('password')],
          ['age', 'Age'],
        ].map(([key, label]) => (
          <View key={key}>
            <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>{label}</Text>
            <TextInput
              secureTextEntry={key === 'password'}
              keyboardType={key === 'age' ? 'number-pad' : key === 'email' ? 'email-address' : 'default'}
              autoCapitalize={key === 'email' ? 'none' : 'sentences'}
              value={state[key]}
              onChangeText={(v) => setField(key, v)}
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 10, padding: 12 }}
            />
          </View>
        ))}

        {userMode ? (
          <>
            {[
              ['address', 'Address'],
              ['province', 'Province'],
              ['district', 'District'],
              ['nic', 'NIC'],
              ['telephone', 'Telephone'],
            ].map(([key, label]) => (
              <View key={key}>
                <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>{label}</Text>
                <TextInput
                  value={state[key]}
                  onChangeText={(v) => setField(key, v)}
                  style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 10, padding: 12 }}
                />
              </View>
            ))}
          </>
        ) : (
          <>
            {[
              ['policeId', 'Police ID'],
              ['jobPosition', 'Job Position'],
              ['workStation', 'Work Station'],
            ].map(([key, label]) => (
              <View key={key}>
                <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>{label}</Text>
                <TextInput
                  value={state[key]}
                  onChangeText={(v) => setField(key, v)}
                  style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 10, padding: 12 }}
                />
              </View>
            ))}
          </>
        )}

        <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: theme.colors.gold, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>{loading ? t('loading') : t('register')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;