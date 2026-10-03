import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import { Platform } from 'react-native'

const SUMMARY_CHANNEL = 'match-summary'
const LIVE_CHANNEL = 'live-scores'

export async function setupNotificationChannels() {
  if (Platform.OS !== 'android') return

  await Notifications.setNotificationChannelAsync(SUMMARY_CHANNEL, {
    name: 'Résumé des matchs',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1B5E20',
  })

  await Notifications.setNotificationChannelAsync(LIVE_CHANNEL, {
    name: 'Scores en direct',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 100],
    lightColor: '#FF1744',
  })
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
})

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function sendSummaryNotification(match) {
  const home = match.homeTeam.name
  const away = match.awayTeam.name
  const score = `${match.score.home} - ${match.score.away}`
  const goalsText = match.goals.length > 0
    ? match.goals.map(g => `${g.scorer} ${g.minute}'`).join('\n')
    : 'Aucun but'

  const statsText = match.statistics && Object.keys(match.statistics).length > 0
    ? Object.entries(match.statistics)
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${v.home} - ${v.away}`)
        .join('\n')
    : ''

  const body = `${home} ${score} ${away}\n\nButeurs :\n${goalsText}${statsText ? `\n\n${statsText}` : ''}\n\nSource : API-Football (RapidAPI)`

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚽ Résumé Coupe du Monde',
      body,
      data: { matchId: match.id, source: 'https://www.api-football.com' },
      color: '#1B5E20',
    },
    trigger: null,
  })
}

export async function sendLiveNotification(matches) {
  const lines = matches.map(m => {
    const emoji = m.statusShort === 'LIVE' ? '🔴' : '⚽'
    return `${emoji} ${m.homeTeam.name} ${m.score.home}-${m.score.away} ${m.awayTeam.name} (${m.elapsed}')`
  })

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔴 Scores en Direct',
      body: lines.join('\n'),
      data: { type: 'live' },
      color: '#FF1744',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  })
}
