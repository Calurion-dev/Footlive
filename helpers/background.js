import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import { getLiveMatches, getMatchesByDate } from '../api/footballApi'
import { getFavoriteTeams, getLastSummaryDate, setLastSummaryDate } from './storage'
import { sendLiveNotification, sendSummaryNotification } from './notifications'

const BACKGROUND_TASK = 'footlive-background-task'

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    await processBackgroundTask()
    return BackgroundTask.BackgroundTaskResult.Success
  } catch (e) {
    console.warn('Background task failed:', e)
    return BackgroundTask.BackgroundTaskResult.Failed
  }
})

async function processBackgroundTask() {
  const now = new Date()

  const favorites = await getFavoriteTeams()
  const isMatchDay = true

  if (isMatchDay) {
    const liveMatches = await getLiveMatches()
    if (liveMatches.length > 0) {
      const filtered = favorites.length > 0
        ? liveMatches.filter(m =>
            favorites.some(f =>
              m.homeTeam.name.toLowerCase().includes(f.toLowerCase()) ||
              m.awayTeam.name.toLowerCase().includes(f.toLowerCase())
            )
          )
        : liveMatches

      if (filtered.length > 0) {
        await sendLiveNotification(filtered)
      } else if (liveMatches.length > 0) {
        await sendLiveNotification(liveMatches)
      }
    }
  }

  const lastSummaryDate = await getLastSummaryDate()
  const todayStr = now.toISOString().split('T')[0]

  if (lastSummaryDate !== todayStr) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const matches = await getMatchesByDate(yesterdayStr)
    const finished = matches.filter(m =>
      m.statusShort === 'FT' || m.statusShort === 'AET' || m.statusShort === 'PEN'
    )

    for (const match of finished) {
      await sendSummaryNotification(match)
    }

    if (finished.length > 0) {
      await setLastSummaryDate(todayStr)
    }
  }
}

export async function registerBackgroundTask() {
  try {
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 15,
    })
    return true
  } catch (e) {
    console.warn('Failed to register background task:', e)
    return false
  }
}

export async function unregisterBackgroundTask() {
  try {
    await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK)
    return true
  } catch (e) {
    console.warn('Failed to unregister background task:', e)
    return false
  }
}
