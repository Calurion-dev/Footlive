import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TextInput, Switch, TouchableOpacity, Alert, Linking,
} from 'react-native'
import { getApiKey, saveApiKey, getSettings, saveSettings } from '../helpers/storage'
import { setApiKey } from '../api/footballApi'
import { registerBackgroundTask, unregisterBackgroundTask } from '../helpers/background'
import { colors, fonts, spacing } from '../constants/theme'

export default function SettingsScreen() {
  const [apiKey, setApiKeyState] = useState('')
  const [settings, setSettingsState] = useState({
    summaryHour: 8,
    summaryMinute: 0,
    liveNotifications: true,
  })
  const [bgRunning, setBgRunning] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const key = await getApiKey()
    setApiKeyState(key)
    if (key) setApiKey(key)
    const s = await getSettings()
    setSettingsState(s)
  }

  const saveApiKeyHandler = async () => {
    await saveApiKey(apiKey)
    setApiKey(apiKey)
    Alert.alert('API Key', 'Clé API sauvegardée.')
  }

  const toggleBackgroundTask = async (enable) => {
    if (enable) {
      const ok = await registerBackgroundTask()
      if (ok) {
        setBgRunning(true)
        await saveSettings({ ...settings, liveNotifications: true })
        setSettingsState(prev => ({ ...prev, liveNotifications: true }))
      }
    } else {
      await unregisterBackgroundTask()
      setBgRunning(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>⚙️ Paramètres</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 API Foot (RapidAPI)</Text>
        <Text style={styles.description}>
          Pour utiliser les vraies données, obtiens une clé gratuite sur :
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://rapidapi.com/api-sports/api/api-football/')}>
          <Text style={styles.link}>api-football.com ↗</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Saisis ta clé RapidAPI"
          placeholderTextColor={colors.textSecondary}
          value={apiKey}
          onChangeText={setApiKeyState}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={saveApiKeyHandler}>
          <Text style={styles.buttonText}>Sauvegarder</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          * Sans clé, l'application utilise des données de démonstration.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications live</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Activer les notifications live</Text>
          <Switch
            value={settings.liveNotifications}
            onValueChange={async (val) => {
              await saveSettings({ ...settings, liveNotifications: val })
              setSettingsState(prev => ({ ...prev, liveNotifications: val }))
              await toggleBackgroundTask(val)
            }}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={settings.liveNotifications ? colors.primary : '#f4f3f4'}
          />
        </View>
        <Text style={styles.hint}>
          Les scores en direct apparaîtront dans une notification mise à jour toutes les ~15 minutes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>☀️ Résumé quotidien</Text>
        <Text style={styles.hint}>
          Un résumé du match de la veille est envoyé chaque matin vers 08h00 avec le score,
          les buteurs et les statistiques. Les notifications doivent être activées.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 À propos</Text>
        <Text style={styles.hint}>FootLive 2026 — v1.0.0</Text>
        <Text style={styles.hint}>Application non-officielle pour la Coupe du Monde 2026</Text>
        <Text style={styles.hint}>Données fournies par API-Football (RapidAPI)</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  title: { fontSize: fonts.header, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: spacing.lg },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
  },
  sectionTitle: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: fonts.small, color: colors.textSecondary, marginBottom: spacing.xs },
  link: { fontSize: fonts.small, color: colors.primary, textDecorationLine: 'underline', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    fontSize: fonts.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: fonts.regular },
  hint: { fontSize: fonts.small, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  switchLabel: { fontSize: fonts.regular, color: colors.text, flex: 1 },
})
