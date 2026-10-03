import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundTask from 'expo-background-task'
import HomeScreen from './src/screens/HomeScreen'
import LiveScreen from './src/screens/LiveScreen'
import FavoritesScreen from './src/screens/FavoritesScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import { setupNotificationChannels, requestPermissions } from './src/helpers/notifications'
import { getApiKey } from './src/helpers/storage'
import { setApiKey } from './src/api/footballApi'
import { colors } from './src/constants/theme'

const Tab = createBottomTabNavigator()

function TabIcon({ label, focused }) {
  const icons = {
    'Résumé': '📋',
    'Direct': '🔴',
    'Favoris': '⭐',
    'Paramètres': '⚙️',
  }
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icons[label] || '📋'}</Text>
    </View>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const navigationRef = useRef(null)

  useEffect(() => {
    initApp()
  }, [])

  async function initApp() {
    await setupNotificationChannels()
    await requestPermissions()

    const key = await getApiKey()
    if (key) setApiKey(key)

    setReady(true)
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 18, color: colors.primary }}>FootLive 2026</Text>
      </View>
    )
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: '#FFF',
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === 'android' ? 8 : 0,
            height: Platform.OS === 'android' ? 60 : 85,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: 'FootLive 2026',
        })}
      >
        <Tab.Screen name="Résumé" component={HomeScreen} />
        <Tab.Screen name="Direct" component={LiveScreen} />
        <Tab.Screen name="Favoris" component={FavoritesScreen} />
        <Tab.Screen name="Paramètres" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
