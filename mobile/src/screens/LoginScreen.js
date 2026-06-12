import React, { useState } from 'react';
import { Image, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    await login(email.trim(), password);
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 60, right: 20 }}>
        <LanguageSelector />
      </View>
      <View style={{ backgroundColor: theme.colors.backgroundElevated, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.colors.border }}>
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <Image source={require('../../assets/logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} />
          <Text style={{ color: theme.colors.gold, marginTop: 8 }}>Sri Lanka Police</Text>
          <Text style={{ color: theme.colors.cream, fontFamily: theme.fonts.display, fontSize: 24, marginTop: 6 }}>{t('app_title')}</Text>
        </View>

        <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>{t('email')}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="user@example.com"
          placeholderTextColor={theme.colors.muted}
          style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 10, padding: 12, marginBottom: 12 }}
        />

        <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>{t('password')}</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={theme.colors.muted}
          style={{ backgroundColor: theme.colors.surface, color: theme.colors.cream, borderRadius: 10, padding: 12, marginBottom: 16 }}
        />

        <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: theme.colors.gold, borderRadius: 10, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.background, fontFamily: theme.fonts.bodySemiBold }}>{loading ? t('loading') : t('login')}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.goldLight }}>{t('register')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
