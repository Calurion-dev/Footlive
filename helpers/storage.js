import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  FAVORITE_TEAMS: '@footlive/favorite_teams',
  API_KEY: '@footlive/api_key',
  SUMMARY_DATE: '@footlive/last_summary_date',
  SETTINGS: '@footlive/settings',
  MATCHES_CACHE: '@footlive/matches_cache',
}

export async function getFavoriteTeams() {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITE_TEAMS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export async function setFavoriteTeams(teams) {
  await AsyncStorage.setItem(KEYS.FAVORITE_TEAMS, JSON.stringify(teams))
}

export async function addFavoriteTeam(teamName) {
  const teams = await getFavoriteTeams()
  if (!teams.includes(teamName)) {
    teams.push(teamName)
    await setFavoriteTeams(teams)
  }
  return teams
}

export async function removeFavoriteTeam(teamName) {
  const teams = await getFavoriteTeams()
  const filtered = teams.filter(t => t !== teamName)
  await setFavoriteTeams(filtered)
  return filtered
}

export async function getApiKey() {
  try {
    return (await AsyncStorage.getItem(KEYS.API_KEY)) || ''
  } catch {
    return ''
  }
}

export async function saveApiKey(key) {
  await AsyncStorage.setItem(KEYS.API_KEY, key)
}

export async function getLastSummaryDate() {
  try {
    return (await AsyncStorage.getItem(KEYS.SUMMARY_DATE)) || ''
  } catch {
    return ''
  }
}

export async function setLastSummaryDate(dateStr) {
  await AsyncStorage.setItem(KEYS.SUMMARY_DATE, dateStr)
}

export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS)
    return data ? JSON.parse(data) : { summaryHour: 8, summaryMinute: 0, liveNotifications: true }
  } catch {
    return { summaryHour: 8, summaryMinute: 0, liveNotifications: true }
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

export async function getCachedMatches() {
  try {
    const data = await AsyncStorage.getItem(KEYS.MATCHES_CACHE)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export async function setCachedMatches(dateStr, matches) {
  const cache = await getCachedMatches()
  cache[dateStr] = { matches, fetchedAt: Date.now() }
  Object.keys(cache).forEach(k => {
    if (Date.now() - cache[k].fetchedAt > 86400000) delete cache[k]
  })
  await AsyncStorage.setItem(KEYS.MATCHES_CACHE, JSON.stringify(cache))
}
