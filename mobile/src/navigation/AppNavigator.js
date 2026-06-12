import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminManageFinesScreen from '../screens/AdminManageFinesScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import UserPaymentsScreen from '../screens/UserPaymentsScreen';
import PaymentProcessingScreen from '../screens/PaymentProcessingScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentFailureScreen from '../screens/PaymentFailureScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabScreenOptions = {
  headerStyle: { backgroundColor: theme.colors.backgroundElevated },
  headerTintColor: theme.colors.cream,
  headerTitleStyle: { fontFamily: theme.fonts.display },
  tabBarStyle: { backgroundColor: theme.colors.backgroundElevated, borderTopColor: theme.colors.border },
  tabBarActiveTintColor: theme.colors.gold,
  tabBarInactiveTintColor: theme.colors.muted,
};

const AdminTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
    <Tab.Screen
      name="AdminHome"
      component={AdminDashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="ManageFines"
      component={AdminManageFinesScreen}
      options={{
        title: 'Manage',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="file-document-edit" color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

const UserTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
    <Tab.Screen
      name="UserHome"
      component={UserDashboardScreen}
      options={{
        title: 'Quick Pay',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cash-fast" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="UserPayments"
      component={UserPaymentsScreen}
      options={{
        title: 'History',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.backgroundElevated },
        headerTintColor: theme.colors.cream,
        headerTitleStyle: { fontFamily: theme.fonts.display },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        </>
      ) : (
        <>
          {user.role === 'ADMIN' ? (
            <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
          )}
          <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} options={{ title: 'Payment' }} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ title: 'Success' }} />
          <Stack.Screen name="PaymentFailure" component={PaymentFailureScreen} options={{ title: 'Failed' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;