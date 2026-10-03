import Constants from 'expo-constants'

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api-football-v1.p.rapidapi.com/v3'
const API_HOST = Constants.expoConfig?.extra?.apiHost || 'api-football-v1.p.rapidapi.com'

let _apiKey = ''

export function setApiKey(key) {
  _apiKey = key
}

export function getApiKey() {
  return _apiKey
}

async function fetchApi(endpoint, params = {}) {
  if (!_apiKey) {
    return mockResponse(endpoint, params)
  }

  const url = new URL(`${BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': _apiKey,
        'x-rapidapi-host': API_HOST,
      },
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const json = await res.json()
    return json.response || json
  } catch (e) {
    console.warn('API fetch failed, using mock data:', e.message)
    return mockResponse(endpoint, params)
  }
}

export async function getMatchesByDate(dateStr) {
  const data = await fetchApi('/fixtures', { date: dateStr })
  return data.map(formatMatch)
}

export async function getLiveMatches() {
  const data = await fetchApi('/fixtures/live')
  return data.map(formatMatch)
}

export async function getMatchDetails(matchId) {
  const data = await fetchApi('/fixtures', { id: matchId })
  if (!data || data.length === 0) return null
  return formatMatch(data[0])
}

function formatMatch(raw) {
  const home = raw.teams?.home || {}
  const away = raw.teams?.away || {}
  const status = raw.fixture?.status || {}
  const score = raw.goals || {}
  const events = raw.events || []

  const goals = events
    .filter(e => e.type === 'Goal' && e.player?.name)
    .map(e => ({
      scorer: e.player.name,
      minute: e.time?.elapsed || 0,
      team: e.team?.name === home.name ? 'home' : 'away',
    }))

  const statsMap = {}

  if (raw.statistics && raw.statistics.length >= 2) {
    const homeStats = raw.statistics[0]?.statistics || []
    const awayStats = raw.statistics[1]?.statistics || []
    homeStats.forEach((s, i) => {
      const statName = s.type
      const awayVal = awayStats[i]?.value ?? ''
      statsMap[statName] = { home: s.value, away: awayVal }
    })
  }

  return {
    id: raw.fixture?.id || 0,
    date: raw.fixture?.date || '',
    status: status.long || '',
    statusShort: status.short || '',
    elapsed: status.elapsed || 0,
    homeTeam: { name: home.name || 'Home', logo: home.logo || '' },
    awayTeam: { name: away.name || 'Away', logo: away.logo || '' },
    score: { home: score.home ?? 0, away: score.away ?? 0 },
    goals,
    statistics: statsMap,
  }
}

function mockResponse(endpoint, params) {
  if (endpoint === '/fixtures/live') {
    return [
      {
        id: 1001,
        date: new Date().toISOString(),
        status: 'Match Live',
        statusShort: 'LIVE',
        elapsed: Math.floor(Math.random() * 90) + 1,
        homeTeam: { name: 'France', logo: '' },
        awayTeam: { name: 'Brésil', logo: '' },
        score: { home: 2, away: 1 },
        goals: [
          { scorer: 'Mbappé', minute: 23, team: 'home' },
          { scorer: 'Vinícius Jr', minute: 45, team: 'away' },
          { scorer: 'Griezmann', minute: 67, team: 'home' },
        ],
        statistics: {
          'Ball Possession': { home: '58%', away: '42%' },
          'Total Shots': { home: '14', away: '8' },
          'Corner Kicks': { home: '6', away: '3' },
        },
      },
      {
        id: 1002,
        date: new Date().toISOString(),
        status: 'Match Live',
        statusShort: 'LIVE',
        elapsed: Math.floor(Math.random() * 90) + 1,
        homeTeam: { name: 'Argentine', logo: '' },
        awayTeam: { name: 'Portugal', logo: '' },
        score: { home: 0, away: 0 },
        goals: [],
        statistics: {},
      },
    ]
  }

  if (endpoint === '/fixtures' && params.date) {
    return [
      {
        id: 1003,
        date: params.date + 'T20:00:00+02:00',
        status: 'Match Finished',
        statusShort: 'FT',
        elapsed: 90,
        homeTeam: { name: 'France', logo: '' },
        awayTeam: { name: 'Brésil', logo: '' },
        score: { home: 2, away: 1 },
        goals: [
          { scorer: 'Mbappé', minute: 23, team: 'home' },
          { scorer: 'Vinícius Jr', minute: 45, team: 'away' },
          { scorer: 'Griezmann', minute: 67, team: 'home' },
        ],
        statistics: {
          'Ball Possession': { home: '58%', away: '42%' },
          'Total Shots': { home: '14', away: '8' },
          'Corner Kicks': { home: '6', away: '3' },
        },
      },
    ]
  }

  return []
}
