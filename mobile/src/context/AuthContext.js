import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiService, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

const KEYS = {
  token: 'token',
  role: 'role',
  email: 'email',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, role, email] = await Promise.all([
          AsyncStorage.getItem(KEYS.token),
          AsyncStorage.getItem(KEYS.role),
          AsyncStorage.getItem(KEYS.email),
        ]);

        if (token && role && email) {
          setAuthToken(token);
          setUser({ token, role, email });
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await apiService.login({ email, password });
      const nextUser = { token: data.token, role: data.role, email: data.email };
      await Promise.all([
        AsyncStorage.setItem(KEYS.token, data.token),
        AsyncStorage.setItem(KEYS.role, data.role),
        AsyncStorage.setItem(KEYS.email, data.email),
      ]);
      setAuthToken(data.token);
      setUser(nextUser);
      return { success: true, role: data.role };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Error', text2: message });
      return { success: false, message };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await apiService.register(payload);
      const nextUser = { token: data.token, role: data.role, email: data.email };
      await Promise.all([
        AsyncStorage.setItem(KEYS.token, data.token),
        AsyncStorage.setItem(KEYS.role, data.role),
        AsyncStorage.setItem(KEYS.email, data.email),
      ]);
      setAuthToken(data.token);
      setUser(nextUser);
      return { success: true, role: data.role };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Registration Error', text2: message });
      return { success: false, message };
    }
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.token),
      AsyncStorage.removeItem(KEYS.role),
      AsyncStorage.removeItem(KEYS.email),
    ]);
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
