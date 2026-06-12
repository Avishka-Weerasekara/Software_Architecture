import React from 'react';
import { View, Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme/theme';

const LANGS = [
  { value: 'en', label: 'EN' },
  { value: 'si', label: 'සි' },
  { value: 'ta', label: 'த' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const onChange = async (lang) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, overflow: 'hidden' }}>
      {LANGS.map((lang) => {
        const active = i18n.language?.startsWith(lang.value);
        return (
          <Pressable
            key={lang.value}
            onPress={() => onChange(lang.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              backgroundColor: active ? theme.colors.gold : 'transparent',
            }}
          >
            <Text style={{ color: active ? theme.colors.background : theme.colors.cream, fontFamily: theme.fonts.bodySemiBold }}>
              {lang.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default LanguageSelector;
