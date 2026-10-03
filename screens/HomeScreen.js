import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, RefreshControl, Linking, TouchableOpacity,
} from 'react-native'
import { getMatchesByDate } from '../api/footballApi'
import { colors, fonts, spacing } from '../constants/theme'

function MatchSummaryCard({ match }) {
  const home = match.homeTeam
  const away = match.awayTeam

  const getStatusBadge = () => {
    switch (match.statusShort) {
      case 'FT': return { label: 'Terminé', color: colors.primary }
      case 'AET': return { label: 'Prolong.', color: colors.primaryDark }
      case 'PEN': return { label: 'TAB', color: colors.primaryDark }
      case 'LIVE': return { label: 'EN DIRECT', color: colors.live }
      default: return { label: match.statusShort, color: colors.textSecondary }
    }
  }

  const badge = getStatusBadge()

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamCol}>
          <Text style={styles.teamName}>{home.name}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreText}>{match.score.home} - {match.score.away}</Text>
        </View>
        <View style={styles.teamCol}>
          <Text style={styles.teamName}>{away.name}</Text>
        </View>
      </View>

      {match.goals.length > 0 && (
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Buteurs</Text>
          {match.goals.map((g, i) => (
            <Text key={i} style={styles.goalText}>
              {g.scorer} {g.minute}' ({g.team === 'home' ? home.name : away.name})
            </Text>
          ))}
        </View>
      )}

      {match.statistics && Object.keys(match.statistics).length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          {Object.entries(match.statistics).slice(0, 4).map(([key, val], i) => (
            <View key={i} style={styles.statRow}>
              <Text style={styles.statValue}>{val.home}</Text>
              <Text style={styles.statLabel}>{key}</Text>
              <Text style={styles.statValue}>{val.away}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.sourceLink}
        onPress={() => Linking.openURL('https://www.api-football.com')}
      >
        <Text style={styles.sourceText}>
          Source : API-Football (RapidAPI) ↗
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default function HomeScreen() {
  const [matches, setMatches] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [dateLabel, setDateLabel] = useState('')

  const loadMatches = useCallback(async () => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      const opts = { day: 'numeric', month: 'long', year: 'numeric' }
      setDateLabel(yesterday.toLocaleDateString('fr-FR', opts))

      const data = await getMatchesByDate(dateStr)
      setMatches(data)
    } catch (e) {
      console.warn(e)
    }
  }, [])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadMatches()
    setRefreshing(false)
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={matches}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <MatchSummaryCard match={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>⚽ Résumé du jour</Text>
          {dateLabel ? <Text style={styles.subtitle}>Matchs du {dateLabel}</Text> : null}
          {matches.length === 0 && !refreshing && (
            <Text style={styles.emptyText}>Aucun match joué hier.</Text>
          )}
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg, alignItems: 'center' },
  title: { fontSize: fonts.header, fontWeight: 'bold', color: colors.primary },
  subtitle: { fontSize: fonts.regular, color: colors.textSecondary, marginTop: spacing.xs },
  emptyText: { fontSize: fonts.regular, color: colors.textSecondary, marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeRow: { flexDirection: 'row', marginBottom: spacing.sm },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: fonts.small, fontWeight: 'bold' },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  teamCol: { flex: 1, alignItems: 'center' },
  teamName: { fontSize: fonts.regular, fontWeight: '600', color: colors.text, textAlign: 'center' },
  scoreCol: { paddingHorizontal: spacing.lg },
  scoreText: { fontSize: fonts.score, fontWeight: 'bold', color: colors.primary },
  goalsSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontSize: fonts.small, fontWeight: 'bold', color: colors.textSecondary, marginBottom: spacing.xs },
  goalText: { fontSize: fonts.small, color: colors.text, marginLeft: spacing.sm },
  statsSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginBottom: spacing.sm },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  statLabel: { fontSize: fonts.small, color: colors.textSecondary, flex: 2, textAlign: 'center' },
  statValue: { fontSize: fonts.small, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'center' },
  sourceLink: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs },
  sourceText: { fontSize: fonts.small, color: colors.primary, textDecorationLine: 'underline', textAlign: 'center' },
})
